"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { adminService } from "@/services/admin.service"
import { staggerContainer, fadeUp } from "@/components/shared/animations"
import { Loader2 } from "lucide-react"

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-error/10 text-error border-error/20",
}

export default function AdminBookings() {
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", page, statusFilter],
    queryFn: async () => {
      const params: { page?: number; size?: number; status?: string } = { page, size: 20 }
      if (statusFilter) params.status = statusFilter
      const { data } = await adminService.getAllBookings(params)
      return data.data
    },
  })

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <PageHeader title="Bookings" subtitle="View all platform bookings" />

            {/* Filter */}
            <motion.div variants={fadeUp} className="mb-6">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
                className="rounded-xl border border-border bg-bgElevated px-3 py-2 text-sm text-textPrimary outline-none focus:border-accent"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-textMuted" />
              </div>
            ) : (
              <>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-bgSurface overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-bgElevated/50">
                          <th className="text-left py-3 px-4 text-textMuted font-medium">Customer</th>
                          <th className="text-left py-3 px-4 text-textMuted font-medium">Service</th>
                          <th className="text-left py-3 px-4 text-textMuted font-medium">Vendor</th>
                          <th className="text-left py-3 px-4 text-textMuted font-medium">Date</th>
                          <th className="text-center py-3 px-4 text-textMuted font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.content?.map((booking: {
                          id: string
                          name: string
                          customerEmail?: string
                          itemTitle: string
                          vendorBusinessName?: string
                          preferredDate: string
                          status: string
                        }) => (
                          <tr key={booking.id} className="border-b border-border/50 hover:bg-bgElevated/50 transition-colors">
                            <td className="py-3 px-4 text-textPrimary">
                              <div>
                                <span className="font-medium">{booking.name || "Customer"}</span>
                                {booking.customerEmail && (
                                  <span className="block text-xs text-textMuted">{booking.customerEmail}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-textPrimary font-medium">{booking.itemTitle || "—"}</td>
                            <td className="py-3 px-4 text-textMuted">{booking.vendorBusinessName || "—"}</td>
                            <td className="py-3 px-4 text-textMuted">{booking.preferredDate || "—"}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusColors[booking.status] || ""}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                      Previous
                    </Button>
                    <span className="text-xs text-textMuted">Page {page + 1} of {data.totalPages}</span>
                    <Button size="sm" variant="outline" disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
