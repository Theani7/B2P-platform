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
  if (!user) return <div className="text-center text-stone-600">User not found</div>;

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
      <Link to="/admin/users" className="text-sm text-brand-purple hover:underline">&larr; Back to Users</Link>
      <h1 className="text-xl font-medium text-stone-900 font-stretch-condensed">{user.full_name}</h1>

      <div className="rounded-xl border border-stone-100 bg-white p-5 border-t-[1px] border-t-brand-purple">
        <dl className="grid grid-cols-2 gap-4">
          <div><dt className="text-[11px] font-medium uppercase tracking-wide text-stone-900">Username</dt><dd className="font-medium text-stone-900 mt-1">@{user.username}</dd></div>
          <div><dt className="text-[11px] font-medium uppercase tracking-wide text-stone-900">Email</dt><dd className="font-medium text-stone-900 mt-1">{user.email}</dd></div>
          <div><dt className="text-[11px] font-medium uppercase tracking-wide text-stone-900">Role</dt><dd className="font-medium text-stone-900 mt-1">{user.role}</dd></div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-stone-900">Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.is_active ? "bg-brand-teal-50 text-brand-teal-900" : "bg-brand-coral-50 text-brand-coral-900"}`}>
                {user.is_active ? "Active" : "Suspended"}
              </span>
            </dd>
          </div>
          <div><dt className="text-[11px] font-medium uppercase tracking-wide text-stone-900">Verified</dt><dd className="font-medium text-stone-900 mt-1">{user.is_verified ? "Yes" : "No"}</dd></div>
          <div><dt className="text-[11px] font-medium uppercase tracking-wide text-stone-900">Created</dt><dd className="font-medium text-stone-900 mt-1">{new Date(user.created_at).toLocaleDateString()}</dd></div>
        </dl>
      </div>

      <div className="flex space-x-3">
        {user.role !== "ADMIN" && (
          <>
            {user.is_active ? (
              <button onClick={handleSuspend} className="rounded-lg bg-brand-amber-50 border border-brand-amber text-brand-amber-900 px-4 py-2 text-sm font-medium hover:bg-brand-amber-100 transition-colors">
                Suspend User
              </button>
            ) : (
              <button onClick={handleActivate} className="rounded-lg bg-brand-teal-50 border border-brand-teal text-brand-teal-900 px-4 py-2 text-sm font-medium hover:bg-brand-teal-100 transition-colors">
                Activate User
              </button>
            )}
            <button onClick={handleDelete} className="rounded-lg bg-brand-coral-50 border border-brand-coral text-brand-coral-900 px-4 py-2 text-sm font-medium hover:bg-brand-coral-100 transition-colors">
              Delete User
            </button>
          </>
        )}
      </div>
    </div>
  );
}
