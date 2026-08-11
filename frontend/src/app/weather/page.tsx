"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { StressMetrics } from "@/components/StressMetrics";
import { InteractiveWeatherMap } from "@/components/InteractiveWeatherMap";
import { CloudSun, Thermometer, Droplets, Wind, ShieldAlert } from "lucide-react";

export default function WeatherPage() {
  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-[#00A878] uppercase bg-[#DDF7EC] px-3 py-1 rounded-full border border-[#00A878]/30">
              SUPPORTING INTELLIGENCE LAYER
            </span>
            <h1 className="text-3xl font-black font-display text-[#10241F] mt-2 flex items-center gap-2">
              <CloudSun className="h-7 w-7 text-[#00A878]" /> Field Weather & Thermal Sensors
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Real-time telemetry supporting AASRA's crop stage modeling and night heat risk forecasting.
            </p>
          </div>
        </div>

        {/* Sensor & Stress Telemetry */}
        <StressMetrics />

        {/* Weather Map */}
        <InteractiveWeatherMap />
      </div>
    </AppShell>
  );
}
