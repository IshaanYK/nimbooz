"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { StressMetrics } from "@/components/StressMetrics";
import { InteractiveWeatherMap } from "@/components/InteractiveWeatherMap";
import { CloudSun, Thermometer, Droplets, Wind, ShieldAlert, Sparkles } from "lucide-react";

export default function WeatherPage() {
  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8 bg-slate-50 text-slate-900 font-body">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-accent font-bold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> ATMOSPHERIC TELEMETRY NETWORK
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 tracking-tight">
              Micro-Climate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">
                Sensors & Radar.
              </span>
            </h1>
            <p className="text-sm text-slate-600 max-w-xl font-body">
              Real-time atmospheric telemetry supporting AASRA's crop stage modeling and 3-day night heat risk forecasting.
            </p>
          </div>

          <div className="flex items-center gap-3 font-accent">
            <span className="px-4 py-2 rounded-full bg-white text-emerald-700 text-xs font-bold border border-slate-200 shadow-sm">
              OPEN-METEO 100% ONLINE
            </span>
          </div>
        </div>

        {/* Sensor & Stress Telemetry */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <StressMetrics />
        </div>

        {/* Weather Map */}
        <div className="bg-white p-3 border border-slate-200 rounded-3xl shadow-sm">
          <InteractiveWeatherMap />
        </div>
      </div>
    </AppShell>
  );
}
