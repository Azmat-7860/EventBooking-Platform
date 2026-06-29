"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/shared/Toast"
import { useCategories } from "@/hooks/useAdmin"
import { useItem, useCreateItem, useUpdateItem } from "@/hooks/useItems"
import { itemsService } from "@/services/items.service"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"

interface ItemFormProps {
  editId?: string
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
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existingItem) {
      setTitle(existingItem.title)
      setCategoryId(existingItem.categoryId || "")
      setDescription(existingItem.description || "")
      setStartingFromText(existingItem.startingFromText || "")
      setExternalUrl(existingItem.externalUrl || "")
      setMetaTitle(existingItem.metaTitle || "")
      setMetaDesc(existingItem.metaDesc || "")
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

  const handleSave = async (status: "draft" | "published") => {
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
        const res = await updateItem.mutateAsync(payload)
        itemId = editId
      } else {
        const res = await createItem.mutateAsync(payload)
        itemId = res.data?.id
      }

      // Upload photos
      for (const file of photos) {
        await itemsService.uploadPhoto(itemId, file)
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
        <div className="p-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/vendor/items">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-textPrimary">
                {isEditing ? "Edit item" : "New item"}
              </h1>
              <p className="mt-1 text-sm text-textMuted">
                {isEditing ? "Update your service listing" : "Create a new service listing"}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Royal Wedding Photography" />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-bgSurface px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select a category</option>
                {categories?.map((cat: { id: string; name: string }) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="flex w-full rounded-lg border border-border bg-bgSurface px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent resize-y"
                placeholder="Describe your service..."
              />
            </div>

            {/* Starting from */}
            <div className="space-y-2">
              <Label htmlFor="price">Starting from</Label>
              <Input id="price" value={startingFromText} onChange={(e) => setStartingFromText(e.target.value)} placeholder="Starting from ₹25,000" />
            </div>

            {/* External URL */}
            <div className="space-y-2">
              <Label htmlFor="ext-url">External URL</Label>
              <Input id="ext-url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://..." />
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <Label>Photos (up to 5)</Label>
              <div className="grid grid-cols-5 gap-3">
                {photoPreviews.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg border border-border overflow-hidden">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-accent transition-colors">
                    <Upload className="h-5 w-5 text-textMuted" />
                    <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* SEO */}
            <div className="space-y-2">
              <Label htmlFor="meta-title">Meta title</Label>
              <Input id="meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-desc">Meta description</Label>
              <textarea
                id="meta-desc"
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                rows={2}
                className="flex w-full rounded-lg border border-border bg-bgSurface px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent resize-y"
                placeholder="SEO description"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving || !title}>
                {saving ? "Saving..." : "Save as draft"}
              </Button>
              <Button onClick={() => handleSave("published")} disabled={saving || !title}>
                {saving ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
