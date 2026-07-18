import { useMutation } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export type UploadKind = "avatar" | "logo" | "portfolio-image" | "chat-attachment";

export interface UploadResult {
  url: string;
}

function endpointFor(kind: UploadKind): string {
  switch (kind) {
    case "avatar":
      return "/upload/avatar";
    case "logo":
      return "/upload/logo";
    case "portfolio-image":
      return "/upload/portfolio-image";
    case "chat-attachment":
      return "/upload/chat-attachment";
  }
}

export const uploadFile = (kind: UploadKind, file: File): Promise<UploadResult> => {
  const form = new FormData();
  form.append("file", file);
  return api.post<UploadResult>(endpointFor(kind), form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

export const useUpload = (kind: UploadKind) => {
  return useMutation<UploadResult, Error, File>({
    mutationFn: (file) => uploadFile(kind, file),
  });
};
