package com.eventbooking.item;

import java.time.Instant;
import java.util.UUID;

public class ItemDetailResponse {
    private UUID id;
    private UUID vendorId;
    private UUID categoryId;
    private String title;
    private String slug;
    private String description;
    private String startingFromText;
    private String videoUrl;
    private String externalUrl;
    private boolean isBundle;
    private String bundleName;
    private String bundleDescription;
    private String status;
    private String metaTitle;
    private String metaDesc;
    private Instant createdAt;
    private double avgRating;
    private long reviewCount;

    public ItemDetailResponse() {}

    public ItemDetailResponse(Item item, double avgRating, long reviewCount) {
        this.id = item.getId();
        this.vendorId = item.getVendorId();
        this.categoryId = item.getCategoryId();
        this.title = item.getTitle();
        this.slug = item.getSlug();
        this.description = item.getDescription();
        this.startingFromText = item.getStartingFromText();
        this.videoUrl = item.getVideoUrl();
        this.externalUrl = item.getExternalUrl();
        this.isBundle = item.isBundle();
        this.bundleName = item.getBundleName();
        this.bundleDescription = item.getBundleDescription();
        this.status = item.getStatus();
        this.metaTitle = item.getMetaTitle();
        this.metaDesc = item.getMetaDesc();
        this.createdAt = item.getCreatedAt();
        this.avgRating = avgRating;
        this.reviewCount = reviewCount;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getVendorId() { return vendorId; }
    public void setVendorId(UUID vendorId) { this.vendorId = vendorId; }
    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStartingFromText() { return startingFromText; }
    public void setStartingFromText(String startingFromText) { this.startingFromText = startingFromText; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public String getExternalUrl() { return externalUrl; }
    public void setExternalUrl(String externalUrl) { this.externalUrl = externalUrl; }
    public boolean isBundle() { return isBundle; }
    public void setBundle(boolean bundle) { isBundle = bundle; }
    public String getBundleName() { return bundleName; }
    public void setBundleName(String bundleName) { this.bundleName = bundleName; }
    public String getBundleDescription() { return bundleDescription; }
    public void setBundleDescription(String bundleDescription) { this.bundleDescription = bundleDescription; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMetaTitle() { return metaTitle; }
    public void setMetaTitle(String metaTitle) { this.metaTitle = metaTitle; }
    public String getMetaDesc() { return metaDesc; }
    public void setMetaDesc(String metaDesc) { this.metaDesc = metaDesc; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public double getAvgRating() { return avgRating; }
    public void setAvgRating(double avgRating) { this.avgRating = avgRating; }
    public long getReviewCount() { return reviewCount; }
    public void setReviewCount(long reviewCount) { this.reviewCount = reviewCount; }
}
