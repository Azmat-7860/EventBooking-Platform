"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/shared/Toast"
import { useVendorBookings, useUpdateBookingStatus, useVendorBookingCounts } from "@/hooks/useBooking"
import { fadeUp, staggerContainer } from "@/components/shared/animations"
import { StatsGridSkeleton } from "@/components/shared/Skeleton"
import { Package, CheckCircle2, XCircle, CalendarDays, Clock, MapPin, Phone, Mail, ChevronLeft, ChevronRight, Loader2, MessageSquare, User, Search, X } from "lucide-react"

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-error/10 text-error border-error/20",
}

export default function VendorInquiries() {
  const { toast } = useToast()
  const [page, setPage] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const filters: { status?: string; date?: string } = {}
  if (statusFilter) filters.status = statusFilter
  if (dateFilter) filters.date = dateFilter

  const { data, isLoading } = useVendorBookings(page, 10, filters)
  const { data: counts, isLoading: countsLoading } = useVendorBookingCounts()
  const updateStatus = useUpdateBookingStatus()

  const bookings = data?.content || []
  const totalPages = data?.totalPages || 1

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const result = await updateStatus.mutateAsync({ id, status })
      if (result.success) {
        toast("success", `Booking ${status}!`)
      } else {
        toast("error", result.message || "Failed to update status")
      }
    } catch {
      toast("error", "Something went wrong")
    }
  }

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <PageHeader
              title="Inquiries"
              subtitle="Manage customer booking requests"
            />

            {countsLoading ? (
              <StatsGridSkeleton count={3} />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid gap-4 sm:grid-cols-3 mb-8"
              >
                <StatsCard icon={Package} label="Total Inquiries" value={counts?.total || 0} />
                <StatsCard icon={Clock} label="Pending" value={counts?.pending || 0} accent />
                <StatsCard icon={CheckCircle2} label="Confirmed" value={(counts?.total || 0) - (counts?.pending || 0)} />
              </motion.div>
            )}

            {/* Filters */}
            <motion.div variants={fadeUp} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-xs">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
                  className="flex h-10 w-full rounded-xl border border-border bg-bgSurface px-3 py-2 text-sm text-textPrimary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="relative shrink-0">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value); setPage(0) }}
                  className="min-w-[150px]"
                />
              </div>
              {(statusFilter || dateFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStatusFilter(""); setDateFilter(""); setPage(0) }}
                  className="gap-1.5 text-textMuted"
                >
                  <X className="h-3.5 w-3.5" /> Clear filters
                </Button>
              )}
            </motion.div>

            {isLoading ? (
              <StatsGridSkeleton count={3} />
            ) : bookings.length === 0 ? (
              <motion.div
                variants={fadeUp}
                className="rounded-2xl border border-border bg-bgSurface p-12 text-center"
              >
                <Package className="h-12 w-12 text-textSubtle mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-textPrimary mb-2">No inquiries found</h3>
                <p className="text-sm text-textMuted">{statusFilter || dateFilter ? "Try adjusting your filters." : "Inquiries from customers will appear here once they submit booking requests."}</p>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {bookings.map((booking: any) => (
                  <motion.div
                    key={booking.id}
                    variants={fadeUp}
                    className="rounded-2xl border border-border bg-bgSurface overflow-hidden transition-all duration-200"
                  >
                    <div
                      className="p-5 sm:p-6 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                              <User className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-textPrimary">{booking.name}</h3>
                              <p className="text-sm text-accent mt-0.5">{booking.itemTitle}</p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-3 text-sm text-textMuted">
                            {booking.preferredDate && (
                              <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" /> {booking.preferredDate}
                              </span>
                            )}
                            {booking.fromTime && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" /> {booking.fromTime}{booking.toTime ? ` - ${booking.toTime}` : ""}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" /> {booking.mobile}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusColors[booking.status] || "bg-bgElevated text-textMuted border-border"}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expandedId === booking.id && (
                      <div className="border-t border-border px-5 sm:px-6 py-4 bg-bgElevated/30 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2 text-sm">
                          <div>
                            <span className="text-textSubtle">Email:</span>
                            <span className="ml-2 text-textPrimary">{booking.customerEmail}</span>
                          </div>
                          <div>
                            <span className="text-textSubtle">Mobile:</span>
                            <span className="ml-2 text-textPrimary">{booking.mobile}</span>
                          </div>
                          {(booking.fromLocation || booking.toLocation) && (
                            <div className="sm:col-span-2">
                              <span className="text-textSubtle">Location:</span>
                              <span className="ml-2 text-textPrimary">{booking.fromLocation || "—"} → {booking.toLocation || "—"}</span>
                            </div>
                          )}
                          {booking.message && (
                            <div className="sm:col-span-2">
                              <span className="text-textSubtle">Message:</span>
                              <p className="mt-1 text-textPrimary whitespace-pre-line">{booking.message}</p>
                            </div>
                          )}
                        </div>

                        {booking.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="gap-1.5"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusUpdate(booking.id, "confirmed")
                              }}
                              disabled={updateStatus.isPending}
                            >
                              {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-error border-error/30 hover:bg-error/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusUpdate(booking.id, "cancelled")
                              }}
                              disabled={updateStatus.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-textMuted">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
