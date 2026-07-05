"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { Button } from "@/components/ui/button"
import { analyticsService } from "@/services/analytics.service"
import { useMyItems } from "@/hooks/useItems"
import { staggerContainer, fadeUp } from "@/components/shared/animations"
import { Eye, MessageSquare, Share2, CalendarDays, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function VendorAnalytics() {
  const router = useRouter()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const { data: items } = useMyItems()

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["vendor-analytics", from, to],
    queryFn: async () => {
      const params: { from?: string; to?: string } = {}
      if (from) params.from = from
      if (to) params.to = to
      const { data } = await analyticsService.getVendorAnalytics(params)
      return data.data
    },
  })

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <PageHeader
              title="Analytics"
              subtitle="Track views, inquiries, and shares for your services"
            />

            {/* Date Range Filter */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-end gap-3 mb-6">
              <div>
                <label className="text-xs font-medium text-textMuted mb-1 block">From</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-xl border border-border bg-bgElevated px-3 py-2 text-sm text-textPrimary outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-textMuted mb-1 block">To</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded-xl border border-border bg-bgElevated px-3 py-2 text-sm text-textPrimary outline-none focus:border-accent"
                />
              </div>
              {(from || to) && (
                <Button variant="ghost" size="sm" onClick={() => { setFrom(""); setTo("") }}>
                  Clear
                </Button>
              )}
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-textMuted" />
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 sm:grid-cols-3 mb-8"
                >
                  <StatsCard icon={Eye} label="Total Views" value={analytics?.totalViews || 0} accent />
                  <StatsCard icon={MessageSquare} label="Inquiries" value={analytics?.totalInquiries || 0} />
                  <StatsCard icon={Share2} label="Shares" value={analytics?.totalShares || 0} />
                </motion.div>

                {/* Monthly Inquiries Chart */}
                <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6 mb-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                      <CalendarDays className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm font-semibold text-textPrimary">Inquiries per Month</span>
                  </div>
                  {analytics?.monthlyInquiries?.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.monthlyInquiries.map((item: { month: string; count: number }, i: number) => {
                        const maxCount = Math.max(...analytics.monthlyInquiries.map((m: { count: number }) => m.count))
                        const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-24 text-xs text-textMuted shrink-0">
                              {new Date(item.month).toLocaleDateString("default", { month: "short", year: "numeric" })}
                            </span>
                            <div className="flex-1 h-5 rounded-lg bg-bgElevated overflow-hidden">
                              <div
                                className="h-full rounded-lg bg-accent transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-xs font-medium text-textPrimary text-right">{item.count}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-textMuted text-center py-6">No inquiry data available for this period.</p>
                  )}
                </motion.div>

                {/* Per-Item Table */}
                <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                        <Eye className="h-4 w-4 text-accent" />
                      </div>
                      <span className="text-sm font-semibold text-textPrimary">Your Services</span>
                    </div>
                  </div>
                  {items && items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-2 text-textMuted font-medium">Title</th>
                            <th className="text-center py-3 px-2 text-textMuted font-medium">Status</th>
                            <th className="text-center py-3 px-2 text-textMuted font-medium">Views</th>
                            <th className="text-center py-3 px-2 text-textMuted font-medium">Inquiries</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item: { id: string; title: string; status: string }) => (
                            <tr key={item.id} className="border-b border-border/50 hover:bg-bgElevated/50 transition-colors">
                              <td className="py-3 px-2 text-textPrimary">{item.title}</td>
                              <td className="py-3 px-2 text-center">
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                                  item.status === "published" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center text-textMuted">—</td>
                              <td className="py-3 px-2 text-center text-textMuted">—</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-textMuted text-center py-6">No services created yet.</p>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
