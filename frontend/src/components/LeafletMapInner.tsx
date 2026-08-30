"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { FieldRecord } from "@/lib/fieldStore";

interface NewMapEngineProps {
  center: [number, number];
  zoom?: number;
  fields: FieldRecord[];
  activeFieldId?: string;
  mapType: "satellite" | "streets" | "terrain";
  isDrawing: boolean;
  drawnPoints: Array<[number, number]>;
  onMapClick: (lat: number, lon: number) => void;
  onSelectField?: (field: FieldRecord) => void;
}

export function LeafletMapInner({
  center,
  zoom = 15,
  fields = [],
  activeFieldId,
  mapType = "satellite",
  isDrawing = false,
  drawnPoints = [],
  onMapClick,
  onSelectField,
}: NewMapEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const vectorsGroupRef = useRef<L.LayerGroup | null>(null);
  const drawingGroupRef = useRef<L.LayerGroup | null>(null);

  // Store latest callbacks to prevent stale closures
  const clickCallbackRef = useRef(onMapClick);
  clickCallbackRef.current = onMapClick;

  const selectCallbackRef = useRef(onSelectField);
  selectCallbackRef.current = onSelectField;

  // 1. Initialize Map Once
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    // Reset container ID if re-mounted
    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    // Default icon assets
    try {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    } catch (_) {}

    const safeLat = center?.[0] && !isNaN(center[0]) ? center[0] : 23.2599;
    const safeLon = center?.[1] && !isNaN(center[1]) ? center[1] : 77.4126;

    const map = L.map(containerRef.current, {
      center: [safeLat, safeLon],
      zoom: zoom,
      minZoom: 3,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    mapInstanceRef.current = map;

    // Zoom Controls at Bottom Right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Layer groups for clean management
    tileLayerGroupRef.current = L.layerGroup().addTo(map);
    vectorsGroupRef.current = L.layerGroup().addTo(map);
    drawingGroupRef.current = L.layerGroup().addTo(map);

    // Click handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (clickCallbackRef.current) {
        clickCallbackRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    // Invalidate size on initial mount
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Base Map Tile Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = tileLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (mapType === "satellite") {
      // High-resolution Google Satellite Hybrid with roads & labels
      const sat = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      });
      group.addLayer(sat);
    } else if (mapType === "terrain") {
      // Google Terrain
      const terr = L.tileLayer("https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      });
      group.addLayer(terr);
    } else {
      // OpenStreetMap Streets
      const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      });
      group.addLayer(streets);
    }
  }, [mapType]);

  // 3. Pan to Center
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const safeLat = center?.[0] && !isNaN(center[0]) ? center[0] : 23.2599;
    const safeLon = center?.[1] && !isNaN(center[1]) ? center[1] : 77.4126;

    map.setView([safeLat, safeLon], map.getZoom(), { animate: true });
    map.invalidateSize();
  }, [center]);

  // 4. Invalidate Size on Drawing Mode Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.invalidateSize();
  }, [isDrawing]);

  // 5. Render Saved Farm Fields
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = vectorsGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    fields.forEach((field) => {
      if (!field.polygon || field.polygon.length < 3) return;
      const isActive = field.id === activeFieldId;

      const polygon = L.polygon(field.polygon, {
        color: isActive ? "#10B981" : "#3B82F6",
        weight: isActive ? 3 : 2,
        fillColor: isActive ? "#10B981" : "#60A5FA",
        fillOpacity: isActive ? 0.4 : 0.2,
      });

      polygon.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 150px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #065F46;">
            🌾 ${field.name}
          </h4>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #475569;">
            ${field.crop} · ${field.areaAcres} Acres
          </p>
          <span style="font-size: 11px; background: #ECFDF5; color: #065F46; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
            ✓ Active Plot
          </span>
        </div>
      `);

      polygon.on("click", () => {
        if (selectCallbackRef.current) {
          selectCallbackRef.current(field);
        }
      });

      group.addLayer(polygon);

      // Center Pin Marker
      const centerDot = L.circleMarker(field.center, {
        radius: isActive ? 8 : 5,
        color: "#FFFFFF",
        weight: 2,
        fillColor: isActive ? "#10B981" : "#3B82F6",
        fillOpacity: 1,
      });
      group.addLayer(centerDot);
    });
  }, [fields, activeFieldId]);

  // 6. Render Active Drawing Points & Preview Line
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = drawingGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (!isDrawing || drawnPoints.length === 0) return;

    // Draw connecting lines
    if (drawnPoints.length > 1) {
      const line = L.polyline(drawnPoints, {
        color: "#F59E0B",
        weight: 3,
        dashArray: "6, 6",
      });
      group.addLayer(line);
    }

    // Draw polygon fill preview if 3+ points
    if (drawnPoints.length >= 3) {
      const fillPreview = L.polygon(drawnPoints, {
        color: "#10B981",
        weight: 2,
        fillColor: "#34D399",
        fillOpacity: 0.35,
      });
      group.addLayer(fillPreview);
    }

    // Point corner markers
    drawnPoints.forEach((point, idx) => {
      const isStart = idx === 0;
      const marker = L.circleMarker(point, {
        radius: isStart ? 8 : 6,
        color: "#FFFFFF",
        weight: 2,
        fillColor: isStart ? "#10B981" : "#F59E0B",
        fillOpacity: 1,
      });
      group.addLayer(marker);
    });
  }, [isDrawing, drawnPoints]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[460px] ${isDrawing ? "cursor-crosshair" : "cursor-grab"}`}
      style={{ width: "100%", height: "100%", minHeight: "460px" }}
    />
  );
}
