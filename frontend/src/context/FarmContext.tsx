"use client";

/**
 * Nimbooz Centralized Single Source of Truth — Farm & Crop Context
 * Ensures ALL pages (Dashboard, Map, AI Studio, CropFit, ROI, Predictions, Simulator, Diary)
 * consume and reflect the EXACT same active farm, field, location, and crop state.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { calculatePolygonArea, calculatePolygonCentroid } from "@/lib/calculations/geospatial";
import { SoilTestValues } from "@/lib/calculations/fertilizerCalc";
import { useWeather } from "./WeatherContext";
import { getStoredProfile, saveProfile } from "@/lib/userStore";

export interface FieldRecord {
  id: string;
  farmId: string;
  name: string;
  crop: string;
  cropVariety: string;
  areaAcres: number;
  areaHa: number;
  areaM2: number;
  center: [number, number];
  polygon: Array<[number, number]>;
  sowingDate: string;
  growthStage: string;
  soilType: string;
  irrigationType: string;
  color: string;
  healthScore?: number;
  isCustomCrop?: boolean;
}

export interface FarmRecord {
  id: string;
  name: string;
  district: string;
  state: string;
  village?: string;
  country?: string;
  center: [number, number];
  polygon: Array<[number, number]>;
  areaAcres: number;
  areaHa: number;
  areaM2: number;
  primaryCrop: string;
  cropVariety: string;
  sowingDate: string;
  growthStage: string;
  soilType: string;
  irrigationType: string;
  soilTest?: SoilTestValues | null;
  fields?: FieldRecord[];
  color?: string;
  healthScore?: number;
  isDemoFarm?: boolean;
}

export interface InterventionRecord {
  id: string;
  farmId: string;
  fieldId?: string;
  date: string;
  actionType: "spray" | "fertilizer" | "irrigation" | "scouting" | "harvest";
  productName: string;
  dosage: string;
  quantityPerAcre: number;
  totalCostRs: number;
  cropStage: string;
  reason: string;
  notes?: string;
  timestamp: string;
}

interface FarmContextType {
  farms: FarmRecord[];
  activeFarm: FarmRecord;
  activeField: FieldRecord;
  interventions: InterventionRecord[];
  isLoading: boolean;
  selectFarm: (farmId: string) => void;
  selectField: (fieldId: string) => void;
  createFarm: (farm: Partial<FarmRecord>) => FarmRecord;
  updateActiveFarm: (updates: Partial<FarmRecord>) => void;
  deleteFarm: (farmId: string) => void;
  updateFarmPolygon: (polygon: Array<[number, number]>) => void;
  saveSoilReport: (soilTest: SoilTestValues) => void;
  addIntervention: (entry: Omit<InterventionRecord, "id" | "timestamp">) => void;
  logIntervention: (entry: any) => void;
}

const STORAGE_KEY_FARMS = "nimbooz_farms_v5";
const STORAGE_KEY_ACTIVE_FARM_ID = "nimbooz_active_farm_id_v5";
const STORAGE_KEY_INTERVENTIONS = "nimbooz_interventions_v5";

export function createDefaultFarm(profile?: any): FarmRecord {
  const p = profile || getStoredProfile();
  const lat = p.gpsLocation?.lat || 23.2599;
  const lon = p.gpsLocation?.lon || 77.4126;
  const offset = 0.0015;
  const poly: Array<[number, number]> = [
    [lat + offset, lon - offset],
    [lat + offset, lon + offset],
    [lat - offset, lon + offset],
    [lat - offset, lon - offset],
  ];
  const area = calculatePolygonArea(poly);

  return {
    id: "farm_primary_main",
    name: p.fieldName || `${p.fullName ? p.fullName + "'s " : "My "}Main Farm`,
    district: p.district || "Bhopal",
    state: p.state || "Madhya Pradesh",
    village: p.village || "Local Village",
    country: "India",
    center: [lat, lon],
    polygon: poly,
    areaAcres: p.fieldAreaAcres || area.acres || 5.0,
    areaHa: p.fieldAreaHa || area.hectares || 2.0,
    areaM2: area.squareMeters || 20234,
    primaryCrop: p.primaryCrop || "Soybean",
    cropVariety: p.cropVariety || "JS-335 (Certified)",
    sowingDate: p.sowingDate || "2026-06-15",
    growthStage: "R2 Flowering Stage",
    soilType: p.soilType || "Black Cotton Vertisol",
    irrigationType: p.irrigationType || "Rainfed + Borewell",
    color: "#10B981",
    healthScore: 92,
    soilTest: null,
  };
}

function createFieldFromFarm(farm: FarmRecord): FieldRecord {
  return {
    id: `field_${farm.id}_1`,
    farmId: farm.id,
    name: `${farm.name} - Plot 1`,
    crop: farm.primaryCrop,
    cropVariety: farm.cropVariety,
    areaAcres: farm.areaAcres,
    areaHa: farm.areaHa,
    areaM2: farm.areaM2,
    center: farm.center,
    polygon: farm.polygon,
    sowingDate: farm.sowingDate,
    growthStage: farm.growthStage,
    soilType: farm.soilType,
    irrigationType: farm.irrigationType,
    color: farm.color || "#10B981",
    healthScore: farm.healthScore || 90,
  };
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setCustomCoordinates } = useWeather();
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [activeFarmId, setActiveFarmId] = useState<string>("");
  const [interventions, setInterventions] = useState<InterventionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from LocalStorage on mount
  useEffect(() => {
    try {
      const storedFarms = localStorage.getItem(STORAGE_KEY_FARMS);
      const storedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_FARM_ID);
      const storedInterventions = localStorage.getItem(STORAGE_KEY_INTERVENTIONS);

      let parsedFarms: FarmRecord[] = [];
      if (storedFarms) {
        try {
          parsedFarms = JSON.parse(storedFarms);
        } catch (_) {}
      }

      if (!parsedFarms || parsedFarms.length === 0) {
        const initial = createDefaultFarm();
        parsedFarms = [initial];
        localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(parsedFarms));
      }

      let activeId = storedActiveId || parsedFarms[0]?.id || "";
      if (!parsedFarms.some((f) => f.id === activeId)) {
        activeId = parsedFarms[0]?.id || "";
      }

      setFarms(parsedFarms);
      setActiveFarmId(activeId);

      if (storedInterventions) {
        try {
          setInterventions(JSON.parse(storedInterventions));
        } catch (_) {}
      }
    } catch (e) {
      console.error("[FarmContext] Initialization error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0] || createDefaultFarm();
  const activeField = activeFarm.fields?.[0] || createFieldFromFarm(activeFarm);

  // Sync GPS Coordinates with WeatherContext whenever active farm changes
  const selectFarm = useCallback(
    (farmId: string) => {
      const target = farms.find((f) => f.id === farmId);
      if (target) {
        setActiveFarmId(farmId);
        try {
          localStorage.setItem(STORAGE_KEY_ACTIVE_FARM_ID, farmId);
        } catch (_) {}

        // Update WeatherContext GPS and telemetry immediately
        if (setCustomCoordinates && target.center) {
          setCustomCoordinates(target.center[0], target.center[1], target.name);
        }

        // Update profile store for legacy compatibility
        const p = getStoredProfile();
        saveProfile({
          ...p,
          fieldName: target.name,
          district: target.district,
          state: target.state,
          village: target.village || p.village,
          primaryCrop: target.primaryCrop,
          cropVariety: target.cropVariety,
          fieldAreaAcres: target.areaAcres,
          fieldAreaHa: target.areaHa,
          gpsLocation: { lat: target.center[0], lon: target.center[1] },
        });
      }
    },
    [farms, setCustomCoordinates]
  );

  const selectField = useCallback(
    (fieldId: string) => {
      console.log(`[FarmContext] Selected field ${fieldId}`);
    },
    []
  );

  const createFarm = useCallback(
    (data: Partial<FarmRecord>): FarmRecord => {
      const lat = data.center?.[0] || 23.2599;
      const lon = data.center?.[1] || 77.4126;
      const poly: Array<[number, number]> = (data.polygon && data.polygon.length >= 3)
        ? (data.polygon as Array<[number, number]>)
        : [
            [lat + 0.0015, lon - 0.0015],
            [lat + 0.0015, lon + 0.0015],
            [lat - 0.0015, lon + 0.0015],
            [lat - 0.0015, lon - 0.0015],
          ];
      const area = calculatePolygonArea(poly);

      const newFarm: FarmRecord = {
        id: `farm_${Date.now()}`,
        name: data.name || `Farm #${farms.length + 1}`,
        district: data.district || "Your District",
        state: data.state || "Your State",
        village: data.village || "Local Village",
        country: data.country || "India",
        center: [lat, lon],
        polygon: poly,
        areaAcres: area.acres || data.areaAcres || 5.0,
        areaHa: area.hectares || data.areaHa || 2.0,
        areaM2: area.squareMeters || 20234,
        primaryCrop: data.primaryCrop || "Soybean",
        cropVariety: data.cropVariety || "Standard Farm Variety",
        sowingDate: data.sowingDate || new Date().toISOString().split("T")[0],
        growthStage: data.growthStage || "Vegetative Stage",
        soilType: data.soilType || "Black Cotton Soil",
        irrigationType: data.irrigationType || "Rainfed + Borewell",
        color: data.color || "#10B981",
        healthScore: 92,
        soilTest: null,
      };

      const updated = [newFarm, ...farms];
      setFarms(updated);
      setActiveFarmId(newFarm.id);
      try {
        localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEY_ACTIVE_FARM_ID, newFarm.id);
      } catch (_) {}

      if (setCustomCoordinates) {
        setCustomCoordinates(lat, lon, newFarm.name);
      }

      return newFarm;
    },
    [farms, setCustomCoordinates]
  );

  const updateActiveFarm = useCallback(
    (updates: Partial<FarmRecord>) => {
      setFarms((prev) => {
        const next = prev.map((f) => {
          if (f.id === activeFarmId) {
            return { ...f, ...updates };
          }
          return f;
        });
        try {
          localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(next));
        } catch (_) {}
        return next;
      });
    },
    [activeFarmId]
  );

  const updateFarmPolygon = useCallback(
    (polygon: Array<[number, number]>) => {
      if (!polygon || polygon.length < 3) return;
      const area = calculatePolygonArea(polygon);
      const centroid = calculatePolygonCentroid(polygon);
      updateActiveFarm({
        polygon,
        center: centroid,
        areaAcres: area.acres,
        areaHa: area.hectares,
        areaM2: area.squareMeters,
      });

      if (setCustomCoordinates) {
        setCustomCoordinates(centroid[0], centroid[1]);
      }
    },
    [updateActiveFarm, setCustomCoordinates]
  );

  const deleteFarm = useCallback(
    (farmId: string) => {
      if (farms.length <= 1) {
        alert("You must retain at least one registered farm.");
        return;
      }
      const updated = farms.filter((f) => f.id !== farmId);
      setFarms(updated);
      const nextActive = updated[0]?.id || "";
      setActiveFarmId(nextActive);
      try {
        localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEY_ACTIVE_FARM_ID, nextActive);
      } catch (_) {}
    },
    [farms]
  );

  const saveSoilReport = useCallback(
    (soilTest: SoilTestValues) => {
      updateActiveFarm({ soilTest });
    },
    [updateActiveFarm]
  );

  const addIntervention = useCallback(
    (entry: Omit<InterventionRecord, "id" | "timestamp">) => {
      const record: InterventionRecord = {
        ...entry,
        id: `interv_${Date.now()}`,
        farmId: activeFarmId,
        timestamp: new Date().toISOString(),
      };
      setInterventions((prev) => {
        const next = [record, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY_INTERVENTIONS, JSON.stringify(next));
        } catch (_) {}
        return next;
      });
    },
    [activeFarmId]
  );

  const logIntervention = useCallback(
    (entry: any) => {
      addIntervention({
        farmId: entry.farmId || activeFarmId,
        date: entry.date || new Date().toISOString().split("T")[0],
        actionType: entry.type || "spray",
        productName: entry.product || "Syngenta Quantis",
        dosage: entry.dosePerAcre || "250 ml/acre",
        quantityPerAcre: entry.quantityPerAcre || 0.25,
        totalCostRs: entry.costINR || 600,
        cropStage: entry.stage || "Flowering Stage",
        reason: entry.targetPestOrStress || entry.reason || "Heat stress mitigation",
        notes: entry.notes || "",
      });
    },
    [addIntervention, activeFarmId]
  );

  return (
    <FarmContext.Provider
      value={{
        farms,
        activeFarm,
        activeField,
        interventions,
        isLoading,
        selectFarm,
        selectField,
        createFarm,
        updateActiveFarm,
        deleteFarm,
        updateFarmPolygon,
        saveSoilReport,
        addIntervention,
        logIntervention,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const ctx = useContext(FarmContext);
  if (!ctx) {
    throw new Error("useFarm must be used within a FarmProvider");
  }
  return ctx;
};
