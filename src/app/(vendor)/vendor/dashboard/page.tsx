"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/shared/Toast"
import { useAuth } from "@/context/AuthContext"
import { vendorService } from "@/services/vendor.service"
import { Package, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function VendorDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [showProfile, setShowProfile] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [contactName, setContactName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [saving, setSaving] = useState(false)
  const [profileExists, setProfileExists] = useState(false)

  useEffect(() => {
    vendorService.getProfile()
      .then(() => setProfileExists(true))
      .catch(() => {
        setShowProfile(true)
        setProfileExists(false)
      })
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await vendorService.createProfile({ businessName, contactName, phone, address, city })
      toast("success", "Profile created!")
      setShowProfile(false)
      setProfileExists(true)
    } catch {
      toast("error", "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <PageTransition>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-textPrimary">Vendor Dashboard</h1>
            <p className="mt-1 text-textMuted">Welcome back, {user?.email}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            <Link href="/vendor/items" className="group rounded-xl border border-border bg-bgSurface p-6 transition-all hover:border-accent/30 hover:shadow-[0_0_30px_var(--accent-glow)]">
              <Package className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-semibold text-textPrimary">My Items</h3>
              <p className="mt-1 text-sm text-textMuted">Manage your service listings</p>
            </Link>
            <div className="rounded-xl border border-border bg-bgSurface p-6 opacity-50">
              <BarChart3 className="h-8 w-8 text-textMuted mb-3" />
              <h3 className="font-semibold text-textMuted">Analytics</h3>
              <p className="mt-1 text-sm text-textMuted">Coming in Phase 6</p>
            </div>
          </div>

          {!profileExists && (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-textMuted">
              Complete your <button onClick={() => setShowProfile(true)} className="text-accent underline">vendor profile</button> to get started.
            </div>
          )}

          <Dialog open={showProfile} onOpenChange={setShowProfile}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Complete your vendor profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="biz-name">Business name *</Label>
                  <Input id="biz-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Studio Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Contact name</Label>
                  <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" />
                </div>
                <Button onClick={handleSaveProfile} className="w-full" disabled={saving || !businessName}>
                  {saving ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
