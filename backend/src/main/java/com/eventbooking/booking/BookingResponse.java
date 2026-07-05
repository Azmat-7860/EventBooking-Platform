package com.eventbooking.booking;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class BookingResponse {
    private UUID id;
    private UUID itemId;
    private String itemTitle;
    private String itemSlug;
    private String itemPhotoUrl;
    private UUID customerId;
    private String customerEmail;
    private UUID vendorId;
    private String vendorBusinessName;
    private LocalDate preferredDate;
    private LocalTime fromTime;
    private LocalTime toTime;
    private String fromLocation;
    private String toLocation;
    private String name;
    private String mobile;
    private String message;
    private String status;
    private Instant createdAt;

    public BookingResponse() {}

    public BookingResponse(Booking booking, String itemTitle, String itemSlug, String itemPhotoUrl, String customerEmail, String vendorBusinessName) {
        this.id = booking.getId();
        this.itemId = booking.getItemId();
        this.itemTitle = itemTitle;
        this.itemSlug = itemSlug;
        this.itemPhotoUrl = itemPhotoUrl;
        this.customerId = booking.getCustomerId();
        this.customerEmail = customerEmail;
        this.vendorId = booking.getVendorId();
        this.vendorBusinessName = vendorBusinessName;
        this.preferredDate = booking.getPreferredDate();
        this.fromTime = booking.getFromTime();
        this.toTime = booking.getToTime();
        this.fromLocation = booking.getFromLocation();
        this.toLocation = booking.getToLocation();
        this.name = booking.getName();
        this.mobile = booking.getMobile();
        this.message = booking.getMessage();
        this.status = booking.getStatus();
        this.createdAt = booking.getCreatedAt();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getItemId() { return itemId; }
    public void setItemId(UUID itemId) { this.itemId = itemId; }
    public String getItemTitle() { return itemTitle; }
    public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }
    public String getItemSlug() { return itemSlug; }
    public void setItemSlug(String itemSlug) { this.itemSlug = itemSlug; }
    public String getItemPhotoUrl() { return itemPhotoUrl; }
    public void setItemPhotoUrl(String itemPhotoUrl) { this.itemPhotoUrl = itemPhotoUrl; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public UUID getVendorId() { return vendorId; }
    public void setVendorId(UUID vendorId) { this.vendorId = vendorId; }
    public String getVendorBusinessName() { return vendorBusinessName; }
    public void setVendorBusinessName(String vendorBusinessName) { this.vendorBusinessName = vendorBusinessName; }
    public LocalDate getPreferredDate() { return preferredDate; }
    public void setPreferredDate(LocalDate preferredDate) { this.preferredDate = preferredDate; }
    public LocalTime getFromTime() { return fromTime; }
    public void setFromTime(LocalTime fromTime) { this.fromTime = fromTime; }
    public LocalTime getToTime() { return toTime; }
    public void setToTime(LocalTime toTime) { this.toTime = toTime; }
    public String getFromLocation() { return fromLocation; }
    public void setFromLocation(String fromLocation) { this.fromLocation = fromLocation; }
    public String getToLocation() { return toLocation; }
    public void setToLocation(String toLocation) { this.toLocation = toLocation; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
