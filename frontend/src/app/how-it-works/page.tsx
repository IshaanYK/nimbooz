"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { AskActProveSection } from "@/components/AskActProveSection";
import { FarmerStoryTimeline } from "@/components/FarmerStoryTimeline";

export default function HowItWorksPage() {
  return (
    <AppShell>
      <div className="space-y-12 pb-12 font-sans bg-[#F7F6EF]">
        <section className="bg-[#063B2D] text-white py-16 px-4 sm:px-6 text-center space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-[#00A878]/30 text-[#20C98A] text-xs font-mono font-black uppercase border border-[#20C98A]/30">
            THE AASRA ARCHITECTURE
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-white">
            How AASRA Works
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto">
            From natural voice inquiry to field application and scientific outcome measurement.
          </p>
        </section>

        <AskActProveSection />
        <FarmerStoryTimeline />
      </div>
    </AppShell>
  );
}
