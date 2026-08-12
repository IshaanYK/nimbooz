"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { StressMetrics } from "@/components/StressMetrics";
import { InteractiveWeatherMap } from "@/components/InteractiveWeatherMap";
import { DataBadge } from "@/components/DataBadge";
import { getActiveField, FieldRecord } from "@/lib/fieldStore";
import { CloudSun, Sparkles, RefreshCw, Loader2, AlertCircle } from "lucide-react";

export default function WeatherPage() {
  const [activeField, setActiveField] = useState<FieldRecord | null>(null);
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-accent font-bold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> ATMOSPHERIC TELEMETRY NETWORK
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 tracking-tight">
              Micro-Climate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">
                Sensors &amp; Stress Analysis.
              </span>
            </h1>
            {activeField && (
              <p className="text-sm text-slate-600 max-w-xl font-body">
                Active field:{" "}
                <strong className="text-slate-800">{activeField.name}</strong> ·{" "}
                <span className="font-mono text-xs">
                  {activeField.crop} · {activeField.center[0].toFixed(4)}°N,{" "}
                  {activeField.center[1].toFixed(4)}°E
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 font-accent">
            {weatherData?.is_demo && (
              <DataBadge type="DEMO" customText="DEMO DATA" />
            )}
            {!weatherData?.is_demo && weatherData && (
              <DataBadge type="LIVE_METEOBLUE" customText="METEOBLUE + CE HUB" />
            )}
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
              {lastFetched ? `Updated ${lastFetched}` : "Refresh"}
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
                Retry
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
              Calling Meteoblue NEMSGLOBAL + Syngenta CE Hub
            </p>
          </div>
        )}

        {/* Sensor & Stress Telemetry — only show when data is ready */}
        {!loading && !error && weatherData && (
          <>
            {/* Demo banner */}
            {weatherData.is_demo && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Demo Mode:</strong> API keys not configured. Showing representative agricultural
                  data. Add METEOBLUE_API_KEY and CEHUB_API_KEY environment variables for live data.
                </span>
              </div>
            )}

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
                  {weatherData.data_sources?.meteoblue === "live" ? "⬤ Live Meteoblue" : "⬤ Demo Data"}
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

        {/* Weather Map */}
        <div className="bg-white p-3 border border-slate-200 rounded-3xl shadow-sm">
          <InteractiveWeatherMap
            lat={activeField?.center[0]}
            lon={activeField?.center[1]}
            crop={activeField?.crop}
            onFieldSelected={handleFieldSelected}
          />
        </div>
      </div>
    </AppShell>
  );
}
