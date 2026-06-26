"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { UserRole } from "@/types"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      const fallback =
        user.role === "vendor" ? "/vendor/dashboard" : user.role === "admin" ? "/admin" : "/"
      router.push(fallback)
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, redirectTo, router])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) return null
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}
