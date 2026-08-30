"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useWeather } from "@/context/WeatherContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  getSavedFields,
  saveFarmerField,
  deleteFarmerField,
  setActiveField,
  calculatePolygonAreaAcres,
  CROP_OPTIONS,
  FieldRecord,
} from "@/lib/fieldStore";
import {
  MapPin,
  PenTool,
  Check,
  X,
  Sprout,
  Search,
  RotateCcw,
  Sparkles,
  Navigation,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Trash2,
  Info
} from "lucide-react";

const LeafletMapInner = dynamic(
  () => import("./LeafletMapInner").then((m) => m.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[440px] w-full bg-slate-950 flex flex-col items-center justify-center text-emerald-400 font-sans text-xs gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="font-bold">🛰️ Loading High-Resolution Satellite GIS &amp; Farm Polygons...</span>
      </div>
    ),
  }
);

interface InteractiveWeatherMapProps {
  lat?: number;
  lon?: number;
  crop?: string;
  onLocationSelect?: (lat: number, lon: number) => void;
  onFieldSelected?: (field: FieldRecord) => void;
}

export const InteractiveWeatherMap: React.FC<InteractiveWeatherMapProps> = ({
  lat = 23.2599,
  lon = 77.4126,
  crop = "Soybean",
  onLocationSelect,
  onFieldSelected,
}) => {
  const { weather } = useWeather();
  const { language } = useLanguage();

  const [currentCenter, setCurrentCenter] = useState<[number, number]>([lat, lon]);
  const [savedFields, setSavedFields] = useState<FieldRecord[]>(getSavedFields());
  const [activeField, setActiveFieldState] = useState<FieldRecord>(savedFields[0] || getSavedFields()[0]);

  // Search & Geocoding Autocomplete
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lon: number }>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState<boolean>(false);

  // Polygon Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [drawnNodes, setDrawnNodes] = useState<Array<[number, number]>>([]);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [newFieldName, setNewFieldName] = useState<string>("");
  const [newCropOption, setNewCropOption] = useState<string>(CROP_OPTIONS[0].name);

  // AI Land-Use Verification State
  const [isValidatingLand, setIsValidatingLand] = useState<boolean>(false);
  const [landValidationResult, setLandValidationResult] = useState<{
    is_agricultural: boolean;
    land_type: string;
    assessment: string;
    warning: string | null;
  } | null>(null);

  // GPS Auto-Locate State
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Sync center when parent changes lat/lon
  useEffect(() => {
    if (lat && lon) {
      setCurrentCenter([lat, lon]);
    }
  }, [lat, lon]);

  // Reload saved fields from store
  const refreshFields = () => {
    const list = getSavedFields();
    setSavedFields(list);
    if (list.length > 0) {
      setActiveFieldState(list[0]);
    }
  };

  useEffect(() => {
    refreshFields();
  }, []);

  // Geocoding live search with debouncing
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowResultsDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data?.results || []);
          setShowResultsDropdown(true);
        }
      } catch (err) {
        console.warn("Geocoding search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectField = (field: FieldRecord) => {
    setActiveFieldState(field);
    setActiveField(field.id);
    setCurrentCenter(field.center);
    if (onFieldSelected) onFieldSelected(field);
    if (onLocationSelect) onLocationSelect(field.center[0], field.center[1]);
  };

  const handleDeleteField = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    if (savedFields.length <= 1) {
      alert(language === "hi" ? "कम से कम एक खेत का होना आवश्यक है।" : "At least one farm plot is required.");
      return;
    }
    deleteFarmerField(fieldId);
    refreshFields();
  };

  const handleSelectSearchResult = (result: { name: string; lat: number; lon: number }) => {
    setCurrentCenter([result.lat, result.lon]);
    setSearchQuery(result.name.split(",")[0]);
    setShowResultsDropdown(false);
    if (onLocationSelect) onLocationSelect(result.lat, result.lon);
  };

  // Live GPS Locate
  const handleFetchLiveGPS = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCenter: [number, number] = [
            Math.round(pos.coords.latitude * 10000) / 10000,
            Math.round(pos.coords.longitude * 10000) / 10000,
          ];
          setCurrentCenter(newCenter);
          setIsLocating(false);
          if (onLocationSelect) onLocationSelect(newCenter[0], newCenter[1]);

          // Trigger AI Land Use Check for GPS coordinates
          validateLandWithGemini(newCenter[0], newCenter[1]);
        },
        () => {
          alert(language === "hi" ? "जीपीएस सिग्नल उपलब्ध नहीं है।" : "GPS signal unavailable. Please search your district.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  // AI Verification
  const validateLandWithGemini = async (centerLat: number, centerLon: number, poly: Array<[number, number]> = []) => {
    setIsValidatingLand(true);
    try {
      const res = await fetch("/api/plant-intelligence/validate-boundary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: centerLat, lon: centerLon, polygon: poly }),
      });
      if (res.ok) {
        const data = await res.json();
        setLandValidationResult({
          is_agricultural: data.is_agricultural,
          land_type: data.land_type || "Farmland",
          assessment: data.assessment || "Verified coordinates.",
          warning: data.warning || null,
        });
      }
    } catch (e) {
      console.warn("Land validation error:", e);
    } finally {
      setIsValidatingLand(false);
    }
  };

  // Handle map click
  const handleMapClick = (mapLat: number, mapLon: number) => {
    const latRound = Math.round(mapLat * 100000) / 100000;
    const lonRound = Math.round(mapLon * 100000) / 100000;

    if (isDrawingMode) {
      setDrawnNodes((prev) => [...prev, [latRound, lonRound]]);
    } else {
      setCurrentCenter([latRound, lonRound]);
      if (onLocationSelect) onLocationSelect(latRound, lonRound);
    }
  };

  const currentDrawnArea = calculatePolygonAreaAcres(drawnNodes);

  // Save new drawn field
  const handleSaveDrawnField = async () => {
    if (drawnNodes.length < 3) {
      alert(language === "hi" ? "कृपया खेत का घेरा बनाने के लिए कम से कम 3 बिंदुओं पर क्लिक करें।" : "Please click at least 3 points on the satellite map.");
      return;
    }

    const centerLat = drawnNodes.reduce((acc, curr) => acc + curr[0], 0) / drawnNodes.length;
    const centerLon = drawnNodes.reduce((acc, curr) => acc + curr[1], 0) / drawnNodes.length;
    const { acres, ha } = calculatePolygonAreaAcres(drawnNodes);

    const newFieldObj: FieldRecord = {
      id: `field_${Date.now()}`,
      name: newFieldName.trim() || `${newCropOption} Plot (${acres} Ac)`,
      crop: newCropOption,
      cropVariety: "JS-335 / High-Yield",
      sowingDate: new Date().toISOString().split("T")[0],
      growthStage: "R2 Flowering",
      areaAcres: acres,
      areaHa: ha,
      soilType: "Black Cotton Vertisol",
      irrigationType: "Rainfed + Borewell",
      color: "#10B981",
      center: [centerLat, centerLon],
      polygon: drawnNodes,
    };

    saveFarmerField(newFieldObj);
    setActiveField(newFieldObj.id);
    setActiveFieldState(newFieldObj);
    refreshFields();

    setIsDrawingMode(false);
    setDrawnNodes([]);
    setShowSaveModal(false);
    setNewFieldName("");

    if (onFieldSelected) onFieldSelected(newFieldObj);
    if (onLocationSelect) onLocationSelect(centerLat, centerLon);

    // Validate land use with Gemini AI
    validateLandWithGemini(centerLat, centerLon, drawnNodes);
  };

  return (
    <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-sm relative font-sans overflow-hidden isolate">
      
      {/* 1. Header & Live Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-mono font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              🛰️ HIGH-RESOLUTION SATELLITE GIS
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              GPS: {currentCenter[0].toFixed(4)}°N, {currentCenter[1].toFixed(4)}°E
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            {language === "hi" ? "खेत और सैटेलाइट जीआईएस नेविगेटर" : "Farm & Satellite GIS Navigator"}
          </h2>
        </div>

        {/* Search Input with Autocomplete */}
        <div className="relative w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResultsDropdown(true)}
              placeholder={language === "hi" ? "शहर, जिला या गांव खोजें..." : "Search city, district, village..."}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setShowResultsDropdown(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showResultsDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 border-b border-slate-50 last:border-0 transition-colors cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{res.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Registered Farms / Fields Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase shrink-0 flex items-center gap-1">
          <Layers className="h-3.5 w-3.5 text-emerald-600" />
          {language === "hi" ? "आपके पंजीकृत खेत:" : "Your Farm Plots:"}
        </span>

        {savedFields.length === 0 ? (
          <span className="text-xs text-slate-500 font-medium italic px-2">
            {language === "hi" ? "कोई खेत रेखांकित नहीं है — नया खेत जोड़ें या सीमा बनाएं" : "No farm plots drawn yet — click Add New Field"}
          </span>
        ) : (
          savedFields.map((f) => {
            const isSelected = activeField?.id === f.id;
            return (
              <div
                key={f.id}
                onClick={() => handleSelectField(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <Sprout className="h-3.5 w-3.5" />
                <span>{f.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${isSelected ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {f.areaAcres} Ac · {f.crop}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteField(e, f.id)}
                  className={`p-0.5 rounded-md hover:bg-rose-500 hover:text-white transition-colors ${isSelected ? "text-emerald-200" : "text-slate-400"}`}
                  title="Delete plot"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })
        )}

        <button
          onClick={() => {
            setIsDrawingMode(true);
            setDrawnNodes([]);
          }}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-300 shrink-0 cursor-pointer"
        >
          <Plus className="h-3 w-3" />
          <span>{language === "hi" ? "+ नया खेत जोड़ें" : "+ Add New Field"}</span>
        </button>

        <button
          onClick={handleFetchLiveGPS}
          disabled={isLocating}
          className="ml-auto px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 shrink-0 border border-blue-200 cursor-pointer"
        >
          <Navigation className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? (language === "hi" ? "खोज रहे हैं..." : "Locating...") : (language === "hi" ? "लाइव जीपीएस" : "My GPS")}</span>
        </button>
      </div>

      {/* 3. AI Land-Use & Boundary Verification Advisory Banner */}
      {landValidationResult && !landValidationResult.is_agricultural && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in duration-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold font-mono text-[10px] uppercase text-amber-800 block">
              AI Land-Use Verification: {landValidationResult.land_type}
            </span>
            <p className="text-xs text-amber-950 font-medium">
              {landValidationResult.warning || "Detected residential/commercial zone. For biophysical soil moisture and GDD telemetry, boundaries should be placed on active farm fields."}
            </p>
          </div>
        </div>
      )}

      {/* 4. Unified Stable Action Bar (No DOM layout shift) */}
      <div className={`p-3 rounded-2xl text-xs transition-colors ${
        isDrawingMode ? "bg-emerald-950 text-white border-2 border-emerald-400 shadow-md" : "bg-slate-900 text-white"
      }`}>
        {isDrawingMode ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <PenTool className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-emerald-300 block">
                  {language === "hi" ? "खेत सीमा रेखांकन सक्रिय (Drawing Mode)" : "Farm Boundary Tracing Active"}
                </span>
                <p className="text-[11px] text-slate-300">
                  {language === "hi"
                    ? "सैटेलाइट मैप पर अपने खेत के 3 या 4 कोनों पर क्लिक करें।"
                    : "Click 3 or 4 corner points directly on the satellite map."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900 text-emerald-300 font-mono font-bold text-xs border border-emerald-700">
                {drawnNodes.length} {language === "hi" ? "बिंदु" : "Corners"} ({currentDrawnArea.acres} Ac)
              </span>
              {drawnNodes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDrawnNodes((prev) => prev.slice(0, -1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Undo</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (drawnNodes.length < 3) {
                    alert(language === "hi" ? "कृपया कम से कम 3 बिंदुओं पर क्लिक करें।" : "Click at least 3 points on the satellite map.");
                    return;
                  }
                  setShowSaveModal(true);
                }}
                disabled={drawnNodes.length < 3}
                className={`px-3.5 py-1 rounded-lg font-black text-xs flex items-center gap-1 cursor-pointer transition-all ${
                  drawnNodes.length >= 3
                    ? "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>{language === "hi" ? "खेत सहेजें" : "Save Field"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDrawingMode(false);
                  setDrawnNodes([]);
                }}
                className="p-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-300 border border-rose-800 cursor-pointer"
                title="Cancel drawing"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                HIGH-RES SATELLITE HYBRID
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">
                {language === "hi" ? "सक्रिय खेत: " + (activeField?.name || "कोई नहीं") : "Active Field: " + (activeField?.name || "None")}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsDrawingMode(true);
                setDrawnNodes([]);
              }}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all ml-auto"
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>{language === "hi" ? "खेत का घेरा बनाएं" : "Draw Boundary"}</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Leaflet Satellite Map Container */}
      <div className="h-[440px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
        <LeafletMapInner
          center={currentCenter}
          savedFields={savedFields}
          activeFieldId={activeField?.id}
          isDrawingMode={isDrawingMode}
          drawnNodes={drawnNodes}
          baseMapType="satellite"
          onMapClick={handleMapClick}
          onSelectField={(f) => handleSelectField(f)}
        />
      </div>

      {/* 7. Save Field Modal Dialog */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                {language === "hi" ? "नया खेत पंजीकृत करें" : "Register New Farm Plot"}
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[10px] font-mono text-emerald-800 font-bold block uppercase">
                  {language === "hi" ? "सैटेलाइट द्वारा मापा गया क्षेत्रफल:" : "Calculated Satellite Acreage:"}
                </span>
                <span className="text-xl font-black text-emerald-950 font-mono">
                  {currentDrawnArea.acres} {language === "hi" ? "एकड़" : "Acres"} ({currentDrawnArea.ha} Ha)
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  {language === "hi" ? "खेत का नाम" : "Field Name"}
                </label>
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder={language === "hi" ? "उदा. उत्तर का खेत, बोरवेल वाला प्लॉट" : "e.g. North River Plot"}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  {language === "hi" ? "मुख्य फसल" : "Primary Crop"}
                </label>
                <select
                  value={newCropOption}
                  onChange={(e) => setNewCropOption(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {CROP_OPTIONS.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleSaveDrawnField}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm cursor-pointer"
              >
                {language === "hi" ? "✓ खेत सहेजें" : "✓ Confirm & Save Field"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
