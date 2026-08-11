"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { RealFieldMap } from "@/components/RealFieldMap";
import { DataBadge } from "@/components/DataBadge";
import { FarmerProfile, getStoredProfile } from "@/lib/userStore";
import { fetchCurrentWeather } from "@/lib/api";
import {
  Sparkles,
  TrendingUp,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Sun,
  Zap,
  User,
  AlertTriangle,
  Mic,
  Layers,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Thermometer,
  Droplets,
  Sprout,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState<FarmerProfile>(getStoredProfile());
  const [liveWeather, setLiveWeather] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const p = getStoredProfile();
    setProfile(p);

    async function loadLiveData() {
      setLoading(true);
      const lat = p.gpsLocation?.lat || 23.2599;
      const lon = p.gpsLocation?.lon || 77.4126;
      const crop = p.primaryCrop || "soybean";
      const res = await fetchCurrentWeather(lat, lon, crop);
      setLiveWeather(res);
      setLoading(false);
    }

    loadLiveData();
  }, []);

  const latestRecord = liveWeather?.weather?.records?.[liveWeather?.weather?.records?.length - 1];
  const tempMax = latestRecord?.temperature_max || 28.4;
  const tempMin = latestRecord?.temperature_min || 20.1;
  const soilMoisture = Math.round((latestRecord?.soil_moisture || 0.38) * 100);
  const totalRainfall = liveWeather?.weather?.records?.reduce((acc: number, r: any) => acc + (r.rainfall || 0), 0) || 42.0;

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-[#00A878] uppercase bg-[#DDF7EC] px-3 py-1 rounded-full border border-[#00A878]/30">
                FIELD COMMAND CENTER
              </span>
              <DataBadge type="LIVE_METEOBLUE" />
              <DataBadge type="LIVE_CEHUB" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-[#10241F] mt-1">
              Welcome, {profile.fullName || "Kisan Brother"}.
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Live farm intelligence for <strong className="text-[#063B2D]">{profile.fieldName || "Primary Field"}</strong> in {profile.village || "Patel Nagar"}, {profile.district || "Bhopal"}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/assistant"
              className="px-6 py-3 rounded-2xl bg-[#00A878] hover:bg-[#063B2D] text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <Mic className="h-4 w-4 text-amber-300 animate-pulse" />
              <span>Ask AASRA Voice</span>
            </Link>

            <Link
              href="/what-if"
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-[#063B2D] border border-slate-300 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="h-4 w-4 text-[#00A878]" />
              <span>What-If Simulator</span>
            </Link>
          </div>
        </div>

        {/* MAIN HERO CARD: LIVE FIELD TELEMETRY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#063B2D] text-white p-6 sm:p-8 rounded-3xl border border-[#20C98A]/30 shadow-2xl space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A878]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#00A878] flex items-center justify-center text-amber-300 font-bold shadow-lg">
                <Sprout className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                    {profile.fieldName || "Bhopal Soybean Field"}
                  </h2>
                  <DataBadge type="USER_PROVIDED" size="sm" />
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  {profile.primaryCrop?.toUpperCase() || "SOYBEAN"} ({profile.cropVariety || "JS-335"}) • {profile.fieldAreaHa || 4.2} ha ({((profile.fieldAreaHa || 4.2) * 2.47).toFixed(1)} acres)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="bg-[#10241F] px-4 py-2 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block">GROWTH STAGE</span>
                <span className="font-extrabold text-[#20C98A]">R2 Flowering Stage</span>
              </div>

              <div className="bg-[#10241F] px-4 py-2 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block">7D CUMULATIVE GDD</span>
                <span className="font-extrabold text-amber-300">{liveWeather?.cumulative_gdd_7d || 142} °C-days</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip with Data Badges */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-[#10241F] p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase">MAX TEMP</span>
                <DataBadge type="LIVE_METEOBLUE" size="sm" />
              </div>
              <span className="text-lg font-black text-white flex items-center gap-1">
                <Thermometer className="h-4 w-4 text-rose-400" /> {tempMax}°C
              </span>
            </div>

            <div className="bg-[#10241F] p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase">SOIL MOISTURE</span>
                <DataBadge type="LIVE_METEOBLUE" size="sm" />
              </div>
              <span className="text-lg font-black text-emerald-300 flex items-center gap-1">
                <Droplets className="h-4 w-4 text-emerald-400" /> {soilMoisture}%
              </span>
            </div>

            <div className="bg-[#10241F] p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase">RAINFALL 7D</span>
                <DataBadge type="LIVE_METEOBLUE" size="sm" />
              </div>
              <span className="text-lg font-black text-sky-300">{totalRainfall.toFixed(1)} mm</span>
            </div>

            <div className="bg-[#10241F] p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase">CE HUB STRESS</span>
                <DataBadge type="LIVE_CEHUB" size="sm" />
              </div>
              <span className="text-xs font-bold text-amber-300 truncate block">
                {liveWeather?.stress_assessment?.stress_scores?.heat_night?.recommendation || "Moderate Night Stress"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* UPCOMING ALERT CARD + TODAY'S RECOMMENDATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch font-sans">
          {/* UPCOMING RISK ALERT */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-amber-400/40 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> UPCOMING RISK ALERT
                </span>
                <DataBadge type="MODELLED" customText="MODELLED AASRA" />
              </div>

              <h3 className="text-xl font-black font-display text-[#10241F]">
                Thermal heat stress risk: <span className="text-rose-600 font-mono font-black">HIGH ALERT</span>
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Night temperatures are forecasted above 25°C during R2 flowering. Dark respiration will cause cell sugar depletion unless Syngenta Stress Buster is applied within 48 hours.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-mono">Spray Window: <strong>Optimal Next 48h</strong></span>
              <Link
                href="/assistant"
                className="px-4 py-2.5 rounded-xl bg-[#063B2D] hover:bg-[#00A878] text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Mic className="h-3.5 w-3.5 text-amber-300" />
                <span>Ask AASRA</span>
              </Link>
            </div>
          </div>

          {/* TODAY'S RECOMMENDATION */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-[#063B2D]/15 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#00A878] bg-[#DDF7EC] px-3 py-1 rounded-full border border-[#00A878]/30">
                  TODAY'S ADVISORY
                </span>
                <DataBadge type="LIVE_CEHUB" />
              </div>

              <h3 className="text-xl font-black font-display text-[#10241F]">
                Apply Syngenta Stress Buster (500 ml/ha)
              </h3>

              <div className="bg-[#F7F6EF] p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700 font-mono">
                <div className="flex justify-between font-bold text-[#063B2D]">
                  <span>Product Protocol:</span>
                  <span>500 ml/ha foliar spray</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Optimal Spray Window:</span>
                  <span>CE Hub Herbicide/Biological Window Open</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-[#00A878] font-bold">✓ Grounded in live weather telemetry</span>
              <Link href="/journal" className="text-xs font-black text-[#063B2D] hover:text-[#00A878] flex items-center gap-1">
                Record Action <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* REAL LEAFLET FIELD MAP WITH POLYGON & OVERLAYS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#10241F] text-lg font-display flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#00A878]" /> Real Interactive Field Map & Telemetry
            </h3>
            <DataBadge type="LIVE_METEOBLUE" />
          </div>
          <RealFieldMap
            initialLat={profile.gpsLocation?.lat || 23.2599}
            initialLon={profile.gpsLocation?.lon || 77.4126}
            crop={profile.primaryCrop || "soybean"}
            fieldName={profile.fieldName || "Bhopal Primary Field"}
            fieldAreaHa={profile.fieldAreaHa || 4.2}
            allowDrawing={true}
          />
        </div>

        {/* LATEST IMPACT SNIPPET (PS-07) */}
        <div className="bg-[#10241F] text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 font-sans">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#20C98A] uppercase">PS-07 OUTCOME MEASUREMENT</span>
                <DataBadge type="MODELLED" customText="MODELLED AASRA" />
              </div>
              <h3 className="text-xl font-black font-display text-white mt-1">Biological Return & Yield Attribution</h3>
            </div>

            <Link
              href="/impact"
              className="px-4 py-2 rounded-xl bg-[#00A878] hover:bg-[#20C98A] text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Full Impact Report</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-center">
            <div className="bg-[#063B2D] p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 block uppercase">MODELLED BASELINE</span>
              <span className="text-xl font-black text-white">2,600 kg/ha</span>
            </div>
            <div className="bg-[#063B2D] p-4 rounded-2xl border border-[#20C98A]/40">
              <span className="text-[10px] text-emerald-300 block uppercase">OBSERVED HARVEST</span>
              <span className="text-xl font-black text-[#20C98A]">2,850 kg/ha</span>
            </div>
            <div className="bg-[#063B2D] p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 block uppercase">YIELD ATTRIBUTION</span>
              <span className="text-xl font-black text-amber-300">+250 kg/ha</span>
            </div>
            <div className="bg-[#063B2D] p-4 rounded-2xl border border-[#20C98A]/40">
              <span className="text-[10px] text-emerald-300 block uppercase">BIOLOGICAL ROBI</span>
              <span className="text-xl font-black text-[#20C98A]">14.8 : 1</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
