"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import { THEME_KEY } from "@/lib/constants"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark")

  const applyTheme = useCallback((t: "light" | "dark") => {
    setResolvedTheme(t)
    document.documentElement.classList.toggle("light", t === "light")
    document.documentElement.classList.toggle("dark", t === "dark")
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored) setThemeState(stored)
  }, [])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = (e: MediaQueryListEvent | MediaQueryList) =>
        applyTheme(e.matches ? "dark" : "light")
      handler(mq)
      mq.addEventListener("change", handler as (e: MediaQueryListEvent) => void)
      return () =>
        mq.removeEventListener("change", handler as (e: MediaQueryListEvent) => void)
    }
    applyTheme(theme)
  }, [theme, applyTheme])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
