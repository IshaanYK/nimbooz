"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Ps07ProofAttribution } from "@/components/Ps07ProofAttribution";
import { ROBICalculator } from "@/components/ROBICalculator";
import { ExportProofCardModal } from "@/components/ExportProofCardModal";
import { Award, TrendingUp, Download, Share2, BarChart2, CheckCircle2, Sparkles, Layers } from "lucide-react";

export default function ImpactPage() {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-[#00A878] uppercase bg-[#DDF7EC] px-3 py-1 rounded-full border border-[#00A878]/30">
              PS-07 CENTERPIECE ENGINE
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-[#10241F] mt-2 flex items-center gap-2">
              <Award className="h-8 w-8 text-[#00A878]" /> "Did it work?" — Impact & ROBI Proof
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Isolates biostimulant effect from weather & soil baselines to prove Return on Biological Investment (ROBI).
            </p>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-[#00A878] hover:bg-[#063B2D] text-white font-black text-xs transition-all shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <Download className="h-4 w-4" />
            <span>Export Proof Card</span>
          </button>
        </div>

        {/* Core PS-07 Proof Section */}
        <Ps07ProofAttribution />

        {/* Interactive ROBI Calculator Engine */}
        <ROBICalculator />

        {/* Season Comparison & Attribution Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#063B2D]/15 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-lg font-black font-display text-[#10241F] flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-[#00A878]" /> Season Comparison & Yield Control
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">2026 vs Regional Baseline</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="bg-[#F7F6EF] p-5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">REGIONAL UNTREATED CONTROL</span>
              <span className="text-2xl font-black text-slate-800">8.4 q/acre</span>
              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                Untreated fields experienced 14% flower pod drop during the Aug 13–15 heat wave.
              </p>
            </div>

            <div className="bg-[#DDF7EC] p-5 rounded-2xl border border-[#00A878]/30 space-y-2">
              <span className="text-[#063B2D] block text-[10px] uppercase font-bold">AASRA TREATED FIELD</span>
              <span className="text-2xl font-black text-[#00A878]">9.2 q/acre</span>
              <p className="text-[11px] text-[#063B2D] font-sans leading-relaxed">
                Biostimulant application stabilized flower cell membranes and prevented pod drop.
              </p>
            </div>

            <div className="bg-[#10241F] text-white p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-amber-300 block text-[10px] uppercase font-bold">ATTRIBUTED BIOLOGICAL GAIN</span>
              <span className="text-2xl font-black text-amber-300">+0.60 q/acre</span>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Isolated with 71% statistical confidence using multi-factor baseline decomposition.
              </p>
            </div>
          </div>
        </div>

        {/* Export Proof Card Modal */}
        <ExportProofCardModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
        />
      </div>
    </AppShell>
  );
}
