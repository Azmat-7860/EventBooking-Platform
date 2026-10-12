"use client"

export const dynamic = "force-dynamic"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { useAuth } from "@/context/AuthContext"
import { adminService } from "@/services/admin.service"
import { analyticsService } from "@/services/analytics.service"
import { staggerContainer, fadeUp } from "@/components/shared/animations"
import { Layers, Users, BookOpen, Star, Eye, MessageSquare, Share2, Loader2, CalendarDays, Building2, Award } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { user } = useAuth()

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await adminService.getCategories()
      return data.data
    },
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await adminService.getStats()
      return data.data
    },
  })

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data } = await analyticsService.getAdminAnalytics()
      return data.data
    },
  })

  const { data: vendorLeaderboard } = useQuery({
    queryKey: ["admin-vendor-analytics"],
    queryFn: async () => {
      const { data } = await analyticsService.getAdminVendorAnalytics()
      return data.data
    },
  })

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

            {/* Stats Cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
            >
              <StatsCard icon={Layers} label="Categories" value={categories?.length || 0} accent />
              <StatsCard icon={Users} label="Users" value={stats?.totalUsers || 0} />
              <StatsCard icon={BookOpen} label="Bookings" value={stats?.totalBookings || 0} />
              <StatsCard icon={Star} label="Reviews" value={stats?.totalReviews || 0} />
            </motion.div>

            {/* Analytics Summary */}
            {analytics && (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid gap-4 sm:grid-cols-3 mb-8"
              >
                <StatsCard icon={Eye} label="Views (30d)" value={analytics.totalViews || 0} />
                <StatsCard icon={MessageSquare} label="Inquiries (30d)" value={analytics.totalInquiries || 0} />
                <StatsCard icon={Share2} label="Shares (30d)" value={analytics.totalShares || 0} />
              </motion.div>
            )}

            {/* Monthly Inquiries Chart */}
            {analytics?.monthlyInquiries?.length > 0 && (
              <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6 mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <CalendarDays className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-textPrimary">Inquiries per Month</span>
                </div>
                <div className="space-y-3">
                  {analytics.monthlyInquiries.map((item: { month: string; count: number }, i: number) => {
                    const maxCount = Math.max(...analytics.monthlyInquiries.map((m: { count: number }) => m.count))
                    const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-20 text-xs text-textMuted shrink-0">
                          {new Date(item.month).toLocaleDateString("default", { month: "short", year: "numeric" })}
                        </span>
                        <div className="flex-1 h-5 rounded-lg bg-bgElevated overflow-hidden">
                          <div className="h-full rounded-lg bg-accent transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-xs font-medium text-textPrimary text-right">{item.count}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Analytics Insights: Top Services & Vendor Leaderboard */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              {/* Top Services */}
              {analytics?.topItems?.length > 0 ? (
                <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-semibold text-textPrimary">Top 5 Services by Inquiries</h3>
                  </div>
                  <div className="space-y-2">
                    {analytics.topItems.map((item: { itemId: string; itemTitle?: string; count: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-bgElevated">
                        <span className="text-sm text-textPrimary font-medium truncate max-w-[200px] sm:max-w-[260px]">
                          {item.itemTitle || `${item.itemId.slice(0, 8)}...`}
                        </span>
                        <span className="text-xs font-semibold text-accent shrink-0">{item.count} inquiries</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null}

              {/* Vendor Leaderboard */}
              {vendorLeaderboard && vendorLeaderboard.length > 0 ? (
                <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-semibold text-textPrimary">Top Vendors Leaderboard</h3>
                  </div>
                  <div className="space-y-2">
                    {vendorLeaderboard.slice(0, 5).map((vendor: {
                      vendorId: string
                      businessName: string
                      itemCount: number
                      totalInquiries: number
                      totalViews: number
                      topItem: string
                    }, i: number) => (
                      <div key={vendor.vendorId} className="flex items-center justify-between p-3 rounded-xl bg-bgElevated">
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-textSubtle w-4">#{i + 1}</span>
                            <span className="text-sm font-medium text-textPrimary truncate">{vendor.businessName}</span>
                          </div>
                          <p className="text-xs text-textMuted mt-0.5 pl-6 truncate">
                            {vendor.itemCount} {vendor.itemCount === 1 ? "service" : "services"} • Top: {vendor.topItem}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-semibold text-accent block">{vendor.totalInquiries} inquiries</span>
                          <span className="text-[11px] text-textSubtle">{vendor.totalViews} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </div>

            {/* Management Cards */}
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
                <Link
                  href="/admin/users"
                  className="group relative block overflow-hidden rounded-2xl border border-border bg-bgSurface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_30px_var(--accent-glow)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-textPrimary">Users</h3>
                      <p className="mt-1 text-sm text-textMuted">Manage platform users</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                        {stats?.totalUsers || 0} users
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Link
                  href="/admin/bookings"
                  className="group relative block overflow-hidden rounded-2xl border border-border bg-bgSurface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_30px_var(--accent-glow)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                      <BookOpen className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-textPrimary">Bookings</h3>
                      <p className="mt-1 text-sm text-textMuted">View all platform bookings</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                        {stats?.totalBookings || 0} bookings
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Link
                  href="/admin/reviews"
                  className="group relative block overflow-hidden rounded-2xl border border-border bg-bgSurface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_30px_var(--accent-glow)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                      <Star className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-textPrimary">Reviews</h3>
                      <p className="mt-1 text-sm text-textMuted">Moderate platform reviews</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                        {stats?.totalReviews || 0} reviews
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
