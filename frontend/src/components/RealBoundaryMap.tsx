"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Layers,
  Trash2,
  RotateCcw,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  MapPin,
  Sparkles,
  Tractor,
  Home,
  Navigation,
  X,
  Undo2,
} from "lucide-react";

interface RealBoundaryMapProps {
  center: [number, number];
  zoom?: number;
  initialPoints?: Array<[number, number]>;
  onBoundaryChange: (points: Array<[number, number]>, calculatedAcres: number) => void;
  onCenterChange?: (newCenter: [number, number]) => void;
}

// Precise Geodesic Polygon Area Calculation in Acres and Hectares
export function calculatePolygonAreaAcres(coords: Array<[number, number]>): number {
  if (!coords || coords.length < 3) return 0;

  const R = 6378137; // Earth's mean radius in meters
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const lat1 = (coords[i][0] * Math.PI) / 180;
    const lat2 = (coords[j][0] * Math.PI) / 180;
    const lon1 = (coords[i][1] * Math.PI) / 180;
    const lon2 = (coords[j][1] * Math.PI) / 180;

    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * R * R) / 2.0); // m²
  const acres = area * 0.000247105; // 1 m² = 0.000247105 acres
  return +acres.toFixed(2);
}

export function RealBoundaryMap({
  center,
  zoom = 16,
  initialPoints,
  onBoundaryChange,
  onCenterChange,
}: RealBoundaryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileGroupRef = useRef<L.LayerGroup | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapType, setMapType] = useState<"satellite" | "streets">("satellite");
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(center);

  // Initialize initial points around center if not given
  const [points, setPoints] = useState<Array<[number, number]>>(() => {
    if (initialPoints && initialPoints.length >= 3) return initialPoints;
    return [
      [center[0] + 0.0012, center[1] - 0.0015],
      [center[0] + 0.0015, center[1] + 0.0018],
      [center[0] - 0.0011, center[1] + 0.0014],
      [center[0] - 0.0014, center[1] - 0.0012],
    ];
  });

  const onBoundaryChangeRef = useRef(onBoundaryChange);
  onBoundaryChangeRef.current = onBoundaryChange;

  const onCenterChangeRef = useRef(onCenterChange);
  onCenterChangeRef.current = onCenterChange;

  // Sync when initialPoints changes from outside
  useEffect(() => {
    if (initialPoints && initialPoints.length >= 3) {
      setPoints(initialPoints);
      const acres = calculatePolygonAreaAcres(initialPoints);
      onBoundaryChangeRef.current(initialPoints, acres);
      
      const map = mapInstanceRef.current;
      if (map) {
        try {
          const bounds = L.latLngBounds(initialPoints);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
        } catch (e) {
          // ignore
        }
      }
    }
  }, [initialPoints]);

  // 1. Initial Mount: Trigger area sync immediately
  useEffect(() => {
    const acres = calculatePolygonAreaAcres(points);
    onBoundaryChangeRef.current(points, acres);
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    const safeLat = center[0] || 23.2032;
    const safeLon = center[1] || 77.0844;

    const map = L.map(containerRef.current, {
      center: [safeLat, safeLon],
      zoom: zoom,
      minZoom: 4,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;
    tileGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Track View Movement (when farmer pans/drags map looking for their field from home)
    map.on("moveend", () => {
      const c = map.getCenter();
      const z = map.getZoom();
      setCurrentCenter([c.lat, c.lng]);
      setCurrentZoom(z);
      if (onCenterChangeRef.current) {
        onCenterChangeRef.current([c.lat, c.lng]);
      }
    });

    // Map Click: Add new boundary point
    map.on("click", (e: L.LeafletMouseEvent) => {
      const newPt: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPoints((prev) => {
        let updated: Array<[number, number]>;
        if (prev.length >= 8) {
          updated = [newPt];
        } else {
          updated = [...prev, newPt];
        }
        const acres = calculatePolygonAreaAcres(updated);
        onBoundaryChangeRef.current(updated, acres);
        return updated;
      });
    });

    // Invalidate size on mount
    setTimeout(() => map.invalidateSize({ animate: false }), 100);
    setTimeout(() => map.invalidateSize({ animate: false }), 400);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Base Tile Layers (Google Satellite Hybrid vs OpenStreetMap)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = tileGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (mapType === "satellite") {
      const googleSat = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      });
      group.addLayer(googleSat);
    } else {
      const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      });
      group.addLayer(osm);
    }
  }, [mapType]);

  // 4. Center update from outside
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const [cLat, cLng] = center;
    const cur = map.getCenter();
    if (Math.abs(cur.lat - cLat) > 0.0001 || Math.abs(cur.lng - cLng) > 0.0001) {
      map.setView([cLat, cLng], map.getZoom(), { animate: true });
      map.invalidateSize({ animate: false });
    }
  }, [center]);

  // Navigation helpers for farmers sitting at home
  const panMapByOffset = (dLat: number, dLon: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const cur = map.getCenter();
    const target: [number, number] = [cur.lat + dLat, cur.lng + dLon];
    map.flyTo(target, map.getZoom(), { duration: 0.8 });
  };

  const handleFlyToFarmlandOutskirts = () => {
    panMapByOffset(0.018, 0.018);
  };

  // ── Individual Pointers Removal & Management ────────
  const handleRemovePoint = (indexToRemove: number) => {
    setPoints((prev) => {
      const next = prev.filter((_, i) => i !== indexToRemove);
      const acres = calculatePolygonAreaAcres(next);
      onBoundaryChangeRef.current(next, acres);
      return next;
    });
  };

  const handleUndoLastPoint = () => {
    setPoints((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, prev.length - 1);
      const acres = calculatePolygonAreaAcres(next);
      onBoundaryChangeRef.current(next, acres);
      return next;
    });
  };

  const handleRemovePointRef = useRef(handleRemovePoint);
  handleRemovePointRef.current = handleRemovePoint;

  // 5. Update Polygon & Vertex Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (points.length >= 3) {
      const polygon = L.polygon(points, {
        color: "#533afd",
        weight: 3,
        dashArray: "6, 4",
        fillColor: "#533afd",
        fillOpacity: 0.28,
      }).addTo(map);

      polygonLayerRef.current = polygon;
    }

    // Add vertex markers with interactive delete capability
    points.forEach((pt, idx) => {
      const customIcon = L.divIcon({
        className: "custom-field-pin",
        html: `
          <div style="
            background: #533afd;
            color: #ffffff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 14px rgba(83, 58, 253, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 900;
            font-family: monospace;
            cursor: pointer;
            position: relative;
            transition: transform 0.15s ease;
          " title="Corner P${idx + 1} - Tap to delete or drag to adjust">
            P${idx + 1}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(pt, {
        icon: customIcon,
        draggable: true,
        title: `Corner P${idx + 1} (Tap to remove or drag to adjust)`,
      });

      marker.on("dragend", (e: any) => {
        const newPos = e.target.getLatLng();
        setPoints((prev) => {
          const next = [...prev];
          next[idx] = [newPos.lat, newPos.lng];
          const acres = calculatePolygonAreaAcres(next);
          onBoundaryChangeRef.current(next, acres);
          return next;
        });
      });

      // Interactive popup with Delete button for mobile phones & desktop
      const popupDiv = document.createElement("div");
      popupDiv.style.textAlign = "center";
      popupDiv.style.fontFamily = "system-ui, -apple-system, sans-serif";
      popupDiv.style.padding = "4px 2px";
      popupDiv.style.minWidth = "140px";
      popupDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 3px;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #533afd;"></span>
          <span style="font-weight: 800; font-size: 13px; color: #0d253d;">Corner P${idx + 1}</span>
        </div>
        <div style="font-size: 10px; color: #64748b; margin-bottom: 8px; font-family: monospace;">
          ${pt[0].toFixed(5)}°N, ${pt[1].toFixed(5)}°E
        </div>
        <button id="del-corner-btn-${idx}" style="
          width: 100%;
          background: #ef4444;
          color: #ffffff;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.35);
        ">
          🗑️ Delete Corner P${idx + 1}
        </button>
        <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">
          (गलती से लगा कोना हटाएं)
        </div>
      `;

      popupDiv.querySelector(`#del-corner-btn-${idx}`)?.addEventListener("click", () => {
        map.closePopup();
        handleRemovePointRef.current(idx);
      });

      marker.bindPopup(popupDiv, { offset: [0, -14], closeButton: true });

      // Right-click directly removes the point on desktop
      marker.on("contextmenu", (e: any) => {
        if (e.originalEvent) {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
        }
        map.closePopup();
        handleRemovePointRef.current(idx);
      });

      markersGroup.addLayer(marker);
    });
  }, [points]);

  const calculatedAcres = calculatePolygonAreaAcres(points);

  const handleResetPointsToCurrentView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const c = map.getCenter();
    const newPts: Array<[number, number]> = [
      [c.lat + 0.0012, c.lng - 0.0015],
      [c.lat + 0.0015, c.lng + 0.0018],
      [c.lat - 0.0011, c.lng + 0.0014],
      [c.lat - 0.0014, c.lng - 0.0012],
    ];
    setPoints(newPts);
    const acres = calculatePolygonAreaAcres(newPts);
    onBoundaryChange(newPts, acres);
  };

  const handleClearPoints = () => {
    setPoints([]);
    onBoundaryChange([], 0);
  };

  return (
    <div className="space-y-3 select-none font-sans">
      {/* ── Farm Navigation Toolbar (Clean Stripe / Apple Light Theme) ──── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-[#533afd] border border-indigo-200/60 shrink-0">
            <Tractor className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-[#0d253d] font-display block text-sm">
              At Home? Fly to Your Farm Land (घर बैठे खेत खोजें)
            </span>
            <span className="text-xs text-slate-500">
              Drag map or use buttons to navigate away from village settlement to green crop fields.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Fly to Outskirts Button */}
          <button
            type="button"
            onClick={handleFlyToFarmlandOutskirts}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#533afd] to-[#4434d4] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>🌾 Fly to Farm Fields (2km)</span>
          </button>

          {/* Directional Nudges */}
          <div className="flex items-center bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              title="Pan North"
              onClick={() => panMapByOffset(0.01, 0)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 hover:text-[#533afd] transition-colors cursor-pointer"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Pan South"
              onClick={() => panMapByOffset(-0.01, 0)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 hover:text-[#533afd] transition-colors cursor-pointer"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Pan West"
              onClick={() => panMapByOffset(0, -0.01)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 hover:text-[#533afd] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Pan East"
              onClick={() => panMapByOffset(0, 0.01)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 hover:text-[#533afd] transition-colors cursor-pointer"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Place Boundary in Current View */}
          <button
            type="button"
            onClick={handleResetPointsToCurrentView}
            className="px-3 py-2 rounded-xl bg-white border border-[#e3e8ee] hover:bg-slate-50 text-[#0d253d] text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <span>🎯 Place Boundary Here</span>
          </button>
        </div>
      </div>

      {/* Map Header Controls */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-[#0d253d]">
            Live Satellite Boundary: <span className="text-[#533afd] font-black">{calculatedAcres} Acres</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Map Layer Switcher */}
          <div className="flex bg-[#f6f9fc] p-0.5 rounded-xl border border-[#e3e8ee] text-xs">
            <button
              type="button"
              onClick={() => setMapType("satellite")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                mapType === "satellite"
                  ? "bg-white text-[#533afd] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType("streets")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                mapType === "streets"
                  ? "bg-white text-[#533afd] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🗺️ Map
            </button>
          </div>

          {/* Undo Point Button */}
          <button
            type="button"
            disabled={points.length === 0}
            onClick={handleUndoLastPoint}
            className="text-xs text-slate-700 hover:text-[#533afd] font-bold flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors disabled:opacity-40"
            title="Undo the last placed corner pin (पिछला कोना हटाएं)"
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span>Undo (हटाएं)</span>
          </button>

          <button
            type="button"
            onClick={handleClearPoints}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Real Map Container */}
      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-[#e3e8ee] shadow-sm bg-slate-900">
        <div ref={containerRef} className="w-full h-full z-0 cursor-crosshair" />

        {/* HUD Overlay Bar (Clean White Stripe Aesthetic) */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-[500] flex items-center justify-between bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#e3e8ee] text-[#0d253d] text-xs font-mono shadow-xl pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-[#533afd] font-extrabold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#533afd]" />
              {points.length} Corners Locked
            </span>
            <span className="text-slate-400 hidden sm:inline">
              | Tap pin or [✕] below to delete accidental point
            </span>
          </div>

          <div className="font-black text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-xl border border-emerald-300 text-xs">
            Calculated: {calculatedAcres} Acres ({(calculatedAcres * 0.4047).toFixed(2)} Ha)
          </div>
        </div>

        {/* GPS Coordinates Top Right */}
        <div className="absolute top-3.5 right-3.5 z-[500] bg-white/95 backdrop-blur-md text-[#0d253d] text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl border border-[#e3e8ee] shadow-sm pointer-events-none">
          📍 {currentCenter[0].toFixed(4)}°N, {currentCenter[1].toFixed(4)}°E
        </div>
      </div>

      {/* ── Interactive Corner Management Bar (Individual Point Removal) ──── */}
      {points.length > 0 && (
        <div className="p-3 bg-white border border-[#e3e8ee] rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-[#0d253d] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#533afd]" />
              Active Corners ({points.length}):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {points.map((pt, idx) => (
                <div
                  key={`corner-chip-${idx}-${pt[0]}-${pt[1]}`}
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl bg-indigo-50/90 border border-indigo-200/80 text-indigo-950 font-mono text-xs font-bold transition-all hover:bg-rose-50 hover:border-rose-300"
                >
                  <span>P{idx + 1}</span>
                  <button
                    type="button"
                    title={`Delete Corner P${idx + 1} (गलती से लगा कोना P${idx + 1} हटाएं)`}
                    onClick={() => handleRemovePoint(idx)}
                    className="p-1 hover:bg-rose-500 hover:text-white rounded-md text-slate-500 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              💡 Tap any pin on map or click [✕] to remove
            </span>
            <button
              type="button"
              disabled={points.length === 0}
              onClick={handleUndoLastPoint}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              title="Remove the last added point"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>Undo Last</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
