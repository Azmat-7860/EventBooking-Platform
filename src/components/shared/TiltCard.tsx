"use client"

import { useRef, useCallback, ReactNode } from "react"

export function TiltCard({ children }: { children: ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -5
    const rotateY = ((x - centerX) / centerX) * 5
    cardRef.current.style.transform =
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg)"
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "transform",
      }}
      className="relative rounded-2xl border border-border bg-bgSurface/70 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_60px_var(--accent-glow)]"
    >
      {children}
    </div>
  )
}
