package com.eventbooking.profile;

import com.eventbooking.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final UserProfileRepository userProfileRepo;

    public ProfileController(UserProfileRepository userProfileRepo) {
        this.userProfileRepo = userProfileRepo;
    }

    private UUID getUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserProfile>> get(Authentication auth) {
        return ResponseEntity.ok(
            userProfileRepo.findByUserId(getUserId(auth))
                .map(ApiResponse::ok)
                .orElse(ApiResponse.error("Profile not found"))
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserProfile>> create(@RequestBody UserProfile profile, Authentication auth) {
        profile.setUserId(getUserId(auth));
        return ResponseEntity.ok(ApiResponse.ok(userProfileRepo.save(profile)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserProfile>> update(@RequestBody UserProfile profile, Authentication auth) {
        UUID userId = getUserId(auth);
        return userProfileRepo.findByUserId(userId).map(existing -> {
            existing.setFullName(profile.getFullName());
            existing.setMobile(profile.getMobile());
            existing.setAddress(profile.getAddress());
            existing.setCity(profile.getCity());
            existing.setPhotoUrl(profile.getPhotoUrl());
            return ResponseEntity.ok(ApiResponse.ok(userProfileRepo.save(existing)));
        }).orElse(ResponseEntity.badRequest().body(ApiResponse.error("Profile not found")));
    }
}
