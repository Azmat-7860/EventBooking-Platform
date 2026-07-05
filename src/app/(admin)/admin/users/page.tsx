"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { PageTransition } from "@/components/shared/PageTransition"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { adminService } from "@/services/admin.service"
import { useToast } from "@/components/shared/Toast"
import { staggerContainer, fadeUp } from "@/components/shared/animations"
import { Loader2, Search, ShieldBan, ShieldCheck } from "lucide-react"

const roleColors: Record<string, string> = {
  admin: "bg-accent/10 text-accent border-accent/20",
  vendor: "bg-success/10 text-success border-success/20",
  customer: "bg-primary/10 text-primary border-primary/20",
}

export default function AdminUsers() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [roleFilter, setRoleFilter] = useState("")
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, roleFilter, search],
    queryFn: async () => {
      const params: { page?: number; size?: number; role?: string; search?: string } = { page, size: 20 }
      if (roleFilter) params.role = roleFilter
      if (search) params.search = search
      const { data } = await adminService.getUsers(params)
      return data.data
    },
  })

  const { mutate: toggleSuspend, isPending: toggling } = useMutation({
    mutationFn: ({ id, suspended }: { id: string; suspended: boolean }) =>
      suspended ? adminService.reinstateUser(id) : adminService.suspendUser(id),
    onSuccess: (res: any) => {
      toast("success", res.data.message || "User updated")
      qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: () => toast("error", "Failed to update user"),
  })

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PageTransition>
        <div className="relative min-h-full">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--accent-glow),transparent_70%)] opacity-30" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <PageHeader title="Users" subtitle="Manage platform users" />

            {/* Filters */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                  className="w-full rounded-xl border border-border bg-bgElevated pl-9 pr-3 py-2 text-sm text-textPrimary outline-none focus:border-accent"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(0) }}
                className="rounded-xl border border-border bg-bgElevated px-3 py-2 text-sm text-textPrimary outline-none focus:border-accent"
              >
                <option value="">All roles</option>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-textMuted" />
              </div>
            ) : (
              <>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-bgSurface overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-bgElevated/50">
                          <th className="text-left py-3 px-4 text-textMuted font-medium">Email</th>
                          <th className="text-left py-3 px-4 text-textMuted font-medium">Role</th>
                          <th className="text-center py-3 px-4 text-textMuted font-medium">Verified</th>
                          <th className="text-center py-3 px-4 text-textMuted font-medium">Suspended</th>
                          <th className="text-right py-3 px-4 text-textMuted font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.content?.map((user: { id: string; email: string; role: string; verified: boolean; suspended: boolean }) => (
                          <tr key={user.id} className="border-b border-border/50 hover:bg-bgElevated/50 transition-colors">
                            <td className="py-3 px-4 text-textPrimary">{user.email}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${roleColors[user.role] || ""}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-xs font-medium ${user.verified ? "text-success" : "text-error"}`}>
                                {user.verified ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-xs font-medium ${user.suspended ? "text-error" : "text-success"}`}>
                                {user.suspended ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                size="sm"
                                variant={user.suspended ? "outline" : "destructive"}
                                disabled={toggling}
                                onClick={() => toggleSuspend({ id: user.id, suspended: user.suspended })}
                                className="gap-1.5"
                              >
                                {user.suspended ? (
                                  <><ShieldCheck className="h-3.5 w-3.5" /> Reinstate</>
                                ) : (
                                  <><ShieldBan className="h-3.5 w-3.5" /> Suspend</>
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                      Previous
                    </Button>
                    <span className="text-xs text-textMuted">Page {page + 1} of {data.totalPages}</span>
                    <Button size="sm" variant="outline" disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  )
}
