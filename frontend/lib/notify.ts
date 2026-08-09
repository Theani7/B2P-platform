import toast from "react-hot-toast";
import { getApiError } from "./apiError";

export const notifyError = (msg: string) => toast.error(msg);
export const notifySuccess = (msg: string) => toast.success(msg);
export const notifyApiError = (err: unknown, fallback?: string) =>
  toast.error(getApiError(err, fallback));
