"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "@/components/ui/button"
import { useVendorBookingCounts } from "@/hooks/useBooking"
import { LogOut, User, LayoutDashboard, CalendarRange, Bell, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { data: bookingCounts } = useVendorBookingCounts(user?.role === "vendor")

  const dashboardLink = user?.role === "vendor" ? "/vendor/dashboard" : user?.role === "admin" ? "/admin" : "/"
  const pendingCount = bookingCounts?.pending || 0

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-bgPrimary/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-accent">
            {process.env.NEXT_PUBLIC_BRAND_NAME || "EventPro"}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user?.role === "vendor" && (
            <Link href="/vendor/inquiries" className="relative flex h-9 w-9 items-center justify-center rounded-lg text-textMuted hover:text-textPrimary hover:bg-bgElevated transition-all">
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white leading-none">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </Link>
          )}
          <ThemeToggle />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-textMuted hover:text-textPrimary">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/browse" className="flex items-center">
                    <Search className="mr-2 h-4 w-4" /> Browse Services
                  </Link>
                </DropdownMenuItem>
                {user?.role === "customer" && (
                  <DropdownMenuItem asChild>
                    <Link href="/bookings" className="flex items-center">
                      <CalendarRange className="mr-2 h-4 w-4" /> My Bookings
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={dashboardLink} className="flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-error">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
