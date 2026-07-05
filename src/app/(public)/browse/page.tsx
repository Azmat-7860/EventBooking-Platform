"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { PageTransition } from "@/components/shared/PageTransition"
import { ServicesListing } from "@/components/shared/ServicesListing"
import { Loader2 } from "lucide-react"

function BrowseContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || undefined
  const search = searchParams.get("search") || undefined
  const date = searchParams.get("date") || undefined

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
      <div className="relative">
        <ServicesListing
          initialCategory={category}
          initialSearch={search}
          initialDate={date}
          showHeader={true}
        />
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <PageTransition>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-textMuted" />
          </div>
        }
      >
        <BrowseContent />
      </Suspense>
    </PageTransition>
  )
}
