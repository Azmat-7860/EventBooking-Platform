package com.eventbooking.analytics;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, UUID> {

    long countByTypeAndItemIdAndCreatedAtBetween(String type, UUID itemId, Instant start, Instant end);

    long countByTypeAndUserIdAndCreatedAtBetween(String type, UUID userId, Instant start, Instant end);

    long countByTypeAndCreatedAtBetween(String type, Instant start, Instant end);

    @Query("SELECT FUNCTION('date_trunc', 'month', e.createdAt) as month, COUNT(e) " +
           "FROM AnalyticsEvent e WHERE e.type = :type AND e.userId = :userId " +
           "AND e.createdAt >= :since GROUP BY FUNCTION('date_trunc', 'month', e.createdAt) ORDER BY month")
    List<Object[]> countByTypeAndUserIdGroupByMonth(@Param("type") String type,
                                                     @Param("userId") UUID userId,
                                                     @Param("since") Instant since);

    @Query("SELECT FUNCTION('date_trunc', 'month', e.createdAt) as month, COUNT(e) " +
           "FROM AnalyticsEvent e WHERE e.type = :type " +
           "AND e.createdAt >= :since GROUP BY FUNCTION('date_trunc', 'month', e.createdAt) ORDER BY month")
    List<Object[]> countByTypeGroupByMonth(@Param("type") String type,
                                            @Param("since") Instant since);

    @Query("SELECT e.itemId, COUNT(e) FROM AnalyticsEvent e " +
           "WHERE e.type = :type AND e.createdAt >= :since " +
           "GROUP BY e.itemId ORDER BY COUNT(e) DESC")
    List<Object[]> findTopItemsByEventType(@Param("type") String type,
                                            @Param("since") Instant since,
                                            Pageable pageable);
}
