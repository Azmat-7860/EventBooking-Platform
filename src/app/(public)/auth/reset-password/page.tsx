"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService } from "@/services/auth.service"
import Link from "next/link"

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    if (!token) {
      setError("Invalid reset link.")
      return
    }
    setError("")
    setIsLoading(true)
    try {
      await authService.resetPassword(token, data.password)
      setSuccess(true)
    } catch {
      setError("Failed to reset password. The link may be expired.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-textPrimary">Invalid Reset Link</h1>
        <p className="mt-2 text-textMuted">This link is invalid or expired.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/auth/forgot-password">Request a new link</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-textPrimary">Reset Password</h1>
        <p className="mt-2 text-textMuted">Enter your new password.</p>
      </div>

      {success ? (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-textPrimary">Password Reset!</h2>
          <p className="mt-2 text-textMuted">Your password has been updated.</p>
          <Button asChild className="mt-6">
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" placeholder="••••••••" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-error">{errors.confirmPassword.message}</p>}
          </div>
          {error && (
            <div className="rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <PageTransition>
      <div className="flex flex-1 items-center justify-center px-4 py-24">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        }>
          <ResetForm />
        </Suspense>
      </div>
    </PageTransition>
  )
}
