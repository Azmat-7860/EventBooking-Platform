package com.eventbooking.admin;

import com.eventbooking.booking.BookingRepository;
import com.eventbooking.booking.BookingResponse;
import com.eventbooking.booking.BookingService;
import com.eventbooking.common.ApiResponse;
import com.eventbooking.item.ItemRepository;
import com.eventbooking.review.ReviewRepository;
import com.eventbooking.review.ReviewResponse;
import com.eventbooking.review.ReviewService;
import com.eventbooking.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final BookingRepository bookingRepo;
    private final BookingService bookingService;
    private final ItemRepository itemRepo;
    private final ReviewRepository reviewRepo;
    private final ReviewService reviewService;

    public AdminController(UserService userService,
                           BookingRepository bookingRepo,
                           BookingService bookingService,
                           ItemRepository itemRepo,
                           ReviewRepository reviewRepo,
                           ReviewService reviewService) {
        this.userService = userService;
        this.bookingRepo = bookingRepo;
        this.bookingService = bookingService;
        this.itemRepo = itemRepo;
        this.reviewRepo = reviewRepo;
        this.reviewService = reviewService;
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
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(bookingService.getAllBookingsForAdmin(status, page, size));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getAllReviews(
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Boolean flagged,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(reviewService.getAllReviewsForAdmin(rating, flagged, page, size));
    }

    @PutMapping("/reviews/{id}/flag")
    public ResponseEntity<ApiResponse<ReviewResponse>> toggleReviewFlag(@PathVariable UUID id) {
        return ResponseEntity.ok(reviewService.toggleFlag(id));
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
