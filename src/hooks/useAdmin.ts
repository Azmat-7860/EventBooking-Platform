"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminService } from "@/services/admin.service"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await adminService.getCategories()
      return data.data
    },
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const { data } = await adminService.getCategory(id)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof adminService.createCategory>[0]) =>
      adminService.createCategory(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof adminService.updateCategory>[1]) =>
      adminService.updateCategory(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      qc.invalidateQueries({ queryKey: ["category", id] })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })
}
