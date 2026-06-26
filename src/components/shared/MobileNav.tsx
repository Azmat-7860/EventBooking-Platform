"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, BarChart3, Users, Home, Search } from "lucide-react"

const publicLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
]

const vendorLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/items", label: "Items", icon: Package },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
]

const adminLinks = [
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
]

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isVendorOrAdmin = user?.role === "vendor" || user?.role === "admin"
  const links = user?.role === "admin" ? adminLinks : user?.role === "vendor" ? vendorLinks : publicLinks

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bgPrimary/95 backdrop-blur-xl md:hidden",
        !isVendorOrAdmin && "hidden"
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
