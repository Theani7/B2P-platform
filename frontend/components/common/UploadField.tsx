"use client";

import { useRef } from "react";
import { useUpload, type UploadKind } from "@/features/upload/api";
import { Button } from "@/components/ui/Button";
import { notifySuccess, notifyError } from "@/lib/notify";

export function UploadField({
  kind,
  label,
  accept = "image/*",
  onUploaded,
}: {
  kind: UploadKind;
  label: string;
  accept?: string;
  onUploaded?: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUpload(kind);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        type="button"
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {upload.isPending ? "Uploading…" : label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          upload.mutate(file, {
            onSuccess: (res) => {
              notifySuccess("Uploaded");
              onUploaded?.(res.url);
            },
            onError: (err: any) =>
              notifyError(err?.response?.data?.message ?? "Upload failed"),
          });
          e.target.value = "";
        }}
      />
    </div>
  );
}
