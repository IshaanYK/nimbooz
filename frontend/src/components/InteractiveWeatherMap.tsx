"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
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
  Eye,
  Globe2,
  Mountain,
} from "lucide-react";

// Dynamically import Leaflet with SSR off
const LeafletMapInner = dynamic(
  () => import("./LeafletMapInner").then((m) => m.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[460px] w-full bg-slate-900 flex flex-col items-center justify-center text-emerald-400 font-sans text-xs gap-3">
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

export function InteractiveWeatherMap({
  lat,
  lon,
  locationName,
  onLocationSelect,
  onFieldSelected,
}: InteractiveWeatherMapProps) {
  const { language } = useLanguage();
  const { weather } = useWeather();

  const effectiveLat = lat ?? weather.lat ?? 23.2599;
  const effectiveLon = lon ?? weather.lon ?? 77.4126;

  // Coordinates and Fields State
  const [center, setCenter] = useState<[number, number]>([effectiveLat, effectiveLon]);
  const [fields, setFields] = useState<FieldRecord[]>([]);
  const [activeField, setActiveFieldState] = useState<FieldRecord | null>(null);
  const [mapType, setMapType] = useState<"satellite" | "streets" | "terrain">("satellite");

  // Search State
  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lon: number }>>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Drawing State
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<Array<[number, number]>>([]);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [newPlotName, setNewPlotName] = useState<string>("");
  const [newPlotCrop, setNewPlotCrop] = useState<string>(CROP_OPTIONS[0].name);

  // GPS State
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Load Saved Fields on Mount
  useEffect(() => {
    const list = getSavedFields();
    if (list && list.length > 0) {
      setFields(list);
      setActiveFieldState(list[0]);
    }
  }, []);

  // Update center if parent lat/lon or weather context changes
  useEffect(() => {
    if (lat && lon) {
      setCenter([lat, lon]);
    } else if (weather.lat && weather.lon) {
      setCenter([weather.lat, weather.lon]);
    }
  }, [lat, lon, weather.lat, weather.lon]);

  // Autocomplete Geocoding Search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSearchResults(data);
            setShowDropdown(true);
          }
        }
      } catch (e) {
        console.warn("Geocoding failed:", e);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Select Search Item
  const handleSelectSearchResult = (item: { name: string; lat: number; lon: number }) => {
    setCenter([item.lat, item.lon]);
    setQuery(item.name);
    setShowDropdown(false);
    if (onLocationSelect) onLocationSelect(item.lat, item.lon);
  };

  // Select Field
  const handleSelectField = (f: FieldRecord) => {
    setActiveFieldState(f);
    setActiveField(f.id);
    setCenter(f.center);
    if (onFieldSelected) onFieldSelected(f);
    if (onLocationSelect) onLocationSelect(f.center[0], f.center[1]);
  };

  // Delete Field
  const handleDeleteField = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (fields.length <= 1) {
      alert(language === "hi" ? "कम से कम एक खेत पंजीकृत रखें।" : "You must keep at least one registered farm plot.");
      return;
    }
    if (confirm(language === "hi" ? "क्या आप इस खेत को हटाना चाहते हैं?" : "Delete this farm plot?")) {
      const updated = deleteFarmerField(id);
      setFields(updated);
      if (updated.length > 0) {
        setActiveFieldState(updated[0]);
        setActiveField(updated[0].id);
        setCenter(updated[0].center);
      }
    }
  };

  // Live GPS Fetch
  const handleFetchGPS = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported on your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = Math.round(pos.coords.latitude * 100000) / 100000;
        const newLon = Math.round(pos.coords.longitude * 100000) / 100000;
        setCenter([newLat, newLon]);
        setIsLocating(false);
        if (onLocationSelect) onLocationSelect(newLat, newLon);
      },
      () => {
        alert("GPS location unavailable.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Map Click
  const handleMapClick = (clickLat: number, clickLon: number) => {
    const roundLat = Math.round(clickLat * 100000) / 100000;
    const roundLon = Math.round(clickLon * 100000) / 100000;

    if (isDrawing) {
      setDrawnPoints((prev) => [...prev, [roundLat, roundLon]]);
    } else {
      setCenter([roundLat, roundLon]);
      if (onLocationSelect) onLocationSelect(roundLat, roundLon);
    }
  };

  const calculatedArea = calculatePolygonAreaAcres(drawnPoints);

  // Save Drawn Field
  const handleSaveField = () => {
    if (drawnPoints.length < 3) {
      alert("Click at least 3 points on the map to define the boundary.");
      return;
    }

    const centerLat = drawnPoints.reduce((acc, curr) => acc + curr[0], 0) / drawnPoints.length;
    const centerLon = drawnPoints.reduce((acc, curr) => acc + curr[1], 0) / drawnPoints.length;

    const newField: FieldRecord = {
      id: `field_${Date.now()}`,
      name: newPlotName.trim() || `Plot #${fields.length + 1}`,
      crop: newPlotCrop,
      cropVariety: "JS-335",
      sowingDate: new Date().toISOString().split("T")[0],
      growthStage: "Vegetative Stage",
      areaAcres: calculatedArea.acres,
      areaHa: calculatedArea.ha,
      soilType: "Black Cotton Soil",
      irrigationType: "Rainfed + Borewell",
      color: "#10B981",
      center: [centerLat, centerLon],
      polygon: drawnPoints,
    };

    const updated = saveFarmerField(newField);
    setFields(updated);
    setActiveField(newField.id);
    setActiveFieldState(newField);

    setIsDrawing(false);
    setDrawnPoints([]);
    setShowSaveModal(false);
    setNewPlotName("");

    if (onFieldSelected) onFieldSelected(newField);
    if (onLocationSelect) onLocationSelect(centerLat, centerLon);
  };

  return (
    <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-sm relative font-sans overflow-hidden">
      
      {/* 1. Top Bar: Search & Layer Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-mono font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
              SATELLITE GIS
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              GPS: {center[0].toFixed(4)}°N, {center[1].toFixed(4)}°E
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {language === "hi" ? "खेत और सैटेलाइट जीआईएस" : "Farm & Satellite GIS"}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setMapType("satellite")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                mapType === "satellite" ? "bg-white text-emerald-900 shadow-xs" : "text-slate-600"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setMapType("streets")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                mapType === "streets" ? "bg-white text-blue-900 shadow-xs" : "text-slate-600"
              }`}
            >
              <Globe2 className="h-3 w-3" />
              <span>Streets</span>
            </button>
            <button
              onClick={() => setMapType("terrain")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                mapType === "terrain" ? "bg-white text-amber-900 shadow-xs" : "text-slate-600"
              }`}
            >
              <Mountain className="h-3 w-3" />
              <span>Terrain</span>
            </button>
          </div>

          {/* Autocomplete Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              placeholder="Search city / district..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setShowDropdown(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}

            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 border-b border-slate-50 last:border-0 cursor-pointer"
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

      {/* 2. Registered Plots Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase shrink-0 flex items-center gap-1">
          <Sprout className="h-3.5 w-3.5 text-emerald-600" />
          {language === "hi" ? "खेत:" : "Farms:"}
        </span>

        {fields.map((f) => {
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
              <span>{f.name}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${isSelected ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-700"}`}>
                {f.areaAcres} Ac · {f.crop}
              </span>
              <button
                type="button"
                onClick={(e) => handleDeleteField(e, f.id)}
                className={`p-0.5 rounded-md hover:bg-rose-500 hover:text-white transition-colors ${isSelected ? "text-emerald-200" : "text-slate-400"}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={() => {
            setIsDrawing(true);
            setDrawnPoints([]);
          }}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-300 shrink-0 cursor-pointer"
        >
          <Plus className="h-3 w-3" />
          <span>{language === "hi" ? "+ नया खेत" : "+ Add Field"}</span>
        </button>

        <button
          onClick={handleFetchGPS}
          disabled={isLocating}
          className="ml-auto px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 shrink-0 border border-blue-200 cursor-pointer"
        >
          <Navigation className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "Locating..." : "My GPS"}</span>
        </button>
      </div>

      {/* 3. Drawing Controls Bar */}
      <div className={`p-3 rounded-2xl text-xs transition-colors ${
        isDrawing ? "bg-emerald-950 text-white border border-emerald-400" : "bg-slate-900 text-white"
      }`}>
        {isDrawing ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <PenTool className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-emerald-300 block">
                  {language === "hi" ? "खेत का घेरा बनाएं" : "Drawing Farm Boundary"}
                </span>
                <p className="text-[11px] text-slate-300">
                  {language === "hi" ? "मैप पर 3 या 4 कोनों पर क्लिक करें।" : "Click 3+ corner points on the map to define the boundary."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900 text-emerald-300 font-mono font-bold text-xs border border-emerald-700">
                {drawnPoints.length} Points ({calculatedArea.acres} Ac)
              </span>
              {drawnPoints.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDrawnPoints((prev) => prev.slice(0, -1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Undo</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (drawnPoints.length < 3) {
                    alert("Click at least 3 points on the map.");
                    return;
                  }
                  setShowSaveModal(true);
                }}
                disabled={drawnPoints.length < 3}
                className={`px-3.5 py-1 rounded-lg font-black text-xs flex items-center gap-1 cursor-pointer transition-all ${
                  drawnPoints.length >= 3
                    ? "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDrawing(false);
                  setDrawnPoints([]);
                }}
                className="p-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-300 border border-rose-800 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs">
              Active: <strong className="text-white">{activeField?.name || "None"}</strong> ({activeField?.areaAcres || 0} Ac · {activeField?.crop || "Crop"})
            </span>
            <button
              type="button"
              onClick={() => {
                setIsDrawing(true);
                setDrawnPoints([]);
              }}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer ml-auto"
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>{language === "hi" ? "घेरा बनाएं" : "Draw Boundary"}</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. The Map Canvas */}
      <div className="h-[460px] w-full rounded-2xl border border-slate-200 shadow-inner relative bg-slate-100" style={{ minHeight: "460px", overflow: "clip" }}>
        <LeafletMapInner
          center={center}
          fields={fields}
          activeFieldId={activeField?.id}
          mapType={mapType}
          isDrawing={isDrawing}
          drawnPoints={drawnPoints}
          onMapClick={handleMapClick}
          onSelectField={handleSelectField}
        />
      </div>

      {/* 5. Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                Register New Farm Plot
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Plot Name:</label>
                <input
                  type="text"
                  value={newPlotName}
                  onChange={(e) => setNewPlotName(e.target.value)}
                  placeholder="e.g. My North Field"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Crop:</label>
                <select
                  value={newPlotCrop}
                  onChange={(e) => setNewPlotCrop(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                >
                  {CROP_OPTIONS.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950 font-bold">
                <span>Calculated Boundary Area:</span>
                <span className="font-mono text-emerald-800 text-sm">
                  {calculatedArea.acres} Acres ({calculatedArea.ha} Ha)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveField}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Save & Register Plot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
