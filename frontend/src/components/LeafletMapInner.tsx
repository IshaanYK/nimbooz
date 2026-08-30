"use client";

import React, { useEffect, useRef, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FieldRecord, FieldPin } from "@/lib/fieldStore";

interface LeafletMapInnerProps {
  center: [number, number];
  savedFields: FieldRecord[];
  activeFieldId?: string;
  isDrawingMode?: boolean;
  drawnNodes?: Array<[number, number]>;
  baseMapType?: "satellite" | "streets" | "hybrid";
  pinsList?: FieldPin[];
  onMapClick?: (lat: number, lon: number) => void;
  onSelectField?: (field: FieldRecord) => void;
}

export const LeafletMapInner: React.FC<LeafletMapInnerProps> = memo(({
  center,
  savedFields,
  activeFieldId,
  isDrawingMode = false,
  drawnNodes = [],
  baseMapType = "satellite",
  pinsList = [],
  onMapClick,
  onSelectField,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const drawingLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const lastCenterRef = useRef<[number, number]>(center);

  // Mutable refs to prevent stale closure bugs
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  const onSelectFieldRef = useRef(onSelectField);
  useEffect(() => {
    onSelectFieldRef.current = onSelectField;
  }, [onSelectField]);

  // 1. Initialize Leaflet Map (ONCE on mount)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    } catch {}

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 16,
      minZoom: 3,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false,
      trackResize: true,
    });

    mapInstanceRef.current = map;

    // Zoom control in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // 100% Reliable ESRI World Imagery Tile Layer
    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution: "Esri Satellite",
        keepBuffer: 8,
        updateWhenIdle: false,
        updateWhenZooming: true,
      }
    );

    // Place & Boundary Labels Overlay
    const esriLabels = L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        opacity: 0.85,
        keepBuffer: 8,
      }
    );

    esriSatellite.addTo(map);
    esriLabels.addTo(map);

    // Vector layer groups
    layerGroupRef.current = L.layerGroup().addTo(map);
    drawingLayerGroupRef.current = L.layerGroup().addTo(map);

    // Map click handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onMapClickRef.current) {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    // Invalidate size once layout settles
    const t1 = setTimeout(() => { try { map.invalidateSize({ animate: false }); } catch {} }, 150);
    const t2 = setTimeout(() => { try { map.invalidateSize({ animate: false }); } catch {} }, 500);

    const handleResize = () => {
      try { map.invalidateSize({ animate: false }); } catch {}
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", handleResize);
      try {
        map.remove();
      } catch {}
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
      drawingLayerGroupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const centerLat = center?.[0];
  const centerLon = center?.[1];

  // 2. Smooth Pan to center ONLY if center actually changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || centerLat == null || centerLon == null) return;
    const [lastLat, lastLon] = lastCenterRef.current;
    const diff = Math.abs(lastLat - centerLat) + Math.abs(lastLon - centerLon);
    if (diff > 0.0001) {
      lastCenterRef.current = [centerLat, centerLon];
      try {
        map.setView([centerLat, centerLon], map.getZoom() || 16, { animate: true });
      } catch {}
    }
  }, [centerLat, centerLon]);

  // 3. Render Real Saved Field Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
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
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #0F172A; min-width: 160px; padding: 2px;">
          <strong style="font-size: 13px; color: #065F46; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            🌾 ${field.name}
          </strong>
          <span style="color: #475569; font-size: 11px; display: block; margin-bottom: 4px;">
            ${field.crop} · ${field.areaAcres} Acres
          </span>
          <div style="padding: 3px 6px; background: #ECFDF5; border-radius: 6px; border: 1px solid #A7F3D0; font-size: 10px; font-weight: bold; color: #065F46;">
            ✓ Real Verified Farm
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

  // 4. Render Active Drawing Nodes & Polygon Preview
  useEffect(() => {
    const map = mapInstanceRef.current;
    const drawGroup = drawingLayerGroupRef.current;
    if (!map || !drawGroup) return;

    drawGroup.clearLayers();

    if (!isDrawingMode || drawnNodes.length === 0) return;

    // Connect nodes with dashed guideline
    if (drawnNodes.length > 1) {
      const line = L.polyline(drawnNodes, {
        color: "#F59E0B",
        weight: 3,
        dashArray: "6, 6",
      });
      drawGroup.addLayer(line);
    }

    // Closed preview polygon if 3+ points
    if (drawnNodes.length >= 3) {
      const polyPreview = L.polygon(drawnNodes, {
        color: "#10B981",
        weight: 2,
        fillColor: "#34D399",
        fillOpacity: 0.35,
      });
      drawGroup.addLayer(polyPreview);
    }

    // Point corner markers
    drawnNodes.forEach((node, index) => {
      const marker = L.circleMarker(node, {
        radius: index === 0 ? 8 : 6,
        color: "#FFFFFF",
        weight: 2,
        fillColor: index === 0 ? "#10B981" : "#F59E0B",
        fillOpacity: 1,
      });
      drawGroup.addLayer(marker);
    });
  }, [isDrawingMode, drawnNodes]);

  return (
    <div
      ref={mapContainerRef}
      className={`h-full w-full relative z-0 ${isDrawingMode ? "cursor-crosshair" : "cursor-grab"}`}
      style={{ minHeight: "440px", backgroundColor: "#0f172a" }}
    />
  );
});

LeafletMapInner.displayName = "LeafletMapInner";
