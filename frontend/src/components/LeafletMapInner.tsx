"use client";

import React, { useEffect, useRef, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FieldRecord } from "@/lib/fieldStore";

export type BaseMapMode = "satellite" | "streets" | "terrain";

interface LeafletMapInnerProps {
  center: [number, number];
  zoom?: number;
  savedFields: FieldRecord[];
  activeFieldId?: string;
  isDrawingMode?: boolean;
  drawnNodes?: Array<[number, number]>;
  baseMapType?: BaseMapMode;
  onMapClick?: (lat: number, lon: number) => void;
  onSelectField?: (field: FieldRecord) => void;
}

export const LeafletMapInner: React.FC<LeafletMapInnerProps> = memo(({
  center,
  zoom = 16,
  savedFields = [],
  activeFieldId,
  isDrawingMode = false,
  drawnNodes = [],
  baseMapType = "satellite",
  onMapClick,
  onSelectField,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);
  const fieldsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const drawingLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userPinLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Mutable refs to prevent stale closure bugs
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  const onSelectFieldRef = useRef(onSelectField);
  useEffect(() => {
    onSelectFieldRef.current = onSelectField;
  }, [onSelectField]);

  // Sanitize coordinates
  const safeLat = typeof center?.[0] === "number" && !isNaN(center[0]) && center[0] !== 0 ? center[0] : 23.2599;
  const safeLon = typeof center?.[1] === "number" && !isNaN(center[1]) && center[1] !== 0 ? center[1] : 77.4126;

  // 1. Initialize Map Instance (Only on mount)
  useEffect(() => {
    if (!containerRef.current) return;

    // Reset container leaflet id if hot reloaded
    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    try {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    } catch {}

    const map = L.map(containerRef.current, {
      center: [safeLat, safeLon],
      zoom: zoom,
      minZoom: 3,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false,
      trackResize: true,
      preferCanvas: true,
    });

    mapRef.current = map;

    // Zoom control at bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Create vector layer groups
    fieldsLayerGroupRef.current = L.layerGroup().addTo(map);
    drawingLayerGroupRef.current = L.layerGroup().addTo(map);
    userPinLayerGroupRef.current = L.layerGroup().addTo(map);

    // Click handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onMapClickRef.current) {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    // Invalidation hooks for smooth initial sizing
    const t1 = setTimeout(() => { try { map.invalidateSize({ animate: false }); } catch {} }, 100);
    const t2 = setTimeout(() => { try { map.invalidateSize({ animate: false }); } catch {} }, 400);

    const onResize = () => {
      try { map.invalidateSize({ animate: false }); } catch {}
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
      tileLayerRef.current = null;
      labelsLayerRef.current = null;
      fieldsLayerGroupRef.current = null;
      drawingLayerGroupRef.current = null;
      userPinLayerGroupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Base Tile Layer Switcher
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
      labelsLayerRef.current = null;
    }

    if (baseMapType === "satellite") {
      // High-Res Google Satellite Hybrid
      const satLayer = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "Google Satellite",
      });
      satLayer.addTo(map);
      tileLayerRef.current = satLayer;
    } else if (baseMapType === "terrain") {
      // Google Terrain / Topo
      const terrLayer = L.tileLayer("https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "Google Terrain",
      });
      terrLayer.addTo(map);
      tileLayerRef.current = terrLayer;
    } else {
      // OpenStreetMap Streets
      const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "OpenStreetMap",
      });
      osmLayer.addTo(map);
      tileLayerRef.current = osmLayer;
    }

    try {
      map.invalidateSize({ animate: false });
    } catch {}
  }, [baseMapType]);

  // 3. Center Pan & Viewport Invalidation
  useEffect(() => {
    const map = mapRef.current;
    if (!map || safeLat == null || safeLon == null) return;
    try {
      map.setView([safeLat, safeLon], map.getZoom() || 16, { animate: true });
      map.invalidateSize({ animate: false });
    } catch {}
  }, [safeLat, safeLon]);

  // 4. Drawing Mode Invalidation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      map.invalidateSize({ animate: false });
    } catch {}
    const t = setTimeout(() => {
      try { map.invalidateSize({ animate: false }); } catch {}
    }, 150);
    return () => clearTimeout(t);
  }, [isDrawingMode]);

  // 5. Render Saved Field Polygons & Markers
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = fieldsLayerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    if (!savedFields || savedFields.length === 0) return;

    savedFields.forEach((field) => {
      if (!field.polygon || field.polygon.length < 3) return;
      const isActive = field.id === activeFieldId;

      const poly = L.polygon(field.polygon, {
        color: isActive ? "#10B981" : "#3B82F6",
        weight: isActive ? 3 : 2,
        fillColor: isActive ? "#10B981" : "#60A5FA",
        fillOpacity: isActive ? 0.35 : 0.2,
        dashArray: isActive ? undefined : "4, 4",
      });

      poly.bindPopup(`
        <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #0F172A; min-width: 170px; padding: 2px;">
          <div style="font-size: 13px; font-weight: 800; color: #065F46; margin-bottom: 2px;">
            🌾 ${field.name}
          </div>
          <div style="color: #475569; font-size: 11px; margin-bottom: 6px;">
            ${field.crop} · ${field.areaAcres} Acres
          </div>
          <div style="display: inline-block; padding: 3px 8px; background: #ECFDF5; border-radius: 6px; border: 1px solid #A7F3D0; font-size: 10px; font-weight: bold; color: #065F46;">
            ✓ Active Field Plot
          </div>
        </div>
      `);

      poly.on("click", () => {
        if (onSelectFieldRef.current) onSelectFieldRef.current(field);
      });

      layerGroup.addLayer(poly);

      // Center marker
      const centerMarker = L.circleMarker(field.center, {
        radius: isActive ? 7 : 5,
        color: "#FFFFFF",
        weight: 2,
        fillColor: isActive ? "#10B981" : "#3B82F6",
        fillOpacity: 1,
      });
      layerGroup.addLayer(centerMarker);
    });
  }, [savedFields, activeFieldId]);

  // 6. Render Active Drawing Nodes & Real-Time Polygon Trace
  useEffect(() => {
    const map = mapRef.current;
    const drawGroup = drawingLayerGroupRef.current;
    if (!map || !drawGroup) return;

    drawGroup.clearLayers();

    if (!isDrawingMode || drawnNodes.length === 0) return;

    // Draw connecting line between points
    if (drawnNodes.length > 1) {
      const line = L.polyline(drawnNodes, {
        color: "#F59E0B",
        weight: 3,
        dashArray: "6, 6",
      });
      drawGroup.addLayer(line);
    }

    // Draw closed polygon preview if 3+ points
    if (drawnNodes.length >= 3) {
      const previewPoly = L.polygon(drawnNodes, {
        color: "#10B981",
        weight: 2,
        fillColor: "#34D399",
        fillOpacity: 0.35,
      });
      drawGroup.addLayer(previewPoly);
    }

    // Draw corner markers
    drawnNodes.forEach((node, index) => {
      const isStart = index === 0;
      const marker = L.circleMarker(node, {
        radius: isStart ? 8 : 6,
        color: "#FFFFFF",
        weight: 2,
        fillColor: isStart ? "#10B981" : "#F59E0B",
        fillOpacity: 1,
      });
      drawGroup.addLayer(marker);
    });
  }, [isDrawingMode, drawnNodes]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full relative z-0 ${isDrawingMode ? "cursor-crosshair" : "cursor-grab"}`}
      style={{ minHeight: "440px", height: "100%", width: "100%" }}
    />
  );
});

LeafletMapInner.displayName = "LeafletMapInner";
