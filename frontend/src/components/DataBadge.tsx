"use client";

import React from "react";
import { Activity, Cpu, UserCheck, Sparkles, AlertCircle, Eye } from "lucide-react";

export type BadgeType = "LIVE_METEOBLUE" | "LIVE_CEHUB" | "AI_GENERATED" | "MODELLED" | "USER_PROVIDED" | "DEMO" | "OBSERVED";

interface DataBadgeProps {
  type: BadgeType;
  customText?: string;
  size?: "sm" | "md";
  className?: string;
}

export function DataBadge({ type, customText, size = "sm", className = "" }: DataBadgeProps) {
  const configs: Record<BadgeType, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    LIVE_METEOBLUE: {
      label: customText || "LIVE Meteoblue",
      bg: "bg-blue-950/80 text-blue-200 border-blue-700/50",
      text: "text-blue-200",
      border: "border-blue-700/50",
      icon: <Activity className="w-3 h-3 text-blue-400 animate-pulse" />,
    },
    LIVE_CEHUB: {
      label: customText || "LIVE CE Hub",
      bg: "bg-emerald-950/80 text-emerald-200 border-emerald-700/50",
      text: "text-emerald-200",
      border: "border-emerald-700/50",
      icon: <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />,
    },
    AI_GENERATED: {
      label: customText || "AI GENERATED",
      bg: "bg-purple-950/80 text-purple-200 border-purple-700/50",
      text: "text-purple-200",
      border: "border-purple-700/50",
      icon: <Sparkles className="w-3 h-3 text-purple-400" />,
    },
    MODELLED: {
      label: customText || "MODELLED AASRA",
      bg: "bg-amber-950/80 text-amber-200 border-amber-700/50",
      text: "text-amber-200",
      border: "border-amber-700/50",
      icon: <Cpu className="w-3 h-3 text-amber-400" />,
    },
    USER_PROVIDED: {
      label: customText || "USER PROVIDED",
      bg: "bg-teal-950/80 text-teal-200 border-teal-700/50",
      text: "text-teal-200",
      border: "border-teal-700/50",
      icon: <UserCheck className="w-3 h-3 text-teal-400" />,
    },
    OBSERVED: {
      label: customText || "OBSERVED",
      bg: "bg-emerald-950/80 text-emerald-300 border-emerald-600/50",
      text: "text-emerald-300",
      border: "border-emerald-600/50",
      icon: <Eye className="w-3 h-3 text-emerald-400" />,
    },
    DEMO: {
      label: customText || "DEMO DATA",
      bg: "bg-gray-800 text-gray-300 border-gray-600",
      text: "text-gray-300",
      border: "border-gray-600",
      icon: <AlertCircle className="w-3 h-3 text-gray-400" />,
    },
  };

  const config = configs[type] || configs.DEMO;
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded-md border font-semibold backdrop-blur-md shadow-sm ${padding} ${config.bg} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
