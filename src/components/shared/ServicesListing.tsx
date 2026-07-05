"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useCategories } from "@/hooks/useAdmin"
import { usePublishedItems } from "@/hooks/usePublicItems"
import { ItemCard } from "@/components/cards/ItemCard"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Calendar, X, Loader2, Package } from "lucide-react"
import { fadeUp, staggerContainer } from "./animations"

interface ServicesListingProps {
  initialCategory?: string
  initialSearch?: string
  initialDate?: string
  showHeader?: boolean
}

export function ServicesListing({ initialCategory, initialSearch, initialDate, showHeader = true }: ServicesListingProps) {
  const { data: categories } = useCategories()

  const [search, setSearch] = useState(initialSearch || "")
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch || "")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null)
  const [selectedDate, setSelectedDate] = useState(initialDate || "")
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data: itemsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: itemsLoading,
  } = usePublishedItems({
    category: selectedCategory || undefined,
    search: debouncedSearch || undefined,
    date: selectedDate || undefined,
  })

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchNextPage() },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const items = useMemo(() => itemsData?.pages.flatMap((p) => p.content) || [], [itemsData])

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <motion.div
            className="mb-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeUp}
              className="mb-3 inline-block rounded-full border border-accent/25 bg-accent/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-accent"
            >
              Browse services
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-textPrimary">
              Find the perfect vendor
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-2 text-textMuted">
              Search by name, category, or date
            </motion.p>
          </motion.div>
        )}

        {/* Search + Filter bar */}
        <motion.div
          variants={fadeUp}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="pl-10 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Date filter */}
          <div className="relative shrink-0">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex h-10 w-full min-w-[150px] rounded-xl border border-border bg-bgSurface px-10 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent [color-scheme:dark]"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Active category filter */}
          {selectedCategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="gap-1.5 shrink-0"
            >
              <X className="h-3.5 w-3.5" /> {categories?.find((c: { id: string; name: string }) => c.id === selectedCategory)?.name || "Category"}
            </Button>
          )}
        </motion.div>

        {/* Items Grid */}
        {itemsLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-bgSurface overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-bgElevated" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-bgElevated" />
                  <div className="h-3 w-1/2 rounded bg-bgElevated" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="h-12 w-12 text-textSubtle mb-4" />
            <p className="text-textMuted text-sm">No services found</p>
            {(search || selectedCategory || selectedDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(""); setSelectedCategory(null); setSelectedDate("") }}
                className="mt-3"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <motion.div
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {items.map((item, i) => (
                <ItemCard key={item.id} item={item} index={i} />
              ))}
            </motion.div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-10">
              {isFetchingNextPage && (
                <Loader2 className="h-5 w-5 animate-spin text-textMuted" />
              )}
              {!hasNextPage && items.length > 0 && (
                <p className="text-xs text-textMuted">All services loaded</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
