package com.eventbooking.analytics;

import com.eventbooking.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService service;

    public AnalyticsController(AnalyticsService service) {
        this.service = service;
    }

    @PostMapping("/event")
    public ResponseEntity<ApiResponse<Void>> logEvent(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String type = body.get("type");
        String itemId = body.get("itemId");
        String userId = body.get("userId");
        String ip = request.getRemoteAddr();
        String ua = request.getHeader("User-Agent");
        service.logEvent(type, itemId, userId, ip, ua);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
