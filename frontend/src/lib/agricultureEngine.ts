/**
 * AASRA Agriculture Engine — TypeScript
 * Deterministic stress formulas for Vercel-compatible serverless execution.
 * Ported from backend/app/services/agriculture/engine.py
 *
 * Formulas sourced from AASRA_TECHNICAL_RESEARCH.md (Syngenta Algorithm Document)
 */

import { resolveCropThresholds } from "@/lib/cropRegistry";

// ─────────────────────────────────────────────────────────
// Crop thresholds (T_opt = optimal, T_limit = critical)
// ─────────────────────────────────────────────────────────
export interface CropThresholds {
  name: string;
  t_opt_day: number;     // Optimal max daytime temp (°C)
  t_limit_day: number;   // Critical max daytime temp (°C)
  t_opt_night: number;   // Optimal min nighttime temp (°C)
  t_limit_night: number; // Critical min nighttime temp (°C)
  t_frost: number;       // Frost threshold (°C)
  t_base_gdd: number;    // Base temperature for GDD accumulation (°C)
}

export function getEffectiveCropThresholds(cropId: string): CropThresholds {
  const resolved = resolveCropThresholds(cropId);
  return {
    name: resolved.name,
    t_opt_day: resolved.t_opt_day,
    t_limit_day: resolved.t_limit_day,
    t_opt_night: resolved.t_opt_night,
    t_limit_night: resolved.t_limit_night,
    t_frost: resolved.t_frost,
    t_base_gdd: resolved.t_base_gdd,
  };
}

export const CROP_THRESHOLDS: Record<string, CropThresholds> = new Proxy({}, {
  get: (_, prop: string) => getEffectiveCropThresholds(prop),
});

// ─────────────────────────────────────────────────────────
// 4.1 — Daytime Heat Stress (0–9 scale)
// ─────────────────────────────────────────────────────────
export function calcDayHeatStress(
  tmax: number,
  cropId: string
): { score: number; interpretation: string } {
  const thresholds = getEffectiveCropThresholds(cropId);
  const { t_opt_day: tOpt, t_limit_day: tLimit, name } = thresholds;

  let score: number;
  if (tmax <= tOpt) {
    score = 0;
  } else if (tmax >= tLimit) {
    score = 9;
  } else {
    score = 9 * ((tmax - tOpt) / (tLimit - tOpt));
  }
  score = Math.round(score * 100) / 100;

  let interpretation: string;
  if (score <= 2) {
    interpretation = `Day temperature (${tmax.toFixed(1)}°C) is within optimal range for ${name}.`;
  } else if (score <= 5) {
    interpretation = `Moderate day heat stress for ${name}. Temp ${tmax.toFixed(1)}°C exceeds optimal ${tOpt}°C. Monitor crop.`;
  } else {
    interpretation = `HIGH day heat stress for ${name}! Temp ${tmax.toFixed(1)}°C nearing critical ${tLimit}°C. Syngenta Stress Buster recommended.`;
  }

  return { score, interpretation };
}

// ─────────────────────────────────────────────────────────
// 4.2 — Nighttime Heat Stress (0–9 scale)
// ─────────────────────────────────────────────────────────
export function calcNightHeatStress(
  tmin: number,
  cropId: string
): { score: number; interpretation: string } {
  const thresholds = CROP_THRESHOLDS[cropId.toLowerCase()] ?? CROP_THRESHOLDS.soybean;
  const { t_opt_night: tOpt, t_limit_night: tLimit, name } = thresholds;

  let score: number;
  if (tmin < tOpt) {
    score = 0;
  } else if (tmin >= tLimit) {
    score = 9;
  } else {
    score = 9 * ((tmin - tOpt) / (tLimit - tOpt));
  }
  score = Math.round(score * 100) / 100;

  let interpretation: string;
  if (score <= 2) {
    interpretation = `Night temperature (${tmin.toFixed(1)}°C) is within optimal range for ${name}.`;
  } else if (score <= 5) {
    interpretation = `Moderate night heat stress. Night temp ${tmin.toFixed(1)}°C exceeds ${tOpt}°C optimal for ${name}.`;
  } else {
    interpretation = `SEVERE night heat stress for ${name}! Night temp ${tmin.toFixed(1)}°C — high yield loss risk. Apply Stress Buster within 48h.`;
  }

  return { score, interpretation };
}

// ─────────────────────────────────────────────────────────
// 4.3 — Frost Stress (0–9 scale)
// ─────────────────────────────────────────────────────────
export function calcFrostStress(
  tmin: number,
  cropId: string
): { score: number; interpretation: string } {
  const thresholds = CROP_THRESHOLDS[cropId.toLowerCase()] ?? CROP_THRESHOLDS.soybean;
  const { t_frost: tFrost, name } = thresholds;

  let score = 0;
  if (tmin < tFrost) {
    score = Math.min(9, 9 * ((tFrost - tmin) / 10));
  }
  score = Math.round(score * 100) / 100;

  const interpretation =
    score === 0
      ? `No frost risk for ${name} (min temp ${tmin.toFixed(1)}°C above threshold).`
      : `Frost risk for ${name}! Min temp ${tmin.toFixed(1)}°C below ${tFrost}°C threshold. Cover crop or apply frost protection.`;

  return { score, interpretation };
}

// ─────────────────────────────────────────────────────────
// 4.3 — Drought Risk Index (DI)
// DI = (P - E) + SM/T  where P=cumul rainfall mm, E=ET mm,
//                       SM=avg soil moisture %, T=avg temp °C
// ─────────────────────────────────────────────────────────
export function calcDroughtIndex(
  cumulRainfallMm: number,
  cumulEtMm: number,
  avgSoilMoisturePct: number,
  avgTempC: number
): { index: number; interpretation: string } {
  // Prevent division by zero
  const t = avgTempC > 0 ? avgTempC : 1;
  const index = (cumulRainfallMm - cumulEtMm) + (avgSoilMoisturePct / t);
  const rounded = Math.round(index * 100) / 100;

  let interpretation: string;
  if (rounded >= 20) {
    interpretation = `Adequate moisture — no drought risk (DI=${rounded.toFixed(1)}).`;
  } else if (rounded >= 5) {
    interpretation = `Mild moisture deficit (DI=${rounded.toFixed(1)}). Monitor soil moisture.`;
  } else if (rounded >= 0) {
    interpretation = `Moderate drought stress (DI=${rounded.toFixed(1)}). Consider irrigation.`;
  } else {
    interpretation = `Severe drought stress (DI=${rounded.toFixed(1)})! Immediate irrigation required.`;
  }

  return { index: rounded, interpretation };
}

// ─────────────────────────────────────────────────────────
// 4.4 — Growing Degree Days (GDD) for a single day
// GDD = max(0, (T_max + T_min)/2 - T_base)
// ─────────────────────────────────────────────────────────
export function calcDailyGDD(tmax: number, tmin: number, cropId: string): number {
  const thresholds = CROP_THRESHOLDS[cropId.toLowerCase()] ?? CROP_THRESHOLDS.soybean;
  const tavg = (tmax + tmin) / 2;
  return Math.max(0, tavg - thresholds.t_base_gdd);
}

export function calcCumulativeGDD(
  records: Array<{ temperature_max: number; temperature_min: number }>,
  cropId: string
): number {
  return records.reduce((sum, r) => sum + calcDailyGDD(r.temperature_max, r.temperature_min, cropId), 0);
}

// ─────────────────────────────────────────────────────────
// Full Field Stress Assessment
// ─────────────────────────────────────────────────────────
export interface FieldStressResult {
  crop: string;
  stress_scores: {
    heat_day: { score: number; interpretation: string };
    heat_night: { score: number; interpretation: string };
    frost: { score: number; interpretation: string };
    drought: { index: number; interpretation: string };
  };
  cumulative_gdd: number;
  stress_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  night_heat_stress_active: boolean;
  primary_recommendation: string;
  is_demo: boolean;
}

export function assessFieldStress(
  cropId: string,
  tmax: number,
  tmin: number,
  cumulRainfallMm: number,
  cumulEtMm: number,
  avgSoilMoisturePct: number,
  avgTempC: number,
  records: Array<{ temperature_max: number; temperature_min: number }> = [],
  isDemo = false
): FieldStressResult {
  const heatDay = calcDayHeatStress(tmax, cropId);
  const heatNight = calcNightHeatStress(tmin, cropId);
  const frost = calcFrostStress(tmin, cropId);
  const drought = calcDroughtIndex(cumulRainfallMm, cumulEtMm, avgSoilMoisturePct, avgTempC);

  // Cumulative GDD
  const gddRecords =
    records.length > 0
      ? records
      : [{ temperature_max: tmax, temperature_min: tmin }];
  const cumGDD = Math.round(calcCumulativeGDD(gddRecords, cropId) * 10) / 10;

  // Overall stress level
  const maxScore = Math.max(heatDay.score, heatNight.score, frost.score);
  let stressLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  if (maxScore <= 2) stressLevel = "LOW";
  else if (maxScore <= 4) stressLevel = "MODERATE";
  else if (maxScore <= 7) stressLevel = "HIGH";
  else stressLevel = "CRITICAL";

  const nightActive = heatNight.score > 3;

  // Primary recommendation
  let rec = "";
  if (frost.score > 2) {
    rec = "Frost risk detected. Apply frost protection measures immediately.";
  } else if (heatNight.score >= 6) {
    rec = "Severe night heat stress. Apply Syngenta Stress Buster @ 250ml/acre within 48 hours.";
  } else if (heatNight.score >= 3) {
    rec = "Moderate night heat stress detected. Consider Syngenta Stress Buster application.";
  } else if (heatDay.score >= 6) {
    rec = "High daytime heat stress. Ensure adequate irrigation and consider biostimulant protection.";
  } else if (drought.index < 5) {
    rec = "Drought stress detected. Irrigate immediately. Consider Syngenta Nutrient Booster to improve nutrient uptake efficiency.";
  } else {
    rec = "Field conditions are within acceptable range. Continue monitoring.";
  }

  return {
    crop: cropId,
    stress_scores: {
      heat_day: heatDay,
      heat_night: heatNight,
      frost,
      drought,
    },
    cumulative_gdd: cumGDD,
    stress_level: stressLevel,
    night_heat_stress_active: nightActive,
    primary_recommendation: rec,
    is_demo: isDemo,
  };
}

// ─────────────────────────────────────────────────────────
// ROBI Calculation (PS-07)
// ROBI = (Yield_gain × Price) / (Product_cost + Application_cost)
// ─────────────────────────────────────────────────────────
export interface ROBIResult {
  yield_gain_kg_per_ha: number;
  gross_revenue_per_ha: number;
  total_cost_per_ha: number;
  net_profit_per_ha: number;
  robi_ratio: number;
  robi_percent: number;
  category: "Poor" | "Moderate" | "Good" | "Excellent";
}

export function calcROBI(
  yieldTreated: number,
  yieldControl: number,
  pricePerKg: number,
  productCostPerHa: number,
  applicationCostPerHa: number,
  fieldAreaHa: number
): ROBIResult {
  const yieldGain = yieldTreated - yieldControl;
  const gross = yieldGain * pricePerKg;
  const totalCost = productCostPerHa + applicationCostPerHa;
  const netProfit = gross - totalCost;
  const ratio = totalCost > 0 ? gross / totalCost : 0;
  const pct = totalCost > 0 ? ((gross - totalCost) / totalCost) * 100 : 0;

  let category: ROBIResult["category"] = "Poor";
  if (ratio >= 5) category = "Excellent";
  else if (ratio >= 3) category = "Good";
  else if (ratio >= 1.5) category = "Moderate";

  return {
    yield_gain_kg_per_ha: Math.round(yieldGain * 10) / 10,
    gross_revenue_per_ha: Math.round(gross),
    total_cost_per_ha: Math.round(totalCost),
    net_profit_per_ha: Math.round(netProfit),
    robi_ratio: Math.round(ratio * 100) / 100,
    robi_percent: Math.round(pct),
    category,
  };
}

// ─────────────────────────────────────────────────────────
// Supported crops list
// ─────────────────────────────────────────────────────────
export const SUPPORTED_CROPS = Object.keys(CROP_THRESHOLDS);

export function isCropSupported(cropId: string): boolean {
  return SUPPORTED_CROPS.includes(cropId.toLowerCase());
}
