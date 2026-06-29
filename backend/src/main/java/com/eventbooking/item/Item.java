package com.eventbooking.item;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "vendor_id", nullable = false)
    private UUID vendorId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "starting_from_text", length = 100)
    private String startingFromText;

    @Column(name = "video_url", columnDefinition = "TEXT")
    private String videoUrl;

    @Column(name = "external_url", columnDefinition = "TEXT")
    private String externalUrl;

    @Column(name = "is_bundle")
    private boolean isBundle;

    @Column(name = "bundle_name", length = 255)
    private String bundleName;

    @Column(name = "bundle_description", columnDefinition = "TEXT")
    private String bundleDescription;

    @Column(length = 20)
    private String status = "draft";

    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_desc", columnDefinition = "TEXT")
    private String metaDesc;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        if (status == null) status = "draft";
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
}
