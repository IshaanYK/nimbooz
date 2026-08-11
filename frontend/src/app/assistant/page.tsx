"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AdvisoryChat } from "@/components/AdvisoryChat";
import { getStoredProfile } from "@/lib/userStore";
import { Sprout, Thermometer, Droplets, AlertTriangle, Layers, Calendar, Mic, Sparkles } from "lucide-react";

export default function AskAasraPage() {
  const profile = getStoredProfile();

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 font-sans space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-[#00A878] uppercase bg-[#DDF7EC] px-3 py-1 rounded-full border border-[#00A878]/30">
              PS-04 MULTILINGUAL ADVISORY
            </span>
            <h1 className="text-3xl font-black font-display text-[#10241F] mt-1 flex items-center gap-2">
              <Mic className="h-7 w-7 text-[#00A878]" /> Ask AASRA
            </h1>
            <p className="text-xs text-slate-600">
              Speak naturally in Hindi or 11 regional dialects. Voice engine converts speech into field-aware recommendations.
            </p>
          </div>
        </div>

        {/* Main Grid Layout: Left Conversation + Right Field Context Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Dedicated Voice & Advisory Chat */}
          <div className="lg:col-span-8 space-y-6">
            <AdvisoryChat />
          </div>

          {/* Right Column (Desktop Sticky Sidebar): Field Context Widget */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-[#063B2D] text-white p-6 rounded-3xl border border-[#20C98A]/30 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-extrabold text-sm font-display text-white flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-[#20C98A]" /> Field Context
                </h3>
                <span className="text-[10px] font-mono text-emerald-300 font-bold bg-[#00A878]/30 px-2.5 py-0.5 rounded-full border border-[#20C98A]/30">
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center bg-[#10241F] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400">Field Name:</span>
                  <span className="font-bold text-white">{profile.fieldName || "Bhopal Field 01"}</span>
                </div>

                <div className="flex justify-between items-center bg-[#10241F] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400">Crop & Variety:</span>
                  <span className="font-bold text-emerald-300">Soybean (JS-335)</span>
                </div>

                <div className="flex justify-between items-center bg-[#10241F] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400">Growth Stage:</span>
                  <span className="font-bold text-amber-300">R2 Flowering</span>
                </div>

                <div className="flex justify-between items-center bg-[#10241F] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400">Night Temperature:</span>
                  <span className="font-bold text-rose-300">25.8°C (High)</span>
                </div>

                <div className="flex justify-between items-center bg-[#10241F] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400">Soil Moisture:</span>
                  <span className="font-bold text-emerald-300">42%</span>
                </div>

                <div className="flex justify-between items-center bg-rose-500/20 p-3 rounded-xl border border-rose-400/40 text-rose-200">
                  <span>3-Day Heat Risk:</span>
                  <span className="font-black text-rose-300 text-sm">78% ALERT</span>
                </div>

                <div className="flex justify-between items-center bg-[#00A878]/20 p-3 rounded-xl border border-[#20C98A]/30 text-emerald-200">
                  <span>Recent Action:</span>
                  <span className="font-bold text-white">Biostimulant Aug 14</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 font-sans leading-relaxed border-t border-white/10 pt-3">
                💡 AASRA automatically injects these real-time field variables into your conversation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
