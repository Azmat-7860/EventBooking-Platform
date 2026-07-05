package com.eventbooking.admin;

import com.eventbooking.booking.Booking;
import com.eventbooking.booking.BookingRepository;
import com.eventbooking.common.ApiResponse;
import com.eventbooking.item.Item;
import com.eventbooking.item.ItemRepository;
import com.eventbooking.review.Review;
import com.eventbooking.review.ReviewRepository;
import com.eventbooking.user.User;
import com.eventbooking.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final BookingRepository bookingRepo;
    private final ItemRepository itemRepo;
    private final ReviewRepository reviewRepo;

    public AdminController(UserService userService,
                           BookingRepository bookingRepo,
                           ItemRepository itemRepo,
                           ReviewRepository reviewRepo) {
        this.userService = userService;
        this.bookingRepo = bookingRepo;
        this.itemRepo = itemRepo;
        this.reviewRepo = reviewRepo;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        long totalUsers = userService.countByRole("customer") + userService.countByRole("vendor") + userService.countByRole("admin");
        long totalVendors = userService.countByRole("vendor");
        long totalCustomers = userService.countByRole("customer");
        long totalItems = itemRepo.count();
        long publishedItems = itemRepo.findByStatus("published").size();
        long totalBookings = bookingRepo.count();
        long totalReviews = reviewRepo.count();

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "totalUsers", totalUsers,
                "totalVendors", totalVendors,
                "totalCustomers", totalCustomers,
                "totalItems", totalItems,
                "publishedItems", publishedItems,
                "totalBookings", totalBookings,
                "totalReviews", totalReviews
        )));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<Page<Booking>>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pr = PageRequest.of(page, size);
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(bookingRepo.findByStatusOrderByCreatedAtDesc(status, pr)));
        }
        return ResponseEntity.ok(ApiResponse.ok(bookingRepo.findAllByOrderByCreatedAtDesc(pr)));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<Page<Review>>> getAllReviews(
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pr = PageRequest.of(page, size);
        if (rating != null) {
            return ResponseEntity.ok(ApiResponse.ok(reviewRepo.findByRating(rating, pr)));
        }
        return ResponseEntity.ok(ApiResponse.ok(reviewRepo.findAllByOrderByCreatedAtDesc(pr)));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable UUID id) {
        if (reviewRepo.existsById(id)) {
            reviewRepo.deleteById(id);
            return ResponseEntity.ok(ApiResponse.ok(null, "Review deleted"));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("Review not found"));
    }
}
