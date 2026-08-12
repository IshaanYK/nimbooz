"use client";

import React from "react";
import Image from "next/image";
import { X, Award, CheckCircle2, ShieldCheck, Download, Share2, Sparkles, Sprout } from "lucide-react";

interface ExportProofCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName?: string;
  fieldName?: string;
  crop?: string;
  expectedYield?: number;
  actualYield?: number;
  biologicalGain?: string;
  confidence?: number;
  robiReturn?: number;
}

export const ExportProofCardModal: React.FC<ExportProofCardModalProps> = ({
  isOpen,
  onClose,
  farmerName = "Rajesh Sharma",
  fieldName = "Bhopal Soybean Field 01",
  crop = "Soybean (JS-335)",
  expectedYield = 8.5,
  actualYield = 9.2,
  biologicalGain = "+0.60 q/acre",
  confidence = 71,
  robiReturn = 215,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-[#063B2D] text-white rounded-3xl border border-[#20C98A]/40 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#00A878] flex items-center justify-center text-amber-300 font-bold shadow-md">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black font-display text-white">AASRA PS-07 Proof Card</h3>
            <p className="text-xs text-emerald-300 font-mono">Modelled Yield Outcome & Attribution Certificate</p>
          </div>
        </div>

        {/* Printable / Shareable Card Container */}
        <div className="bg-[#10241F] p-6 rounded-2xl border border-white/15 space-y-5 shadow-inner">
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="relative h-8 w-28 bg-white/95 px-2 py-1 rounded-xl">
              <Image src="/images/aasra_logo.png" alt="AASRA" fill className="object-contain p-1" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-[#00A878]/20 px-2.5 py-1 rounded-full border border-[#20C98A]/30">
              VERIFIED OUTCOME
            </span>
          </div>

          {/* Farmer & Field Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block uppercase">FARMER NAME</span>
              <span className="font-extrabold text-white text-sm">{farmerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono block uppercase">CROP & VARIETY</span>
              <span className="font-extrabold text-emerald-300 text-sm">{crop}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">FIELD LOCATION</span>
              <span className="font-bold text-slate-200">{fieldName}</span>
            </div>
          </div>

          {/* Core Metrics Box */}
          <div className="grid grid-cols-3 gap-2 bg-[#063B2D] p-4 rounded-xl border border-emerald-500/20 text-center font-mono">
            <div>
              <span className="text-[9px] text-slate-400 block">EXPECTED</span>
              <span className="text-base font-black text-white">{expectedYield} <span className="text-[9px]">q/a</span></span>
            </div>
            <div>
              <span className="text-[9px] text-[#20C98A] block">ACTUAL HARVEST</span>
              <span className="text-base font-black text-[#20C98A]">{actualYield} <span className="text-[9px]">q/a</span></span>
            </div>
            <div>
              <span className="text-[9px] text-amber-300 block">ROBI INDEX</span>
              <span className="text-base font-black text-amber-300">{robiReturn}%</span>
            </div>
          </div>

          {/* Attribution Breakdown */}
          <div className="space-y-1.5 text-xs text-slate-300 font-mono pt-1">
            <div className="flex justify-between">
              <span>Modelled Biological Gain:</span>
              <span className="font-bold text-[#20C98A]">{biologicalGain}</span>
            </div>
            <div className="flex justify-between">
              <span>Attribution Confidence:</span>
              <span className="font-bold text-amber-300">{confidence}%</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2">
              <span>Methodology:</span>
              <span>Decomposition & Multi-Factor Baseline</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => alert("Proof Card downloaded as PDF!")}
            className="flex-1 py-3 px-4 rounded-xl bg-[#00A878] hover:bg-[#20C98A] text-white font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Download className="h-4 w-4" />
            <span>Download Proof PDF</span>
          </button>
          <button
            onClick={() => alert("Proof Card link copied to clipboard!")}
            className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
