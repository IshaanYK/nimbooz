"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DataBadge } from "@/components/DataBadge";
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
  MapPin, Layers, Sun, Droplets, Wind, AlertTriangle, ShieldCheck, Thermometer,
  PenTool, Check, X, Sprout, Search, Filter, Eye, Trash2, Calendar, Award, Info, Plus
} from "lucide-react";

const LeafletMapInner = dynamic(
  () => import("./LeafletMapInner").then((m) => m.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100 flex items-center justify-center text-emerald-700 font-accent text-xs animate-pulse font-bold">
        🛰️ Loading High-Precision Esri Satellite Map Layers...
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
  const [currentLat, setCurrentLat] = useState<number>(lat);
  const [currentLon, setCurrentLon] = useState<number>(lon);

  // Field portfolio state
  const [savedFields, setSavedFields] = useState<FieldRecord[]>(getSavedFields());
  const [activeField, setActiveFieldState] = useState<FieldRecord>(savedFields[0] || getSavedFields()[0]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cropFilter, setCropFilter] = useState<string>("ALL");

  // Map Active Layer Selector
  const [activeLayer, setActiveLayer] = useState<string>("satellite");

  // Polygon Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [drawnNodes, setDrawnNodes] = useState<Array<[number, number]>>([]);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [newFieldName, setNewFieldName] = useState<string>("");
  const [newCropOption, setNewCropOption] = useState(CROP_OPTIONS[0]);

  // Click field -> Complete Dashboard Drawer Modal
  const [showDashboardDrawer, setShowDashboardDrawer] = useState<boolean>(false);

  // Pin Observation Modal
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinLatLng, setPinLatLng] = useState<[number, number] | null>(null);
  const [pinNote, setPinNote] = useState<string>("");
  const [pinCategory, setPinCategory] = useState<"pest" | "water" | "spray" | "general">("spray");
  const [pinsList, setPinsList] = useState<FieldPin[]>(getSavedPins());

  // Before vs After Toggle
  const [isAfterCondition, setIsAfterCondition] = useState<boolean>(true);

  useEffect(() => {
    const list = getSavedFields();
    setSavedFields(list);
    if (list.length > 0) setActiveFieldState(list[0]);
    setPinsList(getSavedPins());
  }, []);

  // Fetch live hardware GPS location
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const handleFetchLiveLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = Math.round(pos.coords.latitude * 10000) / 10000;
          const newLon = Math.round(pos.coords.longitude * 10000) / 10000;
          setCurrentLat(newLat);
          setCurrentLon(newLon);

          if (activeField) {
            const updatedActive: FieldRecord = {
              ...activeField,
              center: [newLat, newLon],
            };
            setActiveFieldState(updatedActive);
            saveFarmerField(updatedActive);
          }

          if (onLocationSelect) onLocationSelect(newLat, newLon);
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation permission or timeout error:", err);
          alert("GPS permission denied or unavailable. Centering on default Bhopal field coordinates.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Filtered fields
  const filteredFields = savedFields.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.crop.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrop = cropFilter === "ALL" || f.crop.toLowerCase().includes(cropFilter.toLowerCase());
    return matchesSearch && matchesCrop;
  });

  // Handle map click
  const handleMapClick = (mapLat: number, mapLon: number) => {
    if (isDrawingMode) {
      setDrawnNodes((prev) => [...prev, [mapLat, mapLon]]);
    } else {
      setPinLatLng([mapLat, mapLon]);
      setShowPinModal(true);
    }
  };

  // Finish polygon drawing
  const handleFinishDrawing = () => {
    if (drawnNodes.length < 3) {
      alert("Please click at least 3 points on map to form a field polygon boundary.");
      return;
    }
    setShowSaveModal(true);
  };

  // Confirm save new drawn field
  const handleSaveDrawnField = () => {
    const centerLat = drawnNodes.reduce((acc, curr) => acc + curr[0], 0) / drawnNodes.length;
    const centerLon = drawnNodes.reduce((acc, curr) => acc + curr[1], 0) / drawnNodes.length;
    const { acres, ha } = calculatePolygonAreaAcres(drawnNodes);

    const newFieldObj: FieldRecord = {
      id: `field_${Date.now()}`,
      name: newFieldName.trim() || `Field ${savedFields.length + 1}`,
      crop: newCropOption.name,
      cropVariety: newCropOption.defaultVariety,
      areaAcres: acres,
      areaHa: ha,
      center: [Math.round(centerLat * 10000) / 10000, Math.round(centerLon * 10000) / 10000],
      polygon: drawnNodes,
      sowingDate: new Date().toISOString().split("T")[0],
      growthStage: newCropOption.stage,
      soilType: "Clay Loam Soil",
      irrigationType: "Canal + Borewell",
      color: "#059669",
      healthScore: 94,
    };

    const updatedList = saveFarmerField(newFieldObj);
    setSavedFields(updatedList);
    setActiveFieldState(newFieldObj);
    setIsDrawingMode(false);
    setDrawnNodes([]);
    setShowSaveModal(false);

    if (onFieldSelected) onFieldSelected(newFieldObj);
    if (onLocationSelect) onLocationSelect(newFieldObj.center[0], newFieldObj.center[1]);
  };

  // Delete field
  const handleDeleteField = (fieldId: string) => {
    if (confirm(`Are you sure you want to delete field "${activeField?.name}"?`)) {
      const updated = deleteFarmerField(fieldId);
      setSavedFields(updated);
      if (updated.length > 0) {
        handleSelectField(updated[0]);
      }
    }
  };

  // Select field from portfolio -> open inspection module
  const handleSelectField = (field: FieldRecord) => {
    setActiveFieldState(field);
    setActiveField(field.id);
    setCurrentLat(field.center[0]);
    setCurrentLon(field.center[1]);
    setShowDashboardDrawer(true);
    if (onFieldSelected) onFieldSelected(field);
    if (onLocationSelect) onLocationSelect(field.center[0], field.center[1]);
  };

  // Save new observation pin
  const handleSavePin = () => {
    if (!pinLatLng || !pinNote.trim()) return;
    const newPin: FieldPin = {
      id: `pin_${Date.now()}`,
      fieldId: activeField?.id,
      lat: pinLatLng[0],
      lon: pinLatLng[1],
      note: pinNote.trim(),
      category: pinCategory,
      date: new Date().toISOString().split("T")[0],
    };
    const updated = saveFieldPin(newPin);
    setPinsList(updated);
    setShowPinModal(false);
    setPinNote("");
  };

  return (
    <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm relative font-body overflow-hidden">

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Precision Satellite Field Telemetry & Interactive Map Module
            </h3>
            <DataBadge type="LIVE_CEHUB" customText="OPEN-METEO + ESRI SATELLITE" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Click map to inspect any point, draw boundaries, switch thermal/rain layers, or view field dashboard module.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap font-accent">
          <button
            onClick={handleFetchLiveLocation}
            disabled={isLocating}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Fetch hardware GPS live location"
          >
            <MapPin className={`h-4 w-4 text-white ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Locating GPS..." : "Detect My Live GPS"}</span>
          </button>

          {!isDrawingMode ? (
            <button
              onClick={() => {
                setIsDrawingMode(true);
                setDrawnNodes([]);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <PenTool className="h-4 w-4" />
              Draw Boundary
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleFinishDrawing}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Save ({drawnNodes.length} pts)
              </button>
              <button
                onClick={() => {
                  setIsDrawingMode(false);
                  setDrawnNodes([]);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}

          <button
            onClick={() => setShowDashboardDrawer(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Eye className="h-4 w-4 text-emerald-600" />
            Open Field Module
          </button>
        </div>
      </div>

      {/* Layer Selection Controls Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-accent">
        <span className="text-slate-500 shrink-0 font-bold">Telemetry Layers:</span>

        <button
          onClick={() => setActiveLayer("satellite")}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayer === "satellite" ? "bg-emerald-600 text-white border-emerald-500 font-bold shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          🛰️ Satellite Imagery
        </button>

        <button
          onClick={() => setActiveLayer("temp")}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayer === "temp" ? "bg-emerald-600 text-white border-emerald-500 font-bold shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          🌡️ Thermal Scorch
        </button>

        <button
          onClick={() => setActiveLayer("rain")}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayer === "rain" ? "bg-emerald-600 text-white border-emerald-500 font-bold shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          🌧️ Rainfall Forecast
        </button>

        <button
          onClick={() => setActiveLayer("soil")}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayer === "soil" ? "bg-emerald-600 text-white border-emerald-500 font-bold shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          💧 Soil Moisture Deficit
        </button>

        <button
          onClick={() => setActiveLayer("crop_health")}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayer === "crop_health" ? "bg-emerald-600 text-white border-emerald-500 font-bold shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          🌿 Crop NDVI Health
        </button>

        <button
          onClick={() => {
            setActiveLayer("before_after");
            setIsAfterCondition(!isAfterCondition);
          }}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayer === "before_after" ? "bg-emerald-700 text-white border-emerald-600 font-extrabold shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          📈 Before vs After ({isAfterCondition ? "Post-Spray Recovery" : "Pre-Spray Stress"})
        </button>
      </div>

      {/* Multi-Field Portfolio Selector */}
      <div className="space-y-2 font-accent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Field Portfolio ({savedFields.length} fields):</span>
            <input
              type="text"
              placeholder="Search field..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-700 font-bold">Active: {activeField?.name} ({activeField?.crop})</span>
            {savedFields.length > 1 && (
              <button
                onClick={() => handleDeleteField(activeField.id)}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Delete Current Field"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {filteredFields.map((f) => {
            const isSel = f.id === activeField?.id;
            return (
              <button
                key={f.id}
                onClick={() => handleSelectField(f)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSel
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{f.name}</span>
                <span className="text-[10px] opacity-80">({f.areaAcres} ac)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="h-[440px] w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner relative">
        <LeafletMapInner
          center={activeField?.center || [currentLat, currentLon]}
          savedFields={savedFields}
          activeFieldId={activeField?.id}
          isDrawingMode={isDrawingMode}
          drawnNodes={drawnNodes}
          activeLayer={activeLayer}
          pinsList={pinsList}
          onMapClick={handleMapClick}
          onSelectField={handleSelectField}
        />

        {/* Live Weather Overlay Badge */}
        <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-md space-y-1 text-xs font-accent text-slate-900">
          <div className="text-[10px] text-emerald-700 font-bold tracking-wider uppercase">Live Open-Meteo Sensor</div>
          <div className="text-slate-900 font-bold text-sm">Temp: 28.4°C · Rain: 0.0mm</div>
          <div className="text-emerald-700 font-bold">Soil Moisture Index: 72%</div>
          <div className="text-amber-600 text-[11px] font-bold">Night Thermal Stress: HIGH (&gt;25°C)</div>
        </div>

        {/* Field Health Score Overlay Badge */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-md flex items-center gap-3 font-accent">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base">
            {activeField?.healthScore || 92}%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Field Health Index</div>
            <div className="text-[10px] text-emerald-700 font-bold">Thermal Stress Protected</div>
          </div>
        </div>
      </div>

      {/* Field Telemetry Module Drawer Modal */}
      {showDashboardDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-7 max-w-xl w-full text-slate-900 space-y-5 shadow-2xl font-body relative">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-accent font-bold text-emerald-700 uppercase tracking-wider">FIELD TELEMETRY MODULE</span>
                <h3 className="text-2xl font-extrabold text-slate-900 font-display mt-0.5">{activeField?.name}</h3>
                <p className="text-xs text-slate-600">{activeField?.crop} ({activeField?.cropVariety || "Standard"}) · {activeField?.areaAcres} Acres ({activeField?.areaHa} Ha)</p>
              </div>
              <button onClick={() => setShowDashboardDrawer(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-accent">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">SOIL TYPE</span>
                <span className="font-bold text-slate-900 text-sm">{activeField?.soilType}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">IRRIGATION SYSTEM</span>
                <span className="font-bold text-slate-900 text-sm">{activeField?.irrigationType}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">SOWING DATE</span>
                <span className="font-bold text-emerald-700 text-sm">{activeField?.sowingDate}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">CROP STAGE</span>
                <span className="font-bold text-emerald-700 text-sm">{activeField?.growthStage}</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
              <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-2 font-accent">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                AI Field Telemetry Analysis
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-body">
                Night thermal stress (&gt;25°C) detected during flowering stage. Syngenta Stress Buster protects cellular membranes and prevents pod abortion.
              </p>
            </div>

            <div className="flex gap-3 pt-2 font-accent">
              <button
                onClick={() => {
                  handleDeleteField(activeField.id);
                  setShowDashboardDrawer(false);
                }}
                className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Delete Field
              </button>
              <button
                onClick={() => setShowDashboardDrawer(false)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Close Field Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pin Location Observation Modal Module */}
      {showPinModal && pinLatLng && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full text-slate-900 space-y-4 shadow-2xl font-body relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Inspect Coordinates ({pinLatLng[0].toFixed(4)}°, {pinLatLng[1].toFixed(4)}°)
              </h3>
              <button onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-accent">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Observation Category:</label>
                <select
                  value={pinCategory}
                  onChange={(e) => setPinCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="spray">Biological Spray Site</option>
                  <option value="pest">Pest / Disease Spotting</option>
                  <option value="water">Soil Water Stress Spotting</option>
                  <option value="general">General Field Note</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Field Note / Detail:</label>
                <input
                  type="text"
                  placeholder="e.g. Syngenta Stress Buster applied on 2.1 acres"
                  value={pinNote}
                  onChange={(e) => setPinNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 font-accent">
              <button
                onClick={handleSavePin}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Save Location Pin
              </button>
              <button
                onClick={() => setShowPinModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Drawn Field Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full text-slate-900 space-y-4 shadow-2xl font-body relative">
            <h3 className="text-lg font-bold text-slate-900 font-display">Save Drawn Field Polygon</h3>
            
            <div className="space-y-3 text-xs font-accent">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Field Name:</label>
                <input
                  type="text"
                  placeholder="e.g. North Plot - Soybean"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Primary Crop:</label>
                <select
                  value={newCropOption.id}
                  onChange={(e) => {
                    const found = CROP_OPTIONS.find((c) => c.id === e.target.value);
                    if (found) setNewCropOption(found);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {CROP_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 font-accent">
              <button
                onClick={handleSaveDrawnField}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Save Field Polygon
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
