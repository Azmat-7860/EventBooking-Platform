package com.eventbooking.review;

public class ReviewStats {
    private double avgRating;
    private long reviewCount;

    public ReviewStats() {}

    public ReviewStats(double avgRating, long reviewCount) {
        this.avgRating = avgRating;
        this.reviewCount = reviewCount;
    }

    public double getAvgRating() { return avgRating; }
    public void setAvgRating(double avgRating) { this.avgRating = avgRating; }
    public long getReviewCount() { return reviewCount; }
    public void setReviewCount(long reviewCount) { this.reviewCount = reviewCount; }
}
