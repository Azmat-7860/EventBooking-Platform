"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { itemsService } from "@/services/items.service"

export function useMyItems() {
  return useQuery({
    queryKey: ["my-items"],
    queryFn: async () => {
      const { data } = await itemsService.getMyItems()
      return data.data
    },
  })
}

export function useItem(slugOrId: string) {
  return useQuery({
    queryKey: ["item", slugOrId],
    queryFn: async () => {
      const { data } = await itemsService.getItem(slugOrId)
      return data.data
    },
    enabled: !!slugOrId,
  })
}

export function useCreateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof itemsService.createItem>[0]) =>
      itemsService.createItem(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-items"] }),
  })
}

export function useUpdateItem(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof itemsService.updateItem>[1]) =>
      itemsService.updateItem(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-items"] })
      qc.invalidateQueries({ queryKey: ["item", id] })
    },
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => itemsService.deleteItem(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-items"] }),
  })
}

export function useToggleStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => itemsService.toggleStatus(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-items"] }),
  })
}

export function useUploadPhoto(itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => itemsService.uploadPhoto(itemId, file).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["item-photos", itemId] }),
  })
}

export function useDeletePhoto(itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (photoId: string) => itemsService.deletePhoto(itemId, photoId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["item-photos", itemId] }),
  })
}

export function useUploadVideo(itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => itemsService.uploadVideo(itemId, file).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["item", itemId] }),
  })
}

export function useDeleteVideo(itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => itemsService.deleteVideo(itemId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["item", itemId] }),
  })
}

export function useAvailability(itemId: string) {
  return useQuery({
    queryKey: ["availability", itemId],
    queryFn: async () => {
      const { data } = await itemsService.getAvailability(itemId)
      return data.data
    },
    enabled: !!itemId,
  })
}

export function useBlockDate(itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (date: string) => itemsService.blockDate(itemId, date).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability", itemId] }),
  })
}

export function useUnblockDate(itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dateId: string) => itemsService.unblockDate(itemId, dateId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability", itemId] }),
  })
}

// ─── Bundle Hooks ──────────────────────────────────────────────────────────

export function useBundles() {
  return useQuery({
    queryKey: ["bundles"],
    queryFn: async () => {
      const { data } = await itemsService.getBundles()
      return data.data
    },
  })
}

export function useCreateBundle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      itemsService.createBundle(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bundles"] }),
  })
}

export function useUpdateBundle(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      itemsService.updateBundle(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bundles"] })
      qc.invalidateQueries({ queryKey: ["bundle", id] })
    },
  })
}

export function useDeleteBundle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => itemsService.deleteBundle(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bundles"] }),
  })
}

export function useBundleItems(bundleId: string) {
  return useQuery({
    queryKey: ["bundle-items", bundleId],
    queryFn: async () => {
      const { data } = await itemsService.getBundleItems(bundleId)
      return data.data
    },
    enabled: !!bundleId,
  })
}

export function useAddBundleItem(bundleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => itemsService.addBundleItem(bundleId, itemId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bundle-items", bundleId] }),
  })
}

export function useRemoveBundleItem(bundleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => itemsService.removeBundleItem(bundleId, itemId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bundle-items", bundleId] }),
  })
}
