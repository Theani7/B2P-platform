import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminUsers, useAdminSuspendUser, useAdminActivateUser, useAdminDeleteUser } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { data, isLoading, error } = useAdminUsers({ page, limit: 20, search: search || undefined, role: roleFilter || undefined });
  const suspendUser = useAdminSuspendUser();
  const activateUser = useAdminActivateUser();
  const deleteUser = useAdminDeleteUser();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (error) return <div className="text-center py-12"><p className="text-coral-alert">Error loading data</p><p className="text-xs text-ash">{(error as Error).message}</p></div>;
  if (isLoading) return <LoadingSpinner />;

  const handleSuspend = (userId: string) => {
    suspendUser.mutate(userId, {
      onSuccess: () => notifySuccess("User suspended"),
      onError: () => notifyError("Failed to suspend user"),
    });
  };

  const handleActivate = (userId: string) => {
    activateUser.mutate(userId, {
      onSuccess: () => notifySuccess("User activated"),
      onError: () => notifyError("Failed to activate user"),
    });
  };

  const handleDelete = (userId: string) => {
    setDeleteConfirm(userId);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteUser.mutate(deleteConfirm, {
      onSuccess: () => { notifySuccess("User deleted"); setDeleteConfirm(null); },
      onError: () => { notifyError("Failed to delete user"); setDeleteConfirm(null); },
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-heading text-graphite">User Management</h1>

      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-inputs border border-slate-custom/10 px-3 py-2 text-sm flex-1 min-w-[200px] text-graphite"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-inputs border border-slate-custom/10 px-3 py-2 text-sm text-graphite"
        >
          <option value="">All Roles</option>
          <option value="BUSINESS">Business</option>
          <option value="PROMOTER">Promoter</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
      <>
        <div className="rounded-cards border border-slate-custom/10 bg-white overflow-hidden overflow-x-auto shadow-product-card-product-card">
          <table className="w-full text-sm">
            <thead className="bg-linen-canvas border-b border-slate-custom/10">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-graphite">Username</th>
                <th className="px-4 py-3 text-left font-medium text-graphite">Full Name</th>
                <th className="px-4 py-3 text-left font-medium text-graphite">Email</th>
                <th className="px-4 py-3 text-left font-medium text-graphite">Role</th>
                <th className="px-4 py-3 text-left font-medium text-graphite">Status</th>
                <th className="px-4 py-3 text-left font-medium text-graphite">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-custom/10">
              {data?.items.map((user) => (
                <tr key={user.id} className="hover:bg-sky-wash transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/admin/users/${user.id}`} className="text-signal-blue hover:underline font-medium">
                      {user.username}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-graphite">{user.full_name}</td>
                  <td className="px-4 py-3 text-ash">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-badges bg-sky-wash px-1.5 py-0.5 text-xs font-medium text-graphite">{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_active ? (
                      <span className="inline-flex items-center rounded-badges bg-emerald-status/10 px-1.5 py-0.5 text-xs font-medium text-emerald-status">Active</span>
                    ) : (
                      <span className="inline-flex items-center rounded-badges bg-coral-alert/10 px-1.5 py-0.5 text-xs font-medium text-coral-alert">Suspended</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-3">
                      {user.is_active ? (
                        <button onClick={() => handleSuspend(user.id)} className="text-xs text-amber-tag hover:underline">
                          Suspend
                        </button>
                      ) : (
                        <button onClick={() => handleActivate(user.id)} className="text-xs text-emerald-status hover:underline">
                          Activate
                        </button>
                      )}
                      {user.role !== "ADMIN" && (
                        <button onClick={() => handleDelete(user.id)} className="text-xs text-coral-alert hover:underline">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-inputs border border-slate-custom/10 bg-white px-3 py-1.5 text-sm text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Previous</button>
            <span className="text-sm text-ash">Page {data.page} of {data.pages}</span>
            <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded-inputs border border-slate-custom/10 bg-white px-3 py-1.5 text-sm text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Next</button>
          </div>
        )}
      </>)}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Delete this user permanently?"
      />
    </div>
  );
}
