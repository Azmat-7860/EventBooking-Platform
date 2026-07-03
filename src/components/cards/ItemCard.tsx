"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Item } from "@/types"
import { ImageIcon } from "lucide-react"

interface ItemCardProps {
  item: Item
  index?: number
}

export function ItemCard({ item, index = 0 }: ItemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link
        href={`/items/${item.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-border bg-bgSurface transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_30px_var(--accent-glow)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Photo */}
        <div className="relative aspect-[4/3] overflow-hidden bg-bgElevated">
          <div className="flex h-full items-center justify-center text-textSubtle">
            <ImageIcon className="h-10 w-10" />
          </div>
        </div>

        {/* Content */}
        <div className="relative p-4">
          <h3 className="font-semibold text-textPrimary truncate group-hover:text-accent transition-colors">
            {item.title}
          </h3>

          {item.startingFromText && (
            <p className="mt-1 text-sm font-medium text-accent">
              {item.startingFromText}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-2.5 py-0.5 text-xs font-medium text-accent">
              View details
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
