"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { bookingService } from "@/services/booking.service"

export function useSubmitInquiry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof bookingService.submitInquiry>[0]) =>
      bookingService.submitInquiry(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-bookings"] })
      qc.invalidateQueries({ queryKey: ["vendor-bookings"] })
    },
  })
}

export function useMyBookings(page = 0, size = 10) {
  return useQuery({
    queryKey: ["my-bookings", page, size],
    queryFn: async () => {
      const { data } = await bookingService.getMyBookings({ page, size })
      return data.data
    },
  })
}

export function useVendorBookings(page = 0, size = 10, filters?: { status?: string; date?: string }) {
  return useQuery({
    queryKey: ["vendor-bookings", page, size, filters?.status, filters?.date],
    queryFn: async () => {
      const { data } = await bookingService.getVendorBookings({ page, size, ...filters })
      return data.data
    },
  })
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingService.updateStatus(id, status).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-bookings"] })
      qc.invalidateQueries({ queryKey: ["vendor-booking-counts"] })
    },
  })
}

export function useVendorBookingCounts(enabled = true) {
  return useQuery({
    queryKey: ["vendor-booking-counts"],
    queryFn: async () => {
      const { data } = await bookingService.getVendorCounts()
      return data.data
    },
    enabled,
    retry: false,
  })
}
