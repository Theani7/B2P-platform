import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminUsers, useAdminSuspendUser, useAdminActivateUser, useAdminDeleteUser } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { data, isLoading } = useAdminUsers({ page, limit: 20, search: search || undefined, role: roleFilter || undefined });
  const suspendUser = useAdminSuspendUser();
  const activateUser = useAdminActivateUser();
  const deleteUser = useAdminDeleteUser();

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
    if (!confirm("Delete this user permanently?")) return;
    deleteUser.mutate(userId, {
      onSuccess: () => notifySuccess("User deleted"),
      onError: () => notifyError("Failed to delete user"),
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

      <div className="overflow-x-auto rounded-lg border">
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
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600">Page {data.page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
