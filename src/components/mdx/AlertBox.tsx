"use client";

import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { ReactNode } from "react";

interface AlertBoxProps {
  type?: "info" | "success" | "warning" | "error";
  children: ReactNode;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const colorMap = {
  info: {
    container: "border-blue-500 bg-alert border-l-4",
    icon: "text-blue-400",
    text: "text-alert [&_*]:text-alert",
  },
  success: {
    container: "border-green-500 bg-alert border-l-4",
    icon: "text-green-400",
    text: "text-alert [&_*]:text-alert",
  },
  warning: {
    container: "border-yellow-500 bg-alert border-l-4",
    icon: "text-yellow-400",
    text: "text-alert [&_*]:text-alert",
  },
  error: {
    container: "border-red-500 bg-alert border-l-4",
    icon: "text-red-400",
    text: "text-alert [&_*]:text-alert",
  },
};

export function AlertBox({ type = "info", children }: AlertBoxProps) {
  const Icon = iconMap[type];
  const colors = colorMap[type];

  return (
    <div className={`p-4 my-4 rounded-lg ${colors.container}`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${colors.icon}`} />
        <div className={`flex-1 ${colors.text}`}>{children}</div>
      </div>
    </div>
  );
}
