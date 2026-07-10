"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Role } from "@/lib/roles";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  useAdminUsers,
  useSuspendUser,
  useActivateUser,
  useDeleteUser,
} from "@/features/admin/api";

function UsersInner() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");
  const [activeOnly, setActiveOnly] = useState<string>("");
  const [userToDelete, setUserToDelete] = useState<{ id: string, username: string } | null>(null);

  const params = {
    page,
    limit: 15,
    search: search || undefined,
    role: (role || undefined) as any,
    isActive: activeOnly === "" ? undefined : activeOnly === "active",
  };

  const { data, isFetching } = useAdminUsers(params);
  const suspend = useSuspendUser();
  const activate = useActivateUser();
  const del = useDeleteUser();

  const act = (fn: any, id: string, ok: string, err: string) =>
    fn.mutate(id, { onSuccess: () => toast.success(ok), onError: (e: any) => toast.error(e?.response?.data?.message ?? err) });

  return (
    <>
      <PageHeader title="Users" subtitle="Manage platform accounts." />

      <Card className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            placeholder="Search name / email / username"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink"
          >
            <option value="">All roles</option>
            <option value="BUSINESS">Business</option>
            <option value="PROMOTER">Promoter</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            value={activeOnly}
            onChange={(e) => {
              setActiveOnly(e.target.value);
              setPage(1);
            }}
            className="rounded-inputs border border-steel/30 bg-white px-3 py-2 text-body text-midnight-ink"
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {isFetching && !data ? <Spinner /> : null}

      <div className="space-y-2">
        {(data?.items ?? []).map((u) => (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <div className="flex items-center gap-2">
                <a href={`/admin/users/${u.id}`} className="text-body font-medium text-midnight-ink hover:underline">
                  {u.fullName || u.username}
                </a>
                <Badge tone="signal">{u.role}</Badge>
                {!u.isActive && <Badge tone="coral">Suspended</Badge>}
                {u.isVerified && <Badge tone="emerald">Verified</Badge>}
              </div>
              <p className="text-caption text-slate-custom">{u.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {u.isActive ? (
                <Button variant="ghost" onClick={() => act(suspend, u.id, "Suspended", "Failed")}>
                  Suspend
                </Button>
              ) : (
                <Button variant="subtle" onClick={() => act(activate, u.id, "Activated", "Failed")}>
                  Activate
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => setUserToDelete({ id: u.id, username: u.username })}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
        {data && data.items.length === 0 && (
          <Card>
            <p className="text-body text-slate-custom">No users found.</p>
          </Card>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <span className="text-caption text-steel">
          Page {data?.page ?? page} of {data?.pages ?? 1}
        </span>
        <Button variant="ghost" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>

      <ConfirmModal
        isOpen={!!userToDelete}
        title="Delete User"
        message={`Are you sure you want to completely delete ${userToDelete?.username}? This action is irreversible.`}
        confirmText="Delete User"
        isDanger={true}
        onCancel={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) act(del, userToDelete.id, "Deleted", "Failed");
          setUserToDelete(null);
        }}
      />
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireAuth role={Role.ADMIN}>
      <UsersInner />
    </RequireAuth>
  );
}
