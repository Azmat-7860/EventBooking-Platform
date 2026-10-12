package com.eventbooking.analytics;

import com.eventbooking.booking.BookingRepository;
import com.eventbooking.common.ApiResponse;
import com.eventbooking.item.Item;
import com.eventbooking.item.ItemRepository;
import com.eventbooking.profile.VendorProfile;
import com.eventbooking.profile.VendorProfileRepository;
import com.eventbooking.review.ReviewRepository;
import com.eventbooking.user.User;
import com.eventbooking.user.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class AnalyticsService {

    private final AnalyticsEventRepository repo;
    private final ItemRepository itemRepo;
    private final ReviewRepository reviewRepo;
    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;
    private final VendorProfileRepository vendorProfileRepo;

    public AnalyticsService(AnalyticsEventRepository repo,
                            ItemRepository itemRepo,
                            ReviewRepository reviewRepo,
                            BookingRepository bookingRepo,
                            UserRepository userRepo,
                            VendorProfileRepository vendorProfileRepo) {
        this.repo = repo;
        this.itemRepo = itemRepo;
        this.reviewRepo = reviewRepo;
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.vendorProfileRepo = vendorProfileRepo;
    }

    @Async
    public void logEvent(String type, String itemId, String userId, String ipAddress, String userAgent) {
        AnalyticsEvent event = new AnalyticsEvent();
        event.setType(type);
        if (itemId != null) event.setItemId(java.util.UUID.fromString(itemId));
        if (userId != null) event.setUserId(java.util.UUID.fromString(userId));
        event.setIpAddress(ipAddress);
        event.setUserAgent(userAgent);
        repo.save(event);
    }

    public ApiResponse<Map<String, Object>> getVendorAnalytics(UUID vendorId, LocalDate from, LocalDate to) {
        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : Instant.now().minus(30, ChronoUnit.DAYS);
        Instant toInstant = to != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : Instant.now();

        long totalViews = repo.countByTypeAndUserIdAndCreatedAtBetween("view", vendorId, fromInstant, toInstant);
        long totalInquiries = repo.countByTypeAndUserIdAndCreatedAtBetween("inquiry", vendorId, fromInstant, toInstant);
        long totalShares = repo.countByTypeAndUserIdAndCreatedAtBetween("share", vendorId, fromInstant, toInstant);

        List<Object[]> monthlyInquiries = repo.countByTypeAndUserIdGroupByMonth("inquiry", vendorId, fromInstant);

        List<Map<String, Object>> monthlyData = new ArrayList<>();
        for (Object[] row : monthlyInquiries) {
            Map<String, Object> m = new HashMap<>();
            m.put("month", row[0].toString());
            m.put("count", row[1]);
            monthlyData.add(m);
        }

        return ApiResponse.ok(Map.of(
                "totalViews", totalViews,
                "totalInquiries", totalInquiries,
                "totalShares", totalShares,
                "monthlyInquiries", monthlyData
        ));
    }

    public ApiResponse<List<Map<String, Object>>> getVendorItemAnalytics(UUID vendorId) {
        List<Item> items = itemRepo.findByVendorIdOrderByCreatedAtDesc(vendorId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Item item : items) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", item.getId().toString());
            m.put("title", item.getTitle());
            m.put("slug", item.getSlug());
            m.put("status", item.getStatus());

            long views = repo.countByTypeAndItemId("view", item.getId());
            long inquiries = repo.countByTypeAndItemId("inquiry", item.getId());
            long shares = repo.countByTypeAndItemId("share", item.getId());

            Double avgRating = reviewRepo.getAverageRatingByItemId(item.getId());
            Long reviewCount = reviewRepo.getReviewCountByItemId(item.getId());

            m.put("views", views);
            m.put("inquiries", inquiries);
            m.put("shares", shares);
            m.put("avgRating", avgRating != null ? avgRating : 0.0);
            m.put("reviewCount", reviewCount != null ? reviewCount : 0L);

            result.add(m);
        }

        return ApiResponse.ok(result);
    }

    public ApiResponse<Map<String, Object>> getAdminAnalytics() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        long totalViews = repo.countByTypeAndCreatedAtBetween("view", thirtyDaysAgo, Instant.now());
        long totalInquiries = repo.countByTypeAndCreatedAtBetween("inquiry", thirtyDaysAgo, Instant.now());
        long totalShares = repo.countByTypeAndCreatedAtBetween("share", thirtyDaysAgo, Instant.now());

        List<Object[]> monthlyInquiries = repo.countByTypeGroupByMonth("inquiry", thirtyDaysAgo);

        List<Map<String, Object>> monthlyData = new ArrayList<>();
        for (Object[] row : monthlyInquiries) {
            Map<String, Object> m = new HashMap<>();
            m.put("month", row[0].toString());
            m.put("count", row[1]);
            monthlyData.add(m);
        }

        List<Object[]> topItems = repo.findTopItemsByEventType("inquiry", thirtyDaysAgo, PageRequest.of(0, 5));
        List<Map<String, Object>> topItemsData = new ArrayList<>();
        for (Object[] row : topItems) {
            Map<String, Object> m = new HashMap<>();
            String itemIdStr = row[0].toString();
            m.put("itemId", itemIdStr);
            m.put("count", row[1]);
            try {
                itemRepo.findById(UUID.fromString(itemIdStr)).ifPresent(it -> m.put("itemTitle", it.getTitle()));
            } catch (Exception ignored) {}
            topItemsData.add(m);
        }

        return ApiResponse.ok(Map.of(
                "totalViews", totalViews,
                "totalInquiries", totalInquiries,
                "totalShares", totalShares,
                "monthlyInquiries", monthlyData,
                "topItems", topItemsData
        ));
    }

    public ApiResponse<List<Map<String, Object>>> getAdminVendorAnalytics() {
        List<User> vendors = userRepo.findByRole("vendor");
        List<Map<String, Object>> result = new ArrayList<>();

        for (User v : vendors) {
            Map<String, Object> m = new HashMap<>();
            m.put("vendorId", v.getId().toString());
            m.put("email", v.getEmail());

            VendorProfile vp = vendorProfileRepo.findByUserId(v.getId()).orElse(null);
            m.put("businessName", vp != null && vp.getBusinessName() != null ? vp.getBusinessName() : v.getEmail());

            List<Item> items = itemRepo.findByVendorIdOrderByCreatedAtDesc(v.getId());
            m.put("itemCount", items.size());

            long totalInquiries = bookingRepo.countByVendorId(v.getId());
            m.put("totalInquiries", totalInquiries);

            long totalViews = 0;
            String topItemTitle = items.isEmpty() ? "No items" : items.get(0).getTitle();
            long maxItemViews = -1;

            for (Item item : items) {
                long itemViews = repo.countByTypeAndItemId("view", item.getId());
                totalViews += itemViews;
                if (itemViews > maxItemViews) {
                    maxItemViews = itemViews;
                    topItemTitle = item.getTitle();
                }
            }

            m.put("totalViews", totalViews);
            m.put("topItem", topItemTitle);
            result.add(m);
        }

        result.sort((a, b) -> {
            long inqA = ((Number) a.get("totalInquiries")).longValue();
            long inqB = ((Number) b.get("totalInquiries")).longValue();
            if (inqA != inqB) return Long.compare(inqB, inqA);
            long viewsA = ((Number) a.get("totalViews")).longValue();
            long viewsB = ((Number) b.get("totalViews")).longValue();
            return Long.compare(viewsB, viewsA);
        });

        return ApiResponse.ok(result);
    }
}
