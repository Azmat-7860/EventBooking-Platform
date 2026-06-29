package com.eventbooking.item;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ItemPhotoRepository extends JpaRepository<ItemPhoto, UUID> {
    List<ItemPhoto> findByItemIdOrderBySortOrder(UUID itemId);
    void deleteByItemId(UUID itemId);
}
