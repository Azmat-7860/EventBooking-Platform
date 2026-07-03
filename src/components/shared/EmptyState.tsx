"use client"

import { motion } from "framer-motion"
import { fadeUp } from "./animations"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bgSurface/30 px-6 py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
        <Icon className="h-8 w-8 text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-textMuted">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6 gap-2">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
