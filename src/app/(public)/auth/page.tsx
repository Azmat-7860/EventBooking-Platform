"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { UserRole } from "@/types"
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["customer", "vendor"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuth()
  const router = useRouter()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", role: "customer" },
  })

  async function onLogin(data: LoginForm) {
    setError("")
    setIsLoading(true)
    try {
      const res = await login(data)
      const redirect = res.user.role === "vendor" ? "/vendor/dashboard" : res.user.role === "admin" ? "/admin" : "/"
      router.push(redirect)
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message || "Login failed"
          : "Login failed"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function onRegister(data: RegisterForm) {
    setError("")
    setSuccess("")
    setIsLoading(true)
    try {
      const res = await register({ email: data.email, password: data.password, role: data.role as UserRole })
      setSuccess(res.message || "Registration successful! Check your email to verify your account.")
      registerForm.reset()
      setActiveTab("login")
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message || "Registration failed"
          : "Registration failed"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-textPrimary">
              {process.env.NEXT_PUBLIC_BRAND_NAME || "EventPro"}
            </h1>
            <p className="mt-2 text-textMuted">Sign in or create your account</p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as "login" | "register"); setError(""); setSuccess("") }}>
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" {...loginForm.register("email")} />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-error">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Link href="/auth/forgot-password" className="text-xs text-accent hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="login-password" type="password" placeholder="••••••••" {...loginForm.register("password")} />
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-error">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" placeholder="you@example.com" {...registerForm.register("email")} />
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-error">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input id="reg-password" type="password" placeholder="••••••••" {...registerForm.register("password")} />
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-error">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirm Password</Label>
                  <Input id="reg-confirm" type="password" placeholder="••••••••" {...registerForm.register("confirmPassword")} />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-error">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>I want to</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={registerForm.watch("role") === "customer" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => registerForm.setValue("role", "customer")}
                    >
                      Book Services
                    </Button>
                    <Button
                      type="button"
                      variant={registerForm.watch("role") === "vendor" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => registerForm.setValue("role", "vendor")}
                    >
                      List My Services
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-lg bg-success/10 border border-success/20 p-3 text-sm text-success">
                    {success}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  )
}
