"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { Ps07ProofAttribution } from "@/components/Ps07ProofAttribution";
import { ROBICalculator } from "@/components/ROBICalculator";

export default function ImpactStoryPage() {
  return (
    <AppShell>
      <div className="space-y-12 pb-12 font-sans bg-[#F7F6EF]">
        <section className="bg-[#10241F] text-white py-16 px-4 sm:px-6 text-center space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-[#00A878]/30 text-[#20C98A] text-xs font-mono font-black uppercase border border-[#20C98A]/30">
            PROVEN OUTCOMES
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-white">
            Impact & ROBI Attribution Story
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Proving biological biostimulant value through scientific multi-factor baseline decomposition.
          </p>
        </section>

        <Ps07ProofAttribution />
        <ROBICalculator />
      </div>
    </AppShell>
  );
}
