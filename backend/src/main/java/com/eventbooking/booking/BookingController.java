package com.eventbooking.booking;

import com.eventbooking.common.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    private UUID getUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> submitInquiry(
            @RequestBody BookingRequest req, Authentication auth) {
        return ResponseEntity.ok(service.submitInquiry(req, getUserId(auth)));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        return ResponseEntity.ok(service.getMyBookings(getUserId(auth), page, size));
    }

    @GetMapping("/vendor")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getVendorBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        return ResponseEntity.ok(service.getVendorBookings(getUserId(auth), status, date, page, size));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Status is required"));
        }
        return ResponseEntity.ok(service.updateStatus(id, getUserId(auth), status));
    }

    @GetMapping("/vendor/counts")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getCounts(Authentication auth) {
        UUID vendorId = getUserId(auth);
        long pending = service.getVendorPendingCount(vendorId).getData();
        long total = service.getVendorTotalCount(vendorId).getData();
        long thisMonth = service.getVendorThisMonthCount(vendorId).getData();
        long confirmed = service.getVendorConfirmedCount(vendorId).getData();
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "pending", pending,
                "total", total,
                "thisMonth", thisMonth,
                "confirmed", confirmed
        )));
    }
}
