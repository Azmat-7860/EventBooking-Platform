package com.eventbooking.analytics;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

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
}
