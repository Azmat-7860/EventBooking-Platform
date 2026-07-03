"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useToast } from "@/components/shared/Toast"
import { adminService } from "@/services/admin.service"
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/useAdmin"
import { useQueryClient } from "@tanstack/react-query"
import { Category } from "@/types"
import { staggerContainer, fadeUp } from "@/components/shared/animations"
import { Plus, Pencil, Trash2, Layers, Hash } from "lucide-react"

const categoryGradients = [
  "from-[#1a0a2e] to-[#2d1b4e]",
  "from-[#0a1a2e] to-[#1b3a5e]",
  "from-[#1a2a0a] to-[#2e4a1b]",
  "from-[#2e1a0a] to-[#4a2a1b]",
  "from-[#0a2e2e] to-[#1b4a4a]",
  "from-[#2e0a2e] to-[#4a1b4a]",
  "from-[#1a0a0a] to-[#3a1b1b]",
  "from-[#0a1a2e] to-[#1b2e4a]",
]

export default function AdminCategories() {
  const { data: categories, isLoading } = useCategories()
  const createCat = useCreateCategory()
  const deleteCat = useDeleteCategory()
  const qc = useQueryClient()

  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const openCreate = () => {
    setEditId(null)
    setName("")
    setIcon("")
    setSortOrder(0)
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditId(cat.id)
    setName(cat.name)
    setIcon(cat.icon || "")
    setSortOrder(cat.sortOrder || 0)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const payload = { name, icon, sortOrder }
    try {
      if (editId) {
        await adminService.updateCategory(editId, payload)
        qc.invalidateQueries({ queryKey: ["categories"] })
        toast("success", "Category updated")
      } else {
        await createCat.mutateAsync(payload)
        toast("success", "Category created")
      }
      setDialogOpen(false)
    } catch {
      toast("error", "Failed to save category")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCat.mutateAsync(deleteId)
      toast("success", "Category deleted")
      setDeleteId(null)
    } catch {
      toast("error", "Failed to delete category")
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <PageHeader
              title="Categories"
              subtitle={`${categories?.length || 0} service categories`}
              action={
                <Button onClick={openCreate} className="gap-2">
                  <Plus className="h-4 w-4" /> Add category
                </Button>
              }
            />

            {isLoading ? (
              <CardGridSkeleton count={6} />
            ) : categories?.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="No categories yet"
                description="Create your first service category to organize vendor listings."
                actionLabel="Add category"
                onAction={openCreate}
              />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                <AnimatePresence mode="popLayout">
                  {categories?.map((cat: Category, idx: number) => (
                    <motion.div
                      key={cat.id}
                      variants={fadeUp}
                      layout
                      className="group relative overflow-hidden rounded-2xl border border-border bg-bgSurface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_0_30px_var(--accent-glow)]"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative">
                        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${categoryGradients[idx % categoryGradients.length]} text-2xl shadow-lg`}>
                          {cat.icon || "📁"}
                        </div>

                        <h3 className="font-semibold text-textPrimary truncate">{cat.name}</h3>

                        <div className="mt-2 flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                            <Hash className="h-3 w-3" />
                            {cat.sortOrder || 0}
                          </span>
                        </div>

                        <div className="mt-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <Button variant="outline" size="sm" onClick={() => openEdit(cat)} className="flex-1 gap-1.5">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteId(cat.id)} className="gap-1.5">
                            <Trash2 className="h-3.5 w-3.5 text-error" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editId ? "Edit category" : "Add category"}</DialogTitle>
                  <DialogDescription>Enter the category details below.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Name</Label>
                    <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Photography" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-icon">Icon emoji</Label>
                    <Input id="cat-icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📸" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-sort">Sort order</Label>
                    <Input id="cat-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
                  </div>
                  <Button onClick={handleSave} className="w-full" disabled={createCat.isPending || !name}>
                    {createCat.isPending ? "Saving..." : editId ? "Update category" : "Create category"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
              open={!!deleteId}
              onOpenChange={(o) => { if (!o) setDeleteId(null) }}
              title="Delete category"
              description="Are you sure you want to delete this category? This action cannot be undone."
              onConfirm={handleDelete}
              loading={deleteCat.isPending}
            />
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
