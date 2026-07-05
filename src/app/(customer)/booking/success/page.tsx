"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowLeft, Search } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const itemName = searchParams.get("item") || ""

  return (
    <PageTransition>
      <div className="relative min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
        <div className="relative max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-success" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-textPrimary mb-2"
          >
            Inquiry Submitted!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-textMuted mb-6"
          >
            {itemName ? (
              <>Your inquiry for <span className="text-accent font-medium">{itemName}</span> has been sent to the vendor.</>
            ) : (
              <>Your inquiry has been sent to the vendor.</>
            )}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-textSubtle mb-8"
          >
            The vendor will review your request and contact you soon. You'll also receive a confirmation email with the details.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-3"
          >
            <Button asChild className="w-full gap-2">
              <Link href="/bookings">
                <Search className="h-4 w-4" /> View My Bookings
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" /> Browse More Services
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
