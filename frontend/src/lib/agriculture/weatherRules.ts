/**
 * ASSARA Agricultural Weather Rules
 * Pure deterministic biophysical formulas for thermal stress, rain risk, and evaporation.
 */

export interface WeatherRiskAssessment {
  thermalStressLevel: "NONE" | "MODERATE" | "SEVERE";
  heatStressDegreeHours: number;
  rainRiskLevel: "LOW" | "MODERATE" | "HIGH";
  rainRiskScore: number; // 0 to 100
  windDriftRisk: "OPTIMAL" | "MODERATE_DRIFT" | "SEVERE_DRIFT" | "INVERSION_RISK";
  estimatedET0MmPerDay: number; // Reference Evapotranspiration
  summaryEn: string;
  summaryHi: string;
}

/**
 * Evaluate agricultural atmospheric risk
 */
export function evaluateWeatherRisks(
  temp: number,
  humidity: number,
  windSpeed: number,
  rainProb: number,
  precipitation: number = 0,
  nightTemp?: number
): WeatherRiskAssessment {
  // 1. Nocturnal Heat Stress (> 25°C baseline threshold for C3/C4 respiration losses)
  const effectiveNightTemp = nightTemp ?? (temp - 6);
  const heatStressDegreeHours = Math.max(0, Math.round((effectiveNightTemp - 25.0) * 10 * 10) / 10);
  let thermalStressLevel: "NONE" | "MODERATE" | "SEVERE" = "NONE";
  if (effectiveNightTemp >= 27.0 || temp >= 38.0) {
    thermalStressLevel = "SEVERE";
  } else if (effectiveNightTemp >= 25.0 || temp >= 34.0) {
    thermalStressLevel = "MODERATE";
  }

  // 2. Rain Wash-off Risk Score
  let rainRiskScore = Math.min(100, Math.max(0, rainProb + (precipitation > 0 ? 50 : 0)));
  let rainRiskLevel: "LOW" | "MODERATE" | "HIGH" = "LOW";
  if (rainRiskScore >= 40 || precipitation > 1.0) {
    rainRiskLevel = "HIGH";
  } else if (rainRiskScore >= 20 || precipitation > 0.2) {
    rainRiskLevel = "MODERATE";
  }

  // 3. Wind Drift
  let windDriftRisk: "OPTIMAL" | "MODERATE_DRIFT" | "SEVERE_DRIFT" | "INVERSION_RISK" = "OPTIMAL";
  if (windSpeed > 15.0) {
    windDriftRisk = "SEVERE_DRIFT";
  } else if (windSpeed > 11.0) {
    windDriftRisk = "MODERATE_DRIFT";
  } else if (windSpeed < 3.0 && temp > 30.0) {
    windDriftRisk = "INVERSION_RISK";
  }

  // 4. Reference Evapotranspiration (Simplified Hargreaves-Samani proxy)
  const tempRange = Math.max(5, temp - (nightTemp ?? (temp - 8)));
  const et0 = Math.round(0.0023 * (temp + 17.8) * Math.sqrt(tempRange) * 5.5 * 10) / 10;

  // Summaries
  let summaryEn = "Atmospheric conditions are stable for general fieldwork.";
  let summaryHi = "खेत के सामान्य कार्यों के लिए मौसम की स्थिति स्थिर है।";

  if (thermalStressLevel === "SEVERE") {
    summaryEn = `Severe night heat stress (${effectiveNightTemp}°C). High respiration energy loss in crops.`;
    summaryHi = `गंभीर रात्रि ताप तनाव (${effectiveNightTemp}°C)। फसलों में ऊर्जा श्वसन हानि अधिक है।`;
  } else if (rainRiskLevel === "HIGH") {
    summaryEn = `High precipitation probability (${rainProb}%). Delay chemical sprays to prevent wash-off.`;
    summaryHi = `बारिश की उच्च संभावना (${rainProb}%)। दवा धुलने से बचाने हेतु छिड़काव टालें।`;
  } else if (windDriftRisk === "SEVERE_DRIFT") {
    summaryEn = `High wind speeds (${windSpeed} km/h). Severe droplet drift hazard.`;
    summaryHi = `तेज हवा की गति (${windSpeed} किमी/घं)। दवा के बहाव का गंभीर खतरा।`;
  }

  return {
    thermalStressLevel,
    heatStressDegreeHours,
    rainRiskLevel,
    rainRiskScore,
    windDriftRisk,
    estimatedET0MmPerDay: Math.max(2.0, Math.min(9.5, et0)),
    summaryEn,
    summaryHi,
  };
}
