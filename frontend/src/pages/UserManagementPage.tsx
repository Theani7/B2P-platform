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

  if (error) return <div className="text-center py-12"><p className="text-danger">Error loading data</p><p className="text-gray-500 text-sm">{(error as Error).message}</p></div>;
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
      <h1 className="text-2xl font-bold text-text">User Management</h1>

      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded border px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded border px-3 py-2 text-sm"
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
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text">Username</th>
              <th className="px-4 py-3 text-left font-medium text-text">Full Name</th>
              <th className="px-4 py-3 text-left font-medium text-text">Email</th>
              <th className="px-4 py-3 text-left font-medium text-text">Role</th>
              <th className="px-4 py-3 text-left font-medium text-text">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={`/admin/users/${user.id}`} className="text-primary hover:underline font-medium">
                    {user.username}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text">{user.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium">{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  {user.is_active ? (
                    <span className="text-green-600 font-medium">Active</span>
                  ) : (
                    <span className="text-red-600 font-medium">Suspended</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    {user.is_active ? (
                      <button onClick={() => handleSuspend(user.id)} className="text-xs text-yellow-600 hover:underline">
                        Suspend
                      </button>
                    ) : (
                      <button onClick={() => handleActivate(user.id)} className="text-xs text-green-600 hover:underline">
                        Activate
                      </button>
                    )}
                    {user.role !== "ADMIN" && (
                      <button onClick={() => handleDelete(user.id)} className="text-xs text-danger hover:underline">
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {data.page} of {data.pages}</span>
            <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
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
