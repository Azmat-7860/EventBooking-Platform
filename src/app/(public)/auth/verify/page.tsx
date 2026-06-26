"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { authService } from "@/services/auth.service"

function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link.")
      return
    }

    const verify = async () => {
      try {
        const { data } = await authService.verifyEmail(token)
        if (data.success) {
          setStatus("success")
          setMessage("Your email has been verified! You can now sign in.")
        } else {
          setStatus("error")
          setMessage(data.message || "Verification failed.")
        }
      } catch {
        setStatus("error")
        setMessage("Verification link is invalid or expired.")
      }
    }

    const timer = setTimeout(verify, 500)
    return () => clearTimeout(timer)
  }, [token])

  return (
    <div className="w-full max-w-md text-center">
      {status === "verifying" && (
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-textMuted">Verifying...</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-textPrimary">Email Verified!</h1>
          <p className="text-textMuted">{message}</p>
          <Button asChild className="mt-4">
            <Link href="/auth">Go to Sign In</Link>
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/20">
            <svg className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-textPrimary">Verification Failed</h1>
          <p className="text-textMuted">{message}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/auth">Back to Sign In</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default function VerifyPage() {
  return (
    <PageTransition>
      <div className="flex flex-1 items-center justify-center px-4 py-24">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </div>
    </PageTransition>
  )
}
