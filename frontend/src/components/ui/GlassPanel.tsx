"use client";

import React from "react";

interface GlassPanelProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  contentClassName?: string;
  radius?: number;
  glow?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  as: Component = "div",
  className = "",
  contentClassName = "",
  radius = 20,
  glow = false,
}) => {
  return (
    <Component
      style={{ borderRadius: `${radius}px` }}
      className={`glass-panel-root relative overflow-hidden ${
        glow ? "ring-1 ring-[#00A878]/30 shadow-[0_0_25px_rgba(0,168,120,0.15)]" : ""
      } ${className}`}
    >
      <div className={`p-5 sm:p-6 text-white ${contentClassName}`}>
        {children}
      </div>
    </Component>
  );
};
