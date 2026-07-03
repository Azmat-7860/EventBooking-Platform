import api from "./api"

export const categoriesService = {
  getAll: () => api.get("/categories"),
}
