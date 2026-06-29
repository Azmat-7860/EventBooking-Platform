package com.eventbooking.item;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "bundle_items")
public class BundleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "bundle_id", nullable = false)
    private UUID bundleId;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getBundleId() { return bundleId; }
    public void setBundleId(UUID bundleId) { this.bundleId = bundleId; }
    public UUID getItemId() { return itemId; }
    public void setItemId(UUID itemId) { this.itemId = itemId; }
}
