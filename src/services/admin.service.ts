import api from "./api"
import { Category } from "@/types"

export const adminService = {
  getCategories: () => api.get("/categories"),

  getCategory: (id: string) => api.get(`/categories/${id}`),

  createCategory: (data: Partial<Category>) =>
    api.post("/categories", data),

  updateCategory: (id: string, data: Partial<Category>) =>
    api.put(`/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete(`/categories/${id}`),

  getUsers: (params?: { page?: number; size?: number; role?: string; search?: string }) =>
    api.get("/users", { params }),

  suspendUser: (id: string) =>
    api.put(`/users/${id}/suspend`),

  reinstateUser: (id: string) =>
    api.put(`/users/${id}/reinstate`),

  getStats: () =>
    api.get("/admin/stats"),

  getAllBookings: (params?: { status?: string; page?: number; size?: number }) =>
    api.get("/admin/bookings", { params }),

  getAllReviews: (params?: { rating?: number; page?: number; size?: number }) =>
    api.get("/admin/reviews", { params }),

  deleteReview: (id: string) =>
    api.delete(`/admin/reviews/${id}`),
}
