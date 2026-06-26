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
