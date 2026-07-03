import api from "./api"

export const analyticsService = {
  logEvent: (type: string, itemId?: string, userId?: string) =>
    api.post("/analytics/event", { type, itemId, userId }),
}
