"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Ps04SpeechIntelligence } from "@/components/Ps04SpeechIntelligence";
import { WhyScienceSection } from "@/components/WhyScienceSection";
import { Sprout, Mic, Award, Sliders, ArrowRight } from "lucide-react";

export default function ProductPage() {
  return (
    <AppShell>
      <div className="space-y-12 pb-12 font-sans bg-[#F7F6EF]">
        {/* Product Hero */}
        <section className="bg-[#063B2D] text-white py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <span className="px-4 py-1.5 rounded-full bg-[#00A878]/30 border border-[#20C98A]/30 text-[#20C98A] text-xs font-mono font-black uppercase">
              AASRA PRODUCT DEEP-DIVE
            </span>
            <h1 className="text-4xl sm:text-6xl font-black font-display text-white">
              Your field's intelligent companion.
            </h1>
            <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
              Combining PS-04 farmer-facing multilingual voice AI with PS-07 return on biological investment attribution.
            </p>

            <div className="pt-4 flex justify-center gap-4">
              <Link
                href="/assistant"
                className="px-6 py-3.5 rounded-2xl bg-[#00A878] hover:bg-[#20C98A] text-white font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Mic className="h-4 w-4 text-amber-300" />
                <span>Try Voice AI</span>
              </Link>
            </div>
          </div>
        </section>

        {/* PS-04 & PS-07 Features */}
        <Ps04SpeechIntelligence />
        <WhyScienceSection />
      </div>
    </AppShell>
  );
}
