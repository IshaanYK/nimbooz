"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { AdvisoryChat } from "@/components/AdvisoryChat";
import { DataBadge } from "@/components/DataBadge";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { getTranslation } from "@/lib/translations";
import { getActiveField } from "@/lib/fieldStore";
import { Mic, Thermometer, RefreshCw, AlertTriangle } from "lucide-react";

export default function AssistantPage() {
  const { language } = useLanguage();
  const { weather, refetch } = useWeather();
  const activeField = getActiveField();

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                MULTILINGUAL VOICE & VISION ENGINE
              </span>
              <DataBadge type="AI_GENERATED" customText="GOOGLE CHIRP 3 & GEMINI 2.0" />
            </div>
            <h1 className="text-3xl font-black font-display text-slate-900 mt-1 flex items-center gap-2">
              <Mic className="h-7 w-7 text-amber-500" />
              {language === "hi" ? "आसरा AI वॉयस और पत्ती स्कैनर" : "Ask AASRA Voice AI & Leaf Scanner"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Speak in any Indian language or upload leaf photos for instant Gemini AI diagnosis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Multilingual AI Voice Chat & Leaf Scanner (2 Cols) */}
          <div className="lg:col-span-2 stripe-card p-6">
            <AdvisoryChat currentField={activeField.name} crop={activeField.crop} />
          </div>

          {/* Live Telemetry & Heat Stress Sidebar (1 Col) */}
          <div className="space-y-6">
            <div className="stripe-card p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 font-display flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-rose-500" />
                  Live Field Telemetry
                </h3>
                <button onClick={refetch} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Active Field:</span>
                  <span className="font-bold text-slate-900">{activeField.name} ({activeField.crop})</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Air Temperature:</span>
                  <span className="font-bold text-rose-600">{weather.temperature}°C</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Soil Moisture:</span>
                  <span className="font-bold text-emerald-600">{weather.soilMoistureEst}% Index</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Wind Speed:</span>
                  <span className="font-bold text-slate-800">{weather.windSpeed} km/h</span>
                </div>
              </div>

              {weather.isNightHeatStress && (
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-900 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                    Heat Stress Risk: {weather.heatStressPercent}%
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Night temp &gt; 25°C threshold during flowering. Syngenta Stress Buster application advised.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
