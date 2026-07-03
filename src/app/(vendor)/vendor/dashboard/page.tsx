"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { StatsGridSkeleton } from "@/components/shared/Skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/shared/Toast"
import { useAuth } from "@/context/AuthContext"
import { vendorService } from "@/services/vendor.service"
import { useMyItems } from "@/hooks/useItems"
import { staggerContainer, fadeUp } from "@/components/shared/animations"
import { Package, BarChart3, Building2, Eye, UserCircle, Camera, Gift } from "lucide-react"
import Link from "next/link"

export default function VendorDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: items, isLoading: itemsLoading } = useMyItems()

  const [showProfile, setShowProfile] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [contactName, setContactName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [profileExists, setProfileExists] = useState(false)

  useEffect(() => {
    vendorService.getProfile()
      .then((res: { data: { businessName?: string; contactName?: string; phone?: string; address?: string; city?: string; logoUrl?: string } }) => {
        setProfileExists(true)
        setBusinessName(res.data.businessName || "")
        setContactName(res.data.contactName || "")
        setPhone(res.data.phone || "")
        setAddress(res.data.address || "")
        setCity(res.data.city || "")
        setLogoUrl(res.data.logoUrl || "")
      })
      .catch(() => {
        setProfileExists(false)
        setShowProfile(true)
      })
  }, [])

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await vendorService.uploadLogo(file)
      const url = res.data.data?.logoUrl
      if (url) setLogoUrl(url)
      toast("success", "Logo uploaded")
    } catch {
      toast("error", "Failed to upload logo")
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const payload = { businessName, contactName, phone, address, city }
      if (profileExists) {
        await vendorService.updateProfile(payload)
      } else {
        await vendorService.createProfile(payload)
      }
      toast("success", profileExists ? "Profile updated!" : "Profile created!")
      setShowProfile(false)
      setProfileExists(true)
    } catch {
      toast("error", "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const publishedCount = items?.filter((i: { status: string }) => i.status === "published").length || 0
  const draftCount = items?.filter((i: { status: string }) => i.status === "draft").length || 0

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <PageHeader
              title="Vendor Dashboard"
              subtitle={`Welcome back, ${user?.email?.split("@")[0] || "vendor"}`}
            />

            {/* Stats */}
            {itemsLoading ? (
              <StatsGridSkeleton count={4} />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
              >
                <StatsCard icon={Package} label="Total Items" value={items?.length || 0} accent />
                <StatsCard icon={Eye} label="Published" value={publishedCount} />
                <StatsCard icon={BarChart3} label="Drafts" value={draftCount} />
                <StatsCard icon={UserCircle} label="Profile" value={profileExists ? "Complete" : "Incomplete"} accent={!profileExists} />
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8"
            >
              <motion.div variants={fadeUp}>
                <Link
                  href="/vendor/items"
                  className="group relative block overflow-hidden rounded-2xl border border-border bg-bgSurface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_30px_var(--accent-glow)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                      <Package className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-textPrimary">My Items</h3>
                      <p className="mt-1 text-sm text-textMuted">Manage your service listings — add, edit, publish</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                        {items?.length || 0} listings
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Link
                  href="/vendor/bundles"
                  className="group relative block overflow-hidden rounded-2xl border border-border bg-bgSurface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_30px_var(--accent-glow)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                      <Gift className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-textPrimary">Bundles</h3>
                      <p className="mt-1 text-sm text-textMuted">Group services together as packages</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                        Manage bundles
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp}>
                <div className="group relative block overflow-hidden rounded-2xl border border-border bg-bgSurface/50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bgElevated">
                      <BarChart3 className="h-6 w-6 text-textMuted" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-textMuted">Analytics</h3>
                      <p className="mt-1 text-sm text-textMuted">View insights on views, shares, and inquiries</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-textSubtle">
                        Coming in Phase 6
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Profile Banner */}
            {!profileExists && (
              <motion.div
                variants={fadeUp}
                className="rounded-2xl border border-accent/20 bg-accent/5 p-5 relative overflow-hidden"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                      <Building2 className="h-5 w-5 text-accent animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-textPrimary">Complete your vendor profile</p>
                      <p className="text-xs text-textMuted mt-0.5">Add your business name and contact details to get started</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowProfile(true)} size="sm" className="shrink-0">
                    Complete profile
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Profile Dialog */}
            <Dialog open={showProfile} onOpenChange={(open) => { if (profileExists || !open) setShowProfile(open) }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{profileExists ? "Edit vendor profile" : "Create vendor profile"}</DialogTitle>
                  <DialogDescription>
                    {profileExists ? "Update your business information" : "Tell customers about your business"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 mt-2">
                  {/* Logo Upload */}
                  <div className="flex justify-center">
                    <label className="group relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border bg-bgElevated hover:border-accent/40 transition-colors overflow-hidden">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="h-6 w-6 text-textMuted group-hover:text-accent transition-colors" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                      <input type="file" accept="image/*" onChange={handleLogoSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="biz-name">Business name *</Label>
                      <Input id="biz-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Studio Name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Contact name</Label>
                      <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} className="w-full gap-2" disabled={saving || !businessName}>
                    {saving ? "Saving..." : profileExists ? "Update profile" : "Create profile"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
