"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { adminService } from "@/services/admin.service"
import { useToast } from "@/components/shared/Toast"
import { staggerContainer, fadeUp } from "@/components/shared/animations"
import { Loader2, Star, Trash2 } from "lucide-react"

export default function AdminReviews() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", page],
    queryFn: async () => {
      const { data } = await adminService.getAllReviews({ page, size: 20 })
      return data.data
    },
  })

  const { mutate: removeReview, isPending: removing } = useMutation({
    mutationFn: (id: string) => adminService.deleteReview(id),
    onSuccess: (res: any) => {
      toast("success", res.data.message || "Review deleted")
      qc.invalidateQueries({ queryKey: ["admin-reviews"] })
    },
    onError: () => toast("error", "Failed to delete review"),
  })

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <PageHeader title="Reviews" subtitle="Moderate platform reviews" />

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
                          <th className="text-center py-3 px-4 text-textMuted font-medium">Rating</th>
                          <th className="text-left py-3 px-4 text-textMuted font-medium">Comment</th>
                          <th className="text-right py-3 px-4 text-textMuted font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.content?.map((review: { id: string; customerName: string; rating: number; comment: string; createdAt: string }) => (
                          <tr key={review.id} className="border-b border-border/50 hover:bg-bgElevated/50 transition-colors">
                            <td className="py-3 px-4 text-textPrimary">{review.customerName}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-textSubtle"}`}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-textMuted max-w-xs truncate">{review.comment || "—"}</td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={removing}
                                onClick={() => removeReview(review.id)}
                                className="gap-1.5"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </Button>
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
