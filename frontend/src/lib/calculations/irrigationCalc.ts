/**
 * Centralized Agricultural Irrigation & Soil Water Balance Engine
 * Evaluates volumetric root-zone moisture deficit, evapotranspiration loss, and incoming rain probability.
 */

export interface IrrigationInput {
  cropName: string;
  acres: number;
  currentSoilMoisturePercent: number; // e.g. 35%
  maxDayTemp: number; // °C
  rainForecastMm72h: number; // mm expected
  soilType?: string; // "Black Cotton", "Alluvial Loam", "Sandy Loam", "Red Soil"
  irrigationSystem?: "Drip" | "Sprinkler" | "Flood / Furrow";
}

export type IrrigationUrgency = "NONE" | "LOW" | "MODERATE" | "CRITICAL";

export interface IrrigationPlan {
  urgency: IrrigationUrgency;
  actionTitle: string;
  actionTitleHi: string;
  waterMmRequired: number;
  totalLitersForFarm: number;
  litersPerAcre: number;
  operatingHoursDrip: number;
  operatingHoursFlood: number;
  reason: string;
  reasonHi: string;
  weatherImpact: string;
  weatherImpactHi: string;
  nextCheckHours: number;
}

/**
 * Calculates deterministic irrigation schedule based on soil moisture and rain forecast.
 */
export function calculateIrrigationPlan(input: IrrigationInput): IrrigationPlan {
  const moisture = Math.max(0, Math.min(100, input.currentSoilMoisturePercent || 40));
  const acres = Math.max(0.1, input.acres || 1);
  const rain72h = Math.max(0, input.rainForecastMm72h || 0);

  // Field Capacity: ~45-50% for Black Cotton, ~35-40% for Loam
  const targetMoisture = 55;
  const deficitPercent = Math.max(0, targetMoisture - moisture);

  // 1 mm water over 1 acre = 4,046.86 liters (~4,050 L)
  // Approximate conversion: 10% moisture deficit in top 30cm root zone ≈ 15 mm water
  let mmRequired = Math.round((deficitPercent / 10) * 12);

  // If significant rain is forecasted (>15mm), suspend or reduce irrigation
  if (rain72h >= 15) {
    mmRequired = 0;
    return {
      urgency: "NONE",
      actionTitle: "🌧️ SKIP IRRIGATION — RAIN FORECASTED",
      actionTitleHi: "🌧️ सिंचाई रोकें — बारिश का पूर्वानुमान",
      waterMmRequired: 0,
      totalLitersForFarm: 0,
      litersPerAcre: 0,
      operatingHoursDrip: 0,
      operatingHoursFlood: 0,
      reason: `Natural precipitation of ~${rain72h} mm is expected within 72 hours. Soil moisture is sufficient to bridge.`,
      reasonHi: `अगले 72 घंटों में लगभग ${rain72h} मिमी बारिश की संभावना है। मिट्टी की नमी पर्याप्त है।`,
      weatherImpact: "Rainfall will naturally recharge root zone; avoid root waterlogging and energy costs.",
      weatherImpactHi: "बारिश से जड़ क्षेत्र में पर्याप्त पानी मिलेगा; अतिरिक्त पानी से फसल को बचाएं।",
      nextCheckHours: 24,
    };
  }

  // Normal irrigation requirement
  const litersPerAcre = Math.round(mmRequired * 4047);
  const totalLiters = Math.round(litersPerAcre * acres);
  const dripHours = Math.round((mmRequired / 4.0) * 10) / 10; // Standard 4mm/hr drip discharge
  const floodHours = Math.round((mmRequired / 8.0) * 10) / 10;

  if (moisture < 30) {
    return {
      urgency: "CRITICAL",
      actionTitle: "🚨 IMMEDIATE IRRIGATION REQUIRED",
      actionTitleHi: "🚨 तुरंत सिंचाई की आवश्यकता है",
      waterMmRequired: mmRequired,
      totalLitersForFarm: totalLiters,
      litersPerAcre,
      operatingHoursDrip: dripHours,
      operatingHoursFlood: floodHours,
      reason: `Soil moisture (${moisture}%) is near permanent wilting point. Root xylem tension is critical.`,
      reasonHi: `मिट्टी की नमी (${moisture}%) अत्यधिक कम हो चुकी है। पौधों को तुरंत पानी दें।`,
      weatherImpact: `High temperatures (${input.maxDayTemp}°C) will accelerate moisture depletion.`,
      weatherImpactHi: `उच्च तापमान (${input.maxDayTemp}°C) से नमी तेजी से खत्म होगी।`,
      nextCheckHours: 12,
    };
  }

  if (moisture < 45) {
    return {
      urgency: "MODERATE",
      actionTitle: "💧 SCHEDULE IRRIGATION WITHIN 48 HOURS",
      actionTitleHi: "💧 अगले 48 घंटों में सिंचाई करें",
      waterMmRequired: mmRequired,
      totalLitersForFarm: totalLiters,
      litersPerAcre,
      operatingHoursDrip: dripHours,
      operatingHoursFlood: floodHours,
      reason: `Soil moisture (${moisture}%) is dropping below optimal vegetative threshold.`,
      reasonHi: `मिट्टी में नमी (${moisture}%) कम हो रही है। समय रहते सिंचाई करें।`,
      weatherImpact: "No heavy rain expected; controlled watering prevents floral drop.",
      weatherImpactHi: "बारिश की संभावना नहीं है; हल्का पानी देने से फूल नहीं गिरेंगे।",
      nextCheckHours: 24,
    };
  }

  return {
    urgency: "LOW",
    actionTitle: "✅ SOIL MOISTURE OPTIMAL",
    actionTitleHi: "✅ मिट्टी में नमी पर्याप्त है",
    waterMmRequired: 0,
    totalLitersForFarm: 0,
    litersPerAcre: 0,
    operatingHoursDrip: 0,
    operatingHoursFlood: 0,
    reason: `Current moisture level (${moisture}%) provides full plant turgor pressure.`,
    reasonHi: `वर्तमान नमी (${moisture}%) पौधों की बढ़वार के लिए पूरी तरह अनुकूल है।`,
    weatherImpact: "Evapotranspiration is stable.",
    weatherImpactHi: "वाष्पीकरण दर सामान्य है।",
    nextCheckHours: 48,
  };
}
