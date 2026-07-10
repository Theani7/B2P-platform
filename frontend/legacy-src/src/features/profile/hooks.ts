import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAvatar, uploadLogo } from "./api";
import { notifyError } from "../../hooks/useToast";

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: uploadAvatar,
    onError: () => notifyError("Failed to upload avatar"),
  });
};

export const useUploadLogo = () => {
  return useMutation({
    mutationFn: uploadLogo,
    onError: () => notifyError("Failed to upload logo"),
  });
};