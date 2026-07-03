"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { fadeUp } from "./animations"

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, backHref, action }: PageHeaderProps) {
  return (
    <motion.div variants={fadeUp} className="mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          {backHref && (
            <Button asChild variant="ghost" size="icon" className="mt-0.5 shrink-0 -ml-2">
              <Link href={backHref}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-bold text-textPrimary truncate">
                {title}
              </h1>
            </div>
            {subtitle && (
              <p className="text-sm sm:text-base text-textMuted mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {action && (
          <div className="shrink-0">{action}</div>
        )}
      </div>
      <div className="mt-4 h-px bg-gradient-to-r from-accent/40 via-accent/10 to-transparent" />
    </motion.div>
  )
}
