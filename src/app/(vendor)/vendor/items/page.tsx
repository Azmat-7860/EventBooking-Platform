"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useToast } from "@/components/shared/Toast"
import { useMyItems, useDeleteItem, useToggleStatus } from "@/hooks/useItems"
import { Item } from "@/types"
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function VendorItems() {
  const { data: items, isLoading } = useMyItems()
  const deleteItem = useDeleteItem()
  const toggleStatus = useToggleStatus()
  const { toast } = useToast()

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteItem.mutateAsync(deleteId)
      toast("success", "Item deleted")
      setDeleteId(null)
    } catch {
      toast("error", "Failed to delete item")
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleStatus.mutateAsync(id)
      toast("success", "Status toggled")
    } catch {
      toast("error", "Failed to toggle status")
    }
  }

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <PageTransition>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-textPrimary">My Items</h1>
              <p className="mt-1 text-sm text-textMuted">Manage your service listings</p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/vendor/items/new">
                <Plus className="h-4 w-4" /> New item
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-bgSurface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bgSurface/50">
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-textMuted">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-textMuted">Loading...</td></tr>
                ) : items?.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-textMuted">No items yet</td></tr>
                ) : (
                  items?.map((item: Item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-bgSurface/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-textPrimary">{item.title}</p>
                        <p className="text-xs text-textMuted mt-0.5">{item.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.status === "published"
                            ? "bg-success/10 text-success"
                            : "bg-textSubtle/10 text-textMuted"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleToggle(item.id)} title="Toggle draft/published">
                            {item.status === "published" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/vendor/items/${item.id}`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteId(item.id)}>
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

          <ConfirmDialog
            open={!!deleteId}
            onOpenChange={(o) => { if (!o) setDeleteId(null) }}
            title="Delete item"
            description="Are you sure you want to delete this item? This action cannot be undone."
            onConfirm={handleDelete}
            loading={deleteItem.isPending}
          />
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
