"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { DataBadge } from "@/components/DataBadge";
import { useWeather } from "@/context/WeatherContext";
import {
  getSavedFields,
  saveFarmerField,
  deleteFarmerField,
  setActiveField,
  calculatePolygonAreaAcres,
  CROP_OPTIONS,
  FieldRecord,
  FieldPin,
  saveFieldPin,
  getSavedPins,
} from "@/lib/fieldStore";
import {
  MapPin,
  Layers,
  Sun,
  Droplets,
  Wind,
  AlertTriangle,
  ShieldCheck,
  Thermometer,
  PenTool,
  Check,
  X,
  Sprout,
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  Award,
  Info,
  Plus,
  CloudRain,
  Navigation,
  Compass,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";

const LeafletMapInner = dynamic(
  () => import("./LeafletMapInner").then((m) => m.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center text-emerald-400 font-sans text-xs gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="font-bold">🛰️ Loading High-Resolution Satellite GIS & Field Polygons...</span>
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

const REGION_PRESETS = [
  { name: "Bhopal (Fanda)", lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh" },
  { name: "Indore (Sanwer)", lat: 22.7196, lon: 75.8577, state: "Madhya Pradesh" },
  { name: "Sehore (Shyampur)", lat: 23.2032, lon: 77.0844, state: "Madhya Pradesh" },
  { name: "Vidisha (Gulabganj)", lat: 23.5251, lon: 77.8081, state: "Madhya Pradesh" },
  { name: "Ujjain (Chimanganj)", lat: 23.1765, lon: 75.7885, state: "Madhya Pradesh" },
  { name: "Pune (Baner)", lat: 18.5204, lon: 73.8567, state: "Maharashtra" },
];

export const InteractiveWeatherMap: React.FC<InteractiveWeatherMapProps> = ({
  lat = 23.2599,
  lon = 77.4126,
  crop = "Soybean",
  onLocationSelect,
  onFieldSelected,
}) => {
  const { weather } = useWeather();

  const [currentCenter, setCurrentCenter] = useState<[number, number]>([lat, lon]);
  const [baseMapType, setBaseMapType] = useState<"satellite" | "streets" | "hybrid">("satellite");
  const [activeLayer, setActiveLayer] = useState<string>("crop_health");

  // Field portfolio state
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
  const [newCropOption, setNewCropOption] = useState(CROP_OPTIONS[0]);

  // Pin Observations
  const [pinsList, setPinsList] = useState<FieldPin[]>(getSavedPins());

  // GPS Auto-Locate State
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Sync saved fields on mount & real location
  useEffect(() => {
    const list = getSavedFields();
    setSavedFields(list);
    if (list.length > 0 && list[0].center) {
      setActiveFieldState(list[0]);
      setCurrentCenter(list[0].center);
    } else if (weather.lat && weather.lon) {
      setCurrentCenter([weather.lat, weather.lon]);
    }
  }, [weather.lat, weather.lon]);

  // Geocoding live search handler with debouncing
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

  // Handle preset region selection
  const handleSelectPreset = (preset: { lat: number; lon: number; name: string }) => {
    setCurrentCenter([preset.lat, preset.lon]);
    if (onLocationSelect) onLocationSelect(preset.lat, preset.lon);
  };

  // Handle Geocoding Result selection
  const handleSelectSearchResult = (result: { name: string; lat: number; lon: number }) => {
    setCurrentCenter([result.lat, result.lon]);
    setSearchQuery(result.name.split(",")[0]);
    setShowResultsDropdown(false);
    if (onLocationSelect) onLocationSelect(result.lat, result.lon);
  };

  // GPS Locate
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
        },
        () => {
          alert("GPS location unavailable. Please pick a preset or search your district.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  // Handle map click for drawing or observation
  const handleMapClick = (mapLat: number, mapLon: number) => {
    const latRound = Math.round(mapLat * 10000) / 10000;
    const lonRound = Math.round(mapLon * 10000) / 10000;

    if (isDrawingMode) {
      setDrawnNodes((prev) => [...prev, [latRound, lonRound]]);
    } else {
      setCurrentCenter([latRound, lonRound]);
      if (onLocationSelect) onLocationSelect(latRound, lonRound);
    }
  };

  // Save new drawn field
  const handleSaveDrawnField = () => {
    if (drawnNodes.length < 3) {
      alert("Please click at least 3 points on the satellite map to define your farm boundary.");
      return;
    }

    const centerLat = drawnNodes.reduce((acc, curr) => acc + curr[0], 0) / drawnNodes.length;
    const centerLon = drawnNodes.reduce((acc, curr) => acc + curr[1], 0) / drawnNodes.length;
    const { acres, ha } = calculatePolygonAreaAcres(drawnNodes);

    const newFieldObj: FieldRecord = {
      id: `field_${Date.now()}`,
      name: newFieldName.trim() || `Plot ${savedFields.length + 1} (${newCropOption.name})`,
      crop: newCropOption.name,
      cropVariety: newCropOption.defaultVariety,
      areaAcres: acres,
      areaHa: ha,
      center: [Math.round(centerLat * 10000) / 10000, Math.round(centerLon * 10000) / 10000],
      polygon: drawnNodes,
      sowingDate: new Date().toISOString().split("T")[0],
      growthStage: newCropOption.stage,
      soilType: "Black Cotton Vertisol",
      irrigationType: "Rainfed + Borewell",
      color: "#10B981",
      healthScore: 94,
    };

    const updatedList = saveFarmerField(newFieldObj);
    setSavedFields(updatedList);
    setActiveFieldState(newFieldObj);
    setIsDrawingMode(false);
    setDrawnNodes([]);
    setShowSaveModal(false);
    setNewFieldName("");

    if (onFieldSelected) onFieldSelected(newFieldObj);
    if (onLocationSelect) onLocationSelect(newFieldObj.center[0], newFieldObj.center[1]);
  };

  const currentDrawnArea = calculatePolygonAreaAcres(drawnNodes);

  return (
    <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-sm relative font-sans overflow-hidden isolate">
      
      {/* 1. Header & Live Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-mono font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              GIS POLYGON & SATELLITE ENGINE
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              GPS: {currentCenter[0].toFixed(4)}°N, {currentCenter[1].toFixed(4)}°E
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            Interactive Farm & Satellite GIS Navigator
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
              placeholder="Search city, district, village..."
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
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 border-b border-slate-50 last:border-0 transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{res.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Quick Agricultural Presets Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase shrink-0">
          Quick Hubs:
        </span>
        {REGION_PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => handleSelectPreset(p)}
            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
              Math.abs(currentCenter[0] - p.lat) < 0.05 && Math.abs(currentCenter[1] - p.lon) < 0.05
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {p.name}
          </button>
        ))}

        <button
          onClick={handleFetchLiveGPS}
          disabled={isLocating}
          className="ml-auto px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 shrink-0 border border-blue-200 cursor-pointer"
        >
          <Navigation className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "Locating..." : "My GPS"}</span>
        </button>
      </div>

      {/* 3. Controls & Overlay Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs">
        {/* Base Map Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setBaseMapType("satellite")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              baseMapType === "satellite" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => setBaseMapType("streets")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              baseMapType === "streets" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🗺️ Streets
          </button>
          <button
            onClick={() => setBaseMapType("hybrid")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              baseMapType === "hybrid" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🧭 Topo
          </button>
        </div>

        {/* Agro-Climatic Layer Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveLayer("crop_health")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
              activeLayer === "crop_health" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sprout className="h-3 w-3" />
            <span>Crop Health (NDVI)</span>
          </button>
          <button
            onClick={() => setActiveLayer("temp")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
              activeLayer === "temp" ? "bg-rose-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Thermometer className="h-3 w-3" />
            <span>Heat Stress</span>
          </button>
          <button
            onClick={() => setActiveLayer("soil")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
              activeLayer === "soil" ? "bg-purple-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Droplets className="h-3 w-3" />
            <span>Soil Moisture</span>
          </button>
        </div>

        {/* Polygon Drawing Toggle Button */}
        <div className="flex items-center gap-2">
          {!isDrawingMode ? (
            <button
              onClick={() => {
                setIsDrawingMode(true);
                setDrawnNodes([]);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>Draw Boundary</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg border border-amber-300">
                {drawnNodes.length} Points ({currentDrawnArea.acres} Ac)
              </span>
              {drawnNodes.length > 0 && (
                <button
                  onClick={() => setDrawnNodes((prev) => prev.slice(0, -1))}
                  className="p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
                  title="Undo last point"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => {
                  if (drawnNodes.length < 3) {
                    alert("Click at least 3 points on map to form a polygon.");
                    return;
                  }
                  setShowSaveModal(true);
                }}
                disabled={drawnNodes.length < 3}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer ${
                  drawnNodes.length >= 3 ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Plot</span>
              </button>
              <button
                onClick={() => {
                  setIsDrawingMode(false);
                  setDrawnNodes([]);
                }}
                className="p-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700"
                title="Cancel drawing"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. The Leaflet Map Container */}
      <div className="h-[460px] sm:h-[520px] w-full rounded-2xl overflow-hidden border border-slate-300 relative shadow-inner isolate z-0">
        <LeafletMapInner
          center={currentCenter}
          savedFields={savedFields}
          activeFieldId={activeField?.id}
          isDrawingMode={isDrawingMode}
          drawnNodes={drawnNodes}
          activeLayer={activeLayer}
          baseMapType={baseMapType}
          pinsList={pinsList}
          onMapClick={handleMapClick}
          onSelectField={(f) => {
            setActiveFieldState(f);
            setActiveField(f.id);
            if (onFieldSelected) onFieldSelected(f);
          }}
        />

        {/* Live Telemetry Floating HUD on Map */}
        <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl border border-slate-700 shadow-xl max-w-xs space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY
            </span>
            <span className="text-[10px] text-slate-400">Open-Meteo Feed</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[9px]">SURFACE TEMP</span>
              <strong className="text-amber-400 text-sm font-black">{weather.temperature}°C</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">SOIL MOISTURE</span>
              <strong className="text-blue-400 text-sm font-black">{weather.soilMoistureEst}%</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">NIGHT RESPR.</span>
              <strong className="text-rose-400 text-xs font-black">{weather.nightTemperature}°C</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">WIND SPEED</span>
              <strong className="text-emerald-400 text-xs font-black">{weather.windSpeed} km/h</strong>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-2">
            <Link
              href="/assistant"
              className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] text-center flex items-center justify-center gap-1"
            >
              <Zap className="h-3 w-3" />
              <span>Ask AI Voice</span>
            </Link>
            <Link
              href="/plant-intelligence"
              className="flex-1 py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] text-center flex items-center justify-center gap-1"
            >
              <span>PS-02 Stress</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Modal: Save Drawn Farm Plot */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 font-display">
                  Register Field Boundary
                </h3>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Field / Plot Name</label>
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="e.g. North Plot - River Side"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Crop</label>
                <select
                  value={newCropOption.name}
                  onChange={(e) => {
                    const found = CROP_OPTIONS.find((c) => c.name === e.target.value);
                    if (found) setNewCropOption(found);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
                >
                  {CROP_OPTIONS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} (Default: {c.defaultVariety})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950 font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Calculated Area:</span>
                  <strong>{currentDrawnArea.acres} Acres ({currentDrawnArea.ha} Ha)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Boundary Vertices:</span>
                  <strong>{drawnNodes.length} Points</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDrawnField}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Save to Farm Portfolio</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
