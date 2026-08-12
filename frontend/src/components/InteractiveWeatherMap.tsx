"use client";

import React, { useState, useEffect } from "react";
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
  MapPin, Layers, Sun, Droplets, Wind, AlertTriangle, ShieldCheck, Thermometer,
  PenTool, Check, X, Sprout, Search, Filter, Eye, Trash2, Calendar, Award, Info, Plus, CloudRain
} from "lucide-react";

const LeafletMapInner = dynamic(
  () => import("./LeafletMapInner").then((m) => m.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100 flex items-center justify-center text-emerald-700 font-accent text-xs animate-pulse font-bold">
        🛰️ Loading High-Precision Satellite & Telemetry Map Layers...
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

  const [currentLat, setCurrentLat] = useState<number>(lat);
  const [currentLon, setCurrentLon] = useState<number>(lon);

  // Field portfolio state
  const [savedFields, setSavedFields] = useState<FieldRecord[]>(getSavedFields());
  const [activeField, setActiveFieldState] = useState<FieldRecord>(savedFields[0] || getSavedFields()[0]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cropFilter, setCropFilter] = useState<string>("ALL");

  // Map Active Layer Selector (DEFAULT TELEMETRY LAYER AUTO ADDED)
  const [activeLayer, setActiveLayer] = useState<string>("crop_health");

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
    if (list.length > 0) {
      setActiveFieldState(list[0]);
      setCurrentLat(list[0].center[0]);
      setCurrentLon(list[0].center[1]);
    }
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
          alert("GPS permission unavailable. Please select or click on the map to set your location.");
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
      alert("Please tap at least 3 points on map to form a valid farm boundary polygon.");
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
      name: newFieldName.trim() || `My Farm Plot ${savedFields.length + 1}`,
      crop: newCropOption.name,
      cropVariety: newCropOption.defaultVariety,
      areaAcres: acres,
      areaHa: ha,
      center: [Math.round(centerLat * 10000) / 10000, Math.round(centerLon * 10000) / 10000],
      polygon: drawnNodes,
      sowingDate: new Date().toISOString().split("T")[0],
      growthStage: newCropOption.stage,
      soilType: "Black Cotton Soil",
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

  const currentDrawnArea = calculatePolygonAreaAcres(drawnNodes);

  return (
    <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm relative font-body overflow-hidden">

      {/* Live Rain & Weather Predictive Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-mono font-bold transition-all ${
        weather.isRaining
          ? "bg-blue-500/10 border-blue-500/30 text-blue-900 animate-pulse"
          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-900"
      }`}>
        <div className="flex items-center gap-2.5">
          {weather.isRaining ? (
            <CloudRain className="h-5 w-5 text-blue-600 animate-bounce shrink-0" />
          ) : (
            <Sun className="h-5 w-5 text-amber-500 shrink-0" />
          )}
          <div>
            <span className="block font-black text-sm">{weather.rainPrediction}</span>
            <span className="text-[11px] font-normal text-slate-600">
              Location: {weather.locationName} · Temp: {weather.temperature}°C · Soil Moisture: {weather.soilMoistureEst}%
            </span>
          </div>
        </div>
        <DataBadge type="LIVE_METEOBLUE" />
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <MapPin className="h-5 w-5 text-[#10B981]" />
              Precision Satellite Telemetry & Field Polygon Map
            </h3>
            <DataBadge type="LIVE_CEHUB" customText="OPEN-METEO TELEMETRY" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Tap 'Draw Boundary' to mark your exact farm boundary. Satellite telemetry automatically overlays on your field.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap font-accent">
          <button
            onClick={handleFetchLiveLocation}
            disabled={isLocating}
            className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Detect live GPS coordinates"
          >
            <MapPin className={`h-4 w-4 text-white ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Locating GPS..." : "Detect Live GPS"}</span>
          </button>

          {!isDrawingMode ? (
            <button
              onClick={() => {
                setIsDrawingMode(true);
                setDrawnNodes([]);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <PenTool className="h-4 w-4 text-amber-400" />
              Draw Boundary
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleFinishDrawing}
                className="px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
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
        </div>
      </div>

      {/* Active Drawing Helper Banner */}
      {isDrawingMode && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 p-3 rounded-2xl text-xs font-mono font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-amber-600 animate-pulse" />
            <span>DRAWING ACTIVE: Tap points around your farm on the map. ({drawnNodes.length} points added)</span>
          </div>
          {drawnNodes.length >= 3 && (
            <span className="text-[#10B981] font-black">
              Area: {currentDrawnArea.acres} Acres ({currentDrawnArea.ha} Ha)
            </span>
          )}
        </div>
      )}

      {/* Layer Selection Controls Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-accent">
        <span className="text-slate-500 shrink-0 font-bold">Telemetry Layers:</span>

        <button
          onClick={() => setActiveLayer("crop_health")}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayer === "crop_health" ? "bg-[#10B981] text-white border-[#10B981] font-bold shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          🌿 Crop Health (NDVI)
        </button>

        <button
          onClick={() => setActiveLayer("temp")}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayer === "temp" ? "bg-[#10B981] text-white border-[#10B981] font-bold shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          🌡️ Thermal Heat Scorch
        </button>

        <button
          onClick={() => setActiveLayer("rain")}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayer === "rain" ? "bg-[#10B981] text-white border-[#10B981] font-bold shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          🌧️ Rainfall & Moisture
        </button>

        <button
          onClick={() => setActiveLayer("soil")}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayer === "soil" ? "bg-[#10B981] text-white border-[#10B981] font-bold shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          💧 Soil Moisture Deficit
        </button>

        <button
          onClick={() => setActiveLayer("satellite")}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayer === "satellite" ? "bg-[#10B981] text-white border-[#10B981] font-bold shadow-sm" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          🛰️ Pure Satellite
        </button>
      </div>

      {/* Map Display Container */}
      <div className="relative w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-900">
        <LeafletMapInner
          center={[currentLat, currentLon]}
          savedFields={savedFields}
          activeFieldId={activeField?.id}
          isDrawingMode={isDrawingMode}
          drawnNodes={drawnNodes}
          activeLayer={activeLayer}
          pinsList={pinsList}
          onMapClick={handleMapClick}
          onSelectField={handleSelectField}
        />
      </div>

      {/* Save Boundary Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                <Check className="h-5 w-5 text-[#10B981]" /> Save Drawn Farm Boundary
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs font-mono text-emerald-900">
              <span className="font-bold block">Calculated Field Area:</span>
              <span className="text-base font-black text-[#10B981]">
                {currentDrawnArea.acres} Acres ({currentDrawnArea.ha} Hectares)
              </span>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-800">
              <div>
                <label className="block uppercase tracking-wider mb-1">Field / Plot Name</label>
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="e.g. North Plot / Primary Soybean Field"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-[#10B981] outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Primary Crop</label>
                <select
                  value={newCropOption.id}
                  onChange={(e) => {
                    const opt = CROP_OPTIONS.find((c) => c.id === e.target.value);
                    if (opt) setNewCropOption(opt);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-[#10B981] outline-none"
                >
                  {CROP_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDrawnField}
                className="flex-1 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Save Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pin Observation Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#10B981]" /> Add Field Observation Pin
              </h3>
              <button onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-800">
              <div>
                <label className="block uppercase tracking-wider mb-1">Observation Note</label>
                <input
                  type="text"
                  value={pinNote}
                  onChange={(e) => setPinNote(e.target.value)}
                  placeholder="e.g. Syngenta Stress Buster applied / Pest spotted"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-[#10B981] outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Category</label>
                <select
                  value={pinCategory}
                  onChange={(e) => setPinCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-[#10B981] outline-none"
                >
                  <option value="spray">Biostimulant Spray Applied</option>
                  <option value="water">Irrigation / Soil Moisture</option>
                  <option value="pest">Pest / Stress Spotted</option>
                  <option value="general">General Note</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePin}
                className="flex-1 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Save Pin
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
