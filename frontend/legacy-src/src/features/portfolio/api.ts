import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import type { PortfolioItem, PortfolioItemCreate, PortfolioItemUpdate, PortfolioMedia } from "./types";

export const portfolioKeys = {
  all: ["portfolio"] as const,
  lists: () => [...portfolioKeys.all, "list"] as const,
  list: (filters: string) => [...portfolioKeys.lists(), { filters }] as const,
  details: () => [...portfolioKeys.all, "detail"] as const,
  detail: (id: string) => [...portfolioKeys.details(), id] as const,
};

// API calls
export const getMyPortfolio = async () => {
  const { data } = await apiClient.get<PortfolioItem[]>("/portfolio/");
  return data;
};

export const getPublicPortfolio = async (promoterId: string) => {
  const { data } = await apiClient.get<PortfolioItem[]>(`/portfolio/promoter/${promoterId}`);
  return data;
};

export const createPortfolioItem = async (item: PortfolioItemCreate) => {
  const { data } = await apiClient.post<PortfolioItem>("/portfolio/", item);
  return data;
};



export const updatePortfolioItem = async ({ id, data }: { id: string; data: PortfolioItemUpdate }) => {
  const response = await apiClient.patch<PortfolioItem>(`/portfolio/${id}`, data);
  return response.data;
};

export const deletePortfolioItem = async (id: string) => {
  await apiClient.delete(`/portfolio/${id}`);
};

export const uploadMedia = async ({ id, file }: { id: string; file: File }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("is_video", file.type.startsWith('video/') ? "true" : "false");
  const { data } = await apiClient.post<PortfolioMedia>(`/portfolio/${id}/media`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const deleteMedia = async (mediaId: string) => {
  await apiClient.delete(`/portfolio/media/${mediaId}`);
};
