"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/context/LanguageContext";
import {
  FieldRecord,
  getSavedFields,
  saveFarmerField,
  deleteFarmerField,
  setActiveField,
  calculatePolygonAreaAcres,
  CROP_OPTIONS,
} from "@/lib/fieldStore";
import {
  Layers,
  MapPin,
  PenTool,
  RotateCcw,
  Check,
  X,
  Plus,
  Trash2,
  Navigation,
  Search,
  Sprout,
  AlertTriangle,
  Eye,
  Globe2,
  Mountain,
} from "lucide-react";
import type { BaseMapMode } from "./LeafletMapInner";

// Dynamic import with SSR disabled
const LeafletMapInner = dynamic(
  () => import("./LeafletMapInner").then((m) => m.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[440px] w-full bg-slate-900 flex flex-col items-center justify-center text-emerald-400 font-sans text-xs gap-3">
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
  locationName?: string;
  onLocationSelect?: (lat: number, lon: number) => void;
  onFieldSelected?: (field: FieldRecord) => void;
}

export const InteractiveWeatherMap: React.FC<InteractiveWeatherMapProps> = ({
  lat = 23.2599,
  lon = 77.4126,
  locationName,
  onLocationSelect,
  onFieldSelected,
}) => {
  const { language } = useLanguage();
  const [, startTransition] = useTransition();

  // Core state
  const [currentCenter, setCurrentCenter] = useState<[number, number]>([lat, lon]);
  const [savedFields, setSavedFields] = useState<FieldRecord[]>([]);
  const [activeField, setActiveFieldState] = useState<FieldRecord | null>(null);
  const [baseMapType, setBaseMapType] = useState<BaseMapMode>("satellite");

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
  const [landValidationResult, setLandValidationResult] = useState<{
    is_agricultural: boolean;
    land_type: string;
    assessment: string;
    warning: string | null;
  } | null>(null);

  // GPS Auto-Locate State
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Load saved fields on client mount
  useEffect(() => {
    const list = getSavedFields();
    if (list && list.length > 0) {
      setSavedFields(list);
      setActiveFieldState(list[0]);
    }
  }, []);

  // Sync center when parent lat/lon changes
  useEffect(() => {
    if (lat && lon && (currentCenter[0] !== lat || currentCenter[1] !== lon)) {
      setCurrentCenter([lat, lon]);
    }
  }, [lat, lon]);

  // Geocoding Autocomplete Search with Debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResultsDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSearchResults(data);
            setShowResultsDropdown(true);
          } else {
            setSearchResults([]);
            setShowResultsDropdown(false);
          }
        }
      } catch (e) {
        console.warn("Geocode error:", e);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: { name: string; lat: number; lon: number }) => {
    setCurrentCenter([result.lat, result.lon]);
    setSearchQuery(result.name);
    setShowResultsDropdown(false);
    if (onLocationSelect) onLocationSelect(result.lat, result.lon);
  };

  // Switch Active Field
  const handleSelectField = useCallback((field: FieldRecord) => {
    setActiveFieldState(field);
    setActiveField(field.id);
    setCurrentCenter(field.center);
    if (onFieldSelected) onFieldSelected(field);
    if (onLocationSelect) onLocationSelect(field.center[0], field.center[1]);
  }, [onFieldSelected, onLocationSelect]);

  // Delete Field
  const handleDeleteField = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    if (savedFields.length <= 1) {
      alert(language === "hi" ? "आप अपने पास कम से कम एक खेत का रिकॉर्ड रखें।" : "You must keep at least one registered farm plot.");
      return;
    }
    if (confirm(language === "hi" ? "क्या आप इस खेत को हटाना चाहते हैं?" : "Delete this farm plot?")) {
      const updated = deleteFarmerField(fieldId);
      setSavedFields(updated);
      if (updated.length > 0) {
        setActiveFieldState(updated[0]);
        setActiveField(updated[0].id);
        setCurrentCenter(updated[0].center);
      }
    }
  };

  // Live GPS Fetch
  const handleFetchLiveGPS = () => {
    if (!navigator.geolocation) {
      alert(language === "hi" ? "आपका ब्राउज़र जीपीएस का समर्थन नहीं करता है।" : "GPS geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = Math.round(pos.coords.latitude * 100000) / 100000;
        const newLon = Math.round(pos.coords.longitude * 100000) / 100000;
        setCurrentCenter([newLat, newLon]);
        setIsLocating(false);
        if (onLocationSelect) onLocationSelect(newLat, newLon);
      },
      () => {
        alert(language === "hi" ? "जीपीएस सिग्नल उपलब्ध नहीं है। कृपया जिला खोजें।" : "GPS signal unavailable. Please search your district.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Map Click Handler for Drawing or Relocation
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
      name: newFieldName.trim() || `Plot #${savedFields.length + 1}`,
      crop: newCropOption,
      cropVariety: "JS-335",
      sowingDate: new Date().toISOString().split("T")[0],
      growthStage: "Vegetative Phase",
      areaAcres: acres,
      areaHa: ha,
      soilType: "Black Cotton Vertisol",
      irrigationType: "Rainfed + Borewell",
      color: "#10B981",
      center: [centerLat, centerLon],
      polygon: drawnNodes,
    };

    const updated = saveFarmerField(newFieldObj);
    setSavedFields(updated);
    setActiveField(newFieldObj.id);
    setActiveFieldState(newFieldObj);

    setIsDrawingMode(false);
    setDrawnNodes([]);
    setShowSaveModal(false);
    setNewFieldName("");

    if (onFieldSelected) onFieldSelected(newFieldObj);
    if (onLocationSelect) onLocationSelect(centerLat, centerLon);
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

        {/* Layer Switcher & Search Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Map Layer Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <button
              onClick={() => setBaseMapType("satellite")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                baseMapType === "satellite" ? "bg-white text-emerald-900 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setBaseMapType("streets")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                baseMapType === "streets" ? "bg-white text-blue-900 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              <Globe2 className="h-3 w-3" />
              <span>Streets</span>
            </button>
            <button
              onClick={() => setBaseMapType("terrain")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                baseMapType === "terrain" ? "bg-white text-amber-900 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              <Mountain className="h-3 w-3" />
              <span>Terrain</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResultsDropdown(true)}
              placeholder={language === "hi" ? "शहर या गांव खोजें..." : "Search city, village..."}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setShowResultsDropdown(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}

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
      </div>

      {/* 2. Registered Farms Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase shrink-0 flex items-center gap-1">
          <Layers className="h-3.5 w-3.5 text-emerald-600" />
          {language === "hi" ? "पंजीकृत खेत:" : "Farm Plots:"}
        </span>

        {savedFields.map((f) => {
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
        })}

        <button
          onClick={() => {
            setIsDrawingMode(true);
            setDrawnNodes([]);
          }}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-300 shrink-0 cursor-pointer"
        >
          <Plus className="h-3 w-3" />
          <span>{language === "hi" ? "+ नया खेत जोड़ें" : "+ Add Field"}</span>
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

      {/* 3. Unified Stable Action Bar */}
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
                    ? "मैप पर अपने खेत के 3 या 4 कोनों पर क्लिक करें।"
                    : "Click 3 or 4 corner points directly on the map."}
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
                    alert(language === "hi" ? "कृपया कम से कम 3 बिंदुओं पर क्लिक करें।" : "Click at least 3 points on the map.");
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

      {/* 4. Leaflet Map Container */}
      <div className="h-[460px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100">
        <LeafletMapInner
          center={currentCenter}
          savedFields={savedFields}
          activeFieldId={activeField?.id}
          isDrawingMode={isDrawingMode}
          drawnNodes={drawnNodes}
          baseMapType={baseMapType}
          onMapClick={handleMapClick}
          onSelectField={(f) => handleSelectField(f)}
        />
      </div>

      {/* 5. Save Field Modal Dialog */}
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

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === "hi" ? "खेत का नाम:" : "Plot / Field Name:"}
                </label>
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="e.g. North Plot / उत्तर खलिहान"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === "hi" ? "बोई गई फसल:" : "Crop Grown:"}
                </label>
                <select
                  value={newCropOption}
                  onChange={(e) => setNewCropOption(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {CROP_OPTIONS.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950 font-bold">
                <span>{language === "hi" ? "गणना किया गया क्षेत्रफल:" : "Calculated Boundary Area:"}</span>
                <span className="font-mono text-emerald-800 text-sm">
                  {currentDrawnArea.acres} Acres ({currentDrawnArea.ha} Ha)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleSaveDrawnField}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                {language === "hi" ? "खेत सहेजें और जोड़ें" : "Save & Register Plot"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
