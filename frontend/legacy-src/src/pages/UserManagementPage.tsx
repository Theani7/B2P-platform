import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminUsers, useAdminSuspendUser, useAdminActivateUser, useAdminDeleteUser } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { notifySuccess, notifyError } from "../hooks/useToast";
import { Search, Filter, ShieldAlert, CheckCircle, Trash2, UserCog, UserCheck, Shield } from "lucide-react";

export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { data, isLoading, error } = useAdminUsers({ page, limit: 20, search: search || undefined, role: roleFilter || undefined });
  const suspendUser = useAdminSuspendUser();
  const activateUser = useAdminActivateUser();
  const deleteUser = useAdminDeleteUser();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (error) return <div className="text-center py-12"><p className="text-coral-alert font-medium">Error loading data</p></div>;

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

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteUser.mutate(deleteConfirm, {
      onSuccess: () => { notifySuccess("User deleted"); setDeleteConfirm(null); },
      onError: () => { notifyError("Failed to delete user"); setDeleteConfirm(null); },
    });
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case "ADMIN": return <Shield size={14} className="text-signal-blue" />;
      case "BUSINESS": return <UserCog size={14} className="text-azure-info" />;
      case "PROMOTER": return <UserCheck size={14} className="text-emerald-status" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading text-midnight-ink">User Management</h1>
          <p className="text-body text-ash mt-1">Manage platform accounts, roles, and access.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-custom/10 rounded-cards shadow-product-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-fog" />
          <input
            type="text"
            placeholder="Search by username, name, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-inputs border border-slate-custom/10 pl-10 pr-4 py-2.5 text-body text-graphite focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-fog" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-full rounded-inputs border border-slate-custom/10 pl-10 pr-8 py-2.5 text-body text-graphite appearance-none focus:outline-none focus:border-signal-blue/50 focus:ring-1 focus:ring-signal-blue/50 bg-white"
          >
            <option value="">All Roles</option>
            <option value="BUSINESS">Business</option>
            <option value="PROMOTER">Promoter</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search or filter criteria." />
      ) : (
      <div className="bg-white border border-slate-custom/10 border-t border-t-signal-blue rounded-cards shadow-product-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-linen-canvas border-b border-slate-custom/10">
              <tr>
                <th className="px-5 py-4 text-caption font-medium uppercase tracking-wide text-ash">User</th>
                <th className="px-5 py-4 text-caption font-medium uppercase tracking-wide text-ash">Contact</th>
                <th className="px-5 py-4 text-caption font-medium uppercase tracking-wide text-ash">Role</th>
                <th className="px-5 py-4 text-caption font-medium uppercase tracking-wide text-ash">Status</th>
                <th className="px-5 py-4 text-caption font-medium uppercase tracking-wide text-ash text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-custom/10">
              {data?.items.map((user) => (
                <tr key={user.id} className="hover:bg-sky-wash/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <Link to={`/admin/users/${user.id}`} className="text-body font-medium text-graphite hover:text-signal-blue transition-colors">
                        {user.username}
                      </Link>
                      <span className="text-caption text-ash">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-body text-ash">{user.email}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className="text-body text-graphite capitalize">{user.role.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-badges bg-emerald-status/10 px-2.5 py-1 text-caption font-medium text-emerald-status">
                        <span className="w-1.5 h-1.5 rounded-pill bg-emerald-status"></span> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-badges bg-coral-alert/10 px-2.5 py-1 text-caption font-medium text-coral-alert">
                        <span className="w-1.5 h-1.5 rounded-pill bg-coral-alert"></span> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role !== "ADMIN" && (
                        <>
                          {user.is_active ? (
                            <button onClick={() => handleSuspend(user.id)} className="p-2 rounded-cards text-amber-tag hover:bg-amber-tag/10 transition-colors" title="Suspend User">
                              <ShieldAlert size={16} />
                            </button>
                          ) : (
                            <button onClick={() => handleActivate(user.id)} className="p-2 rounded-cards text-emerald-status hover:bg-emerald-status/10 transition-colors" title="Activate User">
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button onClick={() => setDeleteConfirm(user.id)} className="p-2 rounded-cards text-coral-alert hover:bg-coral-alert/10 transition-colors" title="Delete User">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="p-4 border-t border-slate-custom/10 bg-linen-canvas flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-buttons border border-slate-custom/10 bg-white px-4 py-2 text-body font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Previous</button>
            <span className="text-caption text-ash uppercase tracking-wide">Page {data.page} of {data.pages}</span>
            <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="rounded-buttons border border-slate-custom/10 bg-white px-4 py-2 text-body font-medium text-graphite hover:bg-sky-wash disabled:opacity-50 transition-colors">Next</button>
          </div>
        )}
      </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and will remove all their associated data."
      />
    </div>
  );
}
