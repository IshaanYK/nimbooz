"use client";

import React, { useEffect, useRef, useState } from "react";
import { fetchCurrentWeather } from "@/lib/api";
import {
  MapPin,
  Sun,
  CloudRain,
  Moon,
  Wind,
  Navigation,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Layers,
  Activity,
  Compass,
  X,
  Droplets,
  Thermometer,
  Shield,
  LocateFixed,
} from "lucide-react";

interface InteractiveWeatherMapProps {
  lat?: number;
  lon?: number;
  crop?: string;
  onLocationSelect?: (lat: number, lon: number) => void;
}

export const InteractiveWeatherMap: React.FC<InteractiveWeatherMapProps> = ({
  lat = 23.2599,
  lon = 77.4126,
  crop = "soybean",
  onLocationSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentLat, setCurrentLat] = useState(lat);
  const [currentLon, setCurrentLon] = useState(lon);
  const [cityName, setCityName] = useState("Bhopal (Soybean)");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);

  // Weather Animation Mode: "sunny" | "rainy" | "night" | "soil"
  const [weatherAnim, setWeatherAnim] = useState<"sunny" | "rainy" | "night" | "soil">("sunny");
  const [mapTileMode, setMapTileMode] = useState<"voyager" | "satellite" | "standard">("voyager");

  // Telemetry Metrics
  const [tempC, setTempC] = useState<number>(34.8);
  const [rainfallMm, setRainfallMm] = useState<number>(0);
  const [soilMoisturePct, setSoilMoisturePct] = useState<number>(76);
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(12.4);

  // Quick Location Shortcuts
  const LOCATION_PRESETS = [
    { name: "Bhopal (Soybean)", lat: 23.2599, lon: 77.4126 },
    { name: "Nagpur (Cotton)", lat: 21.1458, lon: 79.0882 },
    { name: "Pune (Sugarcane)", lat: 18.5204, lon: 73.8567 },
    { name: "Ludhiana (Wheat)", lat: 30.901, lon: 75.8573 },
    { name: "Anand (Maize)", lat: 22.5645, lon: 72.9289 },
  ];

  // Load weather telemetry from backend
  useEffect(() => {
    const loadWeather = async () => {
      const data = await fetchCurrentWeather(currentLat, currentLon, crop);
      if (data && data.weather && data.weather.records && data.weather.records.length > 0) {
        const latest = data.weather.records[data.weather.records.length - 1];
        const t = latest.temperature_max || 34.8;
        const r = latest.rainfall || 0;
        const sm = (latest.soil_moisture || 0.38) * 100;
        const ws = latest.wind_speed || 12.4;

        setTempC(t);
        setRainfallMm(r);
        setSoilMoisturePct(Math.min(Math.round(sm), 100));
        setWindSpeedKmh(ws);

        if (r > 0.5) setWeatherAnim("rainy");
        else if (t > 33) setWeatherAnim("sunny");
      }
    };
    loadWeather();
  }, [currentLat, currentLon, crop]);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Render Leaflet Map & Interactive Markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
      mapRef.current.innerHTML = "";
    }

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([currentLat, currentLon], 13);

    L.control.zoom({ position: "topright" }).addTo(map);

    let tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    if (mapTileMode === "satellite") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    } else if (mapTileMode === "standard") {
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com">CartoDB Voyager</a> & OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    // Interactive Field Markers
    const farms = [
      {
        id: "my_farm",
        name: `Primary Field (${cityName})`,
        owner: "Your Registered Farm",
        crop: crop ? crop.toUpperCase() : "SOYBEAN (JS-335)",
        area: "4.2 Hectares",
        lat: currentLat,
        lon: currentLon,
        temp: tempC,
        rain: rainfallMm,
        soil: soilMoisturePct,
        status: weatherAnim === "sunny" && tempC > 33 ? "Night Heat Risk (6.3/9)" : "Healthy Growth",
        recommendation: "Syngenta Stress Buster (500 ml/ha)",
      },
      {
        id: "farm_east",
        name: `${cityName} East Sector`,
        owner: "Sharma Krishi Land",
        crop: "COTTON (Bt-II)",
        area: "3.8 Hectares",
        lat: currentLat + 0.014,
        lon: currentLon + 0.015,
        temp: (tempC - 0.4).toFixed(1),
        rain: rainfallMm,
        soil: Math.max(soilMoisturePct - 5, 45),
        status: "Vegetative Phase",
        recommendation: "Syngenta Nutrient Booster",
      },
      {
        id: "farm_south",
        name: `${cityName} South Basin`,
        owner: "Verma Organic Farm",
        crop: "PADDY / RICE",
        area: "5.1 Hectares",
        lat: currentLat - 0.012,
        lon: currentLon - 0.018,
        temp: (tempC + 0.3).toFixed(1),
        rain: rainfallMm,
        soil: Math.min(soilMoisturePct + 8, 98),
        status: "Pod Filling Stage",
        recommendation: "Syngenta Yield Boost Pro",
      },
    ];

    farms.forEach((f) => {
      const customHtml = `
        <div class="custom-leaflet-marker">
          <div class="marker-ring"></div>
          <div class="h-9 w-9 rounded-2xl bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs transform hover:scale-125 transition-transform cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: "custom-pin",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([f.lat, f.lon], { icon: customIcon }).addTo(map);
      marker.on("click", () => setSelectedFarm(f));
    });

    map.on("click", (e: any) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      setCurrentLat(newLat);
      setCurrentLon(newLng);
      if (onLocationSelect) onLocationSelect(newLat, newLng);
    });
  }, [mapLoaded, currentLat, currentLon, mapTileMode, cityName, tempC, rainfallMm, soilMoisturePct]);

  const handleUseGps = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newLat = pos.coords.latitude;
        const newLon = pos.coords.longitude;
        setCurrentLat(newLat);
        setCurrentLon(newLon);
        setCityName("My GPS Location");
        if (onLocationSelect) onLocationSelect(newLat, newLon);
      });
    }
  };

  const handlePresetSelect = (preset: { name: string; lat: number; lon: number }) => {
    setCurrentLat(preset.lat);
    setCurrentLon(preset.lon);
    setCityName(preset.name);
    if (onLocationSelect) onLocationSelect(preset.lat, preset.lon);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Map Control Bar */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-500/20 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Live Telemetry Title */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-extrabold text-slate-900 uppercase tracking-wider font-mono">
            Live Weather & Field Telemetry Map
          </span>
        </div>

        {/* Animated Weather Layer Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-emerald-50/80 p-1.5 rounded-2xl border border-emerald-500/20">
          <span className="text-[11px] font-bold text-emerald-950 px-2">Animated Overlay:</span>
          {[
            { id: "sunny", label: "☀️ Heat Haze", icon: Sun },
            { id: "rainy", label: "🌧️ Live Rain", icon: CloudRain },
            { id: "night", label: "🌙 Night Mode", icon: Moon },
            { id: "soil", label: "💧 Soil Moisture", icon: Droplets },
          ].map((w) => (
            <button
              key={w.id}
              onClick={() => setWeatherAnim(w.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 text-xs ${
                weatherAnim === w.id
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-slate-700 hover:text-emerald-900 hover:bg-emerald-100/60"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* GPS Button */}
        <button
          onClick={handleUseGps}
          className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
        >
          <LocateFixed className="h-4 w-4 text-amber-300" />
          Acquire My GPS
        </button>
      </div>

      {/* Preset Location Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-600 font-extrabold shrink-0 flex items-center gap-1">
          <Compass className="h-3.5 w-3.5 text-emerald-600" /> Jump to Location:
        </span>
        {LOCATION_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handlePresetSelect(preset)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 cursor-pointer ${
              cityName.includes(preset.name.split(" ")[0])
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Interactive Map Frame with Animated Weather Overlays */}
      <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl border border-emerald-500/30 overflow-hidden shadow-xl bg-[#f0fdf4]">
        <div ref={mapRef} className="w-full h-full z-0" />

        {/* Animated Weather Overlays */}
        {/* 1. Heat Haze Sun Overlay */}
        {weatherAnim === "sunny" && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-tr from-amber-500/10 via-transparent to-amber-400/20 backdrop-brightness-105 animate-pulse" />
        )}

        {/* 2. Falling Rain Animation Overlay */}
        {weatherAnim === "rainy" && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-slate-950/20 overflow-hidden">
            <div className="w-full h-full flex justify-around opacity-75">
              <div className="w-0.5 h-8 bg-sky-300 animate-rain" />
              <div className="w-0.5 h-8 bg-sky-300 animate-rain" style={{ animationDelay: "0.2s" }} />
              <div className="w-0.5 h-8 bg-sky-300 animate-rain" style={{ animationDelay: "0.4s" }} />
              <div className="w-0.5 h-8 bg-sky-300 animate-rain" style={{ animationDelay: "0.6s" }} />
              <div className="w-0.5 h-8 bg-sky-300 animate-rain" style={{ animationDelay: "0.8s" }} />
            </div>
          </div>
        )}

        {/* 3. Night Sensor Mode Overlay */}
        {weatherAnim === "night" && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-indigo-950/25 backdrop-contrast-110">
            <div className="absolute top-4 right-14 bg-slate-950/90 text-indigo-300 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-indigo-500/30 flex items-center gap-1.5 shadow-lg">
              <Moon className="h-3.5 w-3.5 text-indigo-400" /> Night Sensor Active
            </div>
          </div>
        )}

        {/* 4. Soil Moisture Overlay */}
        {weatherAnim === "soil" && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-emerald-900/10 backdrop-hue-rotate-15">
            <div className="absolute top-4 right-14 bg-emerald-950/90 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
              <Droplets className="h-3.5 w-3.5 text-emerald-400" /> Root Zone Moisture: {soilMoisturePct}%
            </div>
          </div>
        )}

        {/* Light Glassmorphic Telemetry Card (Top Left) */}
        <div className="absolute top-4 left-4 z-20 hidden sm:flex flex-col gap-2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/30 shadow-xl space-y-2 text-slate-800 font-sans text-xs w-52">
            <div className="flex items-center justify-between text-emerald-950 font-black border-b border-emerald-100 pb-1.5">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Activity className="h-4 w-4" /> LIVE TELEMETRY
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                AUTO
              </span>
            </div>

            <div className="space-y-1.5 font-medium text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Air Temperature:</span>
                <span className="font-extrabold text-slate-900">{tempC}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Wind Speed:</span>
                <span className="font-extrabold text-slate-900">{windSpeedKmh} km/h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Soil Moisture:</span>
                <span className="font-extrabold text-emerald-700">{soilMoisturePct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Farm Detail Card (Bottom Overlay) */}
        {selectedFarm && (
          <div className="absolute bottom-4 left-4 right-4 z-30 bg-white/95 backdrop-blur-md p-4.5 rounded-3xl border-2 border-emerald-500/30 shadow-2xl space-y-3 text-xs text-slate-800 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-950 text-sm">{selectedFarm.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Farmer: {selectedFarm.owner}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
                  {selectedFarm.area}
                </span>
                <button
                  onClick={() => setSelectedFarm(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/90 p-3 rounded-2xl border border-emerald-200">
                <span className="text-slate-500 text-[10px] block font-semibold">Crop Variety</span>
                <span className="font-black text-emerald-950 text-xs">{selectedFarm.crop}</span>
              </div>
              <div className="bg-amber-50/90 p-3 rounded-2xl border border-amber-200">
                <span className="text-slate-500 text-[10px] block font-semibold">Field Status</span>
                <span className="font-black text-amber-800 text-xs">{selectedFarm.status}</span>
              </div>
              <div className="bg-teal-50/90 p-3 rounded-2xl border border-teal-200">
                <span className="text-slate-500 text-[10px] block font-semibold">Soil Health</span>
                <span className="font-black text-teal-900 text-xs">{selectedFarm.soil}% Moisture</span>
              </div>
              <div className="bg-sky-50/90 p-3 rounded-2xl border border-sky-200">
                <span className="text-slate-500 text-[10px] block font-semibold">Syngenta Recommendation</span>
                <span className="font-black text-sky-950 text-xs">{selectedFarm.recommendation}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active GPS Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-slate-700">
        <div className="flex items-center gap-2 font-medium">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span>Active GPS Telemetry Coordinates:</span>
        </div>
        <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-xl border border-emerald-200">
          {currentLat.toFixed(4)}° N, {currentLon.toFixed(4)}° E ({cityName})
        </span>
      </div>
    </div>
  );
};
