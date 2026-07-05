package com.eventbooking.booking;

import com.eventbooking.analytics.AnalyticsService;
import com.eventbooking.common.ApiResponse;
import com.eventbooking.email.EmailService;
import com.eventbooking.item.Item;
import com.eventbooking.item.ItemPhotoRepository;
import com.eventbooking.item.ItemRepository;
import com.eventbooking.profile.VendorProfile;
import com.eventbooking.profile.VendorProfileRepository;
import com.eventbooking.user.User;
import com.eventbooking.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final ItemRepository itemRepo;
    private final ItemPhotoRepository photoRepo;
    private final UserRepository userRepo;
    private final VendorProfileRepository vendorProfileRepo;
    private final EmailService emailService;
    private final AnalyticsService analyticsService;

    public BookingService(BookingRepository bookingRepo, ItemRepository itemRepo,
                          ItemPhotoRepository photoRepo, UserRepository userRepo,
                          VendorProfileRepository vendorProfileRepo,
                          EmailService emailService, AnalyticsService analyticsService) {
        this.bookingRepo = bookingRepo;
        this.itemRepo = itemRepo;
        this.photoRepo = photoRepo;
        this.userRepo = userRepo;
        this.vendorProfileRepo = vendorProfileRepo;
        this.emailService = emailService;
        this.analyticsService = analyticsService;
    }

    private String getItemPhotoUrl(UUID itemId) {
        var photos = photoRepo.findByItemIdOrderBySortOrder(itemId);
        return photos.isEmpty() ? null : photos.get(0).getPhotoUrl();
    }

    public ApiResponse<BookingResponse> submitInquiry(BookingRequest req, UUID customerId) {
        Item item = itemRepo.findById(UUID.fromString(req.getItemId()))
                .orElse(null);
        if (item == null) {
            return ApiResponse.error("Item not found");
        }
        if (!"published".equals(item.getStatus())) {
            return ApiResponse.error("Item is not available for booking");
        }

        Booking booking = new Booking();
        booking.setItemId(item.getId());
        booking.setCustomerId(customerId);
        booking.setVendorId(item.getVendorId());
        booking.setPreferredDate(req.getPreferredDate());
        booking.setFromTime(req.getFromTime());
        booking.setToTime(req.getToTime());
        booking.setFromLocation(req.getFromLocation());
        booking.setToLocation(req.getToLocation());
        booking.setName(req.getName());
        booking.setMobile(req.getMobile());
        booking.setMessage(req.getMessage());
        booking = bookingRepo.save(booking);

        User customer = userRepo.findById(customerId).orElse(null);
        User vendor = userRepo.findById(item.getVendorId()).orElse(null);
        VendorProfile vendorProfile = vendorProfileRepo.findByUserId(item.getVendorId()).orElse(null);
        String vendorBusinessName = vendorProfile != null ? vendorProfile.getBusinessName() : vendor.getEmail();

        String photoUrl = getItemPhotoUrl(item.getId());
        BookingResponse response = new BookingResponse(booking, item.getTitle(), item.getSlug(),
                photoUrl, customer != null ? customer.getEmail() : "", vendorBusinessName);

        emailService.sendInquiryToVendor(vendor.getEmail(), booking, customer.getEmail(), item.getTitle(), vendorBusinessName);
        emailService.sendInquiryToCustomer(customer.getEmail(), booking, item.getTitle(), vendorBusinessName);

        analyticsService.logEvent("inquiry", item.getId().toString(), customerId.toString(), null, null);

        return ApiResponse.ok(response, "Inquiry submitted successfully");
    }

    public ApiResponse<Page<BookingResponse>> getMyBookings(UUID customerId, int page, int size) {
        Page<Booking> bookings = bookingRepo.findByCustomerIdOrderByCreatedAtDesc(customerId, PageRequest.of(page, size));
        Page<BookingResponse> response = bookings.map(b -> {
            Item item = itemRepo.findById(b.getItemId()).orElse(null);
            User vendor = userRepo.findById(b.getVendorId()).orElse(null);
            VendorProfile vp = vendorProfileRepo.findByUserId(b.getVendorId()).orElse(null);
            String photoUrl = item != null ? getItemPhotoUrl(item.getId()) : null;
            return new BookingResponse(b,
                    item != null ? item.getTitle() : "Unknown",
                    item != null ? item.getSlug() : "",
                    photoUrl,
                    null,
                    vp != null ? vp.getBusinessName() : (vendor != null ? vendor.getEmail() : "Unknown"));
        });
        return ApiResponse.ok(response);
    }

    public ApiResponse<Page<BookingResponse>> getVendorBookings(UUID vendorId, String status, LocalDate date, int page, int size) {
        Page<Booking> bookings;
        if (status != null || date != null) {
            bookings = bookingRepo.findByVendorIdFiltered(vendorId, status, date, PageRequest.of(page, size));
        } else {
            bookings = bookingRepo.findByVendorIdOrderByCreatedAtDesc(vendorId, PageRequest.of(page, size));
        }
        Page<BookingResponse> response = bookings.map(b -> {
            Item item = itemRepo.findById(b.getItemId()).orElse(null);
            User customer = userRepo.findById(b.getCustomerId()).orElse(null);
            VendorProfile vp = vendorProfileRepo.findByUserId(vendorId).orElse(null);
            String photoUrl = item != null ? getItemPhotoUrl(item.getId()) : null;
            return new BookingResponse(b,
                    item != null ? item.getTitle() : "Unknown",
                    item != null ? item.getSlug() : "",
                    photoUrl,
                    customer != null ? customer.getEmail() : "",
                    vp != null ? vp.getBusinessName() : "Unknown");
        });
        return ApiResponse.ok(response);
    }

    public ApiResponse<BookingResponse> updateStatus(UUID bookingId, UUID vendorId, String status) {
        return bookingRepo.findById(bookingId).map(booking -> {
            if (!booking.getVendorId().equals(vendorId)) {
                return ApiResponse.<BookingResponse>error("Not authorized to update this booking");
            }
            if (!"pending".equals(booking.getStatus())) {
                return ApiResponse.<BookingResponse>error("Booking is already " + booking.getStatus());
            }
            if (!"confirmed".equals(status) && !"cancelled".equals(status)) {
                return ApiResponse.<BookingResponse>error("Invalid status. Must be 'confirmed' or 'cancelled'");
            }

            booking.setStatus(status);
            booking = bookingRepo.save(booking);

            Item item = itemRepo.findById(booking.getItemId()).orElse(null);
            User customer = userRepo.findById(booking.getCustomerId()).orElse(null);
            VendorProfile vp = vendorProfileRepo.findByUserId(vendorId).orElse(null);
            String vendorBusinessName = vp != null ? vp.getBusinessName() : "Vendor";
            String itemTitle = item != null ? item.getTitle() : "Unknown";
            String customerEmail = customer != null ? customer.getEmail() : "";
            String photoUrl = item != null ? getItemPhotoUrl(item.getId()) : null;

            BookingResponse response = new BookingResponse(booking, itemTitle, item != null ? item.getSlug() : "",
                    photoUrl, customerEmail, vendorBusinessName);

            if ("confirmed".equals(status)) {
                emailService.sendBookingConfirmedToCustomer(customerEmail, booking, itemTitle, vendorBusinessName);
            } else if ("cancelled".equals(status)) {
                emailService.sendBookingCancelledToCustomer(customerEmail, booking, itemTitle, vendorBusinessName);
            }

            return ApiResponse.ok(response, "Booking " + status);
        }).orElse(ApiResponse.error("Booking not found"));
    }

    public ApiResponse<Long> getVendorPendingCount(UUID vendorId) {
        return ApiResponse.ok(bookingRepo.countByVendorIdAndStatus(vendorId, "pending"));
    }

    public ApiResponse<Long> getVendorTotalCount(UUID vendorId) {
        return ApiResponse.ok(bookingRepo.countByVendorId(vendorId));
    }

    public ApiResponse<Long> getVendorThisMonthCount(UUID vendorId) {
        Instant startOfMonth = LocalDateTime.now().withDayOfMonth(1).toInstant(ZoneOffset.UTC);
        return ApiResponse.ok(bookingRepo.countByVendorIdAndCreatedAtAfter(vendorId, startOfMonth));
    }

    public ApiResponse<Long> getVendorConfirmedCount(UUID vendorId) {
        return ApiResponse.ok(bookingRepo.countByVendorIdAndStatus(vendorId, "confirmed"));
    }
}
