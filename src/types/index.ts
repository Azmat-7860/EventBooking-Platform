export type UserRole = "customer" | "vendor" | "admin"

export interface User {
  id: string
  email: string
  role: UserRole
  is_verified: boolean
  is_suspended: boolean
  theme_preference: "light" | "dark" | "system"
  created_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  role: UserRole
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface Category {
  id: string
  name: string
  icon: string
  imageUrl: string
  sortOrder: number
  createdAt: string
}

export interface Item {
  id: string
  vendorId: string
  categoryId: string
  title: string
  slug: string
  description: string
  startingFromText: string
  videoUrl: string
  externalUrl: string
  isBundle: boolean
  bundleName: string
  bundleDescription: string
  status: "draft" | "published"
  metaTitle: string
  metaDesc: string
  createdAt: string
}

export interface ItemPhoto {
  id: string
  itemId: string
  photoUrl: string
  altText: string
  sortOrder: number
}

export interface ItemAvailability {
  id: string
  itemId: string
  blockedDate: string
}

export interface Bundle {
  id: string
  vendorId: string
  name: string
  description: string
  createdAt: string
}

export interface VendorProfile {
  id: string
  userId: string
  businessName: string
  contactName: string
  phone: string
  address: string
  city: string
  logoUrl: string
  createdAt: string
}
