"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Link from "next/link"
import { Item, Review } from "@/types"
import { itemsService } from "@/services/items.service"
import { vendorService } from "@/services/vendor.service"
import { reviewService } from "@/services/review.service"
import { analyticsService } from "@/services/analytics.service"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/shared/Calendar"
import { BookingModal } from "@/components/shared/BookingModal"
import { ReviewModal } from "./ReviewModal"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/components/shared/Toast"
import { fadeUp, staggerContainer } from "@/components/shared/animations"
import {
  ArrowLeft,
  CalendarDays,
  Send,
  Share2,
  ImageIcon,
  Video,
  Star,
  Package,
  Building2,
  MapPin,
  Phone,
} from "lucide-react"

export function ItemDetailClient({ item }: { item: Item }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [photoIndex, setPhotoIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewPage, setReviewPage] = useState(0)

  const { data: photos } = useQuery({
    queryKey: ["item-photos", item.id],
    queryFn: async () => {
      const { data } = await itemsService.getPhotos(item.id)
      return data.data
    },
    enabled: !!item.id,
  })

  const { data: availability } = useQuery({
    queryKey: ["availability", item.id],
    queryFn: async () => {
      const { data } = await itemsService.getAvailability(item.id)
      return data.data
    },
    enabled: !!item.id,
  })

  const { data: vendorProfile } = useQuery({
    queryKey: ["vendor-profile-public", item.vendorId],
    queryFn: async () => {
      const { data } = await vendorService.getPublicProfile(item.vendorId)
      return data.data
    },
    enabled: !!item.vendorId,
  })

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ["item-reviews", item.id, reviewPage],
    queryFn: async () => {
      const { data } = await reviewService.getItemReviews(item.id, { page: reviewPage, size: 10 })
      return data.data
    },
    enabled: !!item.id,
  })

  useEffect(() => {
    analyticsService.logEvent("view", item.id, user?.id)
  }, [item.id, user?.id])

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/items/${item.slug}`
    : ""

  const whatsappUrl = `https://wa.me/?text=Check this out: ${encodeURIComponent(item.title)} - ${encodeURIComponent(shareUrl)}`

  const handleWhatsAppShare = () => {
    analyticsService.logEvent("share", item.id, user?.id)
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  const currentPhoto = photos?.[photoIndex]

  const avgRating = item.avgRating || 0
  const reviewCount = item.reviewCount || 0

  const starDistribution = [0, 0, 0, 0, 0]
  if (reviewsData?.content) {
    reviewsData.content.forEach((r: Review) => {
      starDistribution[r.rating - 1]++
    })
  }

  return (
    <PageTransition>
      <div className="relative min-h-full">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
        <div className="relative p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Back */}
          <motion.div variants={fadeUp} className="mb-6">
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link href="/#services">
                <ArrowLeft className="h-4 w-4" /> Back to services
              </Link>
            </Button>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Gallery - Left */}
            <motion.div
              variants={fadeUp}
              className="lg:col-span-3 space-y-3"
            >
              {/* Main photo */}
              <div
                className="relative aspect-[4/3] rounded-2xl border border-border bg-bgElevated overflow-hidden cursor-pointer group"
                onClick={() => setShowLightbox(true)}
              >
                {currentPhoto ? (
                  <img
                    src={currentPhoto.photoUrl}
                    alt={currentPhoto.altText || item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-textSubtle" />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {(photos?.length || 0) > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos?.map((p: { id: string; photoUrl: string; altText?: string }, i: number) => (
                    <button
                      key={p.id}
                      onClick={() => setPhotoIndex(i)}
                      className={`relative h-16 w-24 shrink-0 rounded-lg border-2 overflow-hidden transition-all ${
                        i === photoIndex ? "border-accent ring-1 ring-accent" : "border-border opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={p.photoUrl} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Video */}
              {item.videoUrl && (
                <div className="rounded-2xl border border-border bg-bgSurface overflow-hidden">
                  <video src={item.videoUrl} controls className="w-full aspect-video bg-black" />
                </div>
              )}
            </motion.div>

            {/* Details - Right */}
            <motion.div
              variants={fadeUp}
              className="lg:col-span-2 space-y-5"
            >
              <div className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                <h1 className="text-2xl font-bold text-textPrimary">{item.title}</h1>

                {item.startingFromText && (
                  <p className="mt-3 text-lg font-semibold text-accent">{item.startingFromText}</p>
                )}

                {/* Rating summary */}
                {reviewCount > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(avgRating) ? "text-yellow-500 fill-yellow-500" : "text-textSubtle"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-textMuted">
                      {avgRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                )}

                {/* Vendor info */}
                {vendorProfile && (
                  <div className="mt-5 flex items-start gap-3 border-t border-border pt-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                      <Building2 className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-textPrimary">{vendorProfile.businessName}</p>
                      {vendorProfile.city && (
                        <p className="text-xs text-textMuted mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {vendorProfile.city}
                        </p>
                      )}
                      {vendorProfile.phone && (
                        <p className="text-xs text-textMuted mt-0.5 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {vendorProfile.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex flex-col gap-2">
                  <Button className="w-full gap-2" onClick={() => setShowBookingModal(true)}>
                    <Send className="h-4 w-4" /> Send Inquiry
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={handleWhatsAppShare}>
                    <Share2 className="h-4 w-4" /> Share on WhatsApp
                  </Button>
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <div className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                  <h2 className="text-sm font-semibold text-textPrimary mb-3">Description</h2>
                  <p className="text-sm text-textMuted leading-relaxed whitespace-pre-line">{item.description}</p>
                </div>
              )}

              {/* Bundle display */}
              {item.isBundle && item.bundleName && (
                <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                      <Package className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-textPrimary">Part of a Package</span>
                      <p className="text-lg font-bold text-accent mt-0.5">{item.bundleName}</p>
                    </div>
                  </div>
                  {item.bundleDescription && (
                    <p className="text-sm text-textMuted">{item.bundleDescription}</p>
                  )}
                </div>
              )}

              {/* Availability (read-only) */}
              <div className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <CalendarDays className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-textPrimary">Availability</span>
                </div>
                <Calendar
                  blockedDates={availability || []}
                  onBlockDate={() => {}}
                  onUnblockDate={() => {}}
                />
                <p className="mt-3 text-xs text-textMuted">Blocked dates are not available for booking.</p>
              </div>

              {/* Reviews section */}
              <div className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                      <Star className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm font-semibold text-textPrimary">Reviews</span>
                  </div>
                  {user && (
                    <Button size="sm" variant="outline" onClick={() => setShowReviewModal(true)}>
                      Write a Review
                    </Button>
                  )}
                </div>

                {reviewCount > 0 && (
                  <>
                    {/* Rating summary */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-bgElevated mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-textPrimary">{avgRating.toFixed(1)}</div>
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.round(avgRating) ? "text-yellow-500 fill-yellow-500" : "text-textSubtle"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-textMuted mt-1">{reviewCount} total</div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = starDistribution[star - 1] || 0
                          const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0
                          return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="w-8 text-right text-textMuted">{star}</span>
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <div className="flex-1 h-2 rounded-full bg-bgElevated overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-yellow-500 transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-8 text-textMuted">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Review cards */}
                    <div className="space-y-3">
                      {reviewsData?.content?.map((review: Review) => (
                        <div key={review.id} className="p-4 rounded-xl bg-bgElevated">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-textPrimary">{review.customerName}</span>
                            <span className="text-xs text-textMuted">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-textSubtle"
                                }`}
                              />
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-sm text-textMuted leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {reviewsData && reviewsData.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reviewPage === 0}
                          onClick={() => setReviewPage(p => p - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-xs text-textMuted">
                          Page {reviewPage + 1} of {reviewsData.totalPages}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reviewPage >= reviewsData.totalPages - 1}
                          onClick={() => setReviewPage(p => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {reviewCount === 0 && (
                  <p className="text-sm text-textMuted text-center py-4">No reviews yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        itemId={item.id}
        itemTitle={item.title}
        blockedDates={availability || []}
      />

      {/* Review Modal */}
      <ReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        itemId={item.id}
        onReviewSubmitted={() => refetchReviews()}
      />

      {/* Lightbox */}
      {showLightbox && currentPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute right-4 top-4 text-white/80 hover:text-white text-sm"
          >
            Close ✕
          </button>
          <img
            src={currentPhoto.photoUrl}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </PageTransition>
  )
}
