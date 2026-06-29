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
}
