"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { PageHelpModal } from "@/components/PageHelpModal";
import { Sliders } from "lucide-react";

export default function WhatIfPage() {
  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                BIOLOGICAL SCENARIO SIMULATION ENGINE
              </span>
            </div>
            <h1 className="text-3xl font-black font-display text-slate-900 mt-1 flex items-center gap-2">
              <Sliders className="h-7 w-7 text-blue-600" />
              What-If Spray Delay Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Simulate how biostimulant spray delay (0 to 7 days) impacts heat stress risk, yield loss, and net profit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PageHelpModal
              pageKey="what_if"
              title="How to Use What-If Simulator"
              subtitle="Simulate delay impacts on heat stress recovery and net profit."
              steps={[
                { number: "01", title: "Select Your Farm & Crop", desc: "Choose your active field from the dropdown or enter custom temperature/moisture values." },
                { number: "02", title: "Drag Application Delay Slider", desc: "Move the slider from Day 0 (Today) to Day 3 (+3 Days Delay) to simulate spray delay penalties." },
                { number: "03", title: "Review Net Profit & Bio-Efficacy", desc: "View how spray delay reduces biostimulant efficacy and alters your net profit per acre." },
              ]}
            />
            <span className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
              MODEL 4.2 ONLINE
            </span>
          </div>
        </div>

        {/* Main Simulator Card */}
        <div className="stripe-card p-6 sm:p-8">
          <WhatIfSimulator />
        </div>

      </div>
    </AppShell>
  );
}
