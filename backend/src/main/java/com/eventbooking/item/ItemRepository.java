package com.eventbooking.item;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ItemRepository extends JpaRepository<Item, UUID> {
    List<Item> findByVendorIdOrderByCreatedAtDesc(UUID vendorId);
    Optional<Item> findBySlug(String slug);
    List<Item> findByStatus(String status);
}
