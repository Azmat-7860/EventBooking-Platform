package com.eventbooking.booking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Page<Booking> findByCustomerIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);
    Page<Booking> findByVendorIdOrderByCreatedAtDesc(UUID vendorId, Pageable pageable);
    Page<Booking> findByVendorIdAndStatusOrderByCreatedAtDesc(UUID vendorId, String status, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.vendorId = :vendorId " +
           "AND (:status IS NULL OR b.status = :status) " +
           "AND (:date IS NULL OR b.preferredDate = :date) " +
           "ORDER BY b.createdAt DESC")
    Page<Booking> findByVendorIdFiltered(@Param("vendorId") UUID vendorId,
                                          @Param("status") String status,
                                          @Param("date") LocalDate date,
                                          Pageable pageable);

    long countByVendorIdAndStatus(UUID vendorId, String status);
    long countByVendorId(UUID vendorId);

    @Query("SELECT DISTINCT b.itemId FROM Booking b WHERE b.preferredDate = :date AND b.status = 'confirmed'")
    List<UUID> findItemIdsWithConfirmedBookingOnDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.vendorId = :vendorId " +
           "AND b.createdAt >= :startOfMonth")
    long countByVendorIdAndCreatedAtAfter(@Param("vendorId") UUID vendorId,
                                           @Param("startOfMonth") java.time.Instant startOfMonth);

    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Booking> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt >= :startOfMonth")
    long countByCreatedAtAfter(@Param("startOfMonth") java.time.Instant startOfMonth);
}
