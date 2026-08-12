"use client";

/**
 * AASRA PS-07 Intervention & Outcome Tracking Store
 * Logs field treatment applications (date, product, dosage, cost, weather baseline, stress pre/post).
 */

export interface InterventionRecord {
  id: string;
  fieldId: string;
  fieldName: string;
  date: string;
  productName: string;      // e.g. "Syngenta Stress Buster", "Nutrient Booster"
  dosage: string;           // e.g. "500 ml/ha"
  costRupees: number;
  preStressScore: number;   // 0-100% pre-treatment stress rating
  postYieldGainQAc: number; // +q/acre estimated or measured gain
  weatherSnapshot: {
    temp: number;
    humidity: number;
    description: string;
  };
  status: "LOGGED" | "VERIFIED" | "COMPLETED";
}

export const DEFAULT_INTERVENTIONS: InterventionRecord[] = [
  {
    id: "interv_001",
    fieldId: "field_b_soybean",
    fieldName: "Bhopal Soybean Field",
    date: "2026-08-10",
    productName: "Syngenta Stress Buster",
    dosage: "500 ml/ha",
    costRupees: 600,
    preStressScore: 82,
    postYieldGainQAc: 0.60,
    weatherSnapshot: { temp: 34.8, humidity: 72, description: "Partly Cloudy (Night Heat Risk)" },
    status: "VERIFIED",
  },
  {
    id: "interv_002",
    fieldId: "field_a_rice",
    fieldName: "Field A - Rice Plot",
    date: "2026-08-04",
    productName: "Syngenta Nutrient Booster",
    dosage: "750 ml/ha",
    costRupees: 850,
    preStressScore: 45,
    postYieldGainQAc: 0.85,
    weatherSnapshot: { temp: 29.5, humidity: 85, description: "Moderate Rain" },
    status: "VERIFIED",
  },
];

const STORAGE_KEY_INTERVENTIONS = "aasra_farmer_interventions";

export function getSavedInterventions(): InterventionRecord[] {
  if (typeof window === "undefined") return DEFAULT_INTERVENTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INTERVENTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error reading interventions:", e);
  }
  return DEFAULT_INTERVENTIONS;
}

export function logNewIntervention(record: InterventionRecord): InterventionRecord[] {
  const current = getSavedInterventions();
  const updated = [record, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_INTERVENTIONS, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving intervention:", e);
  }
  return updated;
}
