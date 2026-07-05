"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { useMyBookings } from "@/hooks/useBooking"
import { reviewService } from "@/services/review.service"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/shared/Toast"
import { Star, X, Loader2 } from "lucide-react"

interface ReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  onReviewSubmitted: () => void
}

export function ReviewModal({ open, onOpenChange, itemId, onReviewSubmitted }: ReviewModalProps) {
  const { toast } = useToast()
  const { data: myBookings } = useMyBookings(0, 50)
  const [selectedBooking, setSelectedBooking] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")

  const eligibleBookings = myBookings?.content?.filter(
    (b: { itemId: string; status: string }) => b.itemId === itemId && b.status === "confirmed"
  ) || []

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () =>
      reviewService.createReview({ bookingId: selectedBooking, rating, comment }),
    onSuccess: (res: { data: { success: boolean; message?: string } }) => {
      if (res.data.success) {
        toast("success", "Review submitted successfully")
        onReviewSubmitted()
        onOpenChange(false)
        setSelectedBooking("")
        setRating(0)
        setComment("")
      } else {
        toast("error", res.data.message || "Failed to submit review")
      }
    },
    onError: () => {
      toast("error", "Something went wrong")
    },
  })

  const canSubmit = selectedBooking && rating > 0

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-bgSurface p-6 shadow-xl"
          >
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 text-textSubtle hover:text-textPrimary"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-lg font-bold text-textPrimary mb-2">Write a Review</h2>
            <p className="text-sm text-textMuted mb-5">Share your experience with this service.</p>

            {eligibleBookings.length === 0 ? (
              <p className="text-sm text-textMuted text-center py-4">
                You need a confirmed booking to write a review.
              </p>
            ) : (
              <>
                {/* Booking selection */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-textPrimary mb-1.5 block">
                    Select Booking
                  </label>
                  <select
                    value={selectedBooking}
                    onChange={(e) => setSelectedBooking(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bgElevated px-3 py-2 text-sm text-textPrimary outline-none focus:border-accent"
                  >
                    <option value="">Choose a booking...</option>
                    {eligibleBookings.map((b: { id: string; preferredDate: string }) => (
                      <option key={b.id} value={b.id}>
                        {b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : "Unknown date"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Star rating */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-textPrimary mb-1.5 block">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= (hoverRating || rating)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-textSubtle"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-5">
                  <label className="text-sm font-medium text-textPrimary mb-1.5 block">
                    Comment (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience..."
                    className="w-full rounded-xl border border-border bg-bgElevated px-3 py-2 text-sm text-textPrimary outline-none focus:border-accent resize-none"
                  />
                </div>

                <Button
                  className="w-full gap-2"
                  disabled={!canSubmit || isPending}
                  onClick={() => submit()}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                  Submit Review
                </Button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
