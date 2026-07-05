import api from "./api"
import { ReviewRequest } from "@/types"

export const reviewService = {
  createReview: (data: ReviewRequest) =>
    api.post("/reviews", data),

  getItemReviews: (itemId: string, params?: { page?: number; size?: number }) =>
    api.get(`/reviews/item/${itemId}`, { params }),

  getItemReviewStats: (itemId: string) =>
    api.get(`/reviews/item/${itemId}/stats`),
}
