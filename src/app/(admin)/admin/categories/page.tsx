"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
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
import { Plus, Pencil, Trash2 } from "lucide-react"

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
    setIcon(cat.icon)
    setSortOrder(cat.sortOrder)
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
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-textPrimary">Categories</h1>
              <p className="mt-1 text-sm text-textMuted">Manage service categories</p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add category
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-bgSurface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bgSurface/50">
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Icon</th>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Sort order</th>
                  <th className="text-right px-4 py-3 font-medium text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-textMuted">Loading...</td></tr>
                ) : categories?.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-textMuted">No categories yet</td></tr>
                ) : (
                  categories?.map((cat: Category) => (
                    <tr key={cat.id} className="border-b border-border hover:bg-bgSurface/50 transition-colors">
                      <td className="px-4 py-3 text-xl">{cat.icon || "—"}</td>
                      <td className="px-4 py-3 font-medium text-textPrimary">{cat.name}</td>
                      <td className="px-4 py-3 text-textMuted">{cat.sortOrder}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(cat)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteId(cat.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-error" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
                <Button onClick={handleSave} className="w-full" disabled={createCat.isPending}>
                  {createCat.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <ConfirmDialog
            open={!!deleteId}
            onOpenChange={(o) => { if (!o) setDeleteId(null) }}
            title="Delete category"
            description="Are you sure you want to delete this category? This action cannot be undone."
            onConfirm={handleDelete}
            loading={deleteCat.isPending}
          />
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
