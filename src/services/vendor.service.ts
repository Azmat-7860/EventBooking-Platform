import api from "./api"
import { VendorProfile } from "@/types"

export const vendorService = {
  getProfile: () => api.get("/vendor/profile"),

  createProfile: (data: Partial<VendorProfile>) =>
    api.post("/vendor/profile", data),

  updateProfile: (data: Partial<VendorProfile>) =>
    api.put("/vendor/profile", data),

  uploadLogo: (file: File) => {
    const form = new FormData()
    form.append("file", file)
    return api.post("/vendor/profile/logo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  getPublicProfile: (userId: string) => api.get(`/public/vendors/${userId}/profile`),
}
