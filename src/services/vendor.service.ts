import api from "./api"
import { VendorProfile } from "@/types"

export const vendorService = {
  getProfile: () => api.get("/vendor/profile"),

  createProfile: (data: Partial<VendorProfile>) =>
    api.post("/vendor/profile", data),

  updateProfile: (data: Partial<VendorProfile>) =>
    api.put("/vendor/profile", data),
}
