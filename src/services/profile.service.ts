import api from "./api"

export interface UserProfileData {
  id?: string
  userId?: string
  fullName?: string
  mobile?: string
  address?: string
  city?: string
  photoUrl?: string
}

export const profileService = {
  getProfile: () => api.get("/profile"),
  createProfile: (data: UserProfileData) => api.post("/profile", data),
  updateProfile: (data: UserProfileData) => api.put("/profile", data),
}
