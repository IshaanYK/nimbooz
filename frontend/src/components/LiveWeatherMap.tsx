import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchCurrentWeather } from "@/lib/api";
import { reverseGeocode } from "@/context/WeatherContext";
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

interface LiveWeatherMapProps {
  lat: number;
  lon: number;
  crop: string;
  onLocationSelect?: (lat: number, lon: number) => void;
}

export const LiveWeatherMap: React.FC<LiveWeatherMapProps> = ({
  lat,
  lon,
  crop,
  onLocationSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentLat, setCurrentLat] = useState(lat || 23.2599);
  const [currentLon, setCurrentLon] = useState(lon || 77.4126);
  const [cityName, setCityName] = useState("Field Region");
  const [mapLoaded, setMapLoaded] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);

  // Map View Mode: "telemetry" (Voyager light) | "satellite" | "moisture"
  const [mapMode, setMapMode] = useState<"telemetry" | "satellite" | "moisture">("telemetry");

  // Live Telemetry Data State
  const [timeOfDay, setTimeOfDay] = useState<"night" | "dawn" | "day" | "dusk">("day");
  const [weatherState, setWeatherState] = useState<"raining" | "clear" | "cloudy" | "heat_stress">("clear");
  const [tempC, setTempC] = useState<number>(26.5);
  const [rainfallMm, setRainfallMm] = useState<number>(0);
  const [soilMoisturePct, setSoilMoisturePct] = useState<number>(76);
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(12.4);
  const [humidityPct, setHumidityPct] = useState<number>(68);

  // Location Presets
  const LOCATION_PRESETS = [
    { name: "Bhopal (Soybean)", lat: 23.2599, lon: 77.4126 },
    { name: "Nagpur (Cotton)", lat: 21.1458, lon: 79.0882 },
    { name: "Indore (Wheat)", lat: 22.7196, lon: 75.8577 },
    { name: "Nashik (Grape)", lat: 19.9975, lon: 73.7898 },
    { name: "Amravati (Soybean)", lat: 20.9374, lon: 77.7796 },
    { name: "Ujjain (Mustard)", lat: 23.1765, lon: 75.7885 },
  ];

  // Geocode location name
  useEffect(() => {
    reverseGeocode(currentLat, currentLon).then((geo) => {
      if (geo && typeof geo === "object") {
        setCityName(geo.locationName || geo.district || "Field Region");
      }
    });
  }, [currentLat, currentLon]);

  // Detect time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 19 || hour < 5) setTimeOfDay("night");
    else if (hour >= 5 && hour < 7) setTimeOfDay("dawn");
    else if (hour >= 7 && hour < 17) setTimeOfDay("day");
    else setTimeOfDay("dusk");
  }, []);

  // Fetch real weather telemetry
  useEffect(() => {
    const loadWeather = async () => {
      const data = await fetchCurrentWeather(currentLat, currentLon, crop || "soybean");
      if (data && data.weather && data.weather.records && data.weather.records.length > 0) {
        const latest = data.weather.records[data.weather.records.length - 1];
        const t = latest.temperature_max || 26.5;
        const r = latest.rainfall || 0;
        const sm = (latest.soil_moisture || 0.38) * 100;
        const ws = latest.wind_speed || 12.4;
        const rh = latest.humidity || 68;

        setTempC(t);
        setRainfallMm(r);
        setSoilMoisturePct(Math.min(Math.round(sm), 100));
        setWindSpeedKmh(ws);
        setHumidityPct(rh);

        if (r > 0.5) setWeatherState("raining");
        else if (t > 33.0) setWeatherState("heat_stress");
        else if (sm < 40) setWeatherState("cloudy");
        else setWeatherState("clear");
      }
    };
    loadWeather();
  }, [currentLat, currentLon, crop]);

  // Render Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
      mapRef.current.innerHTML = "";
    }

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([currentLat, currentLon], 13);

    L.control.zoom({ position: "topright" }).addTo(map);

    // Warm, light agricultural map tiles matching website design
    let tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    if (mapMode === "satellite") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    } else if (mapMode === "moisture") {
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com">CartoDB Voyager</a> & OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    // Field Data Markers
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
        status: weatherState === "heat_stress" ? "Night Heat Alert (6.3/9)" : "Optimal Moisture",
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

    // Create Pin Markers matching website emerald styling
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
  }, [mapLoaded, currentLat, currentLon, mapMode, weatherState, cityName]);

  const handleUseGps = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const newLat = pos.coords.latitude;
        const newLon = pos.coords.longitude;
        setCurrentLat(newLat);
        setCurrentLon(newLon);
        const geo = await reverseGeocode(newLat, newLon);
        setCityName(geo.locationName);
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
      {/* Warm Agricultural Control Bar */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-500/20 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="font-extrabold text-emerald-950 tracking-wide text-xs">
              LIVE TELEMETRY MAP
            </span>
          </div>

          <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200 flex items-center gap-1.5">
            {timeOfDay === "night" && <Moon className="h-3.5 w-3.5 text-indigo-600" />}
            {timeOfDay === "day" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
            {timeOfDay.toUpperCase()} ({new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
          </span>

          <span className="px-3 py-1.5 rounded-full bg-emerald-100/90 text-emerald-950 font-bold border border-emerald-300 flex items-center gap-1.5">
            <Thermometer className="h-3.5 w-3.5 text-emerald-700" />
            {tempC}°C
          </span>
        </div>

        {/* Map Layer Controls */}
        <div className="flex items-center gap-1 bg-emerald-50/80 p-1 rounded-2xl border border-emerald-500/20">
          <button
            onClick={() => setMapMode("telemetry")}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              mapMode === "telemetry"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-100/60"
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> Telemetry
          </button>

          <button
            onClick={() => setMapMode("satellite")}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              mapMode === "satellite"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-100/60"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Satellite
          </button>

          <button
            onClick={() => setMapMode("moisture")}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              mapMode === "moisture"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-100/60"
            }`}
          >
            <Droplets className="h-3.5 w-3.5" /> Soil Map
          </button>
        </div>

        {/* GPS Location Button */}
        <button
          onClick={handleUseGps}
          className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
        >
          <LocateFixed className="h-4 w-4 text-amber-300" />
          Acquire GPS Location
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

      {/* Main Map Canvas - Warm Agricultural Frame */}
      <div className="relative w-full h-[380px] sm:h-[460px] md:h-[480px] rounded-3xl border border-emerald-500/30 overflow-hidden shadow-lg bg-[#f0fdf4]">
        <div ref={mapRef} className="w-full h-full z-0" />

        {/* Glassmorphic Light Telemetry Card (Top Left) */}
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
                <span className="text-slate-600">Wind Velocity:</span>
                <span className="font-extrabold text-slate-900">{windSpeedKmh} km/h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Soil Moisture:</span>
                <span className="font-extrabold text-emerald-700">{soilMoisturePct}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Air Humidity:</span>
                <span className="font-extrabold text-teal-700">{humidityPct}%</span>
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

      {/* GPS Telemetry Bar */}
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
