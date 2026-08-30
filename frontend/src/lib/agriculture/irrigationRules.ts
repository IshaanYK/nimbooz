/**
 * ASSARA Agricultural Irrigation Rules Engine
 * Computes soil root-zone moisture deficit, irrigation requirement (mm), and pump run-time hours.
 */

export interface IrrigationRecommendation {
  status: "ADEQUATE" | "NEEDS_IRRIGATION" | "CRITICAL_DEFICIT" | "WATERLOGGED";
  soilMoistureCurrentPct: number;
  optimalSoilMoisturePct: number;
  moistureDeficitPct: number;
  waterDepthRequiredMm: number;
  totalWaterVolumeLiters: number;
  recommendedPumpRuntimeHours: number; // For 5 HP standard tube-well pump (~30,000 L/hr)
  irrigationMethod: "Drip" | "Sprinkler" | "Flood" | "Rainfed";
  recommendationEn: string;
  recommendationHi: string;
}

export function calculateIrrigationRequirement(
  currentMoisturePct: number,
  fieldAreaAcres: number,
  cropName: string = "Soybean",
  irrigationMethod: "Drip" | "Sprinkler" | "Flood" | "Rainfed" = "Drip",
  pumpHp: number = 5
): IrrigationRecommendation {
  const optimalSoilMoisturePct = 70; // 70% of field capacity for standard Indian loam/black soils
  const deficitPct = Math.max(0, optimalSoilMoisturePct - currentMoisturePct);

  let status: "ADEQUATE" | "NEEDS_IRRIGATION" | "CRITICAL_DEFICIT" | "WATERLOGGED" = "ADEQUATE";
  if (currentMoisturePct > 90) {
    status = "WATERLOGGED";
  } else if (currentMoisturePct < 35) {
    status = "CRITICAL_DEFICIT";
  } else if (currentMoisturePct < 55) {
    status = "NEEDS_IRRIGATION";
  }

  // 1 mm water over 1 acre = 4,047 Liters
  // If moisture deficit is 20%, ~ 15-25 mm water needed
  const waterDepthRequiredMm = status === "ADEQUATE" || status === "WATERLOGGED"
    ? 0
    : Math.round((deficitPct / 100) * 45 * 10) / 10;

  // Efficiency factor: Drip = 90%, Sprinkler = 75%, Flood = 50%
  let efficiency = 0.90;
  if (irrigationMethod === "Sprinkler") efficiency = 0.75;
  if (irrigationMethod === "Flood") efficiency = 0.50;

  const rawLitersPerAcre = waterDepthRequiredMm * 4047;
  const effectiveLitersPerAcre = efficiency > 0 ? rawLitersPerAcre / efficiency : rawLitersPerAcre;
  const totalWaterVolumeLiters = Math.round(effectiveLitersPerAcre * Math.max(0.1, fieldAreaAcres));

  // Pump discharge capacity: 5 HP pump ~ 30,000 L/hr, 7.5 HP ~ 45,000 L/hr, 3 HP ~ 18,000 L/hr
  const dischargePerHour = pumpHp * 6000;
  const pumpHours = Math.round((totalWaterVolumeLiters / dischargePerHour) * 10) / 10;

  let recommendationEn = `Soil moisture is adequate (${currentMoisturePct}%). No irrigation required today.`;
  let recommendationHi = `मिट्टी में नमी पर्याप्त है (${currentMoisturePct}%)। आज सिंचाई की आवश्यकता नहीं है।`;

  if (status === "CRITICAL_DEFICIT") {
    recommendationEn = `Critical root-zone deficit (${currentMoisturePct}%). Irrigate ${waterDepthRequiredMm} mm (${pumpHours} hrs on ${pumpHp}HP pump via ${irrigationMethod}).`;
    recommendationHi = `मिट्टी में गंभीर नमी की कमी (${currentMoisturePct}%)। ${waterDepthRequiredMm} मिमी सिंचाई करें (${irrigationMethod} द्वारा ${pumpHours} घंटे)।`;
  } else if (status === "NEEDS_IRRIGATION") {
    recommendationEn = `Moisture falling below optimal. Apply light irrigation of ${waterDepthRequiredMm} mm (${pumpHours} hrs).`;
    recommendationHi = `नमी का स्तर कम हो रहा है। ${waterDepthRequiredMm} मिमी की हल्की सिंचाई करें (${pumpHours} घंटे)।`;
  } else if (status === "WATERLOGGED") {
    recommendationEn = `Soil is saturated/waterlogged (${currentMoisturePct}%). Ensure drainage furrows are clear.`;
    recommendationHi = `खेत में पानी अधिक भरा है (${currentMoisturePct}%)। जल निकासी की व्यवस्था सुनिश्चित करें।`;
  }

  return {
    status,
    soilMoistureCurrentPct: currentMoisturePct,
    optimalSoilMoisturePct,
    moistureDeficitPct: deficitPct,
    waterDepthRequiredMm,
    totalWaterVolumeLiters,
    recommendedPumpRuntimeHours: pumpHours,
    irrigationMethod,
    recommendationEn,
    recommendationHi,
  };
}
