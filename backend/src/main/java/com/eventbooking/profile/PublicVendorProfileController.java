package com.eventbooking.profile;

import com.eventbooking.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/vendors")
public class PublicVendorProfileController {

    private final VendorProfileRepository repo;

    public PublicVendorProfileController(VendorProfileRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<VendorProfile>> getByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(
            repo.findByUserId(userId)
                .map(ApiResponse::ok)
                .orElse(ApiResponse.error("Vendor profile not found"))
        );
    }
}
