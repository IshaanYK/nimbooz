"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { InteractiveWeatherMap } from "@/components/InteractiveWeatherMap";
import { DataBadge } from "@/components/DataBadge";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { getTranslation } from "@/lib/translations";
import {
  getSavedFields,
  saveFarmerField,
  deleteFarmerField,
  setActiveField,
  getInitialFarmerField,
  CROP_OPTIONS,
  getFieldCropOptions,
  saveCustomCrop,
  FieldRecord
} from "@/lib/fieldStore";
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
  Activity
} from "lucide-react";

export default function MyFieldsPage() {
  const { language } = useLanguage();
  const { weather } = useWeather();
  const t = getTranslation(language);

  const [savedFields, setSavedFields] = useState<FieldRecord[]>([]);
  const [activeField, setActiveFieldState] = useState<FieldRecord>(getInitialFarmerField());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const regionalCrops = getFieldCropOptions(weather.district, weather.state);

  // New field form state
  const [newFieldName, setNewFieldName] = useState<string>("");
  const [newCrop, setNewCrop] = useState<string>(regionalCrops[0]?.name || "Soybean (सोयाबीन)");
  const [isCustomCropMode, setIsCustomCropMode] = useState<boolean>(false);
  const [customCropName, setCustomCropName] = useState<string>("");
  const [newAcres, setNewAcres] = useState<number>(5.0);
  const [newLat, setNewLat] = useState<number>(weather.lat || 23.2599);
  const [newLon, setNewLon] = useState<number>(weather.lon || 77.4126);

  useEffect(() => {
    if (weather.lat && weather.lon) {
      setNewLat(weather.lat);
      setNewLon(weather.lon);
    }
  }, [weather.lat, weather.lon]);

  useEffect(() => {
    const list = getSavedFields();
    if (list && list.length > 0) {
      setSavedFields(list);
      setActiveFieldState(list[0]);
    } else {
      const initial = getInitialFarmerField();
      setSavedFields([initial]);
      setActiveFieldState(initial);
    }
  }, []);

  const handleSelectField = (field: FieldRecord) => {
    setActiveFieldState(field);
    setActiveField(field.id);
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
        setActiveFieldState(updated[0]);
        setActiveField(updated[0].id);
      }
    }
  };

  const handleAddQuickField = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = Number(newLat) || 23.2599;
    const lon = Number(newLon) || 77.4126;
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
      areaHa: Math.round((acres * 0.404686) * 10) / 10,
      center: [lat, lon],
      polygon: [
        [lat + 0.002, lon - 0.003],
        [lat + 0.003, lon + 0.003],
        [lat - 0.002, lon + 0.004],
        [lat - 0.003, lon - 0.002],
      ],
      sowingDate: new Date().toISOString().split("T")[0],
      growthStage: "Vegetative Stage",
      soilType: "Black Cotton Vertisol",
      irrigationType: "Rainfed + Borewell",
      color: "#10B981",
      healthScore: 92,
    };

    const updated = saveFarmerField(newFieldObj);
    setSavedFields(updated);
    setActiveFieldState(newFieldObj);
    setActiveField(newFieldObj.id);
    setShowAddModal(false);
    setNewFieldName("");
    setIsCustomCropMode(false);
    setCustomCropName("");
  };

  const currentField = activeField || savedFields[0] || getInitialFarmerField();

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono font-black text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-400 flex items-center gap-1.5 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                PS-01: Agro-Climatic Intelligence & Field Geo-Registry
              </span>
              <DataBadge type="USER_PROVIDED" customText="REGISTERED FIELDS" />
            </div>
            <h1 className="text-3xl font-black font-display text-slate-900 mt-1 flex items-center gap-2">
              <MapPin className="h-7 w-7 text-[#10B981]" />
              Farm Fields GIS & Polygon Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              Register field boundaries using Leaflet GIS, compute Shoelace acreage, and inspect hyper-local soil and climate telemetry across all farm plots.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Field</span>
            </button>
            <span className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
              {savedFields.length} {t.registeredFieldsCount}
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Satellite Map Component (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <InteractiveWeatherMap
              lat={currentField.center ? currentField.center[0] : 23.2599}
              lon={currentField.center ? currentField.center[1] : 77.4126}
              crop={currentField.crop || "Soybean"}
              onFieldSelected={(f) => setActiveFieldState(f)}
            />
          </div>

          {/* Right Field List Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="stripe-card p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 font-display flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#10B981]" />
                  {t.registeredFarmFields}
                </h3>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {savedFields.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleSelectField(f)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      currentField.id === f.id
                        ? "bg-emerald-50/50 border-[#10B981] shadow-sm ring-2 ring-emerald-500/20"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-slate-900">{f.name}</h4>
                        <span className="text-xs text-slate-500 font-mono">{f.crop} ({f.growthStage})</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                        {f.areaAcres} Acres
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono pt-1 text-slate-600">
                      <span>{t.healthScoreLabel}: <strong className="text-[#10B981]">{f.healthScore || 92}%</strong></span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteField(f.id);
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50"
                        title="Delete Field"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Action CTAs */}
            <div className="stripe-card p-6 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900">{t.fieldCommandQuickLinks}</h4>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <Link
                  href="/assistant"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold flex flex-col items-center gap-1 text-center"
                >
                  <Mic className="h-5 w-5 text-amber-500" />
                  <span>{t.navAdvisory}</span>
                </Link>

                <Link
                  href="/impact"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold flex flex-col items-center gap-1 text-center"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                  <span>{t.robiProof}</span>
                </Link>
              </div>
            </div>

            {/* Plant Health AI Quick-Access */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 p-5 text-white border border-emerald-500/30">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">{t.plantStressEngineBadge}</span>
                </div>
                <h4 className="font-black text-white text-sm">{t.plantHealthAI}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.plantStressEngineDesc}
                </p>
                <Link
                  href="/plant-intelligence"
                  className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all"
                >
                  <span>{t.exploreEngine}</span>
                  <Sparkles className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Active Field Weather Summary */}
            <div className="stripe-card p-5 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-rose-500" />
                {t.liveFieldTelemetry} ({currentField.name})
              </h4>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold">TEMP</span>
                  <span className="text-base font-black text-slate-900 block">{weather.temperature}°C</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] text-emerald-700 font-bold">SOIL MOIST.</span>
                  <span className="text-base font-black text-emerald-800 block">{weather.soilMoistureEst}%</span>
                </div>
                <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 space-y-1">
                  <span className="text-[10px] text-sky-700 font-bold">RAIN (mm)</span>
                  <span className="text-base font-black text-sky-800 block">{weather.precipitation}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold">WIND km/h</span>
                  <span className="text-base font-black text-slate-900 block">{weather.windSpeed}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modal: Quick Add Field */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 font-display">
                  Register New Farm Field
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuickField} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Field / Plot Name</label>
                <input
                  type="text"
                  required
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="e.g. River Side Soybean Field"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block text-xs">
                      {language === "hi" ? "फसल चुनें (क्षेत्रीय और कस्टम)" : "Primary Crop (Regional & Custom)"}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCropMode(!isCustomCropMode);
                        if (!isCustomCropMode) setCustomCropName("");
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                    >
                      {isCustomCropMode ? "← Choose from list" : "+ Add Custom Crop"}
                    </button>
                  </div>

                  {isCustomCropMode ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        required
                        value={customCropName}
                        onChange={(e) => setCustomCropName(e.target.value)}
                        placeholder="e.g. Dragon Fruit, Garlic, Mustard, Saffron..."
                        className="w-full p-2.5 bg-emerald-50/60 border-2 border-emerald-500 rounded-xl font-medium text-xs text-slate-900 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        ✨ AI will calculate real thermal limits, GDD, and market rates for this crop.
                      </span>
                    </div>
                  ) : (
                    <select
                      value={newCrop}
                      onChange={(e) => {
                        if (e.target.value === "ADD_CUSTOM") {
                          setIsCustomCropMode(true);
                        } else {
                          setNewCrop(e.target.value);
                        }
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs cursor-pointer"
                    >
                      {regionalCrops.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} {c.isCustom ? "★ (Custom)" : ""}
                        </option>
                      ))}
                      <option value="ADD_CUSTOM">+ Add Custom Crop...</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={newAcres}
                    onChange={(e) => setNewAcres(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newLat}
                    onChange={(e) => setNewLat(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newLon}
                    onChange={(e) => setNewLon(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow transition-all cursor-pointer"
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
