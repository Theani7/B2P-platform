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

  if (error) return <div className="text-center py-12"><p className="text-brand-coral">Error loading data</p><p className="text-stone-500 text-sm">{(error as Error).message}</p></div>;
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
      <h1 className="text-xl font-medium text-stone-900 font-stretch-condensed">User Management</h1>

      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-stone-100 px-3 py-2 text-sm flex-1 min-w-[200px] text-stone-900"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-stone-100 px-3 py-2 text-sm text-stone-900"
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
        <div className="rounded-xl border border-stone-100 bg-white border-t-[1px] border-t-brand-purple overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-900">Username</th>
                <th className="px-4 py-3 text-left font-medium text-stone-900">Full Name</th>
                <th className="px-4 py-3 text-left font-medium text-stone-900">Email</th>
                <th className="px-4 py-3 text-left font-medium text-stone-900">Role</th>
                <th className="px-4 py-3 text-left font-medium text-stone-900">Status</th>
                <th className="px-4 py-3 text-left font-medium text-stone-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data?.items.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/admin/users/${user.id}`} className="text-brand-purple hover:underline font-medium">
                      {user.username}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-900">{user.full_name}</td>
                  <td className="px-4 py-3 text-stone-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-900">{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-brand-teal-50 px-2.5 py-0.5 text-xs font-medium text-brand-teal-900">Active</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-brand-coral-50 px-2.5 py-0.5 text-xs font-medium text-brand-coral-900">Suspended</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-3">
                      {user.is_active ? (
                        <button onClick={() => handleSuspend(user.id)} className="text-xs text-brand-amber-900 hover:underline">
                          Suspend
                        </button>
                      ) : (
                        <button onClick={() => handleActivate(user.id)} className="text-xs text-brand-teal-900 hover:underline">
                          Activate
                        </button>
                      )}
                      {user.role !== "ADMIN" && (
                        <button onClick={() => handleDelete(user.id)} className="text-xs text-brand-coral hover:underline">
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
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-stone-100 bg-white px-3 py-1.5 text-sm text-stone-900 hover:bg-stone-50 disabled:opacity-50 transition-colors">Previous</button>
            <span className="text-sm text-stone-500">Page {data.page} of {data.pages}</span>
            <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded-lg border border-stone-100 bg-white px-3 py-1.5 text-sm text-stone-900 hover:bg-stone-50 disabled:opacity-50 transition-colors">Next</button>
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
