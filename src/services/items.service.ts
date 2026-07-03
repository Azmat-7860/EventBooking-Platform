import api from "./api"
import { Item, ItemPhoto, ItemAvailability } from "@/types"

export const itemsService = {
  getMyItems: () => api.get("/items/vendor/mine"),

  getPublishedItems: (params?: { category?: string; search?: string; date?: string; page?: number; size?: number }) =>
    api.get("/items", { params }),

  getItem: (slugOrId: string) => api.get(`/items/${slugOrId}`),

  createItem: (data: Partial<Item>) =>
    api.post("/items", data),

  updateItem: (id: string, data: Partial<Item>) =>
    api.put(`/items/${id}`, data),

  deleteItem: (id: string) =>
    api.delete(`/items/${id}`),

  toggleStatus: (id: string) =>
    api.put(`/items/${id}/status`),

  getPhotos: (id: string) => api.get(`/items/${id}/photos`),

  uploadPhoto: (id: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return api.post(`/items/${id}/photos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  deletePhoto: (itemId: string, photoId: string) =>
    api.delete(`/items/${itemId}/photos/${photoId}`),

  uploadVideo: (id: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return api.post(`/items/${id}/video`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  deleteVideo: (id: string) =>
    api.delete(`/items/${id}/video`),

  getAvailability: (id: string) => api.get(`/items/${id}/availability`),

  blockDate: (id: string, date: string) =>
    api.post(`/items/${id}/availability`, { blockedDate: date }),

  unblockDate: (itemId: string, dateId: string) =>
    api.delete(`/items/${itemId}/availability/${dateId}`),

  // ─── Bundles ──────────────────────────────────────────────────────────────

  getBundles: () => api.get("/bundles"),

  getBundle: (id: string) => api.get(`/bundles/${id}`),

  createBundle: (data: { name: string; description?: string }) =>
    api.post("/bundles", data),

  updateBundle: (id: string, data: { name: string; description?: string }) =>
    api.put(`/bundles/${id}`, data),

  deleteBundle: (id: string) =>
    api.delete(`/bundles/${id}`),

  getBundleItems: (id: string) => api.get(`/bundles/${id}/items`),

  addBundleItem: (bundleId: string, itemId: string) =>
    api.post(`/bundles/${bundleId}/items/${itemId}`),

  removeBundleItem: (bundleId: string, itemId: string) =>
    api.delete(`/bundles/${bundleId}/items/${itemId}`),
}
