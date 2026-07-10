"use client";

import { use, useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAdminUser, useSuspendUser, useActivateUser, useDeleteUser } from "@/features/admin/api";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-steel/10 py-2 last:border-0">
      <span className="text-caption uppercase tracking-wide text-steel">{label}</span>
      <span className="text-body font-medium text-midnight-ink">{value}</span>
    </div>
  );
}

function UserDetailInner({ userId }: { userId: string }) {
  const { data, isLoading } = useAdminUser(userId);
  const suspend = useSuspendUser();
  const activate = useActivateUser();
  const del = useDeleteUser();
  const [showConfirm, setShowConfirm] = useState(false);

  if (isLoading) return <Spinner />;
  if (!data) return <Card><p className="text-body text-slate-custom">User not found.</p></Card>;

  return (
    <>
      <PageHeader title={data.fullName || data.username} subtitle={`@${data.username}`} />
      <Card className="max-w-lg">
        <Row label="Email" value={data.email} />
        <Row label="Role" value={data.role} />
        <Row label="Status" value={data.isActive ? "Active" : "Suspended"} />
        <Row label="Verified" value={data.isVerified ? "Yes" : "No"} />
        <Row label="Business profile" value={data.hasBusinessProfile ? "Yes" : "No"} />
        <Row label="Promoter profile" value={data.hasPromoterProfile ? "Yes" : "No"} />
        <Row label="Joined" value={new Date(data.createdAt).toLocaleDateString()} />
        <Row label="Last login" value={data.lastLoginAt ? new Date(data.lastLoginAt).toLocaleString() : "Never"} />

        <div className="mt-4 flex flex-wrap gap-2">
          {data.isActive ? (
            <Button variant="ghost" onClick={() => suspend.mutate(data.id, { onSuccess: () => toast.success("Suspended"), onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed") })}>
              Suspend
            </Button>
          ) : (
            <Button variant="subtle" onClick={() => activate.mutate(data.id, { onSuccess: () => toast.success("Activated"), onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed") })}>
              Activate
            </Button>
          )}
          <Button variant="danger" onClick={() => setShowConfirm(true)}>
            Delete
          </Button>
        </div>
      </Card>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete User"
        message="Are you sure you want to completely delete this user? This action is irreversible."
        confirmText="Delete User"
        isDanger={true}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          del.mutate(data.id, { 
            onSuccess: () => { toast.success("Deleted"); window.location.href = "/admin/users"; }, 
            onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed") 
          });
          setShowConfirm(false);
        }}
      />
    </>
  );
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireAuth role={Role.ADMIN}>
      <UserDetailInner userId={id} />
    </RequireAuth>
  );
}
