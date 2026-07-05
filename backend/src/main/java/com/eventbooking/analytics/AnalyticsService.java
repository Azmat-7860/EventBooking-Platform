package com.eventbooking.analytics;

import com.eventbooking.common.ApiResponse;
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

    public AnalyticsService(AnalyticsEventRepository repo) {
        this.repo = repo;
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
            m.put("itemId", row[0].toString());
            m.put("count", row[1]);
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
}
