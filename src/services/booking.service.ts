import api from "./api"
import { BookingRequest } from "@/types"

export const bookingService = {
  submitInquiry: (data: BookingRequest) =>
    api.post("/bookings", data),

  getMyBookings: (params?: { page?: number; size?: number }) =>
    api.get("/bookings/mine", { params }),

  getVendorBookings: (params?: { status?: string; date?: string; page?: number; size?: number }) =>
    api.get("/bookings/vendor", { params }),

  updateStatus: (id: string, status: string) =>
    api.put(`/bookings/${id}/status`, { status }),

  getVendorCounts: () =>
    api.get("/bookings/vendor/counts"),
}
