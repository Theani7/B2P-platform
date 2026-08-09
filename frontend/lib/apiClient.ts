import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const access = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let refreshPromise: Promise<{ access_token: string; refresh_token: string }> | null = null;

async function doRefresh(refresh: string): Promise<{ access_token: string; refresh_token: string }> {
  const resp = await axios.post(`${baseURL}/auth/refresh`, { refresh_token: refresh });
  return resp.data.data;
}

api.interceptors.response.use(
  (r) => r.data,
  async (error) => {
    const original = error.config;
    const isAuthCall =
      original?.url === "/auth/refresh" || original?.url === "/auth/login" || original?.url === "/auth/register";
    if (error.response?.status === 401 && !original._retry && !isAuthCall) {
      const refresh = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
      if (refresh) {
        if (!refreshPromise) {
          refreshPromise = doRefresh(refresh).finally(() => {
            refreshPromise = null;
          });
        }
        try {
          const { access_token, refresh_token } = await refreshPromise;
          original._retry = true;
          localStorage.setItem("access_token", access_token);
          if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        } catch {
          localStorage.clear();
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.clear();
}

export function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export default api;
