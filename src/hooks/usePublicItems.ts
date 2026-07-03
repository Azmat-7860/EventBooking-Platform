"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { itemsService } from "@/services/items.service"
import { Item, PaginatedResponse } from "@/types"

export function usePublishedItems(params?: { category?: string; search?: string; date?: string; size?: number }) {
  return useInfiniteQuery<PaginatedResponse<Item>>({
    queryKey: ["published-items", params?.category, params?.search, params?.date],
    queryFn: async ({ pageParam }) => {
      const { data } = await itemsService.getPublishedItems({
        ...params,
        page: pageParam as number,
        size: params?.size || 12,
      })
      return data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  })
}

export function usePublishedItem(slugOrId: string) {
  return useQuery({
    queryKey: ["published-item", slugOrId],
    queryFn: async () => {
      const { data } = await itemsService.getItem(slugOrId)
      return data.data as Item
    },
    enabled: !!slugOrId,
  })
}
