package com.eventbooking.item;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BundleItemRepository extends JpaRepository<BundleItem, UUID> {
    List<BundleItem> findByBundleId(UUID bundleId);
    void deleteByBundleId(UUID bundleId);
}
