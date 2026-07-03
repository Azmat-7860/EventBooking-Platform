"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { TableSkeleton } from "@/components/shared/Skeleton"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useToast } from "@/components/shared/Toast"
import { useMyItems, useDeleteItem, useToggleStatus } from "@/hooks/useItems"
import { Item } from "@/types"
import { fadeUp } from "@/components/shared/animations"
import { Plus, Pencil, Trash2, Eye, EyeOff, Package } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  published: "bg-success/10 text-success border-success/20",
  draft: "bg-textSubtle/10 text-textMuted border-textSubtle/20",
}

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
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <PageHeader
              title="My Items"
              subtitle={`${items?.length || 0} service listings`}
              action={
                <Button asChild className="gap-2">
                  <Link href="/vendor/items/new">
                    <Plus className="h-4 w-4" /> New item
                  </Link>
                </Button>
              }
            />

            {isLoading ? (
              <TableSkeleton rows={4} cols={4} />
            ) : items?.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No items yet"
                description="Create your first service listing to start receiving inquiries."
                actionLabel="Create item"
                onAction={() => window.location.href = "/vendor/items/new"}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-bgSurface overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-bgSurface/50">
                        <th className="text-left px-4 py-3.5 font-medium text-textMuted text-xs uppercase tracking-wider">Item</th>
                        <th className="text-left px-4 py-3.5 font-medium text-textMuted text-xs uppercase tracking-wider hidden sm:table-cell">Status</th>
                        <th className="text-right px-4 py-3.5 font-medium text-textMuted text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {items?.map((item: Item, idx: number) => (
                          <motion.tr
                            key={item.id}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: idx * 0.03 }}
                            className="group border-b border-border hover:bg-bgSurface/30 transition-colors"
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/10 text-lg">
                                  {item.title?.charAt(0)?.toUpperCase() || "📄"}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-textPrimary truncate">{item.title}</p>
                                  <p className="text-xs text-textMuted mt-0.5 truncate">{item.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 hidden sm:table-cell">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[item.status] || "bg-textSubtle/10 text-textMuted"}`}>
                                <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${item.status === "published" ? "bg-success" : "bg-textMuted"}`} />
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggle(item.id)}
                                  className="text-textMuted hover:text-accent"
                                  title={item.status === "published" ? "Unpublish" : "Publish"}
                                >
                                  {item.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-textMuted hover:text-accent">
                                  <Link href={`/vendor/items/${item.id}`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteId(item.id)}
                                  className="text-textMuted hover:text-error"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <ConfirmDialog
              open={!!deleteId}
              onOpenChange={(o) => { if (!o) setDeleteId(null) }}
              title="Delete item"
              description="Are you sure you want to delete this item? This action cannot be undone."
              onConfirm={handleDelete}
              loading={deleteItem.isPending}
            />
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
