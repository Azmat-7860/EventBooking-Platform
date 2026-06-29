"use client"

import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { useAuth } from "@/context/AuthContext"
import { Layers } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PageTransition>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-textPrimary">Admin Dashboard</h1>
            <p className="mt-1 text-textMuted">Welcome back, {user?.email}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/admin/categories" className="group rounded-xl border border-border bg-bgSurface p-6 transition-all hover:border-accent/30 hover:shadow-[0_0_30px_var(--accent-glow)]">
              <Layers className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-semibold text-textPrimary">Categories</h3>
              <p className="mt-1 text-sm text-textMuted">Manage service categories</p>
            </Link>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
