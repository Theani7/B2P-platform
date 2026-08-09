import axios from "axios";

export function getApiError(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (typeof message === "string" && message) return message;
    if (Array.isArray(err.response?.data?.errors) && err.response.data.errors.length) {
      const first = err.response.data.errors[0];
      if (typeof first?.message === "string") return first.message;
    }
    return fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
