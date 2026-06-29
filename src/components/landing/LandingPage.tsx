"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { PageTransition } from "@/components/shared/PageTransition"
import { FloatingIcons } from "@/components/shared/FloatingIcons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { UserRole } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { TiltCard } from "@/components/shared/TiltCard"
import {
  ArrowRight,
  Search,
  Send,
  CheckCircle,

  Star,
  Shield,
  Clock,
  Mail,
  Users,
  CalendarCheck,
  MapPin,
  Lock,
  ChevronDown,
  ChevronRight,
  Heart,
  BarChart3,
  Calendar,
  Check,
} from "lucide-react"
import Link from "next/link"

// ─── Schemas ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["customer", "vendor"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

// ─── Static Data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { emoji: "📸", label: "Photography", desc: "Capture every moment", count: 214 },
  { emoji: "🎵", label: "Music & DJ", desc: "Set the vibe", count: 178 },
  { emoji: "🍽️", label: "Catering", desc: "Cuisine that delights", count: 132 },
  { emoji: "💡", label: "Lighting & AV", desc: "Stage & event lighting", count: 96 },
  { emoji: "🌸", label: "Floral & Decor", desc: "Stunning arrangements", count: 143 },
  { emoji: "🚗", label: "Vehicles", desc: "Luxury & bridal transport", count: 87 },
  { emoji: "🎤", label: "MC & Host", desc: "Keep the energy high", count: 64 },
  { emoji: "🎂", label: "Cakes & Desserts", desc: "Custom cakes for every milestone", count: 108 },
]

const FEATURED_ITEMS = [
  {
    emoji: "📸",
    gradient: "from-[#1a0a2e] to-[#2d1b4e]",
    badge: "Top Pick",
    category: "Photography",
    title: "Royal Wedding Photo Package",
    vendor: "Ravi Kapoor Studios",
    price: "Starting from ₹25,000",
    rating: 4.9,
    reviews: 48,
  },
  {
    emoji: "🎵",
    gradient: "from-[#0a1a2e] to-[#1b3a5e]",
    badge: "New",
    category: "Music & DJ",
    title: "DJ Aryan — Full Night Set",
    vendor: "Aryan Entertainment",
    price: "Starting from ₹18,000",
    rating: 4.8,
    reviews: 31,
  },
  {
    emoji: "🌸",
    gradient: "from-[#1a2a0a] to-[#2e4a1b]",
    badge: "Popular",
    category: "Floral & Decor",
    title: "Premium Mandap Decor Setup",
    vendor: "Petal & Bloom Co.",
    price: "Starting from ₹40,000",
    rating: 5.0,
    reviews: 22,
  },
]

const STEPS = [
  {
    icon: Search,
    title: "Browse & filter",
    desc: "Search by category, date, or location. Every listing shows real photos, pricing text, and verified reviews.",
  },
  {
    icon: Send,
    title: "Send an inquiry",
    desc: "Fill in your event date, time, and details. No payment required — just a direct message to the vendor.",
  },
  {
    icon: CheckCircle,
    title: "Get confirmed",
    desc: "The vendor confirms your inquiry and you'll get an email the moment your booking is locked in.",
  },
]

const REVIEWS = [
  {
    initial: "P",
    avatarGradient: "from-[#003d4d] to-[#006680]",
    name: "Priya Sharma",
    event: "Wedding in Bhubaneswar",
    rating: 5,
    text: "Found our wedding photographer in 10 minutes. The inquiry form was so smooth and the vendor replied the same evening. Highly recommend.",
    service: "Photography",
    timeAgo: "3 weeks ago",
  },
  {
    initial: "R",
    avatarGradient: "from-[#2d1b00] to-[#6b4200]",
    name: "Rohit Menon",
    event: "Corporate event, Pune",
    rating: 5,
    text: "We booked a DJ and full AV setup through here. The vendor was professional, showed up on time, and the team was brilliant. Will use again.",
    service: "DJ & Lighting",
    timeAgo: "1 month ago",
  },
  {
    initial: "A",
    avatarGradient: "from-[#1a003d] to-[#4a0080]",
    name: "Ananya Reddy",
    event: "Birthday party, Hyderabad",
    rating: 4,
    text: "The decor vendor was absolutely stunning. Everything was set up exactly as described. Only small note — wish there were more cake vendors in my city!",
    service: "Floral Decor",
    timeAgo: "2 months ago",
  },
]

const TRUST_ITEMS = [
  { icon: Shield, label: "Verified vendors" },
  { icon: Star, label: "4.8 avg rating" },
  { icon: Clock, label: "Replies within 4 hrs" },
  { icon: Mail, label: "Instant email confirmation" },
  { icon: Users, label: "1,200+ active vendors" },
  { icon: CalendarCheck, label: "8,400+ bookings" },
  { icon: MapPin, label: "Available across India" },
  { icon: Lock, label: "Secure inquiry flow" },
]

const FAQS = [
  {
    q: "Is there a fee to send a booking inquiry?",
    a: "No. Sending an inquiry is completely free. There's no payment gateway on this platform — all pricing and payment is agreed directly between you and the vendor.",
  },
  {
    q: "How do I know a vendor is trustworthy?",
    a: "Every vendor is reviewed by real customers who have completed a booking. You can read ratings, see photos of past work, and contact the vendor directly before committing.",
  },
  {
    q: "Can I book more than one service at a time?",
    a: "Yes — you can send inquiries to multiple vendors simultaneously. Some vendors also offer bundled packages (e.g. photography + videography) which appear on their listing page.",
  },
  {
    q: "What happens after a vendor confirms my inquiry?",
    a: "You'll receive a confirmation email, and the booking status in your account will update to Confirmed. The vendor's details are included so you can coordinate directly.",
  },
  {
    q: "I'm a vendor. How do I list my services?",
    a: "Register with the 'List my services' option, complete your vendor profile, and start adding listings immediately. Listing is free — no commissions or monthly fees.",
  },
]

const VENDOR_BULLETS = [
  "Free to list — no commissions or hidden fees",
  "Real-time inquiry notifications via email",
  "Analytics dashboard: views, shares, inquiries",
  "Availability calendar to block your busy dates",
]

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PulsingDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
    </span>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-[#FFB800] text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < Math.floor(rating) ? "★" : "☆"}</span>
      ))}
    </span>
  )
}

// Accordion FAQ item
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`rounded-xl border bg-bgSurface transition-colors duration-200 overflow-hidden ${
        open ? "border-accent/30" : "border-border"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-textPrimary"
      >
        {q}
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-textMuted transition-transform duration-200 ${
            open ? "rotate-180 text-accent" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <p className="px-5 pb-4 text-sm text-textMuted leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function LandingPage() {
  const { login, register } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [authError, setAuthError] = useState("")
  const [authSuccess, setAuthSuccess] = useState("")
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [favoured, setFavoured] = useState<Record<number, boolean>>({})

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", role: "customer" },
  })

  async function onLogin(data: LoginForm) {
    setAuthError("")
    setIsAuthLoading(true)
    try {
      const res = await login(data)
      const redirect =
        res.user.role === "vendor" ? "/vendor/dashboard" : res.user.role === "admin" ? "/admin" : "/"
      router.push(redirect)
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message || "Login failed"
          : "Login failed"
      setAuthError(message)
    } finally {
      setIsAuthLoading(false)
    }
  }

  async function onRegister(data: RegisterForm) {
    setAuthError("")
    setAuthSuccess("")
    setIsAuthLoading(true)
    try {
      const res = await register({ email: data.email, password: data.password, role: data.role as UserRole })
      setAuthSuccess(res.message || "Registration successful! Check your email to verify your account.")
      registerForm.reset()
      setActiveTab("login")
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message || "Registration failed"
          : "Registration failed"
      setAuthError(message)
    } finally {
      setIsAuthLoading(false)
    }
  }

  const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )

  return (
    <PageTransition>
      <div className="flex flex-1 flex-col">

        {/* ─── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-bgPrimary">
          {/* Grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_30%_50%,_var(--accent-glow)_0%,_transparent_70%)]" />
          <FloatingIcons />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">

              {/* Left */}
              <motion.div
                className="flex-1 text-center lg:text-left"
                initial="hidden"
                animate="visible"
                variants={stagger}
              >
                {/* Eyebrow */}
                <motion.div
                  variants={fadeUp}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5"
                >
                  <PulsingDot />
                  <span className="text-xs font-medium tracking-wide text-accent">
                    Trusted by 2,400+ event planners
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="text-4xl font-bold tracking-tight text-textPrimary sm:text-5xl lg:text-6xl leading-[1.1]"
                >
                  Book{" "}
                  <span className="text-accent">premium</span>{" "}
                  event services{" "}
                  <br className="hidden lg:block" />
                  with confidence
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mt-5 max-w-lg text-base text-textMuted sm:text-lg lg:mt-6 mx-auto lg:mx-0"
                >
                  From DJs to decor, photographers to floral designers — find vetted vendors
                  and send a booking inquiry in minutes.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
                >
                  <Button asChild size="lg" className="group gap-2">
                    <Link href="#categories">
                      Browse services
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="#how-it-works">How it works</Link>
                  </Button>
                </motion.div>

                {/* Stats row */}
                <motion.div
                  variants={fadeUp}
                  className="mt-10 flex flex-wrap justify-center gap-8 border-t border-border pt-8 lg:justify-start"
                >
                  {[
                    { num: "1,200+", label: "Active vendors" },
                    { num: "8,400+", label: "Bookings made" },
                    { num: "4.8★", label: "Avg vendor rating" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-2xl font-bold text-textPrimary">{s.num}</div>
                      <div className="mt-1 text-xs text-textMuted">{s.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Auth card */}
              <motion.div
                className="w-full max-w-md mx-auto lg:mx-0 lg:shrink-0"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <TiltCard>
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-textPrimary">
                      {process.env.NEXT_PUBLIC_BRAND_NAME || "EventPro"}
                    </h2>
                    <p className="mt-1 text-sm text-textMuted">Sign in or create your account</p>
                  </div>

                  <Tabs
                    value={activeTab}
                    onValueChange={(v) => {
                      setActiveTab(v as "login" | "register")
                      setAuthError("")
                      setAuthSuccess("")
                    }}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="login" className="flex-1">Sign in</TabsTrigger>
                      <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
                    </TabsList>

                    {/* Login */}
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
                        {authError && (
                          <div className="rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">{authError}</div>
                        )}
                        <Button type="submit" className="w-full" disabled={isAuthLoading}>
                          {isAuthLoading ? "Signing in..." : "Sign in"}
                        </Button>
                      </form>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-bgSurface px-2 text-textMuted">Or continue with</span>
                        </div>
                      </div>
                      <Button type="button" variant="outline" className="w-full gap-2">
                        <GoogleIcon /> Google
                      </Button>
                    </TabsContent>

                    {/* Register */}
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
                          <Label htmlFor="reg-confirm">Confirm password</Label>
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
                              className="flex-1 text-sm"
                              onClick={() => registerForm.setValue("role", "customer")}
                            >
                              Book services
                            </Button>
                            <Button
                              type="button"
                              variant={registerForm.watch("role") === "vendor" ? "default" : "outline"}
                              className="flex-1 text-sm"
                              onClick={() => registerForm.setValue("role", "vendor")}
                            >
                              List my services
                            </Button>
                          </div>
                        </div>
                        {authError && (
                          <div className="rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">{authError}</div>
                        )}
                        {authSuccess && (
                          <div className="rounded-lg bg-success/10 border border-success/20 p-3 text-sm text-success">{authSuccess}</div>
                        )}
                        <Button type="submit" className="w-full" disabled={isAuthLoading}>
                          {isAuthLoading ? "Creating account..." : "Create account"}
                        </Button>
                      </form>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-bgSurface px-2 text-textMuted">Or continue with</span>
                        </div>
                      </div>
                      <Button type="button" variant="outline" className="w-full gap-2">
                        <GoogleIcon /> Google
                      </Button>
                    </TabsContent>
                  </Tabs>
                </TiltCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Trust Bar ────────────────────────────────────────────────────── */}
        <div className="border-y border-border bg-bgSurface/60 py-4 overflow-hidden">
          <div
            className="flex gap-12 whitespace-nowrap animate-trust-scroll"
            style={{ width: "max-content" }}
          >
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-2 text-textMuted text-sm">
                  <Icon className="h-4 w-4 text-accent" />
                  {item.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── Categories ───────────────────────────────────────────────────── */}
        <section id="categories" className="border-t border-border bg-bgPrimary py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mb-12 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
            >
              <motion.span
                variants={fadeUp}
                className="mb-3 inline-block rounded-full border border-accent/25 bg-accent/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-accent"
              >
                Browse by category
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-textPrimary">
                Everything your event needs
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-2 text-textMuted">
                Explore vetted vendors across 12 service categories
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              {CATEGORIES.map((cat) => (
                <motion.div
                  key={cat.label}
                  variants={fadeUp}
                  className="group relative flex cursor-pointer flex-col rounded-2xl border border-border bg-bgSurface p-5 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_30px_var(--accent-glow)] hover:-translate-y-1 overflow-hidden"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl transition-all duration-300 group-hover:bg-accent/20">
                    {cat.emoji}
                  </div>
                  <h3 className="font-semibold text-textPrimary">{cat.label}</h3>
                  <p className="mt-1 text-xs text-textMuted">{cat.desc}</p>
                  <p className="mt-3 text-xs font-medium text-accent">{cat.count} vendors →</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Featured Items ────────────────────────────────────────────────── */}
        <section className="border-t border-border bg-bgSurface/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mb-12 flex flex-wrap items-end justify-between gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <div>
                <motion.span
                  variants={fadeUp}
                  className="mb-3 inline-block rounded-full border border-accent/25 bg-accent/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-accent"
                >
                  Trending now
                </motion.span>
                <motion.h2 variants={fadeUp} className="text-3xl font-bold text-textPrimary">
                  Top-rated services this week
                </motion.h2>
              </div>
              <motion.div variants={fadeUp}>
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link href="/">
                    View all <ChevronRight className="h-3 w-3" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              {FEATURED_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="group overflow-hidden rounded-2xl border border-border bg-bgSurface transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_16px_40px_var(--accent-glow)] cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className={`relative h-44 bg-gradient-to-br ${item.gradient} flex items-center justify-center text-5xl`}>
                    {item.emoji}
                    <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/60 px-3 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {item.badge}
                    </span>
                    <button
                      onClick={() => setFavoured((f) => ({ ...f, [i]: !f[i] }))}
                      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/60 backdrop-blur-sm transition-colors hover:bg-black/80"
                    >
                      <Heart className={`h-3.5 w-3.5 ${favoured[i] ? "fill-accent text-accent" : "text-white"}`} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <p className="text-xs font-medium text-accent">{item.category}</p>
                    <h3 className="mt-1 font-semibold text-textPrimary leading-snug">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-textMuted">by {item.vendor}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-textMuted">{item.price}</span>
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={item.rating} />
                        <span className="text-xs text-textMuted">{item.rating} ({item.reviews})</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── How It Works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" className="border-t border-border bg-bgPrimary py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mb-16 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.span
                variants={fadeUp}
                className="mb-3 inline-block rounded-full border border-accent/25 bg-accent/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-accent"
              >
                The process
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-textPrimary">
                Three steps to your perfect event
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-2 text-textMuted">
                No phone tag, no guesswork — just a clean inquiry flow
              </motion.p>
            </motion.div>

            <motion.div
              className="relative grid gap-8 sm:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              {/* Connector line (desktop only) */}
              <div className="pointer-events-none absolute left-[15%] right-[15%] top-8 hidden h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent sm:block" />

              {STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <motion.div key={step.title} variants={fadeUp} className="relative flex flex-col items-center text-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-accent/30 bg-accent/10">
                      <Icon className="h-7 w-7 text-accent" />
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-black">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-textPrimary">{step.title}</h3>
                    <p className="mt-2 text-sm text-textMuted leading-relaxed">{step.desc}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* ─── Vendor CTA ───────────────────────────────────────────────────── */}
        <section className="border-t border-border bg-bgSurface/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="relative overflow-hidden rounded-3xl border border-accent/15 bg-gradient-to-br from-[#0d1a24] to-[#0a1628] p-10 sm:p-14"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
            >
              {/* Decorative glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.08),transparent_70%)]" />

              <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                <div className="lg:max-w-xl">
                  <span className="mb-4 inline-block rounded-full border border-accent/25 bg-accent/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-accent">
                    For vendors
                  </span>
                  <h2 className="text-3xl font-bold text-textPrimary mb-3">
                    Grow your event business
                  </h2>
                  <p className="text-textMuted text-base leading-relaxed mb-6">
                    List your services, manage inquiries, and reach thousands of event planners — all from one dashboard.
                  </p>
                  <ul className="flex flex-col gap-3">
                    {VENDOR_BULLETS.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm text-textMuted">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/15">
                          <Check className="h-3 w-3 text-accent" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col items-center gap-3 lg:flex-shrink-0">
                  <Button asChild size="lg" className="gap-2 px-8">
                    <Link href="/auth">
                      Start listing free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-xs text-textMuted">No credit card needed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Reviews ──────────────────────────────────────────────────────── */}
        <section className="border-t border-border bg-bgPrimary py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mb-12 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.span
                variants={fadeUp}
                className="mb-3 inline-block rounded-full border border-accent/25 bg-accent/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-accent"
              >
                What people say
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-textPrimary">
                Customers love {process.env.NEXT_PUBLIC_BRAND_NAME || "EventPro"}
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-2 text-textMuted">
                Real reviews from real bookings
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-5 sm:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              {REVIEWS.map((r) => (
                <motion.div
                  key={r.name}
                  variants={fadeUp}
                  className="flex flex-col rounded-2xl border border-border bg-bgSurface p-6 transition-colors duration-200 hover:border-accent/20"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${r.avatarGradient} text-sm font-semibold text-white`}
                    >
                      {r.initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-textPrimary">{r.name}</p>
                      <p className="text-xs text-textMuted">{r.event}</p>
                    </div>
                  </div>
                  <StarRating rating={r.rating} />
                  <p className="mt-3 flex-1 text-sm text-textMuted leading-relaxed">"{r.text}"</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs font-medium text-accent">{r.service}</span>
                    <span className="text-xs text-textMuted">{r.timeAgo}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="border-t border-border bg-bgSurface/30 py-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <motion.div
              className="mb-12 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              <motion.span
                variants={fadeUp}
                className="mb-3 inline-block rounded-full border border-accent/25 bg-accent/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-accent"
              >
                Common questions
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-textPrimary">
                Things people ask
              </motion.h2>
            </motion.div>

            <motion.div
              className="flex flex-col gap-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
            >
              {FAQS.map((faq) => (
                <motion.div key={faq.q} variants={fadeUp}>
                  <FaqItem q={faq.q} a={faq.a} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Footer Band ──────────────────────────────────────────────────── */}
        <footer className="border-t border-border bg-bgPrimary py-10 text-center">
          <p className="text-xl font-bold text-textPrimary">
            Event<span className="text-accent">Pro</span>
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-6">
            {["Browse services", "List your service", "How it works", "Privacy policy", "Contact"].map((link) => (
              <Link key={link} href="#" className="text-sm text-textMuted hover:text-accent transition-colors">
                {link}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-xs text-textMuted/50">
            © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_BRAND_NAME || "EventPro"}. All rights reserved.
          </p>
        </footer>

      </div>
    </PageTransition>
  )
}

