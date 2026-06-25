import apiClient from "../../services/apiClient";
import type { ExportRequest, ExportResponse } from "./types";

export const exportApi = {
  generateExport: async (params: ExportRequest): Promise<ExportResponse> => {
    const { data } = await apiClient.post<ExportResponse>("/export", params);
    return (data as any).data || data;
  }
};
