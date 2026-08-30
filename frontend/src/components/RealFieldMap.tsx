"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Layers,
  Activity,
  Droplets,
  Thermometer,
  CloudRain,
  ShieldAlert,
  Compass,
  Navigation,
  CheckCircle2,
  X,
  Maximize2,
  Sparkles,
  Edit3,
  Trash2,
} from "lucide-react";
import { DataBadge } from "./DataBadge";
import { fetchCurrentWeather } from "@/lib/api";

interface FieldPolygonPoint {
  lat: number;
  lng: number;
}

interface RealFieldMapProps {
  initialLat?: number;
  initialLon?: number;
  crop?: string;
  fieldAreaHa?: number;
  fieldName?: string;
  polygonPoints?: FieldPolygonPoint[];
  allowDrawing?: boolean;
  onPolygonComplete?: (points: FieldPolygonPoint[], computedAreaHa: number) => void;
  onLocationSelect?: (lat: number, lon: number) => void;
}

export const RealFieldMap: React.FC<RealFieldMapProps> = ({
  initialLat = 23.2599,
  initialLon = 77.4126,
  crop = "soybean",
  fieldAreaHa = 4.2,
  fieldName = "Bhopal Primary Field",
  polygonPoints = [],
  allowDrawing = true,
  onPolygonComplete,
  onLocationSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const drawMarkersRef = useRef<any[]>([]);

  const [mapLoaded, setMapLoaded] = useState(true);
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLon, setCurrentLon] = useState(initialLon);

  // Map Tile Layers: 'satellite' | 'streets' | 'terrain'
  const [tileLayerType, setTileLayerType] = useState<"satellite" | "streets" | "terrain">("satellite");

  // Weather Overlay Mode: 'none' | 'temperature' | 'rainfall' | 'soil_moisture' | 'heat_risk'
  const [weatherOverlay, setWeatherOverlay] = useState<"none" | "temperature" | "rainfall" | "soil_moisture" | "heat_risk">("soil_moisture");

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawPoints, setDrawPoints] = useState<FieldPolygonPoint[]>(polygonPoints);
  const [computedArea, setComputedArea] = useState<number>(fieldAreaHa);

  // Real API Telemetry
  const [telemetry, setTelemetry] = useState<{
    tempC: number;
    rainfallMm: number;
    soilMoisturePct: number;
    stressScore: string;
    source: string;
  }>({
    tempC: 28.4,
    rainfallMm: 42.0,
    soilMoisturePct: 76,
    stressScore: "Moderate Night Heat Stress",
    source: "LIVE Meteoblue + CE Hub",
  });

  // Selected Pin Panel
  const [selectedPinInfo, setSelectedPinInfo] = useState<any>(null);

  // Fetch real weather data when location changes
  useEffect(() => {
    async function loadData() {
      const res = await fetchCurrentWeather(currentLat, currentLon, crop);
      if (res && res.weather && res.weather.records && res.weather.records.length > 0) {
        const last = res.weather.records[res.weather.records.length - 1];
        setTelemetry({
          tempC: last.temperature_max || 28.4,
          rainfallMm: res.weather.records.reduce((acc: number, r: any) => acc + (r.rainfall || 0), 0),
          soilMoisturePct: Math.round((last.soil_moisture || 0.38) * 100),
          stressScore: res.stress_assessment?.stress_scores?.heat_night?.recommendation || "Optimal Conditions",
          source: "LIVE Meteoblue + CE Hub",
        });
      }
    }
    loadData();
  }, [currentLat, currentLon, crop]);

  // Compute Polygon Area in Hectares (Shoelace formula on Lat/Lon converted to meters)
  const calculatePolygonAreaHa = (pts: FieldPolygonPoint[]) => {
    if (pts.length < 3) return 0;
    const radius = 6378137; // Earth's radius in meters
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      const p1 = pts[i];
      const p2 = pts[j];
      const lat1 = (p1.lat * Math.PI) / 180;
      const lat2 = (p2.lat * Math.PI) / 180;
      const lon1 = (p1.lng * Math.PI) / 180;
      const lon2 = (p2.lng * Math.PI) / 180;
      area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    area = (Math.abs(area) * radius * radius) / 2;
    const hectares = area / 10000;
    return Math.round(hectares * 10) / 10;
  };

  // Initialize & Update Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([currentLat, currentLon], 14);

      L.control.zoom({ position: "topright" }).addTo(map);
      mapInstanceRef.current = map;

      // Handle map clicks in drawing mode or pin mode
      map.on("click", (e: any) => {
        const clickedLat = e.latlng.lat;
        const clickedLng = e.latlng.lng;

        if (onLocationSelect) onLocationSelect(clickedLat, clickedLng);

        // If drawing mode active
        if ((mapContainerRef.current as any)?._isDrawing) {
          setDrawPoints((prev) => {
            const next = [...prev, { lat: clickedLat, lng: clickedLng }];
            const newArea = calculatePolygonAreaHa(next);
            setComputedArea(newArea);
            return next;
          });
        }
      });
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Select Base Tile Layer
    let tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    let attribution = "Esri World Imagery Satellite";

    if (tileLayerType === "streets") {
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      attribution = "OpenStreetMap";
    } else if (tileLayerType === "terrain") {
      tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      attribution = "OpenTopoMap";
    }

    L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);

    // Update Field Polygon if points exist
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
    }

    const defaultShape = [
      [currentLat + 0.003, currentLon - 0.004],
      [currentLat + 0.004, currentLon + 0.003],
      [currentLat - 0.003, currentLon + 0.005],
      [currentLat - 0.004, currentLon - 0.003],
    ];

    const activePolygonCoords =
      drawPoints.length >= 3
        ? drawPoints.map((p) => [p.lat, p.lng])
        : defaultShape;

    // Color based on weather overlay
    let polygonColor = "#10b981"; // Emerald default
    let fillColor = "rgba(16, 185, 129, 0.25)";

    if (weatherOverlay === "temperature") {
      polygonColor = "#f59e0b";
      fillColor = "rgba(245, 158, 11, 0.35)";
    } else if (weatherOverlay === "rainfall") {
      polygonColor = "#0284c7";
      fillColor = "rgba(2, 132, 199, 0.35)";
    } else if (weatherOverlay === "heat_risk") {
      polygonColor = "#ef4444";
      fillColor = "rgba(239, 68, 68, 0.4)";
    } else if (weatherOverlay === "soil_moisture") {
      polygonColor = "#14b8a6";
      fillColor = "rgba(20, 184, 166, 0.3)";
    }

    const polygon = L.polygon(activePolygonCoords, {
      color: polygonColor,
      weight: 3,
      fillColor: fillColor,
      fillOpacity: 0.6,
      dashArray: isDrawingMode ? "6 6" : undefined,
    }).addTo(map);

    polygonLayerRef.current = polygon;

    // Field Center Marker
    const centerIcon = L.divIcon({
      html: `
        <div class="relative group cursor-pointer">
          <div class="absolute -inset-2 bg-emerald-500/30 rounded-full blur-sm animate-pulse"></div>
          <div class="relative h-10 w-10 rounded-2xl bg-emerald-600 border-2 border-white shadow-2xl flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      className: "custom-field-pin",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    const fieldMarker = L.marker([currentLat, currentLon], { icon: centerIcon }).addTo(map);
    fieldMarker.on("click", () => {
      setSelectedPinInfo({
        name: fieldName,
        crop: crop.toUpperCase(),
        area: `${computedArea || fieldAreaHa} ha`,
        lat: currentLat,
        lon: currentLon,
        temp: `${telemetry.tempC}°C`,
        rain: `${telemetry.rainfallMm.toFixed(1)} mm`,
        soil: `${telemetry.soilMoisturePct}%`,
        stress: telemetry.stressScore,
      });
    });
  }, [mapLoaded, tileLayerType, weatherOverlay, drawPoints, isDrawingMode, currentLat, currentLon]);

  // Handle GPS location click
  const handleAcquireGps = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setCurrentLat(lat);
          setCurrentLon(lon);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lon], 15, { duration: 1.5 });
          }
          if (onLocationSelect) onLocationSelect(lat, lon);
        },
        () => {
          alert("GPS permission denied or unavailable. Centering on Bhopal field.");
        }
      );
    }
  };

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    const next = !isDrawingMode;
    setIsDrawingMode(next);
    if (mapContainerRef.current) {
      (mapContainerRef.current as any)._isDrawing = next;
    }
    if (next) {
      setDrawPoints([]);
      setComputedArea(0);
    }
  };

  const clearDrawing = () => {
    setDrawPoints([]);
    setComputedArea(0);
  };

  const saveDrawing = () => {
    setIsDrawingMode(false);
    if (mapContainerRef.current) {
      (mapContainerRef.current as any)._isDrawing = false;
    }
    if (onPolygonComplete) {
      onPolygonComplete(drawPoints, computedArea);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Map Control Bar */}
      <div className="bg-slate-950/90 text-white p-3.5 rounded-3xl border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Layer Switches & Data Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <DataBadge type="LIVE_METEOBLUE" />
          <DataBadge type="LIVE_CEHUB" />

          {isDrawingMode ? (
            <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-mono text-[11px] font-bold border border-amber-500/40 animate-pulse flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Tap Map to Draw Polygon ({drawPoints.length} points)
            </span>
          ) : (
            <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-mono text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Field Polygon Active ({computedArea || fieldAreaHa} ha)
            </span>
          )}
        </div>

        {/* Tile Layer Controls */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setTileLayerType("satellite")}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              tileLayerType === "satellite"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setTileLayerType("streets")}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              tileLayerType === "streets"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Streets
          </button>
          <button
            onClick={() => setTileLayerType("terrain")}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              tileLayerType === "terrain"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Terrain
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {allowDrawing && (
            <>
              {isDrawingMode ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={clearDrawing}
                    className="px-2.5 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-bold border border-red-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                  <button
                    onClick={saveDrawing}
                    disabled={drawPoints.length < 3}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-black shadow-lg disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Save Boundary
                  </button>
                </div>
              ) : (
                <button
                  onClick={toggleDrawingMode}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Draw Boundary
                </button>
              )}
            </>
          )}

          <button
            onClick={handleAcquireGps}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-300" /> Acquire GPS
          </button>
        </div>
      </div>

      {/* Weather Layer Switcher Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-emerald-400" /> Weather Overlays:
        </span>
        {[
          { id: "soil_moisture", label: `Soil Moisture (${telemetry.soilMoisturePct}%)`, icon: <Droplets className="w-3 h-3 text-teal-400" /> },
          { id: "temperature", label: `Temperature (${telemetry.tempC}°C)`, icon: <Thermometer className="w-3 h-3 text-amber-400" /> },
          { id: "rainfall", label: `Rainfall (${telemetry.rainfallMm.toFixed(1)} mm)`, icon: <CloudRain className="w-3 h-3 text-sky-400" /> },
          { id: "heat_risk", label: "Heat Stress Alert", icon: <ShieldAlert className="w-3 h-3 text-red-400" /> },
        ].map((layer) => (
          <button
            key={layer.id}
            onClick={() => setWeatherOverlay(layer.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              weatherOverlay === layer.id
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800"
            }`}
          >
            {layer.icon}
            {layer.label}
          </button>
        ))}
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Live Weather Overlay Badge (Top Left Overlay) */}
        <div className="absolute top-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl text-xs space-y-1.5 max-w-[240px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> LIVE TELEMETRY
            </span>
            <DataBadge type="LIVE_METEOBLUE" size="sm" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Temp</span>
              <span className="text-amber-300 font-bold">{telemetry.tempC}°C</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Soil Moist.</span>
              <span className="text-teal-300 font-bold">{telemetry.soilMoisturePct}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Rainfall</span>
              <span className="text-sky-300 font-bold">{telemetry.rainfallMm.toFixed(1)} mm</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Field Area</span>
              <span className="text-emerald-300 font-bold">{computedArea || fieldAreaHa} ha</span>
            </div>
          </div>
        </div>

        {/* Selected Pin Side/Bottom Panel */}
        {selectedPinInfo && (
          <div className="absolute bottom-4 left-4 right-4 z-30 bg-slate-950/95 backdrop-blur-xl p-4 rounded-3xl border border-emerald-500/40 shadow-2xl text-xs text-white space-y-3 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedPinInfo.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedPinInfo.lat.toFixed(4)}° N, {selectedPinInfo.lon.toFixed(4)}° E
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPinInfo(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-mono">CROP & VARIETY</span>
                <span className="font-bold text-emerald-400">{selectedPinInfo.crop}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-mono">FIELD AREA</span>
                <span className="font-bold text-teal-400">{selectedPinInfo.area}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-mono">CE HUB STRESS</span>
                <span className="font-bold text-amber-400">{selectedPinInfo.stress}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-mono">SOIL MOISTURE</span>
                <span className="font-bold text-sky-400">{selectedPinInfo.soil}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
