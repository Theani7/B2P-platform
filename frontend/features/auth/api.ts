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

export async function checkAvailability(params: { username?: string; email?: string }): Promise<{ usernameAvailable: boolean; emailAvailable: boolean }> {
  const query = new URLSearchParams();
  if (params.username) query.append("username", params.username);
  if (params.email) query.append("email", params.email);
  return (await api.get<{ usernameAvailable: boolean; emailAvailable: boolean }>(`/auth/check?${query.toString()}`)).data;
}

export async function login(payload: LoginPayload): Promise<User> {
  const res = await api.post<AuthTokens>("/auth/login", payload);
  setTokens(res.data.access_token, res.data.refresh_token);
  return (await api.get<User>("/auth/me")).data;
}

export async function register(payload: RegisterPayload): Promise<{ email: string; role: string }> {
  const res = await api.post<{ email: string; role: string }>("/auth/register", payload);
  return res.data;
}

export async function resendVerification(payload: { email: string }): Promise<void> {
  await api.post("/auth/resend-verification", payload);
}

export async function forgotPassword(payload: { email: string }): Promise<void> {
  await api.post("/auth/forgot-password", payload);
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

export async function verifyResetCode(payload: { email: string; code: string }): Promise<{ token: string }> {
  const res = await api.post<{ token: string }>("/auth/verify-reset-code", payload);
  return res.data;
}

export async function resetPassword(payload: { token: string; new_password: string }): Promise<void> {
  await api.post("/auth/reset-password", payload);
}

export async function requestOtp(payload: { email: string }): Promise<void> {
  await api.post("/auth/request-otp", payload);
}

export async function verifyOtp(payload: { email: string; code: string }): Promise<AuthTokens> {
  const res = await api.post<AuthTokens>("/auth/verify-otp", payload);
  setTokens(res.data.access_token, res.data.refresh_token);
  return res.data;
}

export async function verifyRegistrationOtp(payload: { email: string; code: string }): Promise<User> {
  const res = await api.post<AuthTokens>("/auth/verify-registration-otp", payload);
  setTokens(res.data.access_token, res.data.refresh_token);
  return (await api.get<User>("/auth/me")).data;
}

export async function resendRegistrationOtp(payload: { email: string }): Promise<void> {
  await api.post("/auth/resend-registration-otp", payload);
}
