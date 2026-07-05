package com.eventbooking.review;

import com.eventbooking.common.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    private UUID getUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @RequestBody ReviewRequest req, Authentication auth) {
        return ResponseEntity.ok(service.createReview(req, getUserId(auth)));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getItemReviews(
            @PathVariable UUID itemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getItemReviews(itemId, page, size));
    }

    @GetMapping("/item/{itemId}/stats")
    public ResponseEntity<ApiResponse<ReviewStats>> getItemStats(@PathVariable UUID itemId) {
        return ResponseEntity.ok(service.getItemReviewStats(itemId));
    }
}
