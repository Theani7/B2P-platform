import { toast } from "react-hot-toast";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import React from "react";

const parseMessage = (message: any): string => {
  if (typeof message === "string") return message;
  if (Array.isArray(message)) {
    if (message.length > 0 && message[0].msg) {
      return message.map(m => `${m.loc?.[m.loc.length - 1] || 'Field'}: ${m.msg}`).join(', ');
    }
    return JSON.stringify(message);
  }
  if (typeof message === "object" && message !== null) {
    return message.message || JSON.stringify(message);
  }
  return String(message);
};

export const notifySuccess = (message: any) => toast.success(parseMessage(message), {
  icon: React.createElement(CheckCircle2, { size: 18, className: "text-emerald-500" })
});
export const notifyError = (message: any) => toast.error(parseMessage(message), {
  icon: React.createElement(XCircle, { size: 18, className: "text-red-500" })
});
export const notifyInfo = (message: any) => toast(parseMessage(message), {
  icon: React.createElement(Info, { size: 18, className: "text-blue-500" })
});
export { notifyAchievement } from "../components/achievements/AchievementToast";
