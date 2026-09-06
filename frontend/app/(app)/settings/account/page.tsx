"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RequireAuth } from "@/components/common/RequireAuth";
import { useAuth } from "@/providers/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { notifySuccess, notifyError } from "@/lib/notify";
import { getApiError } from "@/lib/apiError";
import api, { clearTokens } from "@/lib/apiClient";
import { useExport } from "@/features/export/api";
import { Lock, Download, Trash2, User } from "lucide-react";

const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name is too long"),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

function PersonalInfoCard() {
  const { user, refreshUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { fullName: user?.fullName || "" },
  });

  useEffect(() => {
    if (user) {
      reset({ fullName: user.fullName || "" });
    }
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.patch("/auth/me", { fullName: values.fullName });
      notifySuccess("Name updated successfully");
      reset(values);
      refreshUser();
    } catch (err: unknown) {
      notifyError(getApiError(err, "Could not update name"));
    }
  });

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-buttons bg-sky-wash text-signal-blue">
          <User size={17} />
        </span>
        <h2 className="text-heading-sm font-semibold text-midnight-ink">Personal information</h2>
      </div>
      <p className="mb-5 text-sm text-ash">Update your display name visible across the platform.</p>
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
        <Input
          label="Full name"
          type="text"
          {...register("fullName")}
          error={errors.fullName?.message}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-graphite">Email address</label>
          <input
            type="text"
            disabled
            className="w-full h-10 px-3.5 rounded-inputs border border-steel/15 bg-linen-canvas text-ash text-sm cursor-not-allowed"
            value={user?.email || ""}
          />
          <p className="text-[11px] text-fog">Registered email address for your account.</p>
        </div>
        <div>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

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
  const [confirmOpen, setConfirmOpen] = useState(false);
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
      <Button variant="danger" onClick={() => { setPassword(""); setConfirmOpen(true); }}>
        Delete my account
      </Button>
      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete account?"
        message="Everything tied to your account will be permanently removed."
        confirmText={deleting ? "Deleting…" : "Delete forever"}
        isDanger
        onCancel={() => !deleting && setConfirmOpen(false)}
        onConfirm={doDelete}
      >
        <div className="mb-2">
          <Input
            label="Confirm with your password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your current password"
          />
        </div>
      </ConfirmModal>
    </Card>
  );
}

export default function AccountSettingsPage() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-[800px] space-y-6 pb-20">
        <div className="relative overflow-hidden rounded-cards-lg border border-steel/10 bg-white p-8 shadow-product-card">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(60% 130% at 100% 0%, rgba(182,203,253,0.55) 0%, rgba(240,244,254,0) 60%)" }}
          />
          <div className="relative">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-midnight-ink">Account settings</h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ash">
              Password, a copy of your data, and account removal. Everything here acts immediately.
            </p>
          </div>
        </div>
        <PersonalInfoCard />
        <ChangePasswordCard />
        <DownloadDataCard />
        <DeleteAccountCard />
      </div>
    </RequireAuth>
  );
}
