package com.eventbooking.profile;

import com.eventbooking.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vendor/profile")
@PreAuthorize("hasRole('VENDOR')")
public class VendorProfileController {

    private final VendorProfileRepository repo;

    public VendorProfileController(VendorProfileRepository repo) {
        this.repo = repo;
    }

    private UUID getUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<VendorProfile>> get(Authentication auth) {
        return ResponseEntity.ok(
            repo.findByUserId(getUserId(auth))
                .map(ApiResponse::ok)
                .orElse(ApiResponse.error("Vendor profile not found"))
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VendorProfile>> create(@RequestBody VendorProfile profile, Authentication auth) {
        profile.setUserId(getUserId(auth));
        return ResponseEntity.ok(ApiResponse.ok(repo.save(profile)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<VendorProfile>> update(@RequestBody VendorProfile profile, Authentication auth) {
        UUID userId = getUserId(auth);
        return repo.findByUserId(userId).map(existing -> {
            existing.setBusinessName(profile.getBusinessName());
            existing.setContactName(profile.getContactName());
            existing.setPhone(profile.getPhone());
            existing.setAddress(profile.getAddress());
            existing.setCity(profile.getCity());
            existing.setLogoUrl(profile.getLogoUrl());
            return ResponseEntity.ok(ApiResponse.ok(repo.save(existing)));
        }).orElse(ResponseEntity.badRequest().body(ApiResponse.error("Vendor profile not found")));
    }
}
