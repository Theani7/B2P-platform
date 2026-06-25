import apiClient from "../../services/apiClient";
import type { SearchQuery, SearchResponse, SearchHistoryItem } from "./types";

export const searchApi = {
  search: async (params: SearchQuery): Promise<SearchResponse> => {
    const { data } = await apiClient.get<SearchResponse>("/search", { params });
    // Assuming backend returns { data: SearchResponse, ... } per API envelope standard
    // Wait, the standard is { success, data, message }
    return (data as any).data || data;
  },
  
  getHistory: async (): Promise<SearchHistoryItem[]> => {
    const { data } = await apiClient.get("/search/history");
    return (data as any).data || data;
  },
  
  clearHistory: async (): Promise<void> => {
    await apiClient.delete("/search/history");
  }
};
