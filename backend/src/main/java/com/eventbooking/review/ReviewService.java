package com.eventbooking.review;

import com.eventbooking.booking.Booking;
import com.eventbooking.booking.BookingRepository;
import com.eventbooking.common.ApiResponse;
import com.eventbooking.user.User;
import com.eventbooking.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;
    private final com.eventbooking.item.ItemRepository itemRepo;

    public ReviewService(ReviewRepository reviewRepo,
                         BookingRepository bookingRepo,
                         UserRepository userRepo,
                         com.eventbooking.item.ItemRepository itemRepo) {
        this.reviewRepo = reviewRepo;
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.itemRepo = itemRepo;
    }

    public ApiResponse<ReviewResponse> createReview(ReviewRequest req, UUID customerId) {
        Booking booking = bookingRepo.findById(UUID.fromString(req.getBookingId())).orElse(null);
        if (booking == null) {
            return ApiResponse.error("Booking not found");
        }
        if (!booking.getCustomerId().equals(customerId)) {
            return ApiResponse.error("Not authorized to review this booking");
        }
        if (!"confirmed".equals(booking.getStatus())) {
            return ApiResponse.error("Only confirmed bookings can be reviewed");
        }
        if (reviewRepo.existsByBookingId(booking.getId())) {
            return ApiResponse.error("You have already reviewed this booking");
        }

        Review review = new Review();
        review.setItemId(booking.getItemId());
        review.setBookingId(booking.getId());
        review.setCustomerId(customerId);
        review.setRating(req.getRating());
        review.setComment(req.getComment());
        review = reviewRepo.save(review);

        User customer = userRepo.findById(customerId).orElse(null);
        String customerName = customer != null ? customer.getEmail() : "Unknown";

        ReviewResponse response = new ReviewResponse(review, customerName);
        itemRepo.findById(booking.getItemId()).ifPresent(item -> response.setItemTitle(item.getTitle()));

        return ApiResponse.ok(response, "Review submitted successfully");
    }

    public ApiResponse<Page<ReviewResponse>> getItemReviews(UUID itemId, int page, int size) {
        Page<Review> reviews = reviewRepo.findByItemIdOrderByCreatedAtDesc(itemId, PageRequest.of(page, size));
        Page<ReviewResponse> response = reviews.map(r -> {
            User customer = userRepo.findById(r.getCustomerId()).orElse(null);
            ReviewResponse res = new ReviewResponse(r, customer != null ? customer.getEmail() : "Unknown");
            itemRepo.findById(r.getItemId()).ifPresent(item -> res.setItemTitle(item.getTitle()));
            return res;
        });
        return ApiResponse.ok(response);
    }

    public ApiResponse<Page<ReviewResponse>> getAllReviewsForAdmin(Integer rating, Boolean flagged, int page, int size) {
        PageRequest pr = PageRequest.of(page, size);
        Page<Review> reviews;
        if (Boolean.TRUE.equals(flagged)) {
            reviews = reviewRepo.findByIsFlaggedTrueOrderByCreatedAtDesc(pr);
        } else if (rating != null) {
            reviews = reviewRepo.findByRating(rating, pr);
        } else {
            reviews = reviewRepo.findAllByOrderByCreatedAtDesc(pr);
        }

        Page<ReviewResponse> response = reviews.map(r -> {
            User customer = userRepo.findById(r.getCustomerId()).orElse(null);
            ReviewResponse res = new ReviewResponse(r, customer != null ? customer.getEmail() : "Unknown");
            itemRepo.findById(r.getItemId()).ifPresent(item -> res.setItemTitle(item.getTitle()));
            return res;
        });
        return ApiResponse.ok(response);
    }

    public ApiResponse<ReviewResponse> toggleFlag(UUID reviewId) {
        return reviewRepo.findById(reviewId).map(r -> {
            boolean newFlag = !Boolean.TRUE.equals(r.getIsFlagged());
            r.setIsFlagged(newFlag);
            reviewRepo.save(r);

            User customer = userRepo.findById(r.getCustomerId()).orElse(null);
            ReviewResponse res = new ReviewResponse(r, customer != null ? customer.getEmail() : "Unknown");
            itemRepo.findById(r.getItemId()).ifPresent(item -> res.setItemTitle(item.getTitle()));
            return ApiResponse.ok(res, newFlag ? "Review flagged" : "Review unflagged");
        }).orElse(ApiResponse.error("Review not found"));
    }

    public ApiResponse<ReviewStats> getItemReviewStats(UUID itemId) {
        Double avgRating = reviewRepo.getAverageRatingByItemId(itemId);
        Long reviewCount = reviewRepo.getReviewCountByItemId(itemId);
        return ApiResponse.ok(new ReviewStats(avgRating, reviewCount));
    }
}
