package com.eventbooking.auth;

import com.eventbooking.user.User;
import com.eventbooking.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OAuthService {

    private final UserRepository userRepository;
    private final String googleClientId;

    public OAuthService(UserRepository userRepository,
                        @Value("${google.client-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.googleClientId = googleClientId;
    }

    public record GooglePayload(String email, String sub) {}

    public GooglePayload verifyGoogleToken(String credential) {
        // In production, verify the credential with Google's tokeninfo endpoint.
        // For development, decode the JWT payload manually (no signature verification).
        try {
            String[] parts = credential.split("\\.");
            if (parts.length < 2) throw new IllegalArgumentException("Invalid Google credential");

            java.util.Base64.Decoder decoder = java.util.Base64.getUrlDecoder();
            String json = new String(decoder.decode(parts[1]));
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var node = mapper.readTree(json);
            String email = node.get("email").asText();
            String sub = node.get("sub").asText();
            return new GooglePayload(email, sub);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Google credential", e);
        }
    }

    public User findOrCreateUser(String email, String googleId) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User user = existing.get();
            if (user.getOauthId() == null) {
                user.setOauthProvider("google");
                user.setOauthId(googleId);
                user.setVerified(true);
                return userRepository.save(user);
            }
            return user;
        }

        User user = new User();
        user.setEmail(email);
        user.setRole("customer");
        user.setVerified(true);
        user.setOauthProvider("google");
        user.setOauthId(googleId);
        return userRepository.save(user);
    }
}
