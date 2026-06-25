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
  if (!user) return <div className="text-center text-gray-600">User not found</div>;

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
      <Link to="/admin/users" className="text-sm text-primary hover:underline">&larr; Back to Users</Link>
      <h1 className="text-2xl font-bold text-text">{user.full_name}</h1>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid grid-cols-2 gap-4">
          <div><dt className="text-sm text-gray-500">Username</dt><dd className="font-medium text-text">@{user.username}</dd></div>
          <div><dt className="text-sm text-gray-500">Email</dt><dd className="font-medium text-text">{user.email}</dd></div>
          <div><dt className="text-sm text-gray-500">Role</dt><dd className="font-medium text-text">{user.role}</dd></div>
          <div>
            <dt className="text-sm text-gray-500">Status</dt>
            <dd className={`font-medium ${user.is_active ? "text-green-600" : "text-red-600"}`}>
              {user.is_active ? "Active" : "Suspended"}
            </dd>
          </div>
          <div><dt className="text-sm text-gray-500">Verified</dt><dd className="font-medium text-text">{user.is_verified ? "Yes" : "No"}</dd></div>
          <div><dt className="text-sm text-gray-500">Created</dt><dd className="font-medium text-text">{new Date(user.created_at).toLocaleDateString()}</dd></div>
        </dl>
      </div>

      <div className="flex space-x-3">
        {user.role !== "ADMIN" && (
          <>
            {user.is_active ? (
              <button onClick={handleSuspend} className="rounded bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600">
                Suspend User
              </button>
            ) : (
              <button onClick={handleActivate} className="rounded bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
                Activate User
              </button>
            )}
            <button onClick={handleDelete} className="rounded bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Delete User
            </button>
          </>
        )}
      </div>
    </div>
  );
}
