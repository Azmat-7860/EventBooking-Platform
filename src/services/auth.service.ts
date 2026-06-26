import api from "./api"

export const authService = {
  login: (payload: { email: string; password: string }) =>
    api.post("/auth/login", payload),

  register: (payload: { email: string; password: string; role: string }) =>
    api.post("/auth/register", payload),

  googleLogin: (credential: string) =>
    api.post("/auth/google", { credential }),

  verifyEmail: (token: string) =>
    api.get(`/auth/verify?token=${token}`),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),

  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
}
