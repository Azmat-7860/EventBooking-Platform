"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Link from "next/link"
import { Item } from "@/types"
import { itemsService } from "@/services/items.service"
import { vendorService } from "@/services/vendor.service"
import { analyticsService } from "@/services/analytics.service"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/shared/Calendar"
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
  Loader2,
  Building2,
  MapPin,
  Phone,
} from "lucide-react"

export function ItemDetailClient({ item }: { item: Item }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [photoIndex, setPhotoIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

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

  useEffect(() => {
    analyticsService.logEvent("view", item.id, user?.id)
  }, [item.id, user?.id])

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/items/${item.slug}`
    : ""

  const whatsappUrl = `https://wa.me/?text=Check this out: ${encodeURIComponent(item.title)} - ${encodeURIComponent(shareUrl)}`

  const currentPhoto = photos?.[photoIndex]

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
                  <Button className="w-full gap-2" onClick={() => toast("info", "Booking inquiries will be available in the next release")}>
                    <Send className="h-4 w-4" /> Send Inquiry
                  </Button>
                  <Button asChild variant="outline" className="w-full gap-2">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <Share2 className="h-4 w-4" /> Share on WhatsApp
                    </a>
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
            </motion.div>
          </div>
        </div>
      </div>

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
