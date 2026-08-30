/**
 * ASSARA Agricultural Spray Rules Engine
 * Evaluates exact chemical & biostimulant spraying suitability windows based on real weather telemetry.
 */

export interface SprayVerdictResult {
  isSuitable: boolean;
  verdict: "OPTIMAL" | "MARGINAL" | "UNSUITABLE";
  score: number; // 0 to 100
  titleEn: string;
  titleHi: string;
  bestTimeWindow: string;
  bestTimeWindowHi: string;
  primaryReasonEn: string;
  primaryReasonHi: string;
  reasons: string[];
  recommendedProduct: string;
  dosagePerAcre: string;
  waterVolumePerAcreLiters: number;
}

export function evaluateSpraySuitability(
  temperature: number,
  windSpeed: number,
  humidity: number,
  rainProbability: number,
  cropName: string = "Soybean"
): SprayVerdictResult {
  const reasons: string[] = [];
  let score = 100;

  // 1. Wind Speed Assessment (Optimal: 4-12 km/h, Marginal: 12-15 km/h, Unsuitable: >15 km/h)
  if (windSpeed > 15) {
    score -= 40;
    reasons.push(`High wind speed (${windSpeed} km/h > 15 km/h threshold) causes excessive droplet drift`);
  } else if (windSpeed > 11) {
    score -= 15;
    reasons.push(`Moderate breeze (${windSpeed} km/h) requires coarse droplet nozzles`);
  } else if (windSpeed < 2 && temperature > 28) {
    score -= 20;
    reasons.push(`Dead calm winds (< 2 km/h) with heat indicate atmospheric inversion risk`);
  }

  // 2. Rain Probability & Wash-off Risk (Optimal: < 20%, Marginal: 20-35%, Unsuitable: > 35%)
  if (rainProbability > 35) {
    score -= 50;
    reasons.push(`Rain probability is ${rainProbability}% — high risk of product wash-off within 4-6 hour rainfast window`);
  } else if (rainProbability > 20) {
    score -= 20;
    reasons.push(`Precipitation risk (${rainProbability}%) suggests adding a silicon-based non-ionic sticker/spreader`);
  }

  // 3. Air Temperature & Thermal Evaporation (Optimal: 18-29°C, Marginal: 30-34°C, Unsuitable: > 34°C)
  if (temperature > 34) {
    score -= 40;
    reasons.push(`High air temperature (${temperature}°C) causes premature droplet evaporation and leaf scorch`);
  } else if (temperature > 30) {
    score -= 15;
    reasons.push(`Warm afternoon temperature (${temperature}°C) — schedule for evening window`);
  }

  // 4. Relative Humidity (Optimal: 50-80%, Low: < 35%)
  if (humidity < 35) {
    score -= 25;
    reasons.push(`Low relative humidity (${humidity}%) accelerates droplet crystallization before leaf uptake`);
  }

  score = Math.max(0, Math.min(100, score));

  const verdict: "OPTIMAL" | "MARGINAL" | "UNSUITABLE" =
    score >= 70 ? "OPTIMAL" : score >= 45 ? "MARGINAL" : "UNSUITABLE";

  const isSuitable = verdict !== "UNSUITABLE";

  let titleEn = "Spray Window Open";
  let titleHi = "छिड़काव के लिए अनुकूल समय";
  let bestTimeWindow = "4:30 PM – 6:45 PM (Cool Evening)";
  let bestTimeWindowHi = "शाम 4:30 से 6:45 बजे (ठंडा समय)";
  let primaryReasonEn = "Favorable wind speed and low rain probability provide excellent absorption.";
  let primaryReasonHi = "अनुकूल हवा की गति और कम बारिश की संभावना बेहतर अवशोषण प्रदान करती है।";

  if (verdict === "UNSUITABLE") {
    titleEn = "Do NOT Spray Today";
    titleHi = "आज छिड़काव न करें";
    bestTimeWindow = "Postpone to tomorrow morning 6:30 AM";
    bestTimeWindowHi = "कल सुबह 6:30 बजे तक स्थगित करें";
    primaryReasonEn = reasons[0] || "Unfavorable atmospheric conditions present high chemical loss risk.";
    primaryReasonHi = "प्रतिकूल मौसमी परिस्थितियों के कारण दवा के नुकसान का भारी जोखिम है।";
  } else if (verdict === "MARGINAL") {
    titleEn = "Marginal Spray Window";
    titleHi = "सावधानीपूर्वक छिड़काव करें";
    bestTimeWindow = "Strictly 5:00 PM – 6:30 PM";
    bestTimeWindowHi = "शाम 5:00 से 6:30 बजे के बीच";
    primaryReasonEn = "Acceptable conditions only during cool evening hours with low drift.";
    primaryReasonHi = "केवल शाम के ठंडे समय में कम हवा के दौरान ही छिड़काव संभव है।";
  }

  // Determine crop-specific biostimulant or protection recommendation
  const cleanCrop = cropName.toLowerCase();
  let recommendedProduct = "Syngenta Quantis / Isabion (Amino Acid Biostimulant)";
  let dosagePerAcre = "250 – 300 ml / acre";

  if (cleanCrop.includes("cotton") || cleanCrop.includes("कपास")) {
    recommendedProduct = "Planofix (NAA) + Potassium Nitrate (13:0:45)";
    dosagePerAcre = "100 ml + 1.0 kg / acre";
  } else if (cleanCrop.includes("wheat") || cleanCrop.includes("गेहूं")) {
    recommendedProduct = "0:0:50 SOP (Soluble Potash) + Boron 20%";
    dosagePerAcre = "1.0 kg + 100g / acre";
  } else if (cleanCrop.includes("tomato") || cleanCrop.includes("टमाटर")) {
    recommendedProduct = "Calcium Nitrate + Boron Micronutrient";
    dosagePerAcre = "500g + 100g / acre";
  }

  return {
    isSuitable,
    verdict,
    score,
    titleEn,
    titleHi,
    bestTimeWindow,
    bestTimeWindowHi,
    primaryReasonEn,
    primaryReasonHi,
    reasons: reasons.length > 0 ? reasons : ["All atmospheric parameters (wind, temp, humidity, rain) are optimal."],
    recommendedProduct,
    dosagePerAcre,
    waterVolumePerAcreLiters: 150,
  };
}
