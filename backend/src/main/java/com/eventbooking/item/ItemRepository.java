package com.eventbooking.item;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ItemRepository extends JpaRepository<Item, UUID>, JpaSpecificationExecutor<Item> {
    List<Item> findByVendorIdOrderByCreatedAtDesc(UUID vendorId);
    Optional<Item> findBySlug(String slug);
    List<Item> findByStatus(String status);
}
