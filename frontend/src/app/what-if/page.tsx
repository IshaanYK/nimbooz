"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { Sliders, Clock, TrendingUp, AlertTriangle } from "lucide-react";

export default function WhatIfPage() {
  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-[#00A878] uppercase bg-[#DDF7EC] px-3 py-1 rounded-full border border-[#00A878]/30">
              SCENARIO ENGINE
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-[#10241F] mt-2 flex items-center gap-2">
              <Sliders className="h-8 w-8 text-[#00A878]" /> Interactive Scenario Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Simulate how intervention delay impacts crop heat stress risk, yield loss, and Return on Biological Investment.
            </p>
          </div>
        </div>

        <WhatIfSimulator />
      </div>
    </AppShell>
  );
}
