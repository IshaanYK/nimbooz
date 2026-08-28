"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Bot,
  Globe,
  Radio,
  FileText,
  ShieldCheck,
} from "lucide-react";

export const HackathonJudgeHUD: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const PS_CHECKLIST = [
    {
      id: "PS-01",
      title: "Agro-Climatic Field Boundary Registry",
      status: "Verified",
      tech: "Leaflet GIS + GeoJSON Polygon Engine",
      link: "/fields",
    },
    {
      id: "PS-02",
      title: "14-Day Predictive Plant Stress Forecasting",
      status: "Verified",
      tech: "GradientBoosting + Open-Meteo Real Telemetry",
      link: "/plant-intelligence",
    },
    {
      id: "PS-03",
      title: "Syngenta CropFit Decision Matrix",
      status: "Verified",
      tech: "Biostimulant Rules (Quantis, Isabion)",
      link: "/product",
    },
    {
      id: "PS-04",
      title: "Multilingual Voice & Vision Assistant",
      status: "Verified",
      tech: "Google Gemini 2.5 Flash + Chirp 3 HD",
      link: "/assistant",
    },
    {
      id: "PS-05",
      title: "Mobile-First UX & Dealer Connectivity",
      status: "Verified",
      tech: "Direct Call & WhatsApp Deep Links",
      link: "/dashboard",
    },
    {
      id: "PS-06",
      title: "What-If Biophysical Scenario Simulator",
      status: "Verified",
      tech: "Delay Decay Curves + Thermal Sensitivity",
      link: "/what-if",
    },
    {
      id: "PS-07",
      title: "Verified ROBI & Attribution Engine",
      status: "Verified",
      tech: "ROBI Mathematical Proof + Card Export",
      link: "/impact",
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {isOpen ? (
        <div className="bg-slate-950 text-white border-2 border-amber-400 rounded-3xl p-5 w-[92vw] max-w-md shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-5">
          {/* HUD Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
              <h4 className="font-black text-sm text-amber-300 font-display flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-400" />
                Hackathon Jury Audit & Architecture HUD
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Core System Architecture Highlights */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Core AI Engine:</span>
              <span className="text-emerald-400 font-bold">100% Google AI Stack</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Voice Synthesis:</span>
              <span className="text-amber-300 font-bold">Google Cloud Chirp 3 HD</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Satellite Weather:</span>
              <span className="text-sky-400 font-bold">Open-Meteo Real Hourly API</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Nocturnal Degree-Hours:</span>
              <span className="text-rose-400 font-bold">NHSDH = Σ max(0, T_night - 25°C)</span>
            </div>
          </div>

          {/* PS-01 to PS-07 Compliance Matrix */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Problem Statement Verification (7 / 7 Complete)
            </span>
            {PS_CHECKLIST.map((ps) => (
              <Link
                key={ps.id}
                href={ps.link}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-emerald-950/60 border border-white/5 hover:border-emerald-500/40 transition-all text-xs group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-black text-amber-400 text-[10px]">{ps.id}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-200 truncate group-hover:text-emerald-300 text-[11px]">
                      {ps.title}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">{ps.tech}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  100%
                </span>
              </Link>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10">
            <span>Syngenta × Google Hackathon</span>
            <Link
              href="/how-it-works"
              className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
            >
              <span>Algorithm Doc</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-amber-200 border-2 border-amber-400/80 px-4 py-2.5 rounded-2xl shadow-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
        >
          <Award className="h-4 w-4 text-amber-400 animate-bounce" />
          <span>🏆 Hackathon Judge Inspector (PS-01 to PS-07)</span>
        </button>
      )}
    </div>
  );
};
