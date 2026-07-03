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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useToast } from "@/components/shared/Toast"
import {
  useBundles,
  useCreateBundle,
  useUpdateBundle,
  useDeleteBundle,
  useBundleItems,
  useAddBundleItem,
  useRemoveBundleItem,
} from "@/hooks/useItems"
import { useMyItems } from "@/hooks/useItems"
import { Bundle, Item } from "@/types"
import { fadeUp, staggerContainer } from "@/components/shared/animations"
import { Plus, Pencil, Trash2, Package, Gift, Link2, Unlink } from "lucide-react"

export default function VendorBundles() {
  const { data: bundles, isLoading } = useBundles()
  const createBundle = useCreateBundle()
  const updateBundle = useUpdateBundle("")
  const deleteBundle = useDeleteBundle()
  const { data: myItems } = useMyItems()
  const { toast } = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [bundleName, setBundleName] = useState("")
  const [bundleDesc, setBundleDesc] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [itemsDialogId, setItemsDialogId] = useState<string | null>(null)

  const openCreate = () => {
    setEditId(null)
    setBundleName("")
    setBundleDesc("")
    setDialogOpen(true)
  }

  const openEdit = (b: Bundle) => {
    setEditId(b.id)
    setBundleName(b.name)
    setBundleDesc(b.description || "")
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const payload = { name: bundleName, description: bundleDesc || undefined }
    try {
      if (editId) {
        await updateBundle.mutateAsync(payload)
        toast("success", "Bundle updated")
      } else {
        await createBundle.mutateAsync(payload)
        toast("success", "Bundle created")
      }
      setDialogOpen(false)
    } catch {
      toast("error", "Failed to save bundle")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteBundle.mutateAsync(deleteId)
      toast("success", "Bundle deleted")
      setDeleteId(null)
    } catch {
      toast("error", "Failed to delete bundle")
    }
  }

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <PageHeader
              title="Bundles"
              subtitle={`${bundles?.length || 0} service bundles`}
              action={
                <Button onClick={openCreate} className="gap-2">
                  <Plus className="h-4 w-4" /> New bundle
                </Button>
              }
            />

            {isLoading ? (
              <TableSkeleton rows={4} cols={4} />
            ) : bundles?.length === 0 ? (
              <EmptyState
                icon={Gift}
                title="No bundles yet"
                description="Create bundles to offer combined services at special prices."
                actionLabel="Create bundle"
                onAction={openCreate}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-bgSurface overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-bgSurface/50">
                        <th className="text-left px-4 py-3.5 font-medium text-textMuted text-xs uppercase tracking-wider">Name</th>
                        <th className="text-left px-4 py-3.5 font-medium text-textMuted text-xs uppercase tracking-wider hidden sm:table-cell">Items</th>
                        <th className="text-left px-4 py-3.5 font-medium text-textMuted text-xs uppercase tracking-wider hidden md:table-cell">Created</th>
                        <th className="text-right px-4 py-3.5 font-medium text-textMuted text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {bundles?.map((b: Bundle, idx: number) => (
                          <BundleRow
                            key={b.id}
                            bundle={b}
                            index={idx}
                            onEdit={() => openEdit(b)}
                            onDelete={() => setDeleteId(b.id)}
                            onManageItems={() => setItemsDialogId(b.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editId ? "Edit bundle" : "Create bundle"}</DialogTitle>
                  <DialogDescription>
                    {editId ? "Update your bundle details" : "Group services together as a bundle"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="bundle-name">Name *</Label>
                    <Input id="bundle-name" value={bundleName} onChange={(e) => setBundleName(e.target.value)} placeholder="Wedding Essentials" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bundle-desc">Description</Label>
                    <textarea
                      id="bundle-desc"
                      value={bundleDesc}
                      onChange={(e) => setBundleDesc(e.target.value)}
                      rows={3}
                      className="flex w-full rounded-lg border border-border bg-bgSurface px-3 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent focus:shadow-[0_0_12px_var(--accent-glow)] transition-all duration-200 resize-y"
                      placeholder="Describe what this bundle includes..."
                    />
                  </div>
                  <Button onClick={handleSave} className="w-full" disabled={createBundle.isPending || !bundleName}>
                    {createBundle.isPending ? "Saving..." : editId ? "Update bundle" : "Create bundle"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
              open={!!deleteId}
              onOpenChange={(o) => { if (!o) setDeleteId(null) }}
              title="Delete bundle"
              description="Are you sure you want to delete this bundle? Items in the bundle won't be affected."
              onConfirm={handleDelete}
              loading={deleteBundle.isPending}
            />

            {/* Manage Items Dialog */}
            {itemsDialogId && (
              <ManageBundleItems
                bundleId={itemsDialogId}
                onClose={() => setItemsDialogId(null)}
              />
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}

function BundleRow({ bundle, index, onEdit, onDelete, onManageItems }: {
  bundle: Bundle
  index: number
  onEdit: () => void
  onDelete: () => void
  onManageItems: () => void
}) {
  const { data: bundleItems } = useBundleItems(bundle.id)

  return (
    <motion.tr
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.03 }}
      className="group border-b border-border hover:bg-bgSurface/30 transition-colors"
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/10">
            <Gift className="h-5 w-5 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-textPrimary truncate">{bundle.name}</p>
            {bundle.description && (
              <p className="text-xs text-textMuted mt-0.5 truncate max-w-[200px]">{bundle.description}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          <Package className="h-3 w-3" />
          {bundleItems?.length || 0}
        </span>
      </td>
      <td className="px-4 py-3.5 text-xs text-textMuted hidden md:table-cell">
        {new Date(bundle.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="flex justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onManageItems}
            className="text-textMuted hover:text-accent"
            title="Manage items"
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-textMuted hover:text-accent"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-textMuted hover:text-error"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}

function ManageBundleItems({ bundleId, onClose }: { bundleId: string; onClose: () => void }) {
  const { data: bundleItems } = useBundleItems(bundleId)
  const { data: myItems } = useMyItems()
  const addItem = useAddBundleItem(bundleId)
  const removeItem = useRemoveBundleItem(bundleId)
  const { toast } = useToast()

  const itemIdsInBundle = new Set(bundleItems?.map((bi: { itemId: string }) => bi.itemId) || [])

  const handleAdd = async (itemId: string) => {
    try {
      await addItem.mutateAsync(itemId)
      toast("success", "Item added to bundle")
    } catch {
      toast("error", "Failed to add item")
    }
  }

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem.mutateAsync(itemId)
      toast("success", "Item removed from bundle")
    } catch {
      toast("error", "Failed to remove item")
    }
  }

  const availableItems = myItems?.filter((i: Item) => !itemIdsInBundle.has(i.id)) || []

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage bundle items</DialogTitle>
          <DialogDescription>Add or remove items from this bundle</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2 max-h-80 overflow-y-auto">
          {/* Items in bundle */}
          {bundleItems?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">In bundle</p>
              <div className="space-y-2">
                {bundleItems.map((bi: { id: string; itemId: string }) => {
                  const item = myItems?.find((i: Item) => i.id === bi.itemId)
                  return (
                    <div key={bi.id} className="flex items-center justify-between rounded-lg border border-border bg-bgSurface p-3">
                      <span className="text-sm text-textPrimary truncate">{item?.title || bi.itemId}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(bi.itemId)} className="text-textMuted hover:text-error shrink-0">
                        <Unlink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Available items */}
          {availableItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Available items</p>
              <div className="space-y-2">
                {availableItems.map((item: Item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-bgSurface/50 p-3">
                    <span className="text-sm text-textPrimary truncate">{item.title}</span>
                    <Button variant="outline" size="sm" onClick={() => handleAdd(item.id)} className="shrink-0 gap-1">
                      <Link2 className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bundleItems?.length === 0 && availableItems.length === 0 && (
            <p className="text-sm text-textMuted text-center py-4">No items available. Create some items first.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
