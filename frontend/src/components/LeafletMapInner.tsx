"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { FieldRecord } from "@/lib/fieldStore";

interface LeafletMapInnerProps {
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
}: LeafletMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const fieldsGroupRef = useRef<L.LayerGroup | null>(null);
  const drawingGroupRef = useRef<L.LayerGroup | null>(null);

  // Store latest callbacks to prevent stale closures
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  const onSelectFieldRef = useRef(onSelectField);
  onSelectFieldRef.current = onSelectField;

  // 1. Initialize Map Once
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    // Clean any prior Leaflet container ID
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
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    mapInstanceRef.current = map;

    // Zoom Controls at Bottom Right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Initialize Layer Groups
    tileLayerGroupRef.current = L.layerGroup().addTo(map);
    fieldsGroupRef.current = L.layerGroup().addTo(map);
    drawingGroupRef.current = L.layerGroup().addTo(map);

    // Map Click Handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onMapClickRef.current) {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    // ResizeObserver ensures map never goes blank when layout changes
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ animate: false });
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    // Initial size invalidations
    setTimeout(() => map.invalidateSize({ animate: false }), 50);
    setTimeout(() => map.invalidateSize({ animate: false }), 250);
    setTimeout(() => map.invalidateSize({ animate: false }), 600);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Base Map Tile Layers (ESRI Satellite + OpenStreetMap + Google)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = tileLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (mapType === "satellite") {
      // 100% Reliable high-res ESRI World Imagery
      const esriSatellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Esri, Maxar, Earthstar Geographics",
        }
      );
      // Optional subtle boundaries overlay
      const esriLabels = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
        }
      );
      group.addLayer(esriSatellite);
      group.addLayer(esriLabels);
    } else if (mapType === "terrain") {
      const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: "OpenTopoMap",
      });
      group.addLayer(topo);
    } else {
      // OpenStreetMap Standard
      const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "OpenStreetMap",
      });
      group.addLayer(osm);
    }
  }, [mapType]);

  // 3. Pan to Center
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const safeLat = center?.[0] && !isNaN(center[0]) ? center[0] : 23.2599;
    const safeLon = center?.[1] && !isNaN(center[1]) ? center[1] : 77.4126;

    map.setView([safeLat, safeLon], map.getZoom(), { animate: true });
    map.invalidateSize({ animate: false });
  }, [center]);

  // 4. Invalidate Size on Drawing Mode Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const t1 = setTimeout(() => {
      try {
        map.invalidateSize({ animate: false });
      } catch (_) {}
    }, 50);
    const t2 = setTimeout(() => {
      try {
        map.invalidateSize({ animate: false });
      } catch (_) {}
    }, 200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isDrawing]);

  // 5. Render Saved Farm Fields
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = fieldsGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    fields.forEach((field) => {
      if (!field.polygon || field.polygon.length < 3) return;
      const isActive = field.id === activeFieldId;

      const polygon = L.polygon(field.polygon, {
        color: isActive ? "#10B981" : "#38BDF8",
        weight: isActive ? 3 : 2,
        fillColor: isActive ? "#10B981" : "#0284C7",
        fillOpacity: isActive ? 0.35 : 0.2,
      });

      polygon.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; min-width: 160px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #065F46;">
            🌾 ${field.name}
          </h4>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #475569;">
            ${field.crop} · <strong>${field.areaAcres} Acres</strong>
          </p>
          <span style="font-size: 11px; background: #ECFDF5; color: #065F46; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
            ✓ Measured Geodesic Area
          </span>
        </div>
      `);

      polygon.on("click", () => {
        if (onSelectFieldRef.current) {
          onSelectFieldRef.current(field);
        }
      });

      group.addLayer(polygon);

      // Centroid Marker
      const marker = L.circleMarker(field.center, {
        radius: isActive ? 8 : 5,
        color: "#FFFFFF",
        weight: 2,
        fillColor: isActive ? "#10B981" : "#38BDF8",
        fillOpacity: 1,
      });
      group.addLayer(marker);
    });
  }, [fields, activeFieldId]);

  // 6. Render Active Drawing Points & Guide Line
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = drawingGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (!isDrawing || drawnPoints.length === 0) return;

    // Connecting dashed line
    if (drawnPoints.length > 1) {
      const line = L.polyline(drawnPoints, {
        color: "#F59E0B",
        weight: 3,
        dashArray: "6, 6",
      });
      group.addLayer(line);
    }

    // Polygon preview fill if 3+ points
    if (drawnPoints.length >= 3) {
      const fillPreview = L.polygon(drawnPoints, {
        color: "#10B981",
        weight: 2,
        fillColor: "#34D399",
        fillOpacity: 0.35,
      });
      group.addLayer(fillPreview);
    }

    // Corner vertex points
    drawnPoints.forEach((point, idx) => {
      const isStart = idx === 0;
      const marker = L.circleMarker(point, {
        radius: isStart ? 9 : 6,
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
      className={`w-full h-full min-h-[480px] relative z-0 ${isDrawing ? "cursor-crosshair" : "cursor-grab"}`}
      style={{ width: "100%", height: "100%", minHeight: "480px" }}
    />
  );
}
