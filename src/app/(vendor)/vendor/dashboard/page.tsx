"use client"

import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { useAuth } from "@/context/AuthContext"

export default function VendorDashboard() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <PageTransition>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-textPrimary">Vendor Dashboard</h1>
          <p className="mt-1 text-textMuted">Welcome back, {user?.email}</p>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
