import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../services/apiClient";
import { RegisterPayload, LoginPayload, TokenResponse, User } from "./types";

export const useRegister = () => {
  const qc = useQueryClient();
  return useMutation<TokenResponse, Error, RegisterPayload>({
    mutationFn: (data) => api.post("/auth/register", data).then((r) => r.data),
    onSuccess: async (res) => {
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      try {
        const userRes = await api.get("/auth/me");
        qc.setQueryData(["me"], userRes.data);
      } catch (e) {
        qc.invalidateQueries({ queryKey: ["me"] });
      }
    },
  });
};

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation<TokenResponse, Error, LoginPayload>({
    mutationFn: (data) => api.post("/auth/login", data).then((r) => r.data),
    onSuccess: async (res) => {
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

export const useCurrentUser = () =>
  useQuery<User, Error>({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me").then((r) => r.data),
    enabled: !!localStorage.getItem("access_token"),
  });

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSuccess: () => {
      localStorage.clear();
      qc.removeQueries({ queryKey: ["me"] });
      window.location.href = "/login";
    },
  });
};
