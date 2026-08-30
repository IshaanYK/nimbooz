"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { checkBackendHealth } from "@/lib/api";
import { Activity, Server, ShieldCheck, Terminal, Cpu, Database, RefreshCw, Sparkles } from "lucide-react";

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
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8 theme-telemetry-speed font-sans">
        {/* Header with High-Tech Telemetry Speed Typography (Ref 2 Style) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/15 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2DC7FF]/15 border border-[#2DC7FF]/35 text-[#2DC7FF] text-xs font-telemetry font-bold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" /> SYSTEM TELEMETRY & DIAGNOSTICS // 06
            </div>
            <h1 className="text-3xl sm:text-5xl font-normal font-futuristic text-white tracking-tight uppercase">
              System Overwatch <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C98A] via-[#2DC7FF] to-purple-400">
                & Infrastructure.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-light max-w-xl font-telemetry">
              Real-time API health checks, Supabase PgBouncer pooler status, Google Cloud Speech AI telemetry, and system logs.
            </p>
          </div>

          <button
            onClick={verifyHealth}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00A878] to-[#2DC7FF] text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xl font-telemetry hover:scale-105"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>REFRESH HEALTH</span>
          </button>
        </div>

        {/* API Health Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono-code">
          <div className="glass-telemetry-card p-6 border border-emerald-400/30 space-y-2">
            <span className="text-slate-400 block text-[10px] uppercase">FASTAPI BACKEND (8000)</span>
            <span className={`text-lg font-bold ${backendOnline ? "text-emerald-400" : "text-amber-400"}`}>
              {backendOnline === null ? "CHECKING..." : backendOnline ? "✓ ONLINE (200 OK)" : "⚠ LOCAL FALLBACK MODE"}
            </span>
            <p className="text-[11px] text-slate-400 font-telemetry">Endpoint: http://localhost:8000/api/health</p>
          </div>

          <div className="glass-telemetry-card p-6 border border-cyan-400/30 space-y-2">
            <span className="text-slate-400 block text-[10px] uppercase">GOOGLE CLOUD CHIRP 3 SPEECH AI</span>
            <span className="text-lg font-bold text-[#2DC7FF]">READY (STT + TTS)</span>
            <p className="text-[11px] text-slate-400 font-telemetry">12 Dialects Operational</p>
          </div>

          <div className="glass-telemetry-card p-6 border border-purple-400/30 space-y-2">
            <span className="text-slate-400 block text-[10px] uppercase">PS-07 ATTRIBUTION MODEL</span>
            <span className="text-lg font-bold text-purple-300">DECOMPOSITION v2</span>
            <p className="text-[11px] text-slate-400 font-telemetry">Confidence Threshold: 71%</p>
          </div>
        </div>

        {/* System Logs Container */}
        <div className="glass-telemetry-card p-6 border border-white/20 space-y-4 font-mono-code">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-emerald-400 font-bold flex items-center gap-2">
              <Terminal className="h-4 w-4" /> SYSTEM TELEMETRY LOG STREAM
            </span>
            <span className="text-[10px] text-slate-400">TIMESTAMP: 2026-08-12T02:10:00Z</span>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-emerald-400">[INFO] Loaded farmer profile: Rajesh Sharma (Soybean 4.2 ha)</p>
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
