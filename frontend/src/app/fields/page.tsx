"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { InteractiveWeatherMap } from "@/components/InteractiveWeatherMap";
import { DataBadge } from "@/components/DataBadge";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { getTranslation } from "@/lib/translations";
import { getSavedFields, deleteFarmerField, setActiveField, FieldRecord } from "@/lib/fieldStore";
import { MapPin, Plus, Trash2, Layers, CheckCircle2, Sliders, Thermometer, Mic, Sparkles } from "lucide-react";

export default function MyFieldsPage() {
  const { language } = useLanguage();
  const { weather } = useWeather();
  const t = getTranslation(language);

  const [savedFields, setSavedFields] = useState<FieldRecord[]>(getSavedFields());
  const [activeField, setActiveFieldState] = useState<FieldRecord>(savedFields[0] || getSavedFields()[0]);

  useEffect(() => {
    const list = getSavedFields();
    setSavedFields(list);
    if (list.length > 0) setActiveFieldState(list[0]);
  }, []);

  const handleSelectField = (field: FieldRecord) => {
    setActiveFieldState(field);
    setActiveField(field.id);
  };

  const handleDeleteField = (fieldId: string) => {
    if (confirm("Are you sure you want to delete this field from your farm portfolio?")) {
      const updated = deleteFarmerField(fieldId);
      setSavedFields(updated);
      if (updated.length > 0) setActiveFieldState(updated[0]);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {t.farmPortfolioBadge}
              </span>
              <DataBadge type="USER_PROVIDED" customText="REGISTERED FIELDS" />
            </div>
            <h1 className="text-3xl font-black font-display text-slate-900 mt-1 flex items-center gap-2">
              <MapPin className="h-7 w-7 text-[#10B981]" />
              {t.myFieldsTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.myFieldsDesc}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
              {savedFields.length} {t.registeredFieldsCount}
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Satellite Map Component (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <InteractiveWeatherMap
              lat={activeField.center[0]}
              lon={activeField.center[1]}
              crop={activeField.crop}
              onFieldSelected={(f) => setActiveFieldState(f)}
            />
          </div>

          {/* Right Field List Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="stripe-card p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 font-display flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#10B981]" />
                  {t.registeredFarmFields}
                </h3>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {savedFields.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleSelectField(f)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      activeField.id === f.id
                        ? "bg-emerald-50/50 border-[#10B981] shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-slate-900">{f.name}</h4>
                        <span className="text-xs text-slate-500 font-mono">{f.crop} ({f.growthStage})</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                        {f.areaAcres} Acres
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono pt-1 text-slate-600">
                      <span>{t.healthScoreLabel}: <strong className="text-[#10B981]">{f.healthScore}%</strong></span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteField(f.id);
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Action CTAs */}
            <div className="stripe-card p-6 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900">{t.fieldCommandQuickLinks}</h4>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <Link
                  href="/assistant"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold flex flex-col items-center gap-1 text-center"
                >
                  <Mic className="h-5 w-5 text-amber-500" />
                  <span>{t.navAdvisory}</span>
                </Link>

                <Link
                  href="/impact"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold flex flex-col items-center gap-1 text-center"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                  <span>{t.robiProof}</span>
                </Link>
              </div>
            </div>

            {/* Plant Health AI Quick-Access */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 p-5 text-white border border-emerald-500/30">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">{t.plantStressEngineBadge}</span>
                </div>
                <h4 className="font-black text-white text-sm">{t.plantHealthAI}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.plantStressEngineDesc}
                </p>
                <Link
                  href="/plant-intelligence"
                  className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all"
                >
                  <span>{t.exploreEngine}</span>
                  <Sparkles className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Active Field Weather Summary */}
            <div className="stripe-card p-5 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-rose-500" />
                {t.liveFieldTelemetry}
              </h4>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold">TEMP</span>
                  <span className="text-base font-black text-slate-900 block">{weather.temperature}°C</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] text-emerald-700 font-bold">SOIL MOIST.</span>
                  <span className="text-base font-black text-emerald-800 block">{weather.soilMoistureEst}%</span>
                </div>
                <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 space-y-1">
                  <span className="text-[10px] text-sky-700 font-bold">RAIN (mm)</span>
                  <span className="text-base font-black text-sky-800 block">{weather.precipitation}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold">WIND km/h</span>
                  <span className="text-base font-black text-slate-900 block">{weather.windSpeed}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </AppShell>
  );
}
