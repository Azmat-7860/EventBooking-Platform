"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Users,
  BookOpen,
  Star,
  Layers,
  Gift,
  MessageSquare,
  Search,
  CalendarRange,
} from "lucide-react"

interface SidebarLink {
  href: string
  label: string
  icon: React.ElementType
}

const vendorLinks: SidebarLink[] = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/items", label: "My Items", icon: Package },
  { href: "/vendor/bundles", label: "Bundles", icon: Gift },
  { href: "/vendor/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
]

const customerLinks: SidebarLink[] = [
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/bookings", label: "My Bookings", icon: CalendarRange },
]

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Only render sidebar on vendor and admin portal routes
  const isVendorRoute = pathname.startsWith("/vendor") && user?.role === "vendor"
  const isAdminRoute = pathname.startsWith("/admin") && user?.role === "admin"

  if (!isVendorRoute && !isAdminRoute) return null

  const links = isAdminRoute ? adminLinks : vendorLinks

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-bgSurface/50 backdrop-blur-sm md:block">
      <div className="flex h-full flex-col gap-1 p-4 pt-20">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative group"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-accent/10 border border-accent/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-accent"
                    : "text-textMuted hover:text-textPrimary"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span>{link.label}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
