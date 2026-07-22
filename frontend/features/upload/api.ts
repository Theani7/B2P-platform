import { useMutation } from "@tanstack/react-query";
import api from "@/lib/apiClient";

import imageCompression from "browser-image-compression";

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

export const uploadFile = async (kind: UploadKind, file: File): Promise<UploadResult> => {
  let fileToUpload: File | Blob = file;
  
  if (file.type.startsWith("image/")) {
    const options = {
      maxSizeMB: 1, // Compress to under 1MB
      maxWidthOrHeight: 1280, // Max dimension
      useWebWorker: true,
    };
    fileToUpload = await imageCompression(file, options);
  }

  const form = new FormData();
  form.append("file", fileToUpload, file.name);
  return api.post<UploadResult>(endpointFor(kind), form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

export const useUpload = (kind: UploadKind) => {
  return useMutation<UploadResult, Error, File>({
    mutationFn: (file) => uploadFile(kind, file),
  });
};
