"use client"

import { motion } from "framer-motion"
import { fadeUp } from "./animations"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: string
  accent?: boolean
}

export function StatsCard({ icon: Icon, label, value, trend, accent }: StatsCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-border bg-bgSurface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_30px_var(--accent-glow)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? "bg-accent/15" : "bg-bgElevated"}`}>
            <Icon className={`h-5 w-5 ${accent ? "text-accent" : "text-textMuted"}`} />
          </div>
          {trend && (
            <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
              {trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-textPrimary">{value}</p>
        <p className="mt-1 text-sm text-textMuted">{label}</p>
      </div>
    </motion.div>
  )
}
