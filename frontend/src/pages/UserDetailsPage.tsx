import { useParams, Link } from "react-router-dom";
import { useAdminUserDetail, useAdminSuspendUser, useAdminActivateUser, useAdminDeleteUser } from "../features/admin/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { notifySuccess, notifyError } from "../hooks/useToast";

export default function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const { data: user, isLoading } = useAdminUserDetail(userId!);
  const suspendUser = useAdminSuspendUser();
  const activateUser = useAdminActivateUser();
  const deleteUser = useAdminDeleteUser();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <div className="text-center text-ash">User not found</div>;

  const handleSuspend = () => {
    suspendUser.mutate(user.id, {
      onSuccess: () => notifySuccess("User suspended"),
      onError: () => notifyError("Failed to suspend user"),
    });
  };

  const handleActivate = () => {
    activateUser.mutate(user.id, {
      onSuccess: () => notifySuccess("User activated"),
      onError: () => notifyError("Failed to activate user"),
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this user permanently?")) return;
    deleteUser.mutate(user.id, {
      onSuccess: () => notifySuccess("User deleted"),
      onError: () => notifyError("Failed to delete user"),
    });
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="text-sm text-signal-blue hover:underline">&larr; Back to Users</Link>
      <h1 className="text-heading text-graphite">{user.full_name}</h1>

      <div className="rounded-cards border border-slate-custom/10 bg-white p-5">
        <dl className="grid grid-cols-2 gap-4">
          <div><dt className="text-[11px] font-medium uppercase tracking-wide text-graphite">Username</dt><dd className="font-medium text-graphite mt-1">@{user.username}</dd></div>
          <div><dt className="text-[11px] font-medium uppercase tracking-wide text-graphite">Email</dt><dd className="font-medium text-graphite mt-1">{user.email}</dd></div>
          <div><dt className="text-[11px] font-medium uppercase tracking-wide text-graphite">Role</dt><dd className="font-medium text-graphite mt-1">{user.role}</dd></div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-graphite">Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center rounded-badges px-1.5 py-0.5 text-xs font-medium ${user.is_active ? "bg-emerald-status/10 text-emerald-status" : "bg-coral-alert/10 text-coral-alert"}`}>
                {user.is_active ? "Active" : "Suspended"}
              </span>
            </dd>
          </div>
          <div><dt className="text-[11px] font-medium uppercase tracking-wide text-graphite">Verified</dt><dd className="font-medium text-graphite mt-1">{user.is_verified ? "Yes" : "No"}</dd></div>
          <div><dt className="text-[11px] font-medium uppercase tracking-wide text-graphite">Created</dt><dd className="font-medium text-graphite mt-1">{new Date(user.created_at).toLocaleDateString()}</dd></div>
        </dl>
      </div>

      <div className="flex space-x-3">
        {user.role !== "ADMIN" && (
          <>
            {user.is_active ? (
              <button onClick={handleSuspend} className="rounded-inputs bg-amber-tag/10 border border-amber-tag text-amber-tag px-4 py-2 text-sm font-medium hover:bg-amber-tag/20 transition-colors">
                Suspend User
              </button>
            ) : (
              <button onClick={handleActivate} className="rounded-inputs bg-emerald-status/10 border border-emerald-status text-emerald-status px-4 py-2 text-sm font-medium hover:bg-emerald-status/20 transition-colors">
                Activate User
              </button>
            )}
            <button onClick={handleDelete} className="rounded-inputs bg-coral-alert/10 border border-coral-alert text-coral-alert px-4 py-2 text-sm font-medium hover:bg-coral-alert/20 transition-colors">
              Delete User
            </button>
          </>
        )}
      </div>
    </div>
  );
}
