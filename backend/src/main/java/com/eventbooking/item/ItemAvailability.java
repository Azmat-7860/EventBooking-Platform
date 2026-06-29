package com.eventbooking.item;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "item_availability")
public class ItemAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "blocked_date", nullable = false)
    private LocalDate blockedDate;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getItemId() { return itemId; }
    public void setItemId(UUID itemId) { this.itemId = itemId; }
    public LocalDate getBlockedDate() { return blockedDate; }
    public void setBlockedDate(LocalDate blockedDate) { this.blockedDate = blockedDate; }
}
