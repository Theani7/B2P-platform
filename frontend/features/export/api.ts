import { useMutation } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export type ExportModule = "campaigns" | "promoters" | "profile";
export type ExportFormat = "csv" | "json";

export interface ExportRequest {
  module: ExportModule;
  format?: ExportFormat;
  columns?: string[];
}

export interface ExportResult {
  downloadUrl: string;
  expiresAt: string;
  filename: string;
}

export const useExport = () => {
  return useMutation<ExportResult, Error, ExportRequest>({
    mutationFn: (body) => api.post<ExportResult>("/export", body).then((r) => r.data),
  });
};
