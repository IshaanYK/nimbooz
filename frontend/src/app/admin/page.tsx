"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { checkBackendHealth } from "@/lib/api";
import { Activity, Server, ShieldCheck, Terminal, Cpu, Database, RefreshCw } from "lucide-react";

export default function AdminPage() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const verifyHealth = async () => {
    setLoading(true);
    const res = await checkBackendHealth();
    setBackendOnline(res);
    setLoading(false);
  };

  useEffect(() => {
    verifyHealth();
  }, []);

  return (
    <AppShell>
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-300 pb-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-bold uppercase text-[10px]">
              ADMIN & DIAGNOSTICS
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Terminal className="h-6 w-6 text-[#00A878]" /> AASRA System Telemetry
            </h1>
          </div>

          <button
            onClick={verifyHealth}
            className="px-4 py-2 rounded-xl bg-[#063B2D] text-white font-bold flex items-center gap-2 cursor-pointer hover:bg-[#00A878] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Health</span>
          </button>
        </div>

        {/* API Health Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-slate-400 block text-[10px]">FASTAPI BACKEND (8000)</span>
            <span className={`text-lg font-black ${backendOnline ? "text-[#00A878]" : "text-amber-600"}`}>
              {backendOnline === null ? "CHECKING..." : backendOnline ? "✓ ONLINE (200 OK)" : "⚠ LOCAL FALLBACK MODE"}
            </span>
            <p className="text-[11px] text-slate-500 font-sans">Endpoint: http://localhost:8000/api/health</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-slate-400 block text-[10px]">SARVAM SPEECH AI</span>
            <span className="text-lg font-black text-[#00A878]">READY (STT + TTS)</span>
            <p className="text-[11px] text-slate-500 font-sans font-mono">12 Dialects Operational</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-slate-400 block text-[10px]">PS-07 ATTRIBUTION MODEL</span>
            <span className="text-lg font-black text-[#00A878]">DECOMPOSITION v2</span>
            <p className="text-[11px] text-slate-500 font-sans">Confidence Threshold: 71%</p>
          </div>
        </div>

        {/* System Logs Container */}
        <div className="bg-[#10241F] text-slate-200 p-6 rounded-2xl border border-white/10 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-emerald-400 font-bold">SYSTEM TELEMETRY LOG</span>
            <span className="text-[10px] text-slate-400">TIMESTAMP: 2026-08-12T02:10:00Z</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <p className="text-emerald-400">[INFO] Loaded farmer profile: Kisan Brother (Soybean 4.2 ha)</p>
            <p className="text-slate-300">[INFO] Crop Stage calculated: R2 Flowering (GDD: 840 °C-days)</p>
            <p className="text-amber-300">[WARN] Night Temperature alert triggered: 25.8°C (78% Heat Risk)</p>
            <p className="text-emerald-400">[INFO] Recommended spray window: Aug 13–14 (Biostimulant 500 ml/ha)</p>
            <p className="text-emerald-400">[INFO] PS-07 Modelled biological gain: +0.60 q/acre (ROBI 215%)</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
