"use client"

import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <PageTransition>
      <div className="flex flex-1 flex-col">
        <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent-glow)_0%,_transparent_60%)] pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-textPrimary sm:text-6xl">
              Discover & Book Premium{" "}
              <span className="text-accent">Event Services</span>
            </h1>
            <p className="mt-6 text-lg text-textMuted sm:text-xl">
              Find and book the best photographers, venues, caterers, and entertainers for your next event.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/auth">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth">Browse Services</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
