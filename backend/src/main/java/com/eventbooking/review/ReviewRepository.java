package com.eventbooking.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Page<Review> findByItemIdOrderByCreatedAtDesc(UUID itemId, Pageable pageable);

    boolean existsByBookingId(UUID bookingId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.itemId = :itemId")
    Double getAverageRatingByItemId(@Param("itemId") UUID itemId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.itemId = :itemId")
    Long getReviewCountByItemId(@Param("itemId") UUID itemId);

    Page<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Review> findByRating(Integer rating, Pageable pageable);

    Page<Review> findByIsFlaggedTrueOrderByCreatedAtDesc(Pageable pageable);
}
