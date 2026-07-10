import toast from "react-hot-toast";

export const notifyError = (msg: string) => toast.error(msg);
export const notifySuccess = (msg: string) => toast.success(msg);
