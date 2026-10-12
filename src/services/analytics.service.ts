import api from "./api"

export const analyticsService = {
  logEvent: (type: string, itemId?: string, userId?: string) =>
    api.post("/analytics/event", { type, itemId, userId }),

  getVendorAnalytics: (params?: { from?: string; to?: string }) =>
    api.get("/analytics/vendor", { params }),

  getVendorItemAnalytics: () =>
    api.get("/analytics/vendor/items"),

  getAdminAnalytics: () =>
    api.get("/analytics/admin"),

  getAdminVendorAnalytics: () =>
    api.get("/analytics/admin/vendors"),
}
