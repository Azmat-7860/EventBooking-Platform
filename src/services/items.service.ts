import api from "./api"
import { Item, ItemPhoto, ItemAvailability } from "@/types"

export const itemsService = {
  getMyItems: () => api.get("/items/vendor/mine"),

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

  getAvailability: (id: string) => api.get(`/items/${id}/availability`),

  blockDate: (id: string, date: string) =>
    api.post(`/items/${id}/availability`, { blockedDate: date }),

  unblockDate: (itemId: string, dateId: string) =>
    api.delete(`/items/${itemId}/availability/${dateId}`),
}
