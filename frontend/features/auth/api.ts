import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { setTokens, clearTokens } from "@/lib/apiClient";
import type { AuthTokens, User } from "./types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: string;
  username: string;
  fullName: string;
}

export async function login(payload: LoginPayload): Promise<User> {
  const res = await api.post<AuthTokens>("/auth/login", payload);
  setTokens(res.data.access_token, res.data.refresh_token);
  return (await api.get<User>("/auth/me")).data;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const res = await api.post<AuthTokens>("/auth/register", payload);
  setTokens(res.data.access_token, res.data.refresh_token);
  return (await api.get<User>("/auth/me")).data;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    clearTokens();
  }
}

export function useCurrentUser() {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: async () => (await api.get<User>("/auth/me")).data,
    enabled: !!token,
    retry: false,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.clear();
    },
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<User>) =>
      (await api.patch<User>("/auth/me", payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
