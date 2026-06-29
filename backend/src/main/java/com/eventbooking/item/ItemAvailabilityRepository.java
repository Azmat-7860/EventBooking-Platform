package com.eventbooking.item;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ItemAvailabilityRepository extends JpaRepository<ItemAvailability, UUID> {
    List<ItemAvailability> findByItemId(UUID itemId);
    boolean existsByItemIdAndBlockedDate(UUID itemId, LocalDate blockedDate);
}
