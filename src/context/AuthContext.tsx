"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { User, AuthState, LoginPayload, RegisterPayload, AuthResponse } from "@/types"
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/lib/constants"
import api from "@/services/api"

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<AuthResponse>
  register: (payload: RegisterPayload) => Promise<{ message: string }>
  logout: () => void
  googleLogin: (credential: string) => Promise<AuthResponse>
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const userStr = localStorage.getItem(USER_KEY)
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User
        setState({
          user,
          token,
          refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
          isAuthenticated: true,
          isLoading: false,
        })
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setState((s) => ({ ...s, isLoading: false }))
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }))
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await api.post<{ success: boolean; data: Record<string, any> }>(
      "/auth/login",
      payload
    )
    const { id, email, role, accessToken, refreshToken, verified, suspended, themePreference } = data.data
    const user = {
      id,
      email,
      role,
      is_verified: verified,
      is_suspended: suspended,
      theme_preference: themePreference || 'light',
      created_at: '',
    }
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setState({ user, token: accessToken, refreshToken, isAuthenticated: true, isLoading: false })
    return { user, accessToken, refreshToken }
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await api.post<{ success: boolean; data: { message: string } }>(
      "/auth/register",
      payload
    )
    return data.data
  }, [])

  const googleLogin = useCallback(async (credential: string) => {
    const { data } = await api.post<{ success: boolean; data: Record<string, any> }>(
      "/auth/google",
      { credential }
    )
    const { id, email, role, accessToken, refreshToken, verified, suspended, themePreference } = data.data
    const user = {
      id,
      email,
      role,
      is_verified: verified,
      is_suspended: suspended,
      theme_preference: themePreference || 'light',
      created_at: '',
    }
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setState({ user, token: accessToken, refreshToken, isAuthenticated: true, isLoading: false })
    return { user, accessToken, refreshToken }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setState({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false })
    window.location.href = "/auth"
  }, [])

  const setUser = useCallback((user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setState((s) => ({ ...s, user }))
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, googleLogin, setUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
