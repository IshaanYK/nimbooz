"use client";

import React, { useState } from "react";
import { MapPin, Layers, Sparkles, Sun, Droplets, ShieldAlert, CheckCircle2, Zap, Info } from "lucide-react";

interface FieldMapProps {
  crop: string;
  fieldAreaHa: number;
  onSelectZone?: (zone: string) => void;
}

export const OneSoilFieldMap: React.FC<FieldMapProps> = ({
  crop,
  fieldAreaHa,
  onSelectZone,
}) => {
  const [activeLayer, setActiveLayer] = useState<"ndvi" | "moisture" | "stress">("ndvi");
  const [selectedPin, setSelectedPin] = useState<string | null>("stress_node");

  const pins = [
    {
      id: "stress_node",
      x: "48%",
      y: "38%",
      title: "Night Heat Stress Alert",
      status: "WARNING",
      color: "bg-amber-500",
      desc: "Night temp: 25.8°C (Stress Score 6.3/9). Syngenta Stress Buster recommended.",
      action: "Apply Stress Buster (500 ml/ha)",
    },
    {
      id: "moisture_sensor",
      x: "28%",
      y: "62%",
      title: "Soil Moisture Sensor #1",
      status: "OPTIMAL",
      color: "bg-emerald-500",
      desc: "Soil moisture at 79%. Hydric status normal (CE Hub Code: ResLegHighSoilMoisture).",
      action: "No irrigation needed",
    },
    {
      id: "weather_station",
      x: "72%",
      y: "52%",
      title: "Meteoblue Weather Station",
      status: "LIVE",
      color: "bg-sky-500",
      desc: "35.1°C Max Temp. Next spray window: Aug 13–14 (Low wind, RH 68%).",
      action: "Optimal Spray Window Open",
    },
  ];

  const activePinObj = pins.find((p) => p.id === selectedPin);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-emerald-500/30 bg-[#08131e] shadow-2xl flex flex-col justify-between p-4 sm:p-6">
      {/* Top Map Controls Bar */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
            OneSoil Field Map (GIS Satellite View)
          </span>
          <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
            {crop.toUpperCase()} • {fieldAreaHa} ha
          </span>
        </div>

        {/* Layer Switcher (NDVI / Soil Moisture / Heat Stress) */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <Layers className="h-3.5 w-3.5 text-emerald-400 ml-1.5 mr-0.5" />
          {[
            { id: "ndvi", label: "NDVI Vegetation" },
            { id: "moisture", label: "Soil Moisture" },
            { id: "stress", label: "Heat Stress Map" },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(l.id as any)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeLayer === l.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Map Representation */}
      <div className="absolute inset-0 z-0">
        {/* Layer-dependent background styling */}
        <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <defs>
            {/* NDVI Gradients */}
            <linearGradient id="ndviGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#052e16" />
              <stop offset="40%" stopColor="#14532d" />
              <stop offset="70%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <radialGradient id="stressGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.4)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
            </radialGradient>
          </defs>

          {/* Grid lines */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Polygon Field Boundary (Bhopal Field shape) */}
          <polygon
            points="200,120 780,100 860,480 340,520 180,380"
            fill={activeLayer === "stress" ? "url(#stressGlow)" : "url(#ndviGrad)"}
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="transition-all duration-700"
          />

          {/* Soil Management Sub-Zone Contours */}
          <path
            d="M 240 200 C 400 160, 600 240, 760 180 C 800 300, 680 440, 480 460 Z"
            fill="rgba(16, 185, 129, 0.15)"
            stroke="rgba(52, 211, 153, 0.3)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Interactive Map Pins */}
        {pins.map((pin) => (
          <button
            key={pin.id}
            onClick={() => setSelectedPin(pin.id)}
            style={{ left: pin.x, top: pin.y }}
            className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer group ${
              selectedPin === pin.id ? "scale-125 z-30" : "hover:scale-110"
            }`}
          >
            <div className={`h-8 w-8 rounded-full ${pin.color} text-slate-950 flex items-center justify-center shadow-lg shadow-black/50 border-2 border-white animate-bounce`}>
              <MapPin className="h-4 w-4" />
            </div>
            <span className="absolute left-1/2 -translate-x-1/2 top-9 whitespace-nowrap bg-slate-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 shadow-md">
              {pin.title}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom Floating Telemetry Panel (OneSoil Style) */}
      <div className="z-10 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        {activePinObj ? (
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-xl ${activePinObj.color} text-slate-950 font-bold flex items-center justify-center shrink-0`}>
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{activePinObj.title}</h4>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {activePinObj.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{activePinObj.desc}</p>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Select any pin on the field map to view live telemetry.</div>
        )}

        {/* Quick Action Button */}
        {activePinObj && (
          <button
            onClick={() => {
              const chatEl = document.getElementById("chat-input");
              if (chatEl) chatEl.focus();
            }}
            className="w-full md:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Zap className="h-3.5 w-3.5" />
            {activePinObj.action}
          </button>
        )}
      </div>
    </div>
  );
};
