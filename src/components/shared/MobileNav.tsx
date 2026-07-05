"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, BarChart3, Users, Home, Search, Gift, MessageSquare, CalendarRange } from "lucide-react"

const customerLinks = [
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/bookings", label: "Bookings", icon: CalendarRange },
]

const vendorLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/items", label: "Items", icon: Package },
  { href: "/vendor/bundles", label: "Bundles", icon: Gift },
  { href: "/vendor/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
]

const adminLinks = [
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
]

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const links =
    user?.role === "customer" ? customerLinks
    : user?.role === "admin" ? adminLinks
    : vendorLinks

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bgPrimary/95 backdrop-blur-xl md:hidden"
      )}
    >
      <div className="flex items-center justify-around py-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors",
                isActive ? "text-accent" : "text-textMuted"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
