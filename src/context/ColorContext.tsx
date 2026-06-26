"use client"

import { createContext, useContext, ReactNode } from "react"

export const defaultColors = {
  bgPrimary: "#0A0A0F",
  bgSurface: "#12121A",
  bgElevated: "#1A1A28",
  accent: "#00D4FF",
  accentGlow: "rgba(0, 212, 255, 0.15)",
  accentHover: "#00B8E0",
  textPrimary: "#FFFFFF",
  textMuted: "#8A8A9A",
  textSubtle: "#555566",
  success: "#00FF88",
  error: "#FF4466",
  warning: "#FFB800",
  border: "#2A2A3A",
  borderAccent: "rgba(0, 212, 255, 0.3)",
}

export const lightOverrides: Partial<typeof defaultColors> = {
  bgPrimary: "#F5F5F8",
  bgSurface: "#FFFFFF",
  bgElevated: "#EEEEF4",
  textPrimary: "#0A0A0F",
  textMuted: "#6B6B7B",
  textSubtle: "#9A9AAB",
  border: "#D0D0DA",
}

type ColorPalette = typeof defaultColors

const ColorContext = createContext<ColorPalette>(defaultColors)

export function ColorProvider({
  children,
  isLight = false,
}: {
  children: ReactNode
  isLight?: boolean
}) {
  const colors = isLight
    ? { ...defaultColors, ...lightOverrides }
    : defaultColors

  return <ColorContext.Provider value={colors}>{children}</ColorContext.Provider>
}

export function useColors() {
  return useContext(ColorContext)
}
