"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "./Toast"
import { useAuth } from "@/context/AuthContext"
import { useSubmitInquiry } from "@/hooks/useBooking"
import { scaleIn } from "./animations"
import { CalendarDays, Clock, MapPin, User, Phone, MessageSquare, Loader2, Send } from "lucide-react"

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  mobile: z.string().trim().min(1, "Mobile number is required"),
  preferredDate: z.string().trim().min(1, "Preferred date is required"),
  fromTime: z.string().optional(),
  toTime: z.string().optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  message: z.string().optional(),
})

type InquiryForm = z.infer<typeof inquirySchema>

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  itemTitle: string
  blockedDates?: { blockedDate: string }[]
}

export function BookingModal({ open, onOpenChange, itemId, itemTitle, blockedDates }: BookingModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const submitInquiry = useSubmitInquiry()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      mobile: "",
      preferredDate: "",
      fromTime: "",
      toTime: "",
      fromLocation: "",
      toLocation: "",
      message: "",
    },
  })

  const preferredDate = watch("preferredDate")

  const onSubmit = async (data: InquiryForm) => {
    if (!user) {
      toast("info", "Please sign in to submit an inquiry")
      router.push("/auth")
      return
    }

    const blockedSet = new Set(blockedDates?.map((b) => b.blockedDate) || [])
    if (blockedSet.has(data.preferredDate)) {
      toast("error", "This date is not available. Please choose another date.")
      return
    }

    try {
      const result = await submitInquiry.mutateAsync({
        itemId,
        preferredDate: data.preferredDate,
        fromTime: data.fromTime || "",
        toTime: data.toTime || "",
        fromLocation: data.fromLocation || "",
        toLocation: data.toLocation || "",
        name: data.name,
        mobile: data.mobile,
        message: data.message || "",
      })

      if (result.success) {
        toast("success", "Inquiry submitted! Check your email for confirmation.")
        onOpenChange(false)
        reset()
        router.push(`/booking/success?item=${encodeURIComponent(itemTitle)}&id=${result.data?.id || ""}`)
      } else {
        toast("error", result.message || "Failed to submit inquiry")
      }
    } catch {
      toast("error", "Something went wrong. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Inquiry</DialogTitle>
          <DialogDescription>
            Request a booking for <span className="text-accent font-medium">{itemTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="inq-name">Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
                <Input id="inq-name" {...register("name")} placeholder="Your name" className="pl-9" />
              </div>
              {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
            </div>

            {/* Mobile */}
            <div className="space-y-2">
              <Label htmlFor="inq-mobile">Mobile *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
                <Input id="inq-mobile" {...register("mobile")} placeholder="+91 98765 43210" className="pl-9" />
              </div>
              {errors.mobile && <p className="text-xs text-error">{errors.mobile.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="inq-date">Preferred Date *</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
                <Input id="inq-date" type="date" {...register("preferredDate")} className="pl-9" />
              </div>
              {errors.preferredDate && <p className="text-xs text-error">{errors.preferredDate.message}</p>}
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="inq-from-time">From</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
                  <Input id="inq-from-time" type="time" {...register("fromTime")} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inq-to-time">To</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
                  <Input id="inq-to-time" type="time" {...register("toTime")} className="pl-9" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* From Location */}
            <div className="space-y-2">
              <Label htmlFor="inq-from-location">From Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
                <Input id="inq-from-location" {...register("fromLocation")} placeholder="Pickup address" className="pl-9" />
              </div>
            </div>

            {/* To Location */}
            <div className="space-y-2">
              <Label htmlFor="inq-to-location">To Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
                <Input id="inq-to-location" {...register("toLocation")} placeholder="Drop-off address" className="pl-9" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="inq-message">Message (optional)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-textSubtle" />
              <textarea
                id="inq-message"
                {...register("message")}
                placeholder="Any special requests or details..."
                className="flex min-h-[80px] w-full rounded-lg border border-border bg-bgSurface px-9 py-2 text-sm text-textPrimary placeholder:text-textSubtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 resize-none transition-all duration-200"
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={submitInquiry.isPending}>
            {submitInquiry.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Inquiry
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
