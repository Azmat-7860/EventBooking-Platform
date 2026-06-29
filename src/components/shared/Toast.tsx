"use client"

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const Icon = icons[t.type]
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-xl animate-[fadeIn_0.2s_ease-out] ${
                t.type === "success"
                  ? "border-success/30 bg-success/10"
                  : t.type === "error"
                  ? "border-error/30 bg-error/10"
                  : "border-accent/30 bg-accent/10"
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                t.type === "success" ? "text-success" : t.type === "error" ? "text-error" : "text-accent"
              }`} />
              <p className="flex-1 text-sm text-textPrimary">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="text-textMuted hover:text-textPrimary">
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
