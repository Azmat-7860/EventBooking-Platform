"use client"

export const dynamic = "force-dynamic"

import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { useAuth } from "@/context/AuthContext"
import { staggerContainer, fadeUp } from "@/components/shared/animations"
import { Layers, Users, BookOpen, Star } from "lucide-react"
import { useCategories } from "@/hooks/useAdmin"
import Link from "next/link"

export default function AdminDashboard() {
  const { user } = useAuth()
  const { data: categories } = useCategories()

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <PageHeader
              title="Admin Dashboard"
              subtitle={`Welcome back, ${user?.email?.split("@")[0] || "admin"}`}
            />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
            >
              <StatsCard icon={Layers} label="Categories" value={categories?.length || 0} accent />
              <StatsCard icon={Users} label="Users" value="—" />
              <StatsCard icon={BookOpen} label="Bookings" value="—" />
              <StatsCard icon={Star} label="Reviews" value="—" />
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-2"
            >
              <motion.div variants={fadeUp}>
                <Link
                  href="/admin/categories"
                  className="group relative block overflow-hidden rounded-2xl border border-border bg-bgSurface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_30px_var(--accent-glow)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                      <Layers className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-textPrimary">Categories</h3>
                      <p className="mt-1 text-sm text-textMuted">Manage service categories</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                        {categories?.length || 0} categories
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp}>
                <div className="group relative block overflow-hidden rounded-2xl border border-border bg-bgSurface/50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bgElevated">
                      <Users className="h-6 w-6 text-textMuted" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-textMuted">Users</h3>
                      <p className="mt-1 text-sm text-textMuted">Manage platform users</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-textSubtle">
                        Coming in Phase 6
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <div className="group relative block overflow-hidden rounded-2xl border border-border bg-bgSurface/50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bgElevated">
                      <BookOpen className="h-6 w-6 text-textMuted" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-textMuted">Bookings</h3>
                      <p className="mt-1 text-sm text-textMuted">View all platform bookings</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-textSubtle">
                        Coming in Phase 6
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <div className="group relative block overflow-hidden rounded-2xl border border-border bg-bgSurface/50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bgElevated">
                      <Star className="h-6 w-6 text-textMuted" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-textMuted">Reviews</h3>
                      <p className="mt-1 text-sm text-textMuted">Moderate platform reviews</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-textSubtle">
                        Coming in Phase 6
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
