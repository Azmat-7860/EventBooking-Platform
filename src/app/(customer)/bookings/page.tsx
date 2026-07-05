"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/shared/PageTransition"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { useMyBookings } from "@/hooks/useBooking"
import { fadeUp, staggerContainer } from "@/components/shared/animations"
import { CalendarDays, MapPin, Clock, ChevronLeft, ChevronRight, Package, Loader2, ImageIcon } from "lucide-react"
import { StatsGridSkeleton } from "@/components/shared/Skeleton"

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-error/10 text-error border-error/20",
}

export default function CustomerBookings() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useMyBookings(page)

  const bookings = data?.content || []
  const totalPages = data?.totalPages || 1

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <PageHeader
              title="My Bookings"
              subtitle="Track the status of your service inquiries"
            />

            {isLoading ? (
              <StatsGridSkeleton count={3} />
            ) : bookings.length === 0 ? (
              <motion.div
                variants={fadeUp}
                className="rounded-2xl border border-border bg-bgSurface p-12 text-center"
              >
                <Package className="h-12 w-12 text-textSubtle mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-textPrimary mb-2">No bookings yet</h3>
                <p className="text-sm text-textMuted mb-6">Browse services and send an inquiry to get started.</p>
                <Button asChild>
                  <Link href="/">Browse Services</Link>
                </Button>
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
                    className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6 transition-all duration-200 hover:border-accent/20"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 overflow-hidden">
                            {booking.itemPhotoUrl ? (
                              <img src={booking.itemPhotoUrl} alt={booking.itemTitle} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-accent" />
                            )}
                          </div>
                          <div>
                            <Link href={`/items/${booking.itemSlug}`} className="text-base font-semibold text-textPrimary hover:text-accent transition-colors">
                              {booking.itemTitle}
                            </Link>
                            <p className="text-sm text-textMuted mt-0.5">{booking.vendorBusinessName}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-textMuted">
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
                          {(booking.fromLocation || booking.toLocation) && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" /> {booking.fromLocation}{booking.toLocation ? ` → ${booking.toLocation}` : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusColors[booking.status] || "bg-bgElevated text-textMuted border-border"}`}>
                        {booking.status}
                      </span>
                    </div>
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
