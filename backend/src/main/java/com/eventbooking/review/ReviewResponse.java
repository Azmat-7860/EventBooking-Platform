package com.eventbooking.review;

import java.time.Instant;
import java.util.UUID;

public class ReviewResponse {
    private UUID id;
    private UUID itemId;
    private UUID bookingId;
    private UUID customerId;
    private String customerName;
    private String itemTitle;
    private Integer rating;
    private String comment;
    private Boolean flagged = false;
    private Instant createdAt;

    public ReviewResponse() {}

    public ReviewResponse(Review review, String customerName) {
        this.id = review.getId();
        this.itemId = review.getItemId();
        this.bookingId = review.getBookingId();
        this.customerId = review.getCustomerId();
        this.customerName = customerName;
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.flagged = Boolean.TRUE.equals(review.getIsFlagged());
        this.createdAt = review.getCreatedAt();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getItemId() { return itemId; }
    public void setItemId(UUID itemId) { this.itemId = itemId; }
    public UUID getBookingId() { return bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getItemTitle() { return itemTitle; }
    public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Boolean getFlagged() { return flagged; }
    public void setFlagged(Boolean flagged) { this.flagged = flagged; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
