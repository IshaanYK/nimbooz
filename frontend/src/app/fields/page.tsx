"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/AppShell";
import { DataBadge } from "@/components/DataBadge";
import { PageHelpModal } from "@/components/PageHelpModal";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { useFarm } from "@/context/FarmContext";
import { FarmerProfile, getStoredProfile, saveProfile } from "@/lib/userStore";
import {
  getSavedFields,
  saveFarmerField,
  deleteFarmerField,
  setActiveField,
  getInitialFarmerField,
  getFieldCropOptions,
  saveCustomCrop,
  FieldRecord,
} from "@/lib/fieldStore";
import { searchLocation } from "@/lib/api";
import { findCropMandiRate } from "@/lib/mandiEngine";
import {
  MapPin,
  Plus,
  Trash2,
  Layers,
  CheckCircle2,
  Sliders,
  Thermometer,
  Mic,
  Sparkles,
  Edit3,
  X,
  Sprout,
  Activity,
  Search,
  Navigation,
  RefreshCw,
  TrendingUp,
  Droplets,
  Compass,
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw,
} from "lucide-react";

// Dynamic import for Leaflet-based RealBoundaryMap to avoid SSR issues
const RealBoundaryMap = dynamic(
  () => import("@/components/RealBoundaryMap").then((mod) => mod.RealBoundaryMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] bg-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3 border border-[#e3e8ee]">
        <RefreshCw className="h-7 w-7 animate-spin text-indigo-500" />
        <span className="text-xs font-mono font-bold">Loading Satellite GIS Engine...</span>
      </div>
    ),
  }
);

export default function MyFieldsPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const { weather } = useWeather();
  const { activeFarm, createFarm, updateActiveFarm } = useFarm();

  const [profile, setProfile] = useState<FarmerProfile>(() => getStoredProfile());
  const [savedFields, setSavedFields] = useState<FieldRecord[]>([]);
  const [activeField, setActiveFieldState] = useState<FieldRecord>(getInitialFarmerField());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    weather.lat || 23.2599,
    weather.lon || 77.4126,
  ]);
  const [currentPolygon, setCurrentPolygon] = useState<Array<[number, number]>>([]);
  const [calculatedAcres, setCalculatedAcres] = useState<number>(5.0);

  // Search location
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Array<any>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // New field form state
  const regionalCrops = getFieldCropOptions(weather.district, weather.state);
  const [newFieldName, setNewFieldName] = useState<string>("");
  const [newCrop, setNewCrop] = useState<string>(regionalCrops[0]?.name || "Soybean");
  const [isCustomCropMode, setIsCustomCropMode] = useState<boolean>(false);
  const [customCropName, setCustomCropName] = useState<string>("");
  const [newAcres, setNewAcres] = useState<number>(5.0);
  const [newSoilType, setNewSoilType] = useState<string>("Medium Black Clay");
  const [newIrrigation, setNewIrrigation] = useState<string>("Borewell + Drip");

  // Sync profile & fields on mount
  useEffect(() => {
    const p = getStoredProfile();
    if (p) setProfile(p);

    const list = getSavedFields();
    if (list && list.length > 0) {
      setSavedFields(list);
      const target = list[0];
      setActiveFieldState(target);
      if (target.center) setMapCenter(target.center);
      else if (p?.gpsLocation) setMapCenter([p.gpsLocation.lat, p.gpsLocation.lon]);

      if (target.polygon && target.polygon.length >= 3) {
        setCurrentPolygon(target.polygon);
      } else if (p?.polygon && p.polygon.length >= 3) {
        setCurrentPolygon(p.polygon);
      }

      if (target.areaAcres) setCalculatedAcres(target.areaAcres);
      else if (p?.fieldAreaAcres) setCalculatedAcres(p.fieldAreaAcres);
    } else {
      const initial = getInitialFarmerField();
      setSavedFields([initial]);
      setActiveFieldState(initial);
      if (initial.center) setMapCenter(initial.center);
      if (initial.polygon) setCurrentPolygon(initial.polygon);
      if (initial.areaAcres) setCalculatedAcres(initial.areaAcres);
    }
  }, []);

  const handleSelectField = (field: FieldRecord) => {
    setActiveFieldState(field);
    setActiveField(field.id);
    if (field.center) setMapCenter(field.center);
    if (field.polygon) setCurrentPolygon(field.polygon);
    if (field.areaAcres) setCalculatedAcres(field.areaAcres);

    updateActiveFarm({
      name: field.name,
      primaryCrop: field.crop,
      cropVariety: field.cropVariety,
      areaAcres: field.areaAcres,
      areaHa: field.areaHa,
      center: field.center,
      polygon: field.polygon,
    });
  };

  const handleBoundaryChange = useCallback(
    (points: Array<[number, number]>, acres: number) => {
      setCurrentPolygon(points);
      setCalculatedAcres(acres);
    },
    []
  );

  const handleSaveBoundaryToField = () => {
    if (!activeField) return;
    const updatedField: FieldRecord = {
      ...activeField,
      polygon: currentPolygon,
      areaAcres: calculatedAcres,
      areaHa: +(calculatedAcres * 0.404686).toFixed(2),
      center: mapCenter,
    };

    const updatedList = saveFarmerField(updatedField);
    setSavedFields(updatedList);
    setActiveFieldState(updatedField);

    updateActiveFarm({
      areaAcres: calculatedAcres,
      areaHa: updatedField.areaHa,
      polygon: currentPolygon,
      center: mapCenter,
    });

    const p = getStoredProfile();
    if (p) {
      saveProfile({
        ...p,
        fieldAreaAcres: calculatedAcres,
      });
    }

    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3500);
  };

  const handleDeleteField = (fieldId: string) => {
    if (savedFields.length <= 1) {
      alert("You must keep at least one registered field plot in your portfolio.");
      return;
    }
    if (confirm("Are you sure you want to delete this field from your farm portfolio?")) {
      const updated = deleteFarmerField(fieldId);
      setSavedFields(updated);
      if (updated.length > 0) {
        handleSelectField(updated[0]);
      }
    }
  };

  const handleLocationSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);
      const results = await searchLocation(val);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectLocation = (res: any) => {
    const lat = Number(res.lat);
    const lon = Number(res.lon);
    setMapCenter([lat, lon]);
    setSearchQuery(res.name);
    setShowDropdown(false);

    // Reposition initial polygon around new center
    const newPoly: Array<[number, number]> = [
      [lat + 0.0012, lon - 0.0015],
      [lat + 0.0015, lon + 0.0018],
      [lat - 0.0011, lon + 0.0014],
      [lat - 0.0014, lon - 0.0012],
    ];
    setCurrentPolygon(newPoly);
  };

  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setMapCenter([lat, lon]);
        setSearchQuery(`GPS Location (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`);

        const newPoly: Array<[number, number]> = [
          [lat + 0.0012, lon - 0.0015],
          [lat + 0.0015, lon + 0.0018],
          [lat - 0.0011, lon + 0.0014],
          [lat - 0.0014, lon - 0.0012],
        ];
        setCurrentPolygon(newPoly);
      },
      () => {
        alert("GPS location access was denied. You can search any city or district instead.");
      }
    );
  };

  const handleAddQuickField = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = mapCenter[0];
    const lon = mapCenter[1];
    const acres = Number(newAcres) || 5.0;

    let finalCropName = newCrop;
    let finalVariety = "Standard Farm Variety";

    if (isCustomCropMode && customCropName.trim()) {
      const saved = saveCustomCrop({ name: customCropName.trim() });
      finalCropName = saved.name;
      finalVariety = saved.defaultVariety;
    } else {
      const matched = regionalCrops.find((c) => c.name === newCrop);
      if (matched) finalVariety = matched.defaultVariety;
    }

    const newFieldObj: FieldRecord = {
      id: `field_${Date.now()}`,
      name: newFieldName.trim() || `Farm Plot ${savedFields.length + 1}`,
      crop: finalCropName,
      cropVariety: finalVariety,
      areaAcres: acres,
      areaHa: +(acres * 0.404686).toFixed(2),
      center: [lat, lon],
      polygon: [
        [lat + 0.0015, lon - 0.002],
        [lat + 0.002, lon + 0.002],
        [lat - 0.0015, lon + 0.0025],
        [lat - 0.002, lon - 0.0015],
      ],
      sowingDate: new Date().toISOString().split("T")[0],
      growthStage: "Vegetative Stage",
      soilType: newSoilType,
      irrigationType: newIrrigation,
      color: "#10B981",
      healthScore: 94,
    };

    const updated = saveFarmerField(newFieldObj);
    setSavedFields(updated);
    handleSelectField(newFieldObj);

    createFarm({
      name: newFieldObj.name,
      district: weather.district || "Local District",
      state: weather.state || "India",
      primaryCrop: finalCropName,
      cropVariety: finalVariety,
      areaAcres: acres,
      areaHa: newFieldObj.areaHa,
      center: [lat, lon],
      polygon: newFieldObj.polygon,
    });

    setShowAddModal(false);
    setNewFieldName("");
    setIsCustomCropMode(false);
    setCustomCropName("");
  };

  const currentField = activeField || savedFields[0] || getInitialFarmerField();
  const mandiRate = findCropMandiRate(currentField.crop, weather.district, weather.state);
  const currentModalPrice = mandiRate?.modalPrice || 4850;
  const estimatedHarvestValue = Math.round(currentField.areaAcres * 12.5 * currentModalPrice);

  return (
    <AppShell>
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                PS-01 GIS FIELD REGISTRY
              </span>
              <DataBadge type="USER_PROVIDED" customText="LIVE SATELLITE PLOTTER" />
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                📍 {(weather.district || "Bhopal").toUpperCase()} ({savedFields.length} {savedFields.length === 1 ? (isHindi ? "खेत" : "PLOT") : (isHindi ? "खेत" : "PLOTS")})
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#0d253d] tracking-tight">
              {isHindi ? "खेत का नक्शा और सीमा निर्धारण" : "Farm Field Boundaries & GIS Mapping"}
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-3xl mt-1">
              {isHindi
                ? "सैटेलाइट मैप पर अपने खेत की वास्तविक सीमा (Boundary) खींचें, सही एकड़ मापें और फसल प्रोफ़ाइल प्रबंधित करें।"
                : "Draw real polygon boundaries on satellite maps, calculate accurate geodesic acreage, and manage your crop plots."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <PageHelpModal
              pageKey="fields"
              title="How to Map Farm Boundaries"
              subtitle="Accurately map your fields to calculate micro-climate stress and exact chemical dosages."
              steps={[
                { number: "01", title: "Locate Your Farm", desc: "Use the search bar or GPS button to focus the satellite view on your field." },
                { number: "02", title: "Drag Boundary Pins", desc: "Drag the circular white corner pins to match the perimeter of your field." },
                { number: "03", title: "Save & Synchronize", desc: "Click 'Save Boundary to Field' to update your acreage and telemetry across the app." },
              ]}
            />

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#533afd] to-[#4434d4] hover:opacity-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>{isHindi ? "नया खेत जोड़ें" : "Register New Field"}</span>
            </button>
          </div>
        </div>

        {/* ── 1. Interactive Satellite Map & Boundary Editor ──────────────── */}
        <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  REAL-TIME GEODESIC PLOTTER
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Active Plot: <strong className="text-slate-900">{currentField.name}</strong>
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#0d253d] font-display">
                {isHindi ? "सैटेलाइट मैप पर खेत की सीमा खींचें" : "Interactive Field Perimeter & Acreage Calculator"}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi
                  ? "सफेद कोनों को खींचकर खेत का आकार बदलें — एकड़ की गणना स्वतः अपडेट होगी।"
                  : "Drag the white corner pins to match your real field fences. Acreage recalculates dynamically."}
              </p>
            </div>

            {/* Location Search Bar directly above Map */}
            <div className="flex items-center gap-2 relative w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  placeholder="Search village or district..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#e3e8ee] bg-[#f6f9fc] text-[#0d253d] font-bold focus:bg-white focus:outline-none focus:border-indigo-500"
                />
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {isSearching && (
                  <RefreshCw className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 animate-spin" />
                )}

                {/* Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {searchResults.map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => handleSelectLocation(res)}
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

              <button
                type="button"
                onClick={handleAutoDetectGPS}
                className="px-3 py-2 rounded-xl bg-[#f6f9fc] hover:bg-slate-100 text-slate-700 border border-[#e3e8ee] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="Detect GPS"
              >
                <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                <span className="hidden sm:inline">GPS</span>
              </button>
            </div>
          </div>

          {/* Leaflet Map Component */}
          <div className="relative rounded-3xl overflow-hidden border border-[#e3e8ee] shadow-sm">
            <RealBoundaryMap
              center={mapCenter}
              zoom={16}
              initialPoints={currentPolygon.length >= 3 ? currentPolygon : profile?.polygon && profile.polygon.length >= 3 ? profile.polygon : undefined}
              onBoundaryChange={handleBoundaryChange}
              onCenterChange={(newC) => setMapCenter(newC)}
            />
          </div>

          {/* Real-time Calculated Acreage & Save Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee]">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                  CALCULATED AREA (SHOELACE FORMULA)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#0d253d] font-mono">
                    {calculatedAcres} <span className="text-sm font-semibold text-slate-500">Acres</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {(calculatedAcres * 0.404686).toFixed(2)} Hectares ({(calculatedAcres * 4046.86).toLocaleString("en-IN", { maximumFractionDigits: 0 })} m²)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveBoundaryToField}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  isSavedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-r from-[#533afd] to-[#4434d4] hover:opacity-95 text-white hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isSavedSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>✓ Boundary Saved to Farm!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isHindi ? "खेत की सीमा सुरक्षित करें" : "Save Boundary to Field"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. Field Portfolio & Agronomic Telemetry Grid ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Registered Farm Plots Portfolio (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#0d253d] font-display">
                      {isHindi ? "पंजीकृत खेत (My Farm Portfolio)" : "Registered Farm Plots"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select a plot to view its specific boundary, crop variety, and soil data.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                  {savedFields.length} {savedFields.length === 1 ? "Plot" : "Plots"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {savedFields.map((f) => {
                  const isSelected = currentField.id === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => handleSelectField(f)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                        isSelected
                          ? "bg-white border-[#533afd] ring-2 ring-[#533afd]/20 shadow-md"
                          : "bg-[#f6f9fc] hover:bg-slate-100 border-[#e3e8ee]"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-sm text-[#0d253d] font-display">{f.name}</h4>
                          <span className="text-xs text-slate-600 font-medium block mt-0.5">
                            🌱 {f.crop} <span className="text-slate-400">({f.growthStage || "Flowering"})</span>
                          </span>
                        </div>
                        <span className="text-xs font-mono font-black text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                          {f.areaAcres} Ac
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200/60">
                        <div>
                          <span className="text-slate-400 block text-[9px]">SOIL</span>
                          <span className="font-bold truncate block">{f.soilType?.split(" ")[0] || "Black Clay"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">HEALTH SCORE</span>
                          <span className="font-bold text-emerald-600">{f.healthScore || 92}% Optimal</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {f.irrigationType || "Borewell + Drip"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteField(f.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Field"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Farm Navigation CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/plant-intelligence"
                className="p-4 rounded-2xl bg-white border border-[#e3e8ee] hover:border-indigo-400 hover:shadow-md transition-all group flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0d253d]">Plant Stress Radar</h4>
                  <p className="text-[11px] text-slate-500">14-Day climate check for this plot</p>
                </div>
              </Link>

              <Link
                href="/robi"
                className="p-4 rounded-2xl bg-white border border-[#e3e8ee] hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0d253d]">ROBI Profit Proof</h4>
                  <p className="text-[11px] text-slate-500">Mandi cash gain calculator</p>
                </div>
              </Link>

              <Link
                href="/assistant"
                className="p-4 rounded-2xl bg-white border border-[#e3e8ee] hover:border-violet-400 hover:shadow-md transition-all group flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-violet-50 text-violet-700">
                    <Mic className="h-4 w-4" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0d253d]">Voice AI Advisory</h4>
                  <p className="text-[11px] text-slate-500">Ask agronomy questions in Hindi</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Right: Selected Field Live Telemetry & Soil Specs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Telemetry Card */}
            <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-[#0d253d] font-bold text-sm">
                  <Thermometer className="h-4 w-4 text-indigo-600" />
                  <span>Live Field Telemetry: {currentField.name}</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  OPEN-METEO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 bg-[#f6f9fc] rounded-xl border border-[#e3e8ee] space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-bold">AIR TEMPERATURE</span>
                  <span className="text-lg font-black text-slate-900">{weather.temperature}°C</span>
                </div>
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-0.5">
                  <span className="text-emerald-800 text-[10px] block font-bold">SOIL MOISTURE EST.</span>
                  <span className="text-lg font-black text-emerald-800">{weather.soilMoistureEst}%</span>
                </div>
                <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200/80 space-y-0.5">
                  <span className="text-indigo-800 text-[10px] block font-bold">PRECIPITATION</span>
                  <span className="text-lg font-black text-indigo-800">{weather.precipitation} mm</span>
                </div>
                <div className="p-3.5 bg-[#f6f9fc] rounded-xl border border-[#e3e8ee] space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-bold">WIND VELOCITY</span>
                  <span className="text-lg font-black text-slate-900">{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>

            {/* Field Economic Valuation */}
            <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-[#0d253d] font-bold text-sm">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span>Mandi Crop Valuation for this Plot</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ₹{currentModalPrice}/q
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-900 uppercase block">
                  ESTIMATED HARVEST REVENUE
                </span>
                <div className="text-3xl font-black text-emerald-700 font-display">
                  ₹{estimatedHarvestValue.toLocaleString("en-IN")}
                </div>
                <p className="text-[11px] text-emerald-800 font-medium mt-1">
                  Based on {currentField.areaAcres} acres @ ~12.5 qtl/acre yield in {weather.district} Mandi.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modal: Register New Field */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-[#0d253d] font-display">
                  {isHindi ? "नया खेत पंजीकृत करें" : "Register New Farm Plot"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuickField} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Field / Plot Name</label>
                <input
                  type="text"
                  required
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="e.g. North Canal Soybean Plot"
                  className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-bold text-[#0d253d] text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block text-xs">Primary Crop</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCropMode(!isCustomCropMode);
                      if (!isCustomCropMode) setCustomCropName("");
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                  >
                    {isCustomCropMode ? "← Choose from list" : "+ Add Custom Crop"}
                  </button>
                </div>

                {isCustomCropMode ? (
                  <input
                    type="text"
                    required
                    value={customCropName}
                    onChange={(e) => setCustomCropName(e.target.value)}
                    placeholder="e.g. Garlic, Mustard, Saffron..."
                    className="w-full p-2.5 bg-indigo-50/50 border-2 border-indigo-500 rounded-xl font-bold text-xs text-slate-900 focus:outline-none"
                  />
                ) : (
                  <select
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-bold text-xs text-[#0d253d] cursor-pointer"
                  >
                    {regionalCrops.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={newAcres}
                    onChange={(e) => setNewAcres(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Irrigation System</label>
                  <select
                    value={newIrrigation}
                    onChange={(e) => setNewIrrigation(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-bold text-xs cursor-pointer"
                  >
                    <option value="Borewell + Drip">Borewell + Drip</option>
                    <option value="Canal Irrigation">Canal Irrigation</option>
                    <option value="Sprinkler System">Sprinkler System</option>
                    <option value="Rainfed Monsoon">Rainfed Monsoon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Soil Type</label>
                <select
                  value={newSoilType}
                  onChange={(e) => setNewSoilType(e.target.value)}
                  className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-bold text-xs cursor-pointer"
                >
                  <option value="Medium Black Clay (Vertisol)">Medium Black Clay (Vertisol)</option>
                  <option value="Alluvial Loam">Alluvial Loam</option>
                  <option value="Red Sandy Loam">Red Sandy Loam</option>
                  <option value="Arid Sandy Soil">Arid Sandy Soil</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#533afd] to-[#4434d4] hover:opacity-95 text-white font-bold shadow transition-all cursor-pointer"
                >
                  Save Field Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
