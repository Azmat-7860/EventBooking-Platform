package com.eventbooking.item;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BundleRepository extends JpaRepository<Bundle, UUID> {
    List<Bundle> findByVendorId(UUID vendorId);
}
