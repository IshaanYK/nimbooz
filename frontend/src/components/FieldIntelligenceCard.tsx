"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Sun, CloudRain, Thermometer, Droplets, Wind, ShieldAlert, Sparkles, Layers, Activity } from "lucide-react";
import { DataBadge } from "./DataBadge";

export const FieldIntelligenceCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "weather" | "stress" | "stage">("overview");

  return (
    <section className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 font-sans">
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DataBadge type="LIVE_METEOBLUE" />
          <DataBadge type="LIVE_CEHUB" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black font-display text-[#10241F]">
          Field Intelligence & Weather Telemetry
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-normal">
          Real-time field context combining satellite vegetation, Meteoblue telemetry, and CE Hub crop growth stage.
        </p>
      </div>

      {/* Main Field Card Container */}
      <div className="bg-white rounded-3xl border border-[#063B2D]/15 shadow-xl overflow-hidden">
        {/* Card Header & Sticky Tabs */}
        <div className="bg-[#063B2D] text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#20C98A]" />
              <h3 className="font-extrabold text-white text-lg font-display">ACTIVE REGISTERED FIELD · LIVE OVERWATCH</h3>
            </div>
            <span className="text-xs text-emerald-200 font-mono">Real-Time Satellite Overwatch • Flowering Stage • Live Microclimate</span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#10241F] p-1 rounded-xl text-xs border border-white/10">
            {[
              { id: "overview", label: "Overview" },
              { id: "weather", label: "Weather" },
              { id: "stress", label: "Stress Index" },
              { id: "stage", label: "Crop Stage" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === t.id
                    ? "bg-[#00A878] text-white font-black shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="p-6 sm:p-8 space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-[#F7F6EF] p-5 rounded-2xl border border-emerald-500/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-semibold">Night Heat Stress</span>
                  <DataBadge type="LIVE_CEHUB" size="sm" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-600">78%</span>
                  <span className="text-xs text-amber-700 font-extrabold uppercase">High Risk</span>
                </div>
                <p className="text-[11px] text-slate-600">Night temps 25.8°C for 3 consecutive nights.</p>
              </div>

              <div className="bg-[#F7F6EF] p-5 rounded-2xl border border-emerald-500/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-semibold">Soil Moisture (0-10cm)</span>
                  <DataBadge type="LIVE_METEOBLUE" size="sm" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#00A878]">76%</span>
                  <span className="text-xs text-[#00A878] font-bold">Optimal</span>
                </div>
                <p className="text-[11px] text-slate-600">Hydric balance favorable for pod set.</p>
              </div>

              <div className="bg-[#F7F6EF] p-5 rounded-2xl border border-emerald-500/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-semibold">Intervention Window</span>
                  <DataBadge type="MODELLED" size="sm" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">3 Days</span>
                  <span className="text-xs text-[#00A878] font-bold">Open Now</span>
                </div>
                <p className="text-[11px] text-slate-600">Apply Syngenta Stress Buster before Aug 14.</p>
              </div>
            </div>
          )}

          {activeTab === "weather" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Air Temp</span>
                <span className="text-lg font-black text-slate-900">35.2°C / 25.8°C</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Relative Humidity</span>
                <span className="text-lg font-black text-slate-900">68%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Wind Speed</span>
                <span className="text-lg font-black text-slate-900">12.4 km/h</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Precipitation (24h)</span>
                <span className="text-lg font-black text-[#00A878]">0 mm</span>
              </div>
            </div>
          )}

          {activeTab === "stress" && (
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldAlert className="h-4 w-4 text-amber-600" /> Heat Stress Accumulation Index
              </div>
              <p className="text-slate-700">
                Degree-hours above 22°C threshold: <strong>6.3 / 9.0</strong>. Flowers are sensitive to dark respiration sugar depletion.
              </p>
            </div>
          )}

          {activeTab === "stage" && (
            <div className="bg-[#DDF7EC] p-5 rounded-2xl border border-[#00A878]/30 text-xs space-y-2">
              <div className="font-bold text-[#063B2D] text-sm">Flowering & Early Pod Initiation (R2 Stage)</div>
              <p className="text-slate-700">
                Sown on June 15, 2026. Critical stage for foliage stress management and biostimulant response.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
