package com.eventbooking.auth;

import com.eventbooking.email.EmailService;
import com.eventbooking.email.EmailVerification;
import com.eventbooking.email.EmailVerificationRepository;
import com.eventbooking.email.PasswordReset;
import com.eventbooking.email.PasswordResetRepository;
import com.eventbooking.user.User;
import com.eventbooking.user.UserRepository;
import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final OAuthService oAuthService;

    public AuthService(UserRepository userRepository,
                       EmailVerificationRepository emailVerificationRepository,
                       PasswordResetRepository passwordResetRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       EmailService emailService,
                       OAuthService oAuthService) {
        this.userRepository = userRepository;
        this.emailVerificationRepository = emailVerificationRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
        this.oAuthService = oAuthService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user = userRepository.save(user);

        String token = UUID.randomUUID().toString();
        EmailVerification ev = new EmailVerification();
        ev.setUser(user);
        ev.setToken(token);
        ev.setExpiresAt(Instant.now().plusSeconds(86400));
        emailVerificationRepository.save(ev);

        emailService.sendVerificationEmail(user.getEmail(), token);

        return AuthResponse.from(user, null, null);
    }

    public void verifyEmail(String token) {
        EmailVerification ev = emailVerificationRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification token"));

        if (ev.isUsed()) {
            throw new IllegalArgumentException("Token already used");
        }
        if (ev.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        ev.setUsed(true);
        emailVerificationRepository.save(ev);

        User user = ev.getUser();
        user.setVerified(true);
        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isVerified()) {
            throw new IllegalStateException("Please verify your email before signing in");
        }
        if (user.isSuspended()) {
            throw new IllegalStateException("Your account has been suspended");
        }

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());
        return AuthResponse.from(user, accessToken, refreshToken);
    }

    public AuthResponse googleLogin(String credential) {
        var payload = oAuthService.verifyGoogleToken(credential);
        User user = oAuthService.findOrCreateUser(payload.email(), payload.sub());

        if (user.isSuspended()) {
            throw new IllegalStateException("Your account has been suspended");
        }

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());
        return AuthResponse.from(user, accessToken, refreshToken);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email"));

        String token = UUID.randomUUID().toString();
        PasswordReset pr = new PasswordReset();
        pr.setUser(user);
        pr.setToken(token);
        pr.setExpiresAt(Instant.now().plusSeconds(3600));
        passwordResetRepository.save(pr);

        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordReset pr = passwordResetRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (pr.isUsed()) {
            throw new IllegalArgumentException("Token already used");
        }
        if (pr.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        pr.setUsed(true);
        passwordResetRepository.save(pr);

        User user = pr.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public AuthResponse refreshAccessToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        Claims claims = tokenProvider.parseToken(refreshToken);
        if (!"refresh".equals(claims.get("type"))) {
            throw new IllegalArgumentException("Invalid token type");
        }

        UUID userId = UUID.fromString(claims.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId());
        return AuthResponse.from(user, newAccessToken, newRefreshToken);
    }
}
