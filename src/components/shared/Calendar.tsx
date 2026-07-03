"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BlockedDate {
  id: string
  itemId: string
  blockedDate: string
}

interface CalendarProps {
  blockedDates: BlockedDate[]
  onBlockDate: (date: string) => void
  onUnblockDate: (dateId: string) => void
  loading?: boolean
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function Calendar({ blockedDates, onBlockDate, onUnblockDate, loading }: CalendarProps) {
  const today = useMemo(() => toLocalDateStr(new Date()), [])
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())

  const blockedMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const b of blockedDates) {
      map.set(b.blockedDate, b.id)
    }
    return map
  }, [blockedDates])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const handleDayClick = (day: number) => {
    if (loading) return
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const existingId = blockedMap.get(dateStr)
    if (existingId) {
      onUnblockDate(existingId)
    } else {
      onBlockDate(dateStr)
    }
  }

  const monthName = new Date(year, month).toLocaleString("default", { month: "long" })

  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return (
    <div className="rounded-2xl border border-border bg-bgSurface p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-textPrimary">
          {monthName} {year}
        </span>
        <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-textMuted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const isBlocked = blockedMap.has(dateStr)
          const isToday = dateStr === today

          return (
            <motion.button
              key={dateStr}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative flex items-center justify-center h-9 rounded-lg text-sm font-medium transition-all duration-150",
                isBlocked
                  ? "bg-error/15 text-error border border-error/20 hover:bg-error/25"
                  : "text-textPrimary hover:bg-bgElevated",
                isToday && !isBlocked && "ring-1 ring-accent/40 text-accent"
              )}
            >
              {isBlocked && (
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-error" />
              )}
              {day}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-textMuted">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-error/20 border border-error/30" />
          Blocked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-accent/40 bg-transparent" />
          Today
        </div>
        {loading && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
      </div>
    </div>
  )
}
