"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sliders,
  Clock,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Sprout,
  CheckCircle2,
  RotateCcw,
  Thermometer,
  Droplets,
  DollarSign,
  Layers,
  Sparkles,
  ChevronRight,
  Leaf,
  Activity,
  Flame,
  Wind,
  Sun,
  Compass,
  Play,
  Pause,
  Target,
  Camera,
  Scan,
  Split,
  Eye,
} from "lucide-react";
import { DataBadge } from "./DataBadge";
import { useFarm } from "@/context/FarmContext";
import {
  calculateYieldAttribution,
  calcDaytimeHeatStress,
  calcNighttimeHeatStress,
  calcDroughtRiskIndex,
  CROP_THRESHOLDS_DB,
  YieldDecompositionResult,
} from "@/lib/attributionEngine";
import { useWeather } from "@/context/WeatherContext";
import { useLanguage } from "@/context/LanguageContext";
import { getStoredProfile, FarmerProfile } from "@/lib/userStore";
import { BiologicalSimulationAnimation } from "./BiologicalSimulationAnimation";

export const WhatIfSimulator: React.FC = () => {
  const { weather, refetch } = useWeather();
  const { language } = useLanguage();
  const { activeFarm, farms, selectFarm } = useFarm();

  const [profile] = useState<FarmerProfile>(() => getStoredProfile() || {
    fullName: "Ishaan Sen",
    mobileNumber: "+91 98260 12345",
    district: "Bhopal",
    state: "Madhya Pradesh",
    village: "Phanda Kalan",
    fieldAreaAcres: 5.0,
    primaryCrop: "Soybean",
    cropVariety: "JS-9560 High Yield",
    sowingDate: "2024-06-25",
    soilType: "Black Clay Soil",
    irrigationType: "Drip / Rainfed",
    preferredCommunication: "WhatsApp & In-App Alerts",
    voiceResponsesEnabled: true,
    helpTopics: ["Heat Stress", "Pest Alerts"],
    dataConsent: true,
    language: "hi",
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    "delay" | "climate_shock" | "market_sensitivity" | "wind_drift" | "visualizer" | "comparison"
  >("delay");

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Core Simulation Telemetry
  // ──────────────────────────────────────────────────────────────────────────
  const [delayDays, setDelayDays] = useState<number>(0);
  const [dayTemp, setDayTemp] = useState<number>(weather.temperature > 0 ? weather.temperature : 32.0);
  const [nightTemp, setNightTemp] = useState<number>(weather.nightTemperature || 24.0);
  const [soilMoisture, setSoilMoisture] = useState<number>(weather.soilMoistureEst > 0 ? weather.soilMoistureEst : 44);
  const [marketPrice, setMarketPrice] = useState<number>(4600);
  const [sprayMethod, setSprayMethod] = useState<"tractor" | "knapsack" | "drone">("tractor");
  const [fieldArea, setFieldArea] = useState<number>(activeFarm.areaAcres || profile.fieldAreaAcres || 5.0);

  // Simulation Controls & Modes
  const [isDelayPlaying, setIsDelayPlaying] = useState<boolean>(false);
  const [isHeatwavePlaying, setIsHeatwavePlaying] = useState<boolean>(false);
  const [isMandiPlaying, setIsMandiPlaying] = useState<boolean>(false);
  const [thermalMode, setThermalMode] = useState<boolean>(false);
  const [splitSliderPos, setSplitSliderPos] = useState<number>(50);

  // 2D Wind Drift Canvas
  const [simWindSpeed, setSimWindSpeed] = useState<number>(weather.windSpeed > 0 ? weather.windSpeed : 10);
  const [simAmbientTemp, setSimAmbientTemp] = useState<number>(weather.temperature > 0 ? weather.temperature : 28.5);
  const windCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync with live weather
  useEffect(() => {
    if (activeFarm.areaAcres) setFieldArea(activeFarm.areaAcres);
    if (weather.temperature > 0 && !weather.isLoading) {
      setDayTemp(weather.temperature);
      setNightTemp(weather.nightTemperature || Math.max(18, weather.temperature - 5));
      setSoilMoisture(weather.soilMoistureEst);
      setSimWindSpeed(weather.windSpeed);
      setSimAmbientTemp(weather.temperature);
    }
  }, [activeFarm.areaAcres, weather.temperature, weather.nightTemperature, weather.soilMoistureEst, weather.windSpeed, weather.isLoading]);

  const sprayCost = useMemo(() => {
    if (sprayMethod === "knapsack") return 950;
    if (sprayMethod === "drone") return 1850;
    return 1280;
  }, [sprayMethod]);

  const resetToLive = () => {
    setDelayDays(0);
    setIsDelayPlaying(false);
    setIsHeatwavePlaying(false);
    setIsMandiPlaying(false);
    setThermalMode(false);
    setDayTemp(weather.temperature > 0 ? weather.temperature : 28.5);
    setNightTemp(weather.nightTemperature || 24.0);
    setSoilMoisture(weather.soilMoistureEst > 0 ? weather.soilMoistureEst : 44);
    setSimWindSpeed(weather.windSpeed > 0 ? weather.windSpeed : 10);
    setSimAmbientTemp(weather.temperature > 0 ? weather.temperature : 28.5);
    setMarketPrice(4600);
    setSprayMethod("tractor");
    setFieldArea(activeFarm.areaAcres || profile.fieldAreaAcres || 5.0);
    refetch();
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Automated Simulation Runners
  // ──────────────────────────────────────────────────────────────────────────

  // Simulation 1: Auto-Play Time-Lapse Loop
  useEffect(() => {
    if (!isDelayPlaying) return;
    const interval = setInterval(() => {
      setDelayDays((prev) => (prev >= 5 ? 0 : prev + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [isDelayPlaying]);

  // Simulation 2: Auto-Play Heatwave Loop
  useEffect(() => {
    if (!isHeatwavePlaying) return;
    let step = 0;
    const temps = [31.5, 34.0, 38.0, 42.0, 45.0, 39.0, 33.0];
    const nights = [22.0, 24.5, 27.5, 30.5, 33.5, 28.0, 23.0];
    const interval = setInterval(() => {
      step = (step + 1) % temps.length;
      setDayTemp(temps[step]);
      setNightTemp(nights[step]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isHeatwavePlaying]);

  // Simulation 3: Auto-Play Mandi Rate Volatility
  useEffect(() => {
    if (!isMandiPlaying) return;
    let step = 0;
    const prices = [3700, 4100, 4600, 4892, 5300, 5800, 6400, 4600];
    const interval = setInterval(() => {
      step = (step + 1) % prices.length;
      setMarketPrice(prices[step]);
    }, 1100);
    return () => clearInterval(interval);
  }, [isMandiPlaying]);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. 2D Wind Drift Canvas Engine
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "wind_drift") return;
    const canvas = windCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    interface Droplet {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }
    const droplets: Droplet[] = [];
    const maxDroplets = 80;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, "#f8fafc");
      skyGrad.addColorStop(1, "#eef2f6");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Boom Nozzle Bar
      ctx.fillStyle = "#334155";
      ctx.fillRect(20, 10, w - 40, 8);
      ctx.fillStyle = "#533afd";
      const nozzleCount = 6;
      for (let i = 0; i < nozzleCount; i++) {
        const nx = 40 + i * ((w - 80) / (nozzleCount - 1));
        ctx.beginPath();
        ctx.arc(nx, 20, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crop Canopy Leaves
      const canopyY = h - 28;
      ctx.fillStyle = "#15803d";
      for (let x = 15; x < w - 15; x += 18) {
        ctx.beginPath();
        ctx.ellipse(x, canopyY, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#854d0e";
      ctx.fillRect(0, h - 10, w, 10);

      // Wind Vector Lines
      const windForce = (simWindSpeed - 4) / 10;
      ctx.strokeStyle = "rgba(14, 165, 233, 0.35)";
      ctx.lineWidth = 1.5;
      for (let y = 45; y < h - 40; y += 35) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(w - 30, y);
        ctx.stroke();
      }

      // Spawn Droplets
      if (droplets.length < maxDroplets) {
        const randomNozzleIdx = Math.floor(Math.random() * nozzleCount);
        const nx = 40 + randomNozzleIdx * ((w - 80) / (nozzleCount - 1));
        droplets.push({
          x: nx + (Math.random() - 0.5) * 6,
          y: 24,
          vx: windForce * 2.6 + (Math.random() - 0.5) * 0.4,
          vy: 2.2 + Math.random() * 1.5,
          radius: 2.8,
          alpha: 0.9,
        });
      }

      // Update & Draw Droplets
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.x += d.vx;
        d.y += d.vy;

        if (simAmbientTemp > 32) {
          d.radius = Math.max(0.8, d.radius - 0.015);
          d.alpha = Math.max(0.1, d.alpha - 0.008);
        }

        const isOffTarget = d.x > w - 20 || d.x < 10;
        ctx.fillStyle = isOffTarget
          ? `rgba(239, 68, 68, ${d.alpha})`
          : `rgba(83, 58, 253, ${d.alpha})`;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();

        if (d.y >= canopyY || d.x > w || d.x < 0 || d.alpha <= 0.1) {
          droplets.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, simWindSpeed, simAmbientTemp]);

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Calculations
  // ──────────────────────────────────────────────────────────────────────────
  const activeCropName = activeFarm.primaryCrop || profile.primaryCrop || "Soybean";

  const baseAttribution: YieldDecompositionResult = useMemo(() => {
    return calculateYieldAttribution(
      activeCropName,
      dayTemp,
      soilMoisture,
      fieldArea,
      sprayCost,
      nightTemp,
      dayTemp
    );
  }, [activeCropName, dayTemp, nightTemp, soilMoisture, fieldArea, sprayCost]);

  const decayFactor = useMemo(() => {
    if (delayDays === 0) return 1.0;
    if (delayDays === 1) return 0.76;
    if (delayDays === 2) return 0.45;
    if (delayDays === 3) return 0.22;
    if (delayDays === 4) return 0.12;
    return 0.08;
  }, [delayDays]);

  const bioGainQAc = Math.round(baseAttribution.biologicalGainQAc * decayFactor * 100) / 100;
  const expectedYieldQAc = Math.round(
    (baseAttribution.baselineYieldQAc +
      baseAttribution.thermalDeltaQAc +
      baseAttribution.soilMoistureDeltaQAc +
      baseAttribution.managementDeltaQAc +
      bioGainQAc) *
      100
  ) / 100;

  const unmanagedYieldQAc = Math.round(
    (baseAttribution.baselineYieldQAc +
      baseAttribution.thermalDeltaQAc +
      baseAttribution.soilMoistureDeltaQAc +
      baseAttribution.managementDeltaQAc) *
      100
  ) / 100;

  const grossReturnPerAcre = Math.round(bioGainQAc * marketPrice);
  const netProfitPerAcre = Math.max(0, grossReturnPerAcre - sprayCost);
  const totalFarmExtraIncome = Math.round(netProfitPerAcre * fieldArea);
  const totalFarmGrossValue = Math.round(grossReturnPerAcre * fieldArea);
  const totalInputCost = Math.round(sprayCost * fieldArea);

  // Pod retention and flower abortion percentages
  const podRetentionPct = Math.round(decayFactor * 98);
  const flowerAbortionRiskPct = Math.min(65, Math.round(12 + (1 - decayFactor) * 50));

  // Climate indices
  const normKey = activeCropName.toLowerCase();
  const cropThreshold = CROP_THRESHOLDS_DB[normKey] || CROP_THRESHOLDS_DB["soybean"];
  const hsiDay = calcDaytimeHeatStress(dayTemp, cropThreshold);
  const hsiNight = calcNighttimeHeatStress(nightTemp, cropThreshold);
  const droughtIndex = calcDroughtRiskIndex(0, soilMoisture < 35 ? 6.5 : 3.0);

  // Wind drift calculations
  const dropletDriftLossPct = useMemo(() => {
    if (simWindSpeed <= 6) return 3;
    if (simWindSpeed <= 12) return Math.round(3 + (simWindSpeed - 6) * 1.5);
    return Math.min(55, Math.round(12 + Math.pow(simWindSpeed - 12, 1.45) * 4));
  }, [simWindSpeed]);

  const canopyPenetrationPct = Math.max(35, Math.round(95 - dropletDriftLossPct * 0.9 - (simAmbientTemp > 33 ? 12 : 0)));

  return (
    <section className="space-y-8 font-sans text-slate-900">
      
      {/* ───────────────────────────────────────────────────────────────────
          1. INTERACTIVE VISUAL NAVIGATION BAR (STRIPE PILLS)
         ─────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#e3e8ee]">
        <button
          type="button"
          onClick={() => setActiveTab("delay")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "delay"
              ? "bg-[#533afd] text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-[#0d253d] hover:bg-[#f6f9fc] border border-[#e3e8ee]"
          }`}
        >
          <Camera className="h-3.5 w-3.5" />
          <span>📸 Visual Delay & Crop Predictor</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">Core</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("climate_shock")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "climate_shock"
              ? "bg-[#533afd] text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-[#0d253d] hover:bg-[#f6f9fc] border border-[#e3e8ee]"
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>⚡ Climate Shock & Heatwave</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">New</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("market_sensitivity")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "market_sensitivity"
              ? "bg-[#533afd] text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-[#0d253d] hover:bg-[#f6f9fc] border border-[#e3e8ee]"
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>💰 Harvest Bags & Mandi Volatility</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">New</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("wind_drift")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "wind_drift"
              ? "bg-[#533afd] text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-[#0d253d] hover:bg-[#f6f9fc] border border-[#e3e8ee]"
          }`}
        >
          <Wind className="h-3.5 w-3.5" />
          <span>💨 2D Wind Drift Spray Physics</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">New</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("comparison")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "comparison"
              ? "bg-[#533afd] text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-[#0d253d] hover:bg-[#f6f9fc] border border-[#e3e8ee]"
          }`}
        >
          <Split className="h-3.5 w-3.5" />
          <span>⚖️ Side-by-Side Photo Split</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("visualizer")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "visualizer"
              ? "bg-[#533afd] text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-[#0d253d] hover:bg-[#f6f9fc] border border-[#e3e8ee]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>🎨 2D Cellular Bio-Canvas</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          TAB 1: VISUAL SPRAY DELAY & PHOTOGRAPHIC CROP HEALTH PREDICTOR
         ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "delay" && (
        <div className="space-y-6">
          
          {/* Main Visual Image Predictor HUD */}
          <div className="relative rounded-3xl overflow-hidden border border-[#e3e8ee] shadow-lg bg-slate-950">
            <div className="relative w-full h-[320px] sm:h-[460px] overflow-hidden select-none">
              
              {/* Healthy Crop Base Photo */}
              <img
                src="/images/predictions/soybean_healthy_predicted.jpg"
                alt="Predicted Healthy Protected Soybean Crop"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  thermalMode ? "hue-rotate-180 contrast-150 saturate-200" : ""
                }`}
              />

              {/* Heat Stressed / Delayed Crop Photo (Cross-fades with delayDays: 0 = 0%, 5 = 100%) */}
              <div
                className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
                style={{
                  opacity:
                    delayDays === 0
                      ? 0
                      : delayDays === 1
                      ? 0.28
                      : delayDays === 2
                      ? 0.55
                      : delayDays === 3
                      ? 0.78
                      : delayDays === 4
                      ? 0.92
                      : 1.0,
                }}
              >
                <img
                  src="/images/predictions/soybean_stressed_predicted.jpg"
                  alt="Predicted Heat Stressed Crop"
                  className={`w-full h-full object-cover ${
                    thermalMode ? "hue-rotate-180 contrast-150 saturate-200" : ""
                  }`}
                />
              </div>

              {/* Simulated Ambient Heatwave Shimmer Overlay */}
              {delayDays > 1 && (
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-transparent to-rose-950/20 pointer-events-none mix-blend-overlay animate-pulse" />
              )}

              {/* Thermal Infrared Vision Scanlines */}
              {thermalMode && (
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              )}

              {/* Camera Header Bar */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-bold border border-white/20 flex items-center gap-2 shadow-sm">
                    <Camera className="h-3.5 w-3.5 text-emerald-400" />
                    <span>AI VISUAL PREDICTOR</span>
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-full backdrop-blur-md text-[11px] font-mono font-bold border shadow-sm transition-all ${
                      delayDays === 0
                        ? "bg-emerald-500/30 text-emerald-300 border-emerald-400/50"
                        : delayDays <= 2
                        ? "bg-amber-500/30 text-amber-300 border-amber-400/50"
                        : "bg-rose-500/40 text-rose-200 border-rose-400/50"
                    }`}
                  >
                    {delayDays === 0
                      ? "🟢 PREDICTED CROP: OPTIMAL CANOPY & 98% POD FILLING"
                      : delayDays <= 2
                      ? `🟡 PREDICTED CROP: +${delayDays}D DELAY (MODERATE CHLOROSIS)`
                      : `🔴 PREDICTED CROP: +${delayDays}D DELAY (SEVERE POD ABORTION)`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setThermalMode(!thermalMode)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md border shadow-md ${
                    thermalMode
                      ? "bg-rose-600 text-white border-rose-400"
                      : "bg-black/60 text-white hover:bg-black/80 border-white/30"
                  }`}
                >
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>{thermalMode ? "🔥 Thermal: ON" : "Thermal Scan"}</span>
                </button>
              </div>

              {/* Visual Diagnostic Reticles Directly on the Crop */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                
                {/* Pod Cluster Diagnostic */}
                <div
                  className={`absolute top-1/3 left-6 sm:left-1/4 border-2 rounded-2xl p-3 backdrop-blur-xs transition-all duration-500 max-w-xs ${
                    delayDays === 0
                      ? "border-emerald-400/90 bg-emerald-950/60 text-emerald-200 shadow-lg shadow-emerald-500/30"
                      : delayDays <= 2
                      ? "border-amber-400/90 bg-amber-950/60 text-amber-200 shadow-lg shadow-amber-500/30"
                      : "border-rose-400/90 bg-rose-950/70 text-rose-200 shadow-lg shadow-rose-500/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                    <Target className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {delayDays === 0
                        ? "Pod Viability: 98% (Protected)"
                        : delayDays <= 2
                        ? `Pod Retention: ${podRetentionPct}% (Stress Abortions)`
                        : `Pod Abortion: ${flowerAbortionRiskPct}% (Severe Loss)`}
                    </span>
                  </div>
                  <div className="text-[11px] opacity-85 mt-0.5 font-sans leading-tight">
                    {delayDays === 0
                      ? "Cellular osmolyte shield prevents flower drop."
                      : delayDays <= 2
                      ? "Accelerated respiration burning sugars."
                      : "Irreversible blossom drop and empty pods."}
                  </div>
                </div>

                {/* Leaf Surface Diagnostic */}
                <div
                  className={`absolute bottom-24 right-6 sm:right-16 border-2 rounded-2xl p-3 backdrop-blur-xs transition-all duration-500 max-w-xs ${
                    delayDays === 0
                      ? "border-emerald-400/80 bg-emerald-950/60 text-emerald-200"
                      : "border-rose-400/90 bg-rose-950/70 text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                    <Leaf className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {delayDays === 0
                        ? "Foliar Turgor: 100% Firm"
                        : "Chlorosis & Leaf Margin Burn"}
                    </span>
                  </div>
                  <div className="text-[11px] opacity-85 mt-0.5 font-sans leading-tight">
                    {delayDays === 0
                      ? "Photosystem II stabilized against heat."
                      : "Cellular dehydration and wilting."}
                  </div>
                </div>
              </div>

              {/* Bottom Visual Controller HUD */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-6 text-white space-y-3 z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                      VISUAL TIME-LAPSE SIMULATION CONTROLLER
                    </span>
                    <div className="text-lg sm:text-xl font-black font-display flex items-center gap-2 text-white">
                      <span>
                        {delayDays === 0
                          ? "Day 0: Optimal Harvest Secured"
                          : `+${delayDays} Days Delay: ${Math.round((1 - decayFactor) * 100)}% Visible Cellular Wilting`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDelayPlaying(!isDelayPlaying)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                      isDelayPlaying
                        ? "bg-amber-500 text-black hover:bg-amber-400"
                        : "bg-[#533afd] text-white hover:bg-indigo-600"
                    }`}
                  >
                    {isDelayPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{isDelayPlaying ? "Pause Visual Runner" : "▶ Run Visual Time-Lapse"}</span>
                  </button>
                </div>

                {/* Tactile Visual Delay Scrubber */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    value={delayDays}
                    onChange={(e) => setDelayDays(Number(e.target.value))}
                    className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 font-semibold">
                    <span className={delayDays === 0 ? "text-emerald-400 font-black" : ""}>Day 0 (Protected)</span>
                    <span className={delayDays === 1 ? "text-amber-300 font-bold" : ""}>+1 Day Delay</span>
                    <span className={delayDays === 2 ? "text-amber-400 font-bold" : ""}>+2 Days</span>
                    <span className={delayDays === 3 ? "text-orange-400 font-bold" : ""}>+3 Days</span>
                    <span className={delayDays === 4 ? "text-rose-400 font-bold" : ""}>+4 Days</span>
                    <span className={delayDays === 5 ? "text-rose-500 font-black" : ""}>+5 Days (Failure)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 2 Primary Farmer Outcome Badges (No Excess Numbers!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Visual Pod Viability Gauge */}
            <div className="bg-[#ffffff] border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Sprout className="h-4 w-4 text-[#533afd]" />
                  <span>Harvest Pod Retention</span>
                </span>
                <span className={`text-sm font-mono font-black ${podRetentionPct > 60 ? "text-emerald-700" : "text-rose-600"}`}>
                  {podRetentionPct}% Viable
                </span>
              </div>
              
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-[#e3e8ee]">
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${podRetentionPct}%` }}
                />
                <div
                  className="bg-rose-500 transition-all duration-500"
                  style={{ width: `${100 - podRetentionPct}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span className="text-emerald-700 font-bold">🟢 Protected Pods ({podRetentionPct}%)</span>
                <span className="text-rose-600 font-bold">🔴 Flower Drop ({100 - podRetentionPct}%)</span>
              </div>
            </div>

            {/* Farm Profit Outcome Banner */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-300 rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-900 uppercase">
                  Net Profit for {fieldArea} Acres ({profile.fullName || "Farmer"})
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-950">
                  +₹{totalFarmExtraIncome.toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-emerald-800 font-medium">
                  {delayDays === 0
                    ? "Maximum revenue protected with Day 0 timely spray."
                    : `Yield loss penalty of ₹${Math.round(
                        ((baseAttribution.biologicalGainQAc - bioGainQAc) * marketPrice * fieldArea)
                      ).toLocaleString("en-IN")} due to ${delayDays}-day delay.`}
                </p>
              </div>

              <ShieldCheck className="h-10 w-10 text-emerald-600 shrink-0" />
            </div>

          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          TAB 2: CLIMATE SHOCK & HEATWAVE VISUAL SIMULATOR
         ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "climate_shock" && (
        <div className="stripe-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3e8ee] pb-5">
            <div>
              <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider">
                EXTREME HEATWAVE WAVEFRONT
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display text-[#0d253d] mt-1 flex items-center gap-2">
                <Flame className="h-6 w-6 text-rose-500" />
                <span>Heatwave Thermal Stress Simulation</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Simulate an acute 72-hour heatwave (+8°C temperature surge) to see how Syngenta Quantis preserves cellular water retention.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsHeatwavePlaying(!isHeatwavePlaying)}
              className={`px-4 py-2.5 rounded-2xl font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                isHeatwavePlaying
                  ? "bg-rose-600 text-white border border-rose-700"
                  : "bg-[#533afd] text-white border border-[#4434d4]"
              }`}
            >
              {isHeatwavePlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isHeatwavePlaying ? "Pause Heat Wave" : "▶ Simulate 72-Hour Heatwave"}</span>
            </button>
          </div>

          {/* Visual Thermometer & Heat Dial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Visual Temperature Dial */}
            <div className="bg-[#f6f9fc] p-6 rounded-3xl border border-[#e3e8ee] space-y-3 text-center">
              <span className="text-xs font-mono font-bold text-slate-500 block">SIMULATED CANOPY TEMPERATURE</span>
              <div className={`text-4xl sm:text-5xl font-black font-mono ${dayTemp > 38 ? "text-rose-600 animate-pulse" : "text-[#0d253d]"}`}>
                {dayTemp.toFixed(1)}°C
              </div>
              <input
                type="range"
                min={24}
                max={46}
                step={0.5}
                value={dayTemp}
                onChange={(e) => setDayTemp(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Normal: 28°C</span>
                <span className="text-amber-600 font-bold">Stress Limit: 36°C</span>
                <span className="text-rose-600 font-bold">Severe: 44°C</span>
              </div>
            </div>

            {/* Visual Cellular Turgor Ring */}
            <div className="bg-[#f6f9fc] p-6 rounded-3xl border border-[#e3e8ee] space-y-3 text-center">
              <span className="text-xs font-mono font-bold text-slate-500 block">CELLULAR TURGOR PRESSURE</span>
              <div className={`text-4xl sm:text-5xl font-black font-mono ${dayTemp > 38 ? "text-amber-600" : "text-emerald-600"}`}>
                {Math.max(25, Math.round(95 - (dayTemp > 32 ? (dayTemp - 32) * 5 : 0)))}%
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {dayTemp > 38
                  ? "⚠️ Quantis osmoprotective prolines prevent severe chloroplast collapse."
                  : "✅ Healthy turgid cell walls supporting leaf transpiration."}
              </p>
            </div>

          </div>

          {/* Visual Photographic Comparison under Heatwave */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden border border-rose-300 relative shadow-sm">
              <img
                src="/images/predictions/soybean_stressed_predicted.jpg"
                alt="Untreated Heat Stressed Crop"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3 bg-rose-900/80 backdrop-blur-sm text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
                ✕ UNTREATED CONTROL (WITHOUT QUANTIS)
              </div>
              <div className="p-4 bg-rose-50/80 space-y-1">
                <h4 className="font-bold text-rose-950 text-xs">Severe Foliar Scorching & Abortion</h4>
                <p className="text-[11px] text-rose-800">
                  Excessive ROS oxidation leads to irreversible flower drop and empty pods.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-emerald-300 relative shadow-sm">
              <img
                src="/images/predictions/soybean_healthy_predicted.jpg"
                alt="Protected Crop with Quantis"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3 bg-emerald-900/80 backdrop-blur-sm text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
                ✓ PROTECTED WITH SYNGENTA QUANTIS
              </div>
              <div className="p-4 bg-emerald-50/80 space-y-1">
                <h4 className="font-bold text-emerald-950 text-xs">Preserved Photosystem & Osmoprotection</h4>
                <p className="text-[11px] text-emerald-800">
                  Osmolytes stabilize chloroplasts, safeguarding grain filling up to 42°C.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          TAB 3: HARVEST BAGS & APMC MANDI SENSITIVITY (VISUAL STACKER)
         ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "market_sensitivity" && (
        <div className="stripe-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3e8ee] pb-5">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
                VISUAL HARVEST YIELD STACKER
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display text-[#0d253d] mt-1 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-emerald-600" />
                <span>Visual Harvest Bags & Market Realization</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                See each quintal of your {fieldArea}-acre harvest as physical grain bags protected by biostimulant treatment.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsMandiPlaying(!isMandiPlaying)}
              className={`px-4 py-2.5 rounded-2xl font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                isMandiPlaying
                  ? "bg-emerald-600 text-white border border-emerald-700"
                  : "bg-[#533afd] text-white border border-[#4434d4]"
              }`}
            >
              {isMandiPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isMandiPlaying ? "Pause Volatility" : "▶ Simulate Mandi Cycles"}</span>
            </button>
          </div>

          {/* Mandi Rate Slider Knob */}
          <div className="bg-[#f6f9fc] p-6 rounded-3xl border border-[#e3e8ee] space-y-3">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-slate-600">Mandi Rate Scrubber:</span>
              <span className="text-emerald-700 text-base bg-white px-3.5 py-1 rounded-xl border border-[#e3e8ee]">
                ₹{marketPrice.toLocaleString("en-IN")} / Quintal
              </span>
            </div>
            <input
              type="range"
              min={3600}
              max={6500}
              step={50}
              value={marketPrice}
              onChange={(e) => setMarketPrice(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Low: ₹3,600/q</span>
              <span className="text-emerald-700 font-bold">Govt MSP: ₹4,892/q</span>
              <span>Peak: ₹6,500/q</span>
            </div>
          </div>

          {/* Visual Harvest Grain Bags Grid */}
          <div className="bg-white p-6 rounded-3xl border border-[#e3e8ee] space-y-4 shadow-sm">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h4 className="font-bold text-sm text-[#0d253d] flex items-center gap-2">
                <Sprout className="h-4 w-4 text-emerald-600" />
                <span>Harvest Grain Bags ({fieldArea} Acres Soybean):</span>
              </h4>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-md bg-emerald-500 inline-block" />
                  <span>Protected Harvest (42 Bags)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-md bg-rose-400 inline-block" />
                  <span>Saved by Quantis (+{(bioGainQAc * fieldArea).toFixed(1)} Bags)</span>
                </span>
              </div>
            </div>

            {/* Bag Icons Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2">
              {Array.from({ length: 42 }).map((_, i) => {
                const isBioSaved = i >= 35;
                return (
                  <div
                    key={i}
                    className={`h-12 rounded-xl border flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all ${
                      isBioSaved
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-xs animate-bounce"
                        : "bg-amber-100/70 text-amber-900 border-amber-300"
                    }`}
                    title={`Bag #${i + 1}: ${isBioSaved ? "Saved by Syngenta Quantis" : "Baseline Harvest"}`}
                  >
                    <span>🌾</span>
                    <span className="text-[9px]">1q</span>
                  </div>
                );
              })}
            </div>

            {/* Net Farm Realization */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-emerald-950">Total Season Extra Income ({fieldArea} Acres):</span>
              <span className="text-emerald-900 text-lg">
                +₹{totalFarmExtraIncome.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          TAB 4: 2D WIND DRIFT CANVAS PARTICLE SIMULATOR
         ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "wind_drift" && (
        <div className="stripe-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3e8ee] pb-5">
            <div>
              <span className="text-xs font-mono font-bold text-sky-600 uppercase tracking-wider">
                PHYSICS SIMULATION
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display text-[#0d253d] mt-1 flex items-center gap-2">
                <Wind className="h-6 w-6 text-sky-600" />
                <span>2D Wind Drift & Droplet Adhesion Simulator</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Live 60 FPS HTML5 canvas engine simulating tractor boom nozzles, crosswind drag, and foliage adhesion.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-4 py-2 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider border shadow-2xs ${
                  simWindSpeed > 18
                    ? "bg-rose-50 text-rose-950 border-rose-300"
                    : simWindSpeed > 12
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-emerald-50 text-emerald-900 border-emerald-300"
                }`}
              >
                {simWindSpeed > 18 ? "🚫 PROHIBITED: EXCESSIVE DRIFT" : simWindSpeed > 12 ? "⚠️ CAUTION: ELEVATED DRIFT" : "✅ OPTIMAL SPRAY WINDOW"}
              </span>
            </div>
          </div>

          {/* 2D Canvas */}
          <div className="rounded-3xl border border-[#e3e8ee] overflow-hidden shadow-inner bg-[#f8fafc] relative">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-white/90 text-[#0d253d] border border-[#e3e8ee] shadow-2xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                PHYSICS ENGINE · 60 FPS
              </span>
              <span className="text-[10px] font-mono text-slate-600 bg-white/90 px-2 py-1 rounded-lg border border-[#e3e8ee]">
                Wind Drag: {simWindSpeed} km/h
              </span>
            </div>

            <canvas
              ref={windCanvasRef}
              width={800}
              height={220}
              className="w-full h-52 block"
            />
          </div>

          {/* Wind Speed Scrubber */}
          <div className="bg-[#f6f9fc] p-6 rounded-3xl border border-[#e3e8ee] space-y-3">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-slate-600">Simulate Wind Speed:</span>
              <span className="text-sky-700 text-sm bg-white px-3.5 py-1 rounded-xl border border-[#e3e8ee]">
                {simWindSpeed} km/h
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={26}
              step={1}
              value={simWindSpeed}
              onChange={(e) => setSimWindSpeed(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <button
                type="button"
                onClick={() => setSimWindSpeed(4)}
                className="hover:text-emerald-700 font-bold cursor-pointer"
              >
                Calm (4 km/h)
              </button>
              <button
                type="button"
                onClick={() => setSimWindSpeed(12)}
                className="hover:text-amber-700 cursor-pointer"
              >
                Moderate (12 km/h)
              </button>
              <button
                type="button"
                onClick={() => setSimWindSpeed(24)}
                className="hover:text-rose-600 font-bold cursor-pointer"
              >
                Excessive (24 km/h)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          TAB 5: 2D CELLULAR BIO-CANVAS
         ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "visualizer" && (
        <div className="stripe-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[#e3e8ee] pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#533afd] uppercase tracking-wider">
                CANVAS PARTICLE ENGINE
              </span>
              <h3 className="font-extrabold text-base text-[#0d253d] font-display flex items-center gap-2 mt-0.5">
                <Sparkles className="h-5 w-5 text-[#533afd]" />
                <span>Cellular Plant Stress & Osmoprotection Visualizer</span>
              </h3>
            </div>
            <DataBadge type="MODELLED" customText="LIVE PARTICLE ENGINE" />
          </div>

          <BiologicalSimulationAnimation crop={activeCropName} />
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          TAB 6: SIDE-BY-SIDE PHOTOGRAPHIC BEFORE / AFTER SPLIT SCRUBBER
         ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "comparison" && (
        <div className="stripe-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3e8ee] pb-5">
            <div>
              <span className="text-xs font-mono font-bold text-[#533afd] uppercase tracking-wider">
                PHOTOREALISTIC PREDICTION SCRUBBER
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display text-[#0d253d] mt-1 flex items-center gap-2">
                <Split className="h-6 w-6 text-[#533afd]" />
                <span>Interactive Crop Photo Split Scrubber</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Drag the divider below over the actual field photos to compare untreated heat stress versus protected crop.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setSplitSliderPos(0)}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  splitSliderPos === 0
                    ? "bg-rose-600 text-white border-rose-700"
                    : "bg-white text-slate-700 border-[#e3e8ee] hover:bg-slate-50"
                }`}
              >
                100% Stressed
              </button>
              <button
                type="button"
                onClick={() => setSplitSliderPos(50)}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  splitSliderPos === 50
                    ? "bg-[#533afd] text-white border-[#4434d4]"
                    : "bg-white text-slate-700 border-[#e3e8ee] hover:bg-slate-50"
                }`}
              >
                50 / 50 Split
              </button>
              <button
                type="button"
                onClick={() => setSplitSliderPos(100)}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  splitSliderPos === 100
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : "bg-white text-slate-700 border-[#e3e8ee] hover:bg-slate-50"
                }`}
              >
                100% Protected
              </button>
            </div>
          </div>

          {/* Interactive Photo Split Viewer */}
          <div className="relative w-full h-[320px] sm:h-[440px] rounded-3xl overflow-hidden border border-[#e3e8ee] select-none shadow-md bg-slate-900">
            
            {/* Right Photo: Heat Stressed Crop */}
            <img
              src="/images/predictions/soybean_stressed_predicted.jpg"
              alt="Heat Stressed Crop (Untreated)"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-rose-900/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-full border border-rose-500/40">
              ✕ UNTREATED HEAT STRESS
            </div>

            {/* Left Photo: Protected Crop (Clipped by splitSliderPos) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-2xl"
              style={{ width: `${splitSliderPos}%` }}
            >
              <img
                src="/images/predictions/soybean_healthy_predicted.jpg"
                alt="Protected Crop with Quantis"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  width: "100%",
                  minWidth: "100%",
                }}
              />
              <div className="absolute top-4 left-4 bg-emerald-900/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-full border border-emerald-500/40">
                ✓ DAY 0 SYNGENTA QUANTIS
              </div>
            </div>

            {/* Split Handle Knob */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-[#533afd] shadow-2xl flex items-center justify-center font-bold text-sm border-2 border-[#533afd] pointer-events-none"
              style={{ left: `${splitSliderPos}%` }}
            >
              ↔
            </div>

            {/* Bottom Scrubber Overlay */}
            <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 bg-black/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
              <span className="text-xs font-mono font-bold">
                Drag Slider: {splitSliderPos}% Protected / {100 - splitSliderPos}% Stressed
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={splitSliderPos}
                onChange={(e) => setSplitSliderPos(Number(e.target.value))}
                className="w-full sm:w-64 h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#533afd]"
              />
            </div>
          </div>

          {/* Simple Visual Comparison Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-1.5">
              <span className="text-xs font-mono font-bold text-rose-900 uppercase">Without Protection</span>
              <div className="text-2xl font-black font-mono text-rose-950">{unmanagedYieldQAc} q/ac</div>
              <p className="text-xs text-rose-800">
                Severe nocturnal respiration burn and 42% flower abortion under unchecked heat.
              </p>
            </div>

            <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1.5">
              <span className="text-xs font-mono font-bold text-emerald-900 uppercase">With Syngenta Quantis</span>
              <div className="text-2xl font-black font-mono text-emerald-950">{expectedYieldQAc} q/ac</div>
              <p className="text-xs text-emerald-800">
                Full osmoprotective cellular shield securing +{bioGainQAc} q/ac and +₹{totalFarmExtraIncome.toLocaleString("en-IN")}.
              </p>
            </div>
          </div>

        </div>
      )}

    </section>
  );
};
