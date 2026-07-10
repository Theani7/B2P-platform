import { useMutation } from "@tanstack/react-query";
import { exportApi } from "./api";
import type { ExportRequest } from "./types";

export function useExport() {
  return useMutation({
    mutationFn: (params: ExportRequest) => exportApi.generateExport(params),
    onSuccess: (data) => {
      // Create an invisible link to trigger download automatically
      const url = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
      const fullUrl = `${url}${data.download_url}`;
      
      const link = document.createElement('a');
      link.href = fullUrl;
      link.setAttribute('download', data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });
}
