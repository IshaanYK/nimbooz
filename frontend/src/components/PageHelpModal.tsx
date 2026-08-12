"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, X, CheckCircle2, Sparkles } from "lucide-react";

interface PageHelpModalProps {
  pageKey: string;
  title: string;
  subtitle: string;
  steps: Array<{ number: string; title: string; desc: string }>;
}

export const PageHelpModal: React.FC<PageHelpModalProps> = ({
  pageKey,
  title,
  subtitle,
  steps,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = `aasra_has_seen_help_${pageKey}`;
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, [pageKey]);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(`aasra_has_seen_help_${pageKey}`, "true");
    }
  };

  const handleOpenManually = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Help Trigger Button in Page Header */}
      <button
        onClick={handleOpenManually}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold border border-slate-300 transition-all cursor-pointer shadow-2xs"
        title="How to Use this page"
      >
        <HelpCircle className="h-4 w-4 text-[#10B981]" />
        <span>How to Use</span>
      </button>

      {/* Onboarding Guidance Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6 relative animate-fade-in-up">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#10B981] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase flex items-center gap-1 w-max">
                  <Sparkles className="h-3 w-3" /> PAGE GUIDE & INSTRUCTIONS
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                  {title}
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  {subtitle}
                </p>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step-by-Step Instructions List */}
            <div className="space-y-4">
              {steps.map((s, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="h-7 w-7 rounded-xl bg-[#10B981] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {s.number || `0${idx + 1}`}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-slate-900">{s.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-normal">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action CTA Button */}
            <div className="pt-2">
              <button
                onClick={handleClose}
                className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Got It, Start Using</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
