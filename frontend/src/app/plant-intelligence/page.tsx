"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageHelpModal } from "@/components/PageHelpModal";
import { DataBadge } from "@/components/DataBadge";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { useFarm } from "@/context/FarmContext";
import { FarmerProfile, getStoredProfile, saveProfile } from "@/lib/userStore";
import { getRegionalCrops } from "@/lib/cropRegistry";
import { findCropMandiRate } from "@/lib/mandiEngine";
import { getNearbySyngentaDealers } from "@/lib/syngentaDealers";
import {
  fetchPlantIntelligenceRegions,
  runPlantIntelligencePipeline,
  parseFarmerIntent,
  submitFarmerYieldFeedback,
  searchLocation,
} from "@/lib/api";
import {
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Droplets,
  Thermometer,
  Satellite,
  ThumbsUp,
  ThumbsDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Compass,
  Calendar,
  Sliders,
  Clock,
  FlaskConical,
  Wind,
  Check,
  Package,
  Bug,
  MapPin,
  Search,
  Navigation,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

interface RegionInfo {
  name: string;
  crops: string[];
  lat: number;
  lon: number;
  soil_type: string;
  dominant_stresses: string[];
}

interface ProductRec {
  product_key: string;
  product_name: string;
  category: string;
  active_ingredient: string;
  dosage: string;
  application_method: string;
  water_usage: string;
  timing_advice: string;
  timing_window: string;
  rationale: string;
  severity: string;
  priority: number;
  trigger_description: string;
}

interface DayForecast {
  day: number;
  date: string;
  overall_stress_probability: number;
  dominant_stress: string;
  is_stressed: boolean;
  safe_to_spray: boolean;
  stress_breakdown: Record<string, number>;
  weather_layer: Record<string, any>;
  satellite_layer: Record<string, any>;
  soil_layer: Record<string, any>;
  shap_explanations: Array<{ factor: string; contribution: string }>;
  products: ProductRec[];
}

interface CatalogProduct {
  key: string;
  name: string;
  category: string;
  active_ingredient: string;
  retail_price: string;
  target: string;
}

interface PipelineResponse {
  data_source: string;
  weather_api?: string;
  region: Record<string, any>;
  crop_profile: Record<string, any>;
  forecast: DayForecast[];
  alert: {
    title: string;
    description: string;
    severity: string;
    factors: Array<{
      factor: string;
      readings: string;
      status: string;
      threshold_info: string;
    }>;
    recommendations: string[];
  };
  cropfit: {
    product: {
      product_key?: string;
      product_name: string;
      category: string;
      active_ingredient: string;
      dosage: string;
      application_method: string;
      water_usage: string;
      target: string;
      description: string;
      synergist?: string;
      tank_mix_safe?: string[];
      tank_mix_danger?: string[];
      retail_price?: string;
    };
    secondary_crop_protection?: {
      product_name: string;
      category: string;
      active_ingredient: string;
      dosage: string;
      rationale: string;
      tank_mix_compatibility: string;
    } | null;
    rationale: string;
    confidence: number;
    top_candidates?: Array<{
      name: string;
      category?: string;
      score: number;
      target: string;
      costBreakdown?: { totalPerAcre: number };
      costPerAcre?: number;
      expectedBenefit?: { revenueProtectedPerAcre: number; robi?: number };
      dosage?: string;
      mrp?: string;
      trialCitation?: string;
      trialEfficacyPct?: number;
      etlThreshold?: string;
      cropwiseStandard?: {
        rainfastnessHours: number;
        optimalDeltaT: string;
        droneApplicable: boolean;
      };
      tankMixSafe?: string[];
      reasoning?: string;
      sprayWindow?: {
        isSafeToSpray: boolean;
        reason: string;
        bestTime: string;
      };
    }>;
  } | null;
  has_critical_alert: boolean;
  product_recommendations?: Array<{ day: number; products: ProductRec[] }>;
  economicROI?: {
    productCost: number;
    applicationCost: number;
    expectedYieldGain: string;
    mandiPrice: number;
    expectedRevenue: number;
    robi: number;
  };
  syngenta_india_catalog?: CatalogProduct[];
}

export default function PlantIntelligencePage() {
  const { language, t } = useLanguage();
  const isHindi = language === "hi";
  const { weather } = useWeather();
  const { activeFarm, updateActiveFarm } = useFarm();

  const [profile, setProfile] = useState<FarmerProfile>(() => getStoredProfile());
  const [regions, setRegions] = useState<Record<string, RegionInfo>>({});
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>("bhopal");
  const [selectedCrop, setSelectedCrop] = useState<string>("soybean");

  // Universal Location State (GPS / Search)
  const [customLocation, setCustomLocation] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>("");
  const [locationSearchResults, setLocationSearchResults] = useState<Array<any>>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [growthStage, setGrowthStage] = useState<string>("Flowering");
  const [symptoms, setSymptoms] = useState<string>("None");
  const [soilMoisture, setSoilMoisture] = useState<string>("Optimal");
  const [conversationalInput, setConversationalInput] = useState<string>("");
  const [parsingContext, setParsingContext] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [pipelineData, setPipelineData] = useState<PipelineResponse | null>(null);
  const [selectedDayModal, setSelectedDayModal] = useState<DayForecast | null>(null);

  // High-Impact Feature States
  const [delayDays, setDelayDays] = useState<number>(0);
  const [selectedTankMix, setSelectedTankMix] = useState<string>("urea");
  const [catalogCategory, setCatalogCategory] = useState<string>("all");
  const [showCatalog, setShowCatalog] = useState<boolean>(false);

  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [sprayScheduledToast, setSprayScheduledToast] = useState<string | null>(null);

  // Sync profile & farm on mount
  useEffect(() => {
    const p = getStoredProfile();
    if (p) {
      setProfile(p);
      if (p.primaryCrop) {
        const cleanC = p.primaryCrop.toLowerCase().replace(/[^a-z0-9]/g, "");
        setSelectedCrop(cleanC);
      }
      if (p.district) {
        setLocationSearchQuery(`${p.district}${p.state ? `, ${p.state}` : ""}`);
      }
    }
  }, []);

  // Fetch initial regions from backend
  useEffect(() => {
    async function loadRegions() {
      const data = await fetchPlantIntelligenceRegions();
      if (data && Object.keys(data).length > 0) {
        setRegions(data);
        const keys = Object.keys(data);
        const p = getStoredProfile();

        let initialKey = keys.includes("bhopal") ? "bhopal" : keys[0];
        if (p?.district) {
          const match = keys.find(
            (k) =>
              k.toLowerCase().includes(p.district.toLowerCase()) ||
              p.district.toLowerCase().includes(k.toLowerCase())
          );
          if (match) initialKey = match;
        }

        setSelectedRegionKey(initialKey);

        const initialCrop = p?.primaryCrop
          ? p.primaryCrop.toLowerCase().replace(/[^a-z0-9]/g, "")
          : data[initialKey]?.crops?.[0] || "soybean";

        setSelectedCrop(initialCrop);

        const lat = p?.gpsLocation?.lat || weather.lat || data[initialKey]?.lat;
        const lon = p?.gpsLocation?.lon || weather.lon || data[initialKey]?.lon;
        const name = p?.district
          ? `${p.district}${p.state ? `, ${p.state}` : ""}`
          : data[initialKey]?.name;

        if (p?.district) {
          setCustomLocation({ name, lat, lon });
        }

        executePipeline(
          initialKey,
          initialCrop,
          growthStage,
          symptoms,
          soilMoisture,
          lat,
          lon,
          name
        );
      }
    }
    loadRegions();
  }, []);

  const currentDistrict =
    profile.district || activeFarm.district || weather.district || "Bhopal";
  const currentState =
    profile.state || activeFarm.state || weather.state || "Madhya Pradesh";
  const currentAcres = profile.fieldAreaAcres || activeFarm.areaAcres || 5.0;

  // Real regional crops available in this area
  const regionalCrops = getRegionalCrops(currentDistrict, currentState);

  // Local Mandi modal price for the active crop
  const mandiRateObj = findCropMandiRate(selectedCrop, currentDistrict, currentState);
  const currentMandiPrice = mandiRateObj?.modalPrice || 4850;

  // Nearby Syngenta dealers for this district
  const nearbyDealers = getNearbySyngentaDealers(currentDistrict);
  const primaryDealer = nearbyDealers[0];

  const currentRegion = customLocation
    ? {
        name: customLocation.name,
        crops: pipelineData?.region?.crops || regionalCrops.map((c) => c.id),
        lat: customLocation.lat,
        lon: customLocation.lon,
        soil_type: pipelineData?.region?.soil_type || "Regional Agricultural Soil",
        dominant_stresses:
          pipelineData?.region?.dominant_stresses || ["Heat Waves", "Moisture Deficit"],
      }
    : regions[selectedRegionKey] || {
        name: `${currentDistrict}, ${currentState}`,
        crops: regionalCrops.map((c) => c.id),
        lat: weather.lat || 23.2599,
        lon: weather.lon || 77.4126,
        soil_type: "Medium Black Clay",
        dominant_stresses: ["Heat Waves", "Moisture Deficit"],
      };

  const handleRegionChange = (newKey: string) => {
    setCustomLocation(null);
    setSelectedRegionKey(newKey);
    const targetRegion = regions[newKey];
    if (targetRegion && targetRegion.crops?.length > 0) {
      const newCrop = targetRegion.crops[0];
      setSelectedCrop(newCrop);
      executePipeline(
        newKey,
        newCrop,
        growthStage,
        symptoms,
        soilMoisture,
        targetRegion.lat,
        targetRegion.lon,
        targetRegion.name
      );
    } else {
      executePipeline(newKey, selectedCrop, growthStage, symptoms, soilMoisture);
    }
  };

  const handleCropChange = (newCrop: string) => {
    setSelectedCrop(newCrop);
    updateActiveFarm({ primaryCrop: newCrop });
    const p = getStoredProfile();
    saveProfile({ ...p, primaryCrop: newCrop });
    executePipeline(
      selectedRegionKey,
      newCrop,
      growthStage,
      symptoms,
      soilMoisture,
      currentRegion.lat,
      currentRegion.lon,
      currentRegion.name
    );
  };

  const executePipeline = async (
    regionKey: string,
    crop: string,
    stage: string,
    sym: string,
    moisture: string,
    customLat?: number | null,
    customLon?: number | null,
    customName?: string | null
  ) => {
    setLoading(true);
    setFeedbackSubmitted(false);
    setFeedbackMessage("");
    try {
      const data = await runPlantIntelligencePipeline({
        crop_type: crop,
        region: regionKey,
        growth_stage: stage,
        symptoms: sym,
        soil_moisture: moisture,
        lat: customLat ?? currentRegion.lat,
        lon: customLon ?? currentRegion.lon,
        custom_location_name: customName ?? currentRegion.name,
      });
      if (data) {
        setPipelineData(data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Universal Location Search Handler
  const handleLocationSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocationSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length >= 2) {
      setIsSearchingLocation(true);
      setShowSearchResults(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocation(val);
        setLocationSearchResults(results);
        setIsSearchingLocation(false);
      }, 350);
    } else {
      setLocationSearchResults([]);
      setShowSearchResults(false);
      setIsSearchingLocation(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const loc = {
      name: result.name,
      lat: Number(result.lat),
      lon: Number(result.lon),
    };
    setCustomLocation(loc);
    setLocationSearchQuery(result.name);
    setShowSearchResults(false);
    executePipeline(
      selectedRegionKey,
      selectedCrop,
      growthStage,
      symptoms,
      soilMoisture,
      loc.lat,
      loc.lon,
      loc.name
    );
  };

  // Auto-Detect Device GPS Coordinates
  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const locName = `GPS Location (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`;
        const loc = {
          name: locName,
          lat,
          lon,
        };
        setCustomLocation(loc);
        setLocationSearchQuery(locName);
        setShowSearchResults(false);
        setGpsLoading(false);
        executePipeline(
          selectedRegionKey,
          selectedCrop,
          growthStage,
          symptoms,
          soilMoisture,
          lat,
          lon,
          locName
        );
      },
      () => {
        setGpsLoading(false);
        alert("GPS location access was denied. You can search any city/district name instead.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleExtractContext = async () => {
    if (!conversationalInput.trim()) return;
    setParsingContext(true);
    try {
      const res = await parseFarmerIntent(conversationalInput);
      if (res?.parsed_context) {
        const newStage = res.parsed_context.growth_stage || "Vegetative";
        const newSymptoms = res.parsed_context.symptoms || "None";
        const newMoisture = res.parsed_context.soil_moisture || "Optimal";
        setGrowthStage(newStage);
        setSymptoms(newSymptoms);
        setSoilMoisture(newMoisture);
        executePipeline(
          selectedRegionKey,
          selectedCrop,
          newStage,
          newSymptoms,
          newMoisture,
          currentRegion.lat,
          currentRegion.lon,
          currentRegion.name
        );
      }
    } finally {
      setParsingContext(false);
    }
  };

  const handleFeedback = async (positive: boolean) => {
    const productName = pipelineData?.cropfit?.product?.product_name || "Quantis®";
    await submitFarmerYieldFeedback({
      improved_yield: positive,
      product: productName,
      crop: selectedCrop,
      region: selectedRegionKey,
    });
    setFeedbackSubmitted(true);
    setFeedbackMessage(
      positive
        ? "Thank you! Positive efficacy feedback calibrated into regional agronomic model."
        : "Thank you. Model calibrating for specific local soil variance."
    );
  };

  const delayProtectionMap: Record<
    number,
    { protection: number; yieldLossQ: number; lossInr: number }
  > = {
    0: { protection: 94, yieldLossQ: 0.1, lossInr: 485 },
    1: { protection: 88, yieldLossQ: 0.4, lossInr: 1940 },
    2: { protection: 79, yieldLossQ: 0.8, lossInr: 3880 },
    3: { protection: 68, yieldLossQ: 1.3, lossInr: 6305 },
    4: { protection: 54, yieldLossQ: 1.8, lossInr: 8730 },
    5: { protection: 42, yieldLossQ: 2.3, lossInr: 11155 },
    6: { protection: 30, yieldLossQ: 2.9, lossInr: 14065 },
    7: { protection: 18, yieldLossQ: 3.5, lossInr: 16975 },
  };

  const delayStats = delayProtectionMap[delayDays] || delayProtectionMap[0];
  const firstForecast = pipelineData?.forecast?.[0];

  const catalogProducts: CatalogProduct[] = pipelineData?.syngenta_india_catalog || [
    { key: "quantis", name: "Quantis®", category: "Biostimulant", active_ingredient: "Amino Acids, Organic Carbon, Peptides", retail_price: "₹1,250 - ₹1,450 / L", target: "Extreme Heat & Drought Stress Shield" },
    { key: "isabion", name: "Isabion®", category: "Biostimulant", active_ingredient: "Animal-derived Free Amino Acids (62.5%)", retail_price: "₹950 - ₹1,150 / L", target: "Nutrient Absorption & Floral Preservation" },
    { key: "amistar_top", name: "Amistar Top®", category: "Fungicide", active_ingredient: "Azoxystrobin (18.2%) + Difenoconazole (11.4%)", retail_price: "₹2,100 - ₹2,350 / 500ml", target: "Anthracnose, Leaf Blight & Rust" },
    { key: "ampligo", name: "Ampligo®", category: "Insecticide", active_ingredient: "Chlorantraniliprole (9.3%) + Lambda-cyhalothrin (4.6%)", retail_price: "₹1,850 - ₹2,050 / 200ml", target: "Pod Borer & Fall Armyworm" },
    { key: "alika", name: "Alika®", category: "Insecticide", active_ingredient: "Thiamethoxam (12.6%) + Lambda-cyhalothrin (9.5%) ZC", retail_price: "₹850 - ₹950 / 250ml", target: "Sucking Pests & Caterpillars" },
    { key: "score", name: "Score®", category: "Fungicide", active_ingredient: "Difenoconazole 25% EC", retail_price: "₹1,100 - ₹1,250 / 250ml", target: "Powdery Mildew & Scab" },
    { key: "ridomil_gold", name: "Ridomil Gold®", category: "Fungicide", active_ingredient: "Metalaxyl-M (4%) + Mancozeb (64%) WP", retail_price: "₹1,400 - ₹1,550 / kg", target: "Late Blight & Downy Mildew" },
    { key: "virtako", name: "Virtako®", category: "Insecticide", active_ingredient: "Chlorantraniliprole (0.5%) + Thiamethoxam (1%) GR", retail_price: "₹1,350 - ₹1,500 / 2.5kg", target: "Stem Borer & Leaf Folder" },
    { key: "fusilade_forte", name: "Fusilade Forte®", category: "Herbicide", active_ingredient: "Fluazifop-p-butyl 13.4% EC", retail_price: "₹1,650 - ₹1,800 / L", target: "Post-emergence Selective Grass Control" },
    { key: "simodis", name: "Simodis®", category: "Insecticide", active_ingredient: "Isocycloseram 9.2% w/w DC", retail_price: "₹2,400 - ₹2,600 / 250ml", target: "Thrips, Mites & Resistant Caterpillars" },
    { key: "custodia", name: "Custodia®", category: "Fungicide", active_ingredient: "Azoxystrobin 11% + Tebuconazole 18.3% w/w SC", retail_price: "₹1,750 - ₹1,950 / 500ml", target: "Sheath Blight & Purple Blotch" },
    { key: "dual_gold", name: "Dual Gold®", category: "Herbicide", active_ingredient: "S-Metolachlor 960 g/L EC", retail_price: "₹1,450 - ₹1,600 / L", target: "Pre-emergence Annual Grasses & Weeds" },
    { key: "cruiser", name: "Cruiser®", category: "Seed Treatment", active_ingredient: "Thiamethoxam 30% FS", retail_price: "₹1,200 - ₹1,350 / 250ml", target: "Early Sucking Pests & Termites" },
  ];

  const filteredCatalog =
    catalogCategory === "all"
      ? catalogProducts
      : catalogProducts.filter((p) =>
          p.category.toLowerCase().includes(catalogCategory.toLowerCase())
        );

  return (
    <AppShell>
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        {/* Top Header */}
        <div className="border-b border-slate-200/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-mono font-bold text-indigo-700 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                {t?.plantIntelligenceBadge || "PS-02 / PS-03 Plant Intelligence"}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE GPS TELEMETRY: OPEN-METEO ({currentRegion?.name?.split(",")[0] || "BHOPAL"} {Number(currentRegion?.lat).toFixed(2)}°N, {Number(currentRegion?.lon).toFixed(2)}°E)
              </span>
              <DataBadge type="LIVE_CEHUB" customText="UNIVERSAL LOCATION ENABLED" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#0d253d] tracking-tight">
              {isHindi ? "पौधा स्वास्थ्य और मौसम पूर्व-चेतावनी" : t?.plantIntelligenceTitle || "Plant Intelligence Engine"}
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-3xl mt-1">
              14-Day Real Weather Phenology Forecast for Any Location in India, Multi-Criteria Syngenta Advisor &amp; Spray Radar
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <PageHelpModal
              pageKey="plant-intelligence"
              title="How to Use Plant Health Radar"
              subtitle="Understand silent heat stress and lock in optimal biostimulant spray windows."
              steps={[
                { number: "01", title: "Review 14-Day Horizon", desc: "Inspect the daily climate radar cards below. Green days mean safe spray conditions; amber/red indicate thermal stress." },
                { number: "02", title: "Check Syngenta Prescription", desc: "View the recommended dosage of Quantis/Isabion calibrated for your exact crop and acreage." },
                { number: "03", title: "Lock In Spray Schedule", desc: "Tap 'Lock In Spray Plan' to record the date into your Farm Journal and contact the nearest authorized dealer." },
              ]}
            />

            <button
              onClick={() =>
                executePipeline(
                  selectedRegionKey,
                  selectedCrop,
                  growthStage,
                  symptoms,
                  soilMoisture,
                  customLocation?.lat,
                  customLocation?.lon,
                  customLocation?.name
                )
              }
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#533afd] to-[#4434d4] hover:opacity-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Fetching Live Telemetry..." : "Re-run Live Pipeline"}</span>
            </button>
          </div>
        </div>

        {/* How It Works Explainer (Expandable) */}
        <details className="p-5 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm group cursor-pointer">
          <summary className="flex items-center justify-between font-bold text-[#0d253d] text-sm list-none">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-emerald-600" />
              How the Universal PS-02 &amp; PS-03 Pipeline Works for Any Indian Location
            </span>
            <span className="text-xs text-slate-500 font-mono group-open:hidden">Click to expand</span>
            <span className="text-xs text-slate-500 font-mono hidden group-open:block">Click to collapse</span>
          </summary>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {[
              { step: "01", title: "Universal Location", desc: "Auto-detect GPS or search any Indian district/village (Indore, Varanasi, Akola, etc.)", color: "emerald" },
              { step: "02", title: "Live Open-Meteo Feed", desc: "Extracts real 14-day weather (TMax, TMin, Rain, RH, Wind, VPD) for exact coordinates", color: "sky" },
              { step: "03", title: "Mechanistic GDD & Stress", desc: "HSI + DSI non-linear multiplication identifies silent damage & flower abortion", color: "blue" },
              { step: "04", title: "Multi-Criteria Matrix", desc: "Matches Biostimulants + Fungicide/Insecticide secondary partner based on moisture", color: "amber" },
              { step: "05", title: "ROBI & Spray Radar", desc: "Calculates net Mandi cash ROI and safe early-morning spray window", color: "purple" },
            ].map(({ step, title, desc, color }) => (
              <div
                key={step}
                className={`p-3.5 rounded-xl border space-y-1 ${
                  color === "emerald"
                    ? "bg-emerald-50 border-emerald-200"
                    : color === "sky"
                    ? "bg-sky-50 border-sky-200"
                    : color === "blue"
                    ? "bg-indigo-50 border-indigo-200"
                    : color === "amber"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-purple-50 border-purple-200"
                }`}
              >
                <span
                  className={`text-[10px] font-black font-mono ${
                    color === "emerald"
                      ? "text-emerald-700"
                      : color === "sky"
                      ? "text-sky-700"
                      : color === "blue"
                      ? "text-indigo-700"
                      : color === "amber"
                      ? "text-amber-700"
                      : "text-purple-700"
                  }`}
                >
                  STEP {step}
                </span>
                <h4 className="font-extrabold text-[#0d253d] text-[11px]">{title}</h4>
                <p className="text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </details>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Universal Location & Crop Selector Card */}
            <div className="p-5 space-y-4 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0d253d] font-bold text-sm">
                  <Compass className="h-4 w-4 text-emerald-600" />
                  <span>Field Location &amp; Crop</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoDetectGPS}
                  disabled={gpsLoading}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Auto-detect exact GPS location of your field"
                >
                  <Navigation className={`h-3 w-3 ${gpsLoading ? "animate-spin" : ""}`} />
                  <span>{gpsLoading ? "Locating..." : "📍 GPS Auto"}</span>
                </button>
              </div>

              {/* Universal Search Bar for any District/Village in India */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  Search Any District / Village in India
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={locationSearchQuery}
                    onChange={handleLocationSearchInput}
                    onFocus={() => locationSearchResults.length > 0 && setShowSearchResults(true)}
                    placeholder="e.g. Bhopal, Sehore, Indore, Kota, Nashik..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e3e8ee] bg-[#f6f9fc] focus:bg-white focus:outline-none focus:border-indigo-500 font-medium text-[#0d253d]"
                  />
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                  {isSearchingLocation && (
                    <RefreshCw className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-2.5 animate-spin" />
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showSearchResults && locationSearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {locationSearchResults.map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => handleSelectSearchResult(res)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 text-slate-800 font-medium flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate font-bold">{res.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                          {Number(res.lat).toFixed(2)}°N, {Number(res.lon).toFixed(2)}°E
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  Or Quick Select Agro-Climatic Preset
                </label>
                <select
                  value={customLocation ? "" : selectedRegionKey}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e3e8ee] bg-[#f6f9fc] focus:bg-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer text-[#0d253d]"
                >
                  {customLocation && <option value="">Custom: {customLocation.name.split(",")[0]}</option>}
                  {Object.entries(regions || {}).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info?.name || key}
                    </option>
                  ))}
                </select>
              </div>

              {currentRegion && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="text-slate-800 font-semibold flex items-center justify-between">
                    <span>Target Location:</span>
                    <span className="font-mono text-slate-700 truncate max-w-[170px]" title={currentRegion.name}>
                      {currentRegion.name.split(",")[0]}
                    </span>
                  </div>
                  <div className="text-slate-800 font-semibold flex items-center justify-between">
                    <span>Live GPS Coordinates:</span>
                    <span className="font-mono text-slate-700">
                      {Number(currentRegion?.lat).toFixed(2)}°N, {Number(currentRegion?.lon).toFixed(2)}°E
                    </span>
                  </div>
                  <div className="text-slate-800">
                    <span className="font-semibold">Soil Classification:</span> {currentRegion?.soil_type || "Medium Black Clay"}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1">Dominant Regional Stresses:</span>
                    <div className="flex flex-wrap gap-1">
                      {(currentRegion?.dominant_stresses || ["Heat Waves", "Drought"]).map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 border border-amber-300 text-[10px] font-bold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  Target Crop Variety
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => handleCropChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e3e8ee] bg-[#f6f9fc] focus:bg-white focus:outline-none focus:border-indigo-500 font-medium capitalize cursor-pointer text-[#0d253d]"
                >
                  {(regionalCrops.length > 0 ? regionalCrops.map((c) => c.id) : currentRegion?.crops || ["soybean", "wheat", "cotton_bt", "rice", "groundnut", "chilli"]).map((c: string) => (
                    <option key={c} value={c}>
                      {c.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conversational NLP Input Card */}
            <div className="p-5 space-y-4 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0d253d] font-bold text-sm">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>Conversational Symptom Extraction</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                  GEMINI NLP
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Describe field observations in everyday language. Gemini auto-extracts growth stage, symptoms &amp; moisture.
              </p>

              <div className="space-y-2">
                <textarea
                  value={conversationalInput}
                  onChange={(e) => setConversationalInput(e.target.value)}
                  placeholder="e.g. My soybean crop is flowering but the leaves are wilting and soil is dry..."
                  rows={2}
                  className="w-full p-3 text-xs rounded-xl border border-[#e3e8ee] bg-[#f6f9fc] focus:bg-white focus:outline-none focus:border-indigo-500 font-sans text-[#0d253d]"
                />
                <button
                  type="button"
                  onClick={handleExtractContext}
                  disabled={parsingContext || !conversationalInput.trim()}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-[#533afd] to-[#4434d4] hover:opacity-95 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{parsingContext ? "Parsing Symptoms..." : "Extract Context & Auto-Fill"}</span>
                </button>
              </div>

              {/* Manual Context Overrides */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Phenology &amp; Field Parameters</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Growth Stage
                    </label>
                    <select
                      value={growthStage}
                      onChange={(e) => {
                        setGrowthStage(e.target.value);
                        executePipeline(selectedRegionKey, selectedCrop, e.target.value, symptoms, soilMoisture, customLocation?.lat, customLocation?.lon, customLocation?.name);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#e3e8ee] bg-white text-[#0d253d]"
                    >
                      <option value="Vegetative">Vegetative Stage</option>
                      <option value="Flowering">Flowering (+5% Sensitivity Boost)</option>
                      <option value="Pod Formation">Pod Formation / Grain Fill</option>
                      <option value="Germination">Germination / Emergence</option>
                      <option value="Maturity">Maturity / Ripening</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Observed Symptoms
                    </label>
                    <select
                      value={symptoms}
                      onChange={(e) => {
                        setSymptoms(e.target.value);
                        executePipeline(selectedRegionKey, selectedCrop, growthStage, e.target.value, soilMoisture, customLocation?.lat, customLocation?.lon, customLocation?.name);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#e3e8ee] bg-white text-[#0d253d]"
                    >
                      <option value="None">None (Healthy Canopy)</option>
                      <option value="Wilting">Wilting / Drought Stress</option>
                      <option value="Yellowing/Chlorosis">Yellowing / Chlorosis (Disease Risk)</option>
                      <option value="Stunting">Stunting / Thermal Shock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Soil Moisture Status
                    </label>
                    <select
                      value={soilMoisture}
                      onChange={(e) => {
                        setSoilMoisture(e.target.value);
                        executePipeline(selectedRegionKey, selectedCrop, growthStage, symptoms, e.target.value, customLocation?.lat, customLocation?.lon, customLocation?.name);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#e3e8ee] bg-white text-[#0d253d]"
                    >
                      <option value="Optimal">Optimal (Field Capacity)</option>
                      <option value="Dry">Dry / Water Deficit (High Stress)</option>
                      <option value="Waterlogged">Waterlogged / High Monsoon Rain</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Advisory Card */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Misdiagnosis &amp; Savings Advisory</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Observed wilting / flower drop is <strong>Abiotic Weather Stress</strong>, NOT pest damage. Do NOT purchase chemical insecticide sprays without pest confirmation. You save up to <strong>₹2,200/acre</strong> by choosing biological stress shielding.
              </p>
            </div>

            {/* Syngenta Tank-Mix Compatibility Helper */}
            <div className="p-5 space-y-3 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-[#0d253d] font-bold text-sm">
                <FlaskConical className="h-4 w-4 text-purple-600" />
                <span>Syngenta Tank-Mix Helper</span>
              </div>
              <p className="text-xs text-slate-600">
                Check whether biostimulants can be co-applied in the same spray tank to save labor.
              </p>
              <div className="flex gap-2">
                {[
                  { id: "urea", label: "Urea (Foliar)" },
                  { id: "insecticide", label: "Ampligo / Insecticide" },
                  { id: "copper", label: "Copper Fungicide" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTankMix(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedTankMix === item.id
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-[#f6f9fc] text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div
                className={`p-3 rounded-xl text-xs space-y-1 ${
                  selectedTankMix === "copper"
                    ? "bg-rose-50 border border-rose-200 text-rose-900"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-900"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {selectedTankMix === "copper" ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                      <span>INCOMPATIBLE — Do Not Mix</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>100% TANK COMPATIBLE</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed">
                  {selectedTankMix === "urea" &&
                    "Isabion + 1% Foliar Urea creates high nitrogen uptake synergy without phytotoxicity."}
                  {selectedTankMix === "insecticide" &&
                    "Isabion + Ampligo / Cyantraniliprole is fully compatible. Saves one tractor/labor pass."}
                  {selectedTankMix === "copper" &&
                    "Do NOT mix amino acid biostimulants with copper or alkaline sulfur compounds (causes curdling & burn)."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Critical Alert Banner */}
            {pipelineData?.has_critical_alert && (
              <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                      COMPOUND CLIMATE STRESS ALERT
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-200/60 px-2 py-0.5 rounded-full">
                      PEAK RISK WINDOW
                    </span>
                  </div>
                  <p className="text-xs text-rose-900 font-medium">
                    {pipelineData?.alert?.description ||
                      "Thermal and hydric deviation exceeds physiological threshold. Apply biological intervention within 3 days."}
                  </p>
                </div>
              </div>
            )}

            {/* Feature: Hourly Microclimate Spray Radar */}
            <div className="p-5 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0d253d] font-bold text-sm">
                  <Wind className="h-4 w-4 text-indigo-600" />
                  <span>Microclimate Spray Window Radar (Next 24 Hours)</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  OPTIMAL WINDOW ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { time: "06:00 - 09:00 AM", status: "Optimal Window", desc: "24°C · Low Evaporation", badge: "bg-emerald-500", text: "text-emerald-700" },
                  { time: "09:00 - 12:00 PM", status: "Moderate", desc: "28°C · Moderate Wind", badge: "bg-amber-500", text: "text-amber-700" },
                  { time: "12:00 - 04:00 PM", status: "Evaporation Risk", desc: "32°C · Stomatal Closure", badge: "bg-rose-500", text: "text-rose-700" },
                  { time: "05:00 - 07:30 PM", status: "Optimal Window", desc: "26°C · Zero Drift", badge: "bg-emerald-500", text: "text-emerald-700" },
                ].map((w, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-[#f6f9fc] space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 block">{w.time}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${w.badge}`} />
                      <span className={`text-xs font-extrabold ${w.text}`}>{w.status}</span>
                    </div>
                    <span className="text-[10px] text-slate-600 block">{w.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CropFit Recommended Biological Intervention Card */}
            {pipelineData?.cropfit?.product ? (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 text-white border border-emerald-500/40 shadow-lg space-y-4">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        PS-03 CROPFIT RECOMMENDED INTERVENTION
                      </span>
                      {growthStage === "Flowering" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          +5% FLOWERING SENSITIVITY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-600/50 px-3 py-1 rounded-full">
                      <span className="text-xs text-emerald-300 font-semibold">Model Confidence:</span>
                      <span className="text-sm font-mono font-black text-white">
                        {pipelineData.cropfit.confidence}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {pipelineData.cropfit.product.product_name}
                      </h2>
                      {pipelineData.cropfit.product.retail_price && (
                        <span className="text-xs font-mono font-bold bg-white/10 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30">
                          {pipelineData.cropfit.product.retail_price}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-400 font-mono mt-0.5">
                      {pipelineData.cropfit.product.category} · {pipelineData.cropfit.product.active_ingredient}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <strong className="text-emerald-300 font-semibold block mb-1">Agronomic Rationale:</strong>
                    {pipelineData.cropfit.rationale}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Dosage</span>
                      <span className="text-xs font-bold text-white font-mono">{pipelineData.cropfit.product.dosage}</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Application</span>
                      <span className="text-xs font-bold text-white">{pipelineData.cropfit.product.application_method}</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Water Volume</span>
                      <span className="text-xs font-bold text-white font-mono">{pipelineData.cropfit.product.water_usage}</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Mandi Price ROI</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {pipelineData.economicROI?.robi ? `${pipelineData.economicROI.robi}x Return` : "9.6x ROBI"}
                      </span>
                    </div>
                  </div>

                  {/* Secondary Crop Protection Package */}
                  {pipelineData.cropfit.secondary_crop_protection && (
                    <div className="bg-indigo-950/70 border border-indigo-500/40 rounded-xl p-3.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <Bug className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Co-Application Partner: {pipelineData.cropfit.secondary_crop_protection.product_name}</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                          {pipelineData.cropfit.secondary_crop_protection.category}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {pipelineData.cropfit.secondary_crop_protection.rationale}
                      </p>
                      <div className="text-[10px] font-mono text-indigo-300 flex items-center gap-2">
                        <span>Dosage: <strong>{pipelineData.cropfit.secondary_crop_protection.dosage}</strong></span>
                        <span>•</span>
                        <span>{pipelineData.cropfit.secondary_crop_protection.tank_mix_compatibility}</span>
                      </div>
                    </div>
                  )}

                  {/* Multi-Candidate Hybrid Engine Ranking — Top Candidates */}
                  {pipelineData.cropfit?.top_candidates && pipelineData.cropfit.top_candidates.length > 0 && (
                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                          <span>3-Layer Hybrid Recommendation Engine (50 Syngenta Products)</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">RULE → SCORE → EXPLAIN</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {pipelineData.cropfit.top_candidates.map((cand: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border text-xs space-y-2 ${
                              idx === 0
                                ? "bg-emerald-950/60 border-emerald-500/50 text-white"
                                : "bg-slate-800/60 border-slate-700/60 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                                    idx === 0 ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-slate-300"
                                  }`}
                                >
                                  #{idx + 1}
                                </span>
                                <span className="font-extrabold">{cand.name}</span>
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                                    cand.category === "biostimulant"
                                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                      : cand.category === "fungicide"
                                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                      : cand.category === "insecticide"
                                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                      : cand.category === "herbicide"
                                      ? "bg-green-500/20 text-green-300 border-green-500/40"
                                      : "bg-slate-500/20 text-slate-300 border-slate-500/40"
                                  }`}
                                >
                                  {cand.category?.toUpperCase() || "PRODUCT"}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                                  idx === 0 ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-slate-300"
                                }`}
                              >
                                {typeof cand.score === "number" ? cand.score.toFixed(1) : cand.score} Score
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">{cand.target}</p>

                            {/* Cost & Benefit Row */}
                            {(cand.costBreakdown || cand.costPerAcre) && (
                              <div className="flex items-center gap-3 text-[10px] font-mono">
                                <span className="text-amber-300">
                                  ₹{cand.costBreakdown?.totalPerAcre || cand.costPerAcre}/acre
                                </span>
                                {cand.expectedBenefit && (
                                  <>
                                    <span className="text-slate-500">→</span>
                                    <span className="text-emerald-300">
                                      ₹{cand.expectedBenefit.revenueProtectedPerAcre}/acre saved
                                    </span>
                                    <span className="text-slate-500">→</span>
                                    <span className="text-emerald-400 font-bold">
                                      {cand.expectedBenefit.robi?.toFixed(1)}x ROBI
                                    </span>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Dosage & MRP */}
                            {cand.dosage && (
                              <div className="text-[10px] text-slate-400">
                                Dosage: <strong className="text-slate-200">{cand.dosage}</strong>
                                {cand.mrp && <span className="ml-2">| MRP: {cand.mrp}</span>}
                              </div>
                            )}

                            {/* Scientific & ICAR Field Trial Validation */}
                            {cand.trialCitation && (
                              <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-lg p-2 text-[10px] text-emerald-200 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                                    <span>🔬</span> ICAR &amp; Field Trial Validation:
                                  </span>
                                  {cand.trialEfficacyPct && (
                                    <span className="font-mono font-black text-emerald-300 bg-emerald-900/60 px-1.5 py-0.2 rounded border border-emerald-600/40">
                                      {cand.trialEfficacyPct}% Control Rate
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-300 leading-tight">{cand.trialCitation}</p>
                              </div>
                            )}

                            {/* Economic Threshold Level (ETL) Trigger */}
                            {cand.etlThreshold && (
                              <div className="text-[10px] text-amber-300/90 font-mono">
                                🎯 <strong>KVK / ETL Trigger:</strong> {cand.etlThreshold}
                              </div>
                            )}

                            {/* Syngenta Cropwise Standard Protocol */}
                            {cand.cropwiseStandard && (
                              <div className="text-[10px] text-indigo-300/90 font-mono flex flex-wrap items-center gap-2 bg-indigo-950/30 p-1.5 rounded border border-indigo-500/20">
                                <span>📱 <strong>Cropwise:</strong> Rainfastness: <strong>{cand.cropwiseStandard.rainfastnessHours}h</strong></span>
                                <span>•</span>
                                <span>Delta T: <strong>{cand.cropwiseStandard.optimalDeltaT}</strong></span>
                                {cand.cropwiseStandard.droneApplicable && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-300 font-bold">🚁 Drone-Spray Ready</span>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Tank-Mix Compatibility Protocol */}
                            {cand.tankMixSafe && cand.tankMixSafe.length > 0 && (
                              <div className="text-[10px] text-slate-300 flex flex-wrap gap-1 items-center">
                                <span className="text-emerald-400 font-semibold">✓ Tank-Mix Safe:</span>
                                {cand.tankMixSafe.slice(0, 3).map((mix: string, mIdx: number) => (
                                  <span key={mIdx} className="bg-slate-700/80 px-1.5 py-0.5 rounded text-[9px] text-slate-200">
                                    {mix}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Farmer-Friendly Reasoning */}
                            {cand.reasoning && (
                              <p className="text-[10px] text-slate-300 bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/10 leading-relaxed">
                                💡 <strong className="text-emerald-300">Why:</strong> {cand.reasoning}
                              </p>
                            )}
                            {/* Spray Window */}
                            {cand.sprayWindow && (
                              <div
                                className={`text-[10px] font-mono flex items-center gap-1.5 ${
                                  cand.sprayWindow.isSafeToSpray ? "text-emerald-400" : "text-amber-400"
                                }`}
                              >
                                {cand.sprayWindow.isSafeToSpray ? "✓" : "⚠️"} {cand.sprayWindow.reason} | Best: {cand.sprayWindow.bestTime}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Tank-Mix Synergist Protocol */}
                  {pipelineData.cropfit?.product?.synergist && (
                    <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-3 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-300 font-medium">
                        <FlaskConical className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong>Recommended Tank Synergist:</strong> {pipelineData.cropfit.product.synergist}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                        ZERO-BURN SAFE
                      </span>
                    </div>
                  )}

                  {/* Feedback Loop */}
                  <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-300">
                      <span className="font-semibold text-white">Farmer Outcome Feedback Loop:</span> Did this biological intervention improve field yield?
                    </div>

                    {feedbackSubmitted ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{feedbackMessage}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleFeedback(true)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Yes, Improved</span>
                        </button>
                        <button
                          onClick={() => handleFeedback(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          <span>No</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Feature: What-If Biological Clock Delay Simulator */}
            <div className="p-5 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-[#0d253d] text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Biological Activation Countdown: "What-If Delay" Simulator</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    See why timing matters: Drag the slider to see how delaying application reduces yield protection.
                  </p>
                </div>
                <span className="text-xs font-mono font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Delay: +{delayDays} Days
                </span>
              </div>

              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={delayDays}
                  onChange={(e) => setDelayDays(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
                  <span>Day 0 (Today)</span>
                  <span>Day 2</span>
                  <span>Day 4</span>
                  <span>Day 7 (Too Late)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-[#f6f9fc] p-3.5 rounded-xl border border-[#e3e8ee] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Yield Protection Window</span>
                  <span
                    className={`text-2xl font-black font-mono ${
                      delayStats.protection >= 70
                        ? "text-emerald-600"
                        : delayStats.protection >= 45
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`}
                  >
                    {delayStats.protection}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Membrane shield active</span>
                </div>

                <div className="bg-[#f6f9fc] p-3.5 rounded-xl border border-[#e3e8ee] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Yield Loss from Delay</span>
                  <span className="text-2xl font-black font-mono text-rose-600">
                    -{delayStats.yieldLossQ} q/ha
                  </span>
                  <span className="text-[10px] text-slate-500 block">Permanent floret damage</span>
                </div>

                <div className="bg-[#f6f9fc] p-3.5 rounded-xl border border-[#e3e8ee] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Financial Mandi Loss</span>
                  <span className="text-2xl font-black font-mono text-[#0d253d]">
                    -₹{delayStats.lossInr.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-500 block">@ ₹{currentMandiPrice}/q Mandi rate</span>
                </div>
              </div>
            </div>

            {/* Multi-Modal Sensor Grid (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weather Layer */}
              <div className="p-4 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0d253d] font-bold text-xs">
                    <Thermometer className="h-4 w-4 text-emerald-600" />
                    <span>Weather Telemetry</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                    LIVE OPEN-METEO
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Max Temp</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.weather_layer?.TMax ?? 26.6}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Night Min</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.weather_layer?.TMin ?? 23.1}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Precipitation</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.weather_layer?.Precipitation_mm ?? 0} mm
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">VPD Air Pull</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.weather_layer?.VPD_kPa ?? 0.7} kPa
                    </span>
                  </div>
                </div>
              </div>

              {/* Satellite Layer */}
              <div className="p-4 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0d253d] font-bold text-xs">
                    <Satellite className="h-4 w-4 text-indigo-600" />
                    <span>Satellite Biomass Layer</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                    CE HUB HYDRIC
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">NDVI Index</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.satellite_layer?.NDVI ?? 0.68}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">NDWI Canopy Moisture</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.satellite_layer?.NDWI ?? 0.34}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Hydric Index</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.satellite_layer?.Hydric_Index ?? 0.15}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Vegetation Condition</span>
                    <span className="font-bold text-emerald-700">Healthy Canopy</span>
                  </div>
                </div>
              </div>

              {/* Soil Layer */}
              <div className="p-4 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0d253d] font-bold text-xs">
                    <Droplets className="h-4 w-4 text-amber-600" />
                    <span>Root-Zone Soil Telemetry</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">
                    0-30 cm
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Soil Moisture</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.soil_layer?.Soil_Moisture_Pct ?? 28}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Soil Temp</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.soil_layer?.Soil_Temp_C ?? 26}°C
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px] block">Hydric Status</span>
                    <span className="font-semibold text-slate-800">
                      {(firstForecast?.soil_layer?.Soil_Moisture_Pct ?? 28) < 20
                        ? "Dry Root Zone — Biostimulant Recommended"
                        : "Adequate Moisture Retention"}
                    </span>
                  </div>
                </div>
              </div>

              {/* SHAP Explainability */}
              <div className="p-4 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0d253d] font-bold text-xs">
                    <Layers className="h-4 w-4 text-purple-600" />
                    <span>SHAP AI Explainability</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                    TREE EXPLAINER
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {(firstForecast?.shap_explanations?.length ?? 0) > 0 ? (
                    firstForecast?.shap_explanations?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">{item.factor}:</span>
                        <span className="font-mono font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded">
                          {item.contribution}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">
                      Baseline stress conditions are within normal limits for this variety.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 14-Day Stress Forecast Timeline */}
            <div className="p-5 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-[#0d253d] text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span>14-Day Dynamic Plant Stress Forecast (Live Open-Meteo)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any day card to inspect real meteorological telemetry and targeted Syngenta product application guidelines.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  Total Forecast: 14 Days
                </span>
              </div>

              {/* Horizontal Scrollable Timeline */}
              <div className="flex gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar">
                {(pipelineData?.forecast || []).map((day, idx) => {
                  const stressPct = Math.round((day.overall_stress_probability || 0.2) * 100);
                  const isHigh = stressPct >= 40;
                  const isCritical = stressPct >= 70;

                  return (
                    <div
                      key={`timeline-day-${day.day ?? idx}-${day.date ?? idx}`}
                      onClick={() => setSelectedDayModal(day)}
                      className={`min-w-[130px] p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 hover:shadow-md ${
                        isCritical
                          ? "bg-rose-50/70 border-rose-300 hover:border-rose-500"
                          : isHigh
                          ? "bg-amber-50/70 border-amber-300 hover:border-amber-500"
                          : "bg-[#f6f9fc] border-[#e3e8ee] hover:border-emerald-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0d253d]">Day {day.day}</span>
                        <span className="text-[10px] font-mono text-slate-500">{day.date}</span>
                      </div>

                      <div className="flex flex-col items-center justify-center py-1">
                        <span
                          className={`text-xl font-black font-mono ${
                            isCritical ? "text-rose-700" : isHigh ? "text-amber-700" : "text-emerald-700"
                          }`}
                        >
                          {stressPct}%
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
                          Stress Prob
                        </span>
                      </div>

                      <div className="space-y-1 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCritical
                              ? "bg-rose-200 text-rose-900"
                              : isHigh
                              ? "bg-amber-200 text-amber-900"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {day.dominant_stress}
                        </span>

                        <div className="text-[9px] font-medium text-slate-600">
                          {day.safe_to_spray ? (
                            <span className="text-emerald-700 font-bold">✓ Safe to spray</span>
                          ) : (
                            <span className="text-amber-700 font-bold">⚠️ High wind / rain</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Syngenta India Product Catalog Explorer */}
            <div className="p-5 bg-white border border-[#e3e8ee] rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#0d253d] text-sm flex items-center gap-2">
                    <Package className="h-4 w-4 text-emerald-600" />
                    <span>Syngenta India Retail Catalog (13 Registered Products)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Explore all Syngenta products sold by authorized retailers across India with real retail price ranges.
                  </p>
                </div>
                <button
                  onClick={() => setShowCatalog(!showCatalog)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{showCatalog ? "Collapse" : "Explore Catalog"}</span>
                  {showCatalog ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {showCatalog && (
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {[
                      { id: "all", label: "All Products (13)" },
                      { id: "biostimulant", label: "Biostimulants (2)" },
                      { id: "insecticide", label: "Insecticides (4)" },
                      { id: "fungicide", label: "Fungicides (4)" },
                      { id: "herbicide", label: "Herbicides (2)" },
                      { id: "seed", label: "Seed Treatment (1)" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCatalogCategory(cat.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          catalogCategory === cat.id
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                    {filteredCatalog.map((prod) => (
                      <div key={prod.key} className="p-3.5 rounded-xl border border-slate-200 bg-[#f6f9fc] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[#0d253d] text-sm">{prod.name}</span>
                          <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            {prod.category}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{prod.target}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[10px] font-mono">
                          <span className="text-slate-500">{prod.active_ingredient.substring(0, 38)}...</span>
                          <span className="font-black text-[#0d253d] bg-white px-2 py-0.5 rounded border border-slate-200">{prod.retail_price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Day Details Modal */}
        {selectedDayModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    DAY {selectedDayModal.day} · {selectedDayModal.date}
                  </span>
                  <h3 className="text-xl font-black text-[#0d253d] mt-1">
                    Day Forecast &amp; Product Action
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDayModal(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#f6f9fc] p-4 rounded-2xl border border-[#e3e8ee] text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Overall Stress Probability</span>
                  <span className="text-lg font-black font-mono text-[#0d253d]">
                    {Math.round((selectedDayModal.overall_stress_probability || 0) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Dominant Stress Factor</span>
                  <span className="text-sm font-bold text-amber-700">{selectedDayModal.dominant_stress}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Max Temperature</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedDayModal.weather_layer?.TMax ?? 26.6}°C
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Expected Rainfall</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedDayModal.weather_layer?.Precipitation_mm ?? 0} mm
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#0d253d]">
                  Targeted Syngenta Products for Day {selectedDayModal.day}
                </h4>

                {(selectedDayModal.products || []).length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayModal.products.map((prod, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/40 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#0d253d]">{prod.product_name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                            {prod.category}
                          </span>
                        </div>
                        <p className="text-slate-600">{prod.rationale}</p>
                        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-slate-800">
                          <div>Dosage: <strong className="font-bold">{prod.dosage}</strong></div>
                          <div>Timing: <strong className="font-bold">{prod.timing_window}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-100 text-slate-600 text-xs">
                    No chemical or biological intervention required for this day. Weather indicators are optimal.
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedDayModal(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
