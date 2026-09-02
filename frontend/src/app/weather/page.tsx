"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StressMetrics } from "@/components/StressMetrics";
import { DataBadge } from "@/components/DataBadge";
import { useWeather } from "@/context/WeatherContext";
import { useLanguage } from "@/context/LanguageContext";
import { getActiveField, FieldRecord } from "@/lib/fieldStore";
import { CloudSun, Sparkles, RefreshCw, Loader2, AlertCircle } from "lucide-react";

export default function WeatherPage() {
  const [activeField, setActiveField] = useState<FieldRecord | null>(null);
  const { weather, refetch } = useWeather();
  const { t } = useLanguage();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string>("");

  useEffect(() => {
    const field = getActiveField();
    setActiveField(field);
  }, []);

  const fetchWeatherData = async (field: FieldRecord) => {
    setLoading(true);
    setError(null);
    try {
      const lat = field.center[0];
      const lon = field.center[1];
      const crop = field.crop;

      const res = await fetch(
        `/api/weather/current?lat=${lat}&lon=${lon}&crop=${encodeURIComponent(crop)}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setWeatherData(data);
      setLastFetched(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } catch (err: any) {
      console.error("[WeatherPage] fetch error:", err);
      setError("Unable to fetch weather data. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeField) {
      fetchWeatherData(activeField);
    }
  }, [activeField]);

  const handleRefresh = () => {
    if (activeField) fetchWeatherData(activeField);
  };

  const handleFieldSelected = (field: FieldRecord) => {
    setActiveField(field);
  };

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8 bg-slate-50 text-slate-900 font-body">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-black text-sky-950 bg-sky-100 px-3 py-1 rounded-full border border-sky-300 flex items-center gap-1.5 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-sky-600 animate-ping" />
                PS-02: Live Satellite & Atmospheric Telemetry
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Open-Meteo Hourly Telemetry Stream
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 tracking-tight">
              Micro-Climate & Thermal Stress Overwatch
            </h1>
            {activeField && (
              <p className="text-sm text-slate-600 max-w-xl font-body">
                {t.activeFieldLabel}:{" "}
                <strong className="text-slate-800">{activeField.name}</strong> ·{" "}
                <span className="font-mono text-xs">
                  {activeField.crop} · {activeField.center[0].toFixed(4)}°N,{" "}
                  {activeField.center[1].toFixed(4)}°E
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 font-accent">
            <DataBadge type="LIVE_METEOBLUE" customText="OPEN-METEO + SATELLITE" />
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 rounded-full bg-white text-emerald-700 text-xs font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {lastFetched ? `Updated ${lastFetched}` : t.refreshLabel}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-900 text-sm">Data Fetch Error</h3>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
              >
                {t.retryLabel}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            <p className="text-sm text-slate-600 font-medium">
              Fetching live weather &amp; stress analysis for{" "}
              <strong>{activeField?.name ?? "your field"}</strong>...
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Calling Open-Meteo NEMSGLOBAL + Syngenta CE Hub
            </p>
          </div>
        )}

        {/* Sensor & Stress Telemetry — only show when data is ready */}
        {!loading && !error && weatherData && (
          <>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <StressMetrics
                stressData={weatherData.stress_assessment}
                hydricData={weatherData.hydric_stress_latest}
                sprayData={[]}
                plantingData={[]}
                crop={weatherData.crop}
              />
            </div>

            {/* Latest Conditions Summary */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <CloudSun className="h-5 w-5 text-amber-500" />
                  7-Day Conditions Summary
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  {weatherData.data_sources?.meteoblue === "live" ? "⬤ Live Open-Meteo" : "⬤ Real-Time Telemetry"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">MAX TEMP</span>
                  <span className="text-xl font-bold text-slate-900">
                    {weatherData.latest_conditions?.temperature_max?.toFixed(1)}°C
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">MIN TEMP</span>
                  <span className="text-xl font-bold text-rose-600">
                    {weatherData.latest_conditions?.temperature_min?.toFixed(1)}°C
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">7D RAINFALL</span>
                  <span className="text-xl font-bold text-blue-600">
                    {weatherData.latest_conditions?.rainfall_7d_mm} mm
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">SOIL MOISTURE</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {weatherData.latest_conditions?.soil_moisture_pct?.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* GDD */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 block text-[10px] font-bold">
                    CUMULATIVE GDD (7 DAYS — ENGINE)
                  </span>
                  <span className="text-xl font-bold text-emerald-900">
                    {weatherData.cumulative_gdd_7d?.engine_calculated} °C·d
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">
                    Crop: {weatherData.crop_label}
                  </span>
                </div>
                {weatherData.cumulative_gdd_7d?.cehub_reported > 0 && (
                  <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200">
                    <span className="text-sky-700 block text-[10px] font-bold">
                      CUMULATIVE GDD (CE HUB REPORTED)
                    </span>
                    <span className="text-xl font-bold text-sky-900">
                      {weatherData.cumulative_gdd_7d?.cehub_reported} °C·d
                    </span>
                    <span className="text-[10px] text-sky-600 block mt-0.5">
                      Source: {weatherData.data_sources?.cehub_gdd}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 14-Day AI Forecast CTA + Data Source Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* CTA: Plant Intelligence */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 p-5 text-white border border-emerald-500/30">
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">PS-02 ENGINE</span>
              </div>
              <h3 className="font-black text-white text-sm leading-tight">{t.runForecastCta}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.runForecastDesc}
              </p>
              <Link href="/plant-intelligence" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all">
                <span>{t.launchPlantIntelligence}</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Data Source Legend */}
          <div className="stripe-card p-5 space-y-4 rounded-2xl">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">{t.dataSourceArchitecture}</h3>
            <div className="space-y-2.5 text-xs font-mono">
              {[
                { dot: "bg-sky-500",     src: "Meteoblue NEMSGLOBAL",      desc: "Temperature, Precipitation, ET, ERA5 Reanalysis (7km global grid)" },
                { dot: "bg-emerald-500", src: "Syngenta CE Hub API",       desc: "GDD accumulation, Hydric Stress, Spray/Planting windows, Disease Risk" },
                { dot: "bg-amber-500",   src: "Open-Meteo (Dashboard)",    desc: "Real-time air temp, soil moisture, wind speed — used in header telemetry" },
                { dot: "bg-purple-500",  src: "SHAP TreeExplainer (PS-02)",desc: "Feature attribution explaining which sensor drives each stress prediction" },
              ].map(({ dot, src, desc }) => (
                <div key={src} className="flex items-start gap-2">
                  <span className={`mt-1 h-2 w-2 rounded-full ${dot} shrink-0`} />
                  <div>
                    <span className="font-bold text-slate-900 block">{src}</span>
                    <span className="text-[10px] text-slate-500 font-sans">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
