"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Users,
  BookOpen,
  Star,
  Settings,
} from "lucide-react"

interface SidebarLink {
  href: string
  label: string
  icon: React.ElementType
}

const vendorLinks: SidebarLink[] = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/items", label: "My Items", icon: Package },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
]

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: BookOpen },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const links = user?.role === "admin" ? adminLinks : vendorLinks

  if (!user || (user.role !== "vendor" && user.role !== "admin")) return null

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-bgSurface md:block">
      <div className="flex h-full flex-col gap-1 p-4 pt-20">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-textMuted hover:text-textPrimary hover:bg-bgElevated"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
