import { toast } from "react-hot-toast";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import React from "react";

export const notifySuccess = (message: string) => toast.success(message, {
  icon: React.createElement(CheckCircle2, { size: 18, className: "text-emerald-500" })
});
export const notifyError = (message: string) => toast.error(message, {
  icon: React.createElement(XCircle, { size: 18, className: "text-red-500" })
});
export const notifyInfo = (message: string) => toast(message, {
  icon: React.createElement(Info, { size: 18, className: "text-blue-500" })
});
export { notifyAchievement } from "../components/achievements/AchievementToast";
