"use client"

import { useEffect, useState } from "react"

const icons = [
  { symbol: "🎤", label: "mic" },
  { symbol: "🎧", label: "headphones" },
  { symbol: "🎚️", label: "dj" },
  { symbol: "💡", label: "light" },
  { symbol: "🎵", label: "music" },
]

function getRandomPosition() {
  return {
    left: `${10 + Math.random() * 75}%`,
    top: `${10 + Math.random() * 70}%`,
  }
}

function getRandomDuration() {
  return 6 + Math.random() * 8
}

function getRandomDelay() {
  return Math.random() * 5
}

export function FloatingIcons() {
  const [positions] = useState(() =>
    icons.map(() => getRandomPosition())
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {icons.map((icon, i) => (
        <FloatingIcon
          key={icon.label}
          symbol={icon.symbol}
          left={positions[i].left}
          top={positions[i].top}
          duration={getRandomDuration()}
          delay={getRandomDelay()}
        />
      ))}
    </div>
  )
}

function FloatingIcon({
  symbol,
  left,
  top,
  duration,
  delay,
}: {
  symbol: string
  left: string
  top: string
  duration: number
  delay: number
}) {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: "absolute",
    left,
    top,
    opacity: 0,
    fontSize: "1.5rem",
    transform: "translateY(0)",
    transition: "none",
  })

  useEffect(() => {
    const animFrame = requestAnimationFrame(() => {
      setStyle({
        position: "absolute",
        left,
        top,
        fontSize: "1.5rem",
        opacity: 0.12,
        animation: `float-icon ${duration}s ease-in-out ${delay}s infinite`,
        filter: "blur(0.5px)",
      })
    })
    return () => cancelAnimationFrame(animFrame)
  }, [left, top, duration, delay])

  return (
    <>
      <style>{`
        @keyframes float-icon {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.06; }
          25% { opacity: 0.15; }
          50% { transform: translateY(-20px) rotate(5deg); opacity: 0.12; }
          75% { opacity: 0.15; }
        }
      `}</style>
      <span style={style}>{symbol}</span>
    </>
  )
}
