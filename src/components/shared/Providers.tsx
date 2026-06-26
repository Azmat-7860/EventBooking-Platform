"use client"

import { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { ThemeProvider } from "@/context/ThemeContext"
import { ColorProvider } from "@/context/ColorContext"
import { AuthProvider } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"

function ColorThemeBridge({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme()
  return (
    <ColorProvider isLight={resolvedTheme === "light"}>
      {children}
    </ColorProvider>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ColorThemeBridge>
          <AuthProvider>{children}</AuthProvider>
        </ColorThemeBridge>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
