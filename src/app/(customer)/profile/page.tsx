"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import { profileService, UserProfileData } from "@/services/profile.service"
import { useToast } from "@/components/shared/Toast"
import { fadeUp } from "@/components/shared/animations"
import { User, Phone, MapPin, Mail, Home, Save, Loader2, CheckCircle } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [fullName, setFullName] = useState("")
  const [mobile, setMobile] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    profileService
      .getProfile()
      .then((res: any) => {
        const data: UserProfileData = res.data?.data
        if (data) {
          setHasProfile(true)
          setFullName(data.fullName || "")
          setMobile(data.mobile || "")
          setCity(data.city || "")
          setAddress(data.address || "")
        }
      })
      .catch(() => {
        setHasProfile(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: UserProfileData = { fullName, mobile, city, address }
      if (hasProfile) {
        await profileService.updateProfile(payload)
      } else {
        await profileService.createProfile(payload)
        setHasProfile(true)
      }
      toast("success", "Profile updated successfully")
    } catch {
      toast("error", "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0].toUpperCase() || "U"

  return (
    <ProtectedRoute allowedRoles={["customer", "vendor", "admin"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
            <PageHeader
              title="My Profile"
              subtitle="Manage your personal details and contact preferences"
            />

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-textMuted" />
              </div>
            ) : (
              <motion.div variants={fadeUp} className="space-y-6">
                {/* User Info Header Card */}
                <div className="rounded-2xl border border-border bg-bgSurface p-6 flex flex-col sm:flex-row items-center gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent/15 border border-accent/20 text-2xl font-bold text-accent shadow-[0_0_20px_var(--accent-glow)]">
                    {initials}
                  </div>
                  <div className="text-center sm:text-left min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-textPrimary truncate">
                      {fullName || "Welcome!"}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-textMuted">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {user?.email}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-medium text-success capitalize">
                        <CheckCircle className="h-3 w-3" />
                        {user?.role || "user"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-border bg-bgSurface p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium text-textPrimary flex items-center gap-1.5">
                          <User className="h-4 w-4 text-accent" /> Full Name
                        </Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="bg-bgElevated border-border focus:border-accent"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-sm font-medium text-textPrimary flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-accent" /> Mobile Number
                        </Label>
                        <Input
                          id="mobile"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="e.g. +1 234 567 8900"
                          className="bg-bgElevated border-border focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-textPrimary flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-accent" /> City / Region
                      </Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. New York, NY"
                        className="bg-bgElevated border-border focus:border-accent"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-textPrimary flex items-center gap-1.5">
                        <Home className="h-4 w-4 text-accent" /> Address
                      </Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 123 Main Street, Apt 4B"
                        className="bg-bgElevated border-border focus:border-accent"
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="submit" disabled={saving} className="gap-2 px-6">
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" /> Save Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
