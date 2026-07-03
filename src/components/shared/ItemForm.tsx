"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/shared/Toast"
import { Calendar } from "@/components/shared/Calendar"
import { useCategories } from "@/hooks/useAdmin"
import { useItem, useCreateItem, useUpdateItem, useUploadVideo, useDeleteVideo, useAvailability, useBlockDate, useUnblockDate } from "@/hooks/useItems"
import { itemsService } from "@/services/items.service"
import { fadeUp, staggerContainer } from "@/components/shared/animations"
import {
  ArrowLeft,
  Upload,
  X,
  ChevronRight,
  ImageIcon,
  Search,
  FileText,
  Video,
  Save,
  Send,
  Loader2,
  CalendarDays,
  Trash2,
} from "lucide-react"
import Link from "next/link"

interface ItemFormProps {
  editId?: string
}

function SectionDivider({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <span className="text-sm font-semibold text-textPrimary">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-accent/20 to-transparent" />
    </div>
  )
}

export function ItemForm({ editId }: ItemFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: categories } = useCategories()
  const { data: existingItem } = useItem(editId || "")
  const createItem = useCreateItem()
  const updateItem = useUpdateItem(editId || "")

  const isEditing = !!editId

  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [startingFromText, setStartingFromText] = useState("")
  const [externalUrl, setExternalUrl] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDesc, setMetaDesc] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>("")
  const [existingVideoUrl, setExistingVideoUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [showSeo, setShowSeo] = useState(false)

  const uploadVideo = useUploadVideo(editId || "")
  const deleteVideo = useDeleteVideo(editId || "")
  const { data: blockedDates, isLoading: availLoading } = useAvailability(editId || "")
  const blockDate = useBlockDate(editId || "")
  const unblockDate = useUnblockDate(editId || "")

  useEffect(() => {
    if (existingItem) {
      setTitle(existingItem.title)
      setCategoryId(existingItem.categoryId || "")
      setDescription(existingItem.description || "")
      setStartingFromText(existingItem.startingFromText || "")
      setExternalUrl(existingItem.externalUrl || "")
      setMetaTitle(existingItem.metaTitle || "")
      setMetaDesc(existingItem.metaDesc || "")
      setExistingVideoUrl(existingItem.videoUrl || "")
    }
  }, [existingItem])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - photos.length
    const selected = files.slice(0, remaining)
    setPhotos((prev) => [...prev, ...selected])
    selected.forEach((f) => {
      const url = URL.createObjectURL(f)
      setPhotoPreviews((prev) => [...prev, url])
    })
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(null)
    setVideoPreview("")
    if (existingVideoUrl) {
      deleteVideo.mutate(undefined, {
        onSuccess: () => setExistingVideoUrl(""),
      })
    }
  }

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) {
      toast("error", "Title is required")
      return
    }
    setSaving(true)
    try {
      const payload = {
        title,
        categoryId: categoryId || undefined,
        description,
        startingFromText,
        externalUrl,
        metaTitle,
        metaDesc,
        status,
      }

      let itemId: string
      if (isEditing) {
        await updateItem.mutateAsync(payload)
        itemId = editId!
      } else {
        const res = await createItem.mutateAsync(payload)
        itemId = res.data?.id
      }

      // Upload photos
      for (const file of photos) {
        await itemsService.uploadPhoto(itemId, file)
      }

      // Upload video if selected
      if (videoFile) {
        await uploadVideo.mutateAsync(videoFile)
      }

      toast("success", isEditing ? "Item updated" : "Item created")
      router.push("/vendor/items")
    } catch {
      toast("error", "Failed to save item")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Back + Title */}
            <motion.div variants={fadeUp} className="mb-8">
              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon" className="-ml-2">
                  <Link href="/vendor/items">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-textPrimary">
                      {isEditing ? "Edit item" : "New item"}
                    </h1>
                  </div>
                  <p className="text-sm text-textMuted pl-5">
                    {isEditing ? "Update your service listing" : "Create a new service listing"}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-px bg-gradient-to-r from-accent/40 via-accent/10 to-transparent ml-5" />
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Basic Information */}
              <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                <SectionDivider icon={FileText} label="Basic Information" />
                <div className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Royal Wedding Photography"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        id="category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                      >
                        <option value="">Select a category</option>
                        {categories?.map((cat: { id: string; name: string; icon?: string }) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon || "📁"} {cat.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Starting from</Label>
                      <Input
                        id="price"
                        value={startingFromText}
                        onChange={(e) => setStartingFromText(e.target.value)}
                        placeholder="Starting from ₹25,000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <textarea
                      id="desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="flex w-full rounded-lg border border-border bg-bgSurface px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent focus:shadow-[0_0_12px_var(--accent-glow)] transition-all duration-200 resize-y"
                      placeholder="Describe your service in detail..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ext-url">External URL</Label>
                    <Input
                      id="ext-url"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://your-portfolio.com"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Photos */}
              <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                <SectionDivider icon={ImageIcon} label={`Photos (${photos.length}/5)`} />
                <div className="mt-5">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {photoPreviews.map((url, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative aspect-square rounded-xl border border-border overflow-hidden"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                    {photos.length < 5 && (
                      <motion.label
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-accent/40 hover:bg-accent/5 transition-all duration-200"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="h-5 w-5 text-textMuted" />
                          <span className="text-xs text-textMuted">Upload</span>
                        </div>
                        <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
                      </motion.label>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-textMuted">Max 5 images, 5MB each. Drag to reorder (coming soon).</p>
                </div>
              </motion.div>

              {/* Video */}
              <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                <SectionDivider icon={Video} label="Video (optional)" />
                <div className="mt-5">
                  <div className="flex flex-col items-center gap-4">
                    {existingVideoUrl && !videoPreview ? (
                      <div className="group relative w-full max-w-md rounded-xl border border-border overflow-hidden">
                        <video src={existingVideoUrl} controls className="w-full aspect-video bg-black" />
                        <button
                          onClick={handleRemoveVideo}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : videoPreview ? (
                      <div className="group relative w-full max-w-md rounded-xl border border-border overflow-hidden">
                        <video src={videoPreview} controls className="w-full aspect-video bg-black" />
                        <button
                          onClick={handleRemoveVideo}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <motion.label
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex w-full max-w-md cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-accent/40 hover:bg-accent/5 transition-all duration-200 py-10"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Video className="h-8 w-8 text-textMuted" />
                          <span className="text-sm text-textMuted">Upload a video</span>
                          <span className="text-xs text-textSubtle">MP4, WebM up to 50MB</span>
                        </div>
                        <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                      </motion.label>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Availability */}
              {isEditing && (
                <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                  <SectionDivider icon={CalendarDays} label="Availability" />
                  <div className="mt-5">
                    {availLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-textMuted" />
                      </div>
                    ) : (
                      <Calendar
                        blockedDates={blockedDates || []}
                        onBlockDate={(date) => blockDate.mutate(date)}
                        onUnblockDate={(dateId) => unblockDate.mutate(dateId)}
                        loading={blockDate.isPending || unblockDate.isPending}
                      />
                    )}
                    <p className="mt-3 text-xs text-textMuted">Click a date to block/unblock it. Blocked dates won't be available for booking.</p>
                  </div>
                </motion.div>
              )}

              {/* SEO - Collapsible */}
              <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-bgSurface p-5 sm:p-6">
                <button
                  onClick={() => setShowSeo(!showSeo)}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <Search className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-textPrimary flex-1">SEO Settings</span>
                  <motion.div
                    animate={{ rotate: showSeo ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4 text-textMuted" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showSeo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 space-y-4 border-t border-border pt-5">
                        <div className="space-y-2">
                          <Label htmlFor="meta-title">Meta title</Label>
                          <Input
                            id="meta-title"
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            placeholder="SEO-friendly title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="meta-desc">Meta description</Label>
                          <textarea
                            id="meta-desc"
                            value={metaDesc}
                            onChange={(e) => setMetaDesc(e.target.value)}
                            rows={2}
                            className="flex w-full rounded-lg border border-border bg-bgSurface px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent focus:shadow-[0_0_12px_var(--accent-glow)] transition-all duration-200 resize-y"
                            placeholder="Brief description for search engines"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Actions */}
              <motion.div
                variants={fadeUp}
                className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-bgPrimary/80 backdrop-blur-xl border-t border-border"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end max-w-4xl mx-auto">
                  <Button
                    variant="outline"
                    onClick={() => handleSave("draft")}
                    disabled={saving || !title.trim()}
                    className="gap-2 order-2 sm:order-1"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save as draft"}
                  </Button>
                  <Button
                    onClick={() => handleSave("published")}
                    disabled={saving || !title.trim()}
                    className="gap-2 order-1 sm:order-2"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {saving ? "Publishing..." : "Publish"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
