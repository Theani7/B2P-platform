"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Card, PageHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { notifySuccess, notifyError } from "@/lib/notify";
import { getApiError } from "@/lib/apiError";
import api, { clearTokens } from "@/lib/apiClient";
import { useExport } from "@/features/export/api";
import { Lock, Download, Trash2 } from "lucide-react";

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    new_password: z.string().min(6, "At least 6 characters"),
    confirm: z.string().min(6, "Confirm your new password"),
  })
  .refine((v) => v.new_password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

function ChangePasswordCard() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.post("/auth/change-password", {
        current_password: values.current_password,
        new_password: values.new_password,
      });
      reset();
      notifySuccess("Password changed");
    } catch (err: unknown) {
      notifyError(getApiError(err, "Could not change password"));
    }
  });

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-buttons bg-sky-wash text-signal-blue">
          <Lock size={17} />
        </span>
        <h2 className="text-heading-sm font-semibold text-midnight-ink">Change password</h2>
      </div>
      <p className="mb-5 text-sm text-ash">Confirm your current password, then choose a new one.</p>
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
        <Input label="Current password" type="password" autoComplete="current-password" {...register("current_password")} error={errors.current_password?.message} />
        <Input label="New password" type="password" autoComplete="new-password" {...register("new_password")} error={errors.new_password?.message} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" {...register("confirm")} error={errors.confirm?.message} />
        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Update password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function DownloadDataCard() {
  const exp = useExport();

  const go = () => {
    exp.mutate(
      { module: "profile", format: "csv" },
      {
        onSuccess: (data) => {
          notifySuccess("Export ready — downloading");
          window.open(data.downloadUrl, "_blank");
        },
        onError: (e: unknown) => notifyError(getApiError(e, "Export failed")),
      },
    );
  };

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-buttons bg-emerald-status/10 text-emerald-status">
          <Download size={17} />
        </span>
        <h2 className="text-heading-sm font-semibold text-midnight-ink">Download my data</h2>
      </div>
      <p className="mb-5 max-w-lg text-sm leading-relaxed text-ash">
        Get a CSV copy of your profile, social links, and platform activity.
      </p>
      <Button onClick={go} disabled={exp.isPending} variant="ghost">
        {exp.isPending ? "Preparing…" : "Download CSV"}
      </Button>
    </Card>
  );
}

function DeleteAccountCard() {
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const doDelete = async () => {
    if (!password) {
      notifyError("Enter your password to confirm");
      return;
    }
    setDeleting(true);
    try {
      await api.delete("/auth/me", { data: { password } });
      clearTokens();
      notifySuccess("Account deleted");
      window.location.href = "/";
    } catch (err: unknown) {
      notifyError(getApiError(err, "Could not delete account"));
      setDeleting(false);
    }
  };

  return (
    <Card className="border-coral-alert/25">
      <div className="mb-1 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-buttons bg-coral-alert/10 text-coral-alert">
          <Trash2 size={17} />
        </span>
        <h2 className="text-heading-sm font-semibold text-midnight-ink">Delete account</h2>
      </div>
      <p className="mb-5 max-w-lg text-sm leading-relaxed text-ash">
        Permanently removes your account, profile, portfolio, messages, and reviews. This cannot be undone.
      </p>
      {!confirming ? (
        <Button variant="danger" onClick={() => setConfirming(true)}>
          Delete my account
        </Button>
      ) : (
        <div className="max-w-md rounded-cards border border-coral-alert/25 bg-coral-alert/5 p-4">
          <p className="mb-3 text-sm font-medium text-graphite">
            Type your password to permanently delete everything.
          </p>
          <div className="flex flex-col gap-3">
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your current password"
            />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => { if (!deleting) { setConfirming(false); setPassword(""); } }}>
                Keep my account
              </Button>
              <Button variant="danger" disabled={deleting} onClick={doDelete}>
                {deleting ? "Deleting…" : "Delete forever"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AccountSettingsPage() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-[800px] space-y-6 pb-20">
        <PageHeader title="Account settings" subtitle="Password, your data, and account removal." />
        <ChangePasswordCard />
        <DownloadDataCard />
        <DeleteAccountCard />
      </div>
    </RequireAuth>
  );
}
