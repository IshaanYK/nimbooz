/**
 * Centralized Deterministic Weather & Spraying Suitability Rule Engine
 * Evaluates real atmospheric limits (wind drift, precipitation wash-off, thermal volatilization).
 */

export interface WeatherMetricsForSpray {
  temp: number;
  windSpeed: number;
  rainProb: number;
  humidity: number;
  precipitation?: number;
  isRaining?: boolean;
}

export type SprayRiskLevel = "SAFE" | "MARGINAL" | "HIGH_RISK" | "PROHIBITED";

export interface SpraySuitabilityVerdict {
  riskLevel: SprayRiskLevel;
  isSuitable: boolean;
  actionText: string;
  actionTextHi: string;
  primaryReason: string;
  primaryReasonHi: string;
  reasons: string[];
  reasonsHi: string[];
  recommendedWindow: string;
  recommendedWindowHi: string;
  nextCheckHours: number;
  badgeColor: string;
}

/**
 * Deterministically evaluates whether foliar spray or biostimulant application is safe right now.
 */
export function evaluateSpraySuitability(metrics: WeatherMetricsForSpray): SpraySuitabilityVerdict {
  const reasons: string[] = [];
  const reasonsHi: string[] = [];
  let riskScore = 0; // 0 = safe, 1 = marginal, 2+ = prohibited/high risk

  // 1. Rain & Precipitation Check
  if (metrics.isRaining || (metrics.precipitation && metrics.precipitation > 0.2)) {
    riskScore += 3;
    reasons.push(`Active rainfall (${metrics.precipitation || 0.5} mm/hr) will wash off spray chemicals immediately.`);
    reasonsHi.push(`सक्रिय वर्षा के कारण दवा धुल जाएगी।`);
  } else if (metrics.rainProb >= 65) {
    riskScore += 2;
    reasons.push(`High precipitation probability (${metrics.rainProb}%) within the next 6 hours creates a severe wash-off risk.`);
    reasonsHi.push(`अगले 6 घंटों में भारी बारिश की संभावना (${metrics.rainProb}%) के कारण दवा धुलने का उच्च जोखिम है।`);
  } else if (metrics.rainProb >= 40) {
    riskScore += 1;
    reasons.push(`Moderate chance of rain (${metrics.rainProb}%); ensure surfactant or rainfast formulation.`);
    reasonsHi.push(`बारिश की मध्यम संभावना (${metrics.rainProb}%); चिपको (surfactant) का प्रयोग करें।`);
  }

  // 2. Wind Speed Drift Check
  if (metrics.windSpeed > 20) {
    riskScore += 2;
    reasons.push(`Wind speed is ${metrics.windSpeed} km/h (exceeds safe limit of 15 km/h), causing heavy aerosol drift and chemical wastage.`);
    reasonsHi.push(`हवा की गति ${metrics.windSpeed} किमी/घंटा है (सुरक्षित सीमा 15 किमी/घंटा से अधिक), जिससे दवा हवा में उड़ जाएगी।`);
  } else if (metrics.windSpeed > 14) {
    riskScore += 1;
    reasons.push(`Breezy conditions (${metrics.windSpeed} km/h); use low-drift nozzles with coarse droplet size.`);
    reasonsHi.push(`तेज़ हवा (${metrics.windSpeed} किमी/घंटा); मोटे नोजल का प्रयोग करें।`);
  }

  // 3. Temperature Volatilization & Leaf Scorch Check
  if (metrics.temp >= 36) {
    riskScore += 2;
    reasons.push(`High ambient temperature (${metrics.temp}°C > 35°C limit) causes rapid droplet evaporation and potential leaf burn.`);
    reasonsHi.push(`उच्च तापमान (${metrics.temp}°C) से दवा की बूंदें जल्दी सूख जाएंगी और पत्तियों को नुकसान हो सकता है।`);
  } else if (metrics.temp >= 32) {
    riskScore += 1;
    reasons.push(`Midday heat (${metrics.temp}°C); spray early morning (06:00-09:00 AM) or late evening (04:30-07:00 PM).`);
    reasonsHi.push(`दोपहर की गर्मी (${metrics.temp}°C); केवल सुबह (06:00-09:00) या शाम (04:30-07:00) ही छिड़काव करें।`);
  }

  // 4. Relative Humidity Stomatal Openness
  if (metrics.humidity < 35 && metrics.temp > 30) {
    riskScore += 1;
    reasons.push(`Low relative humidity (${metrics.humidity}%) triggers plant stomatal closure, reducing systemic chemical uptake.`);
    reasonsHi.push(`कम आर्द्रता (${metrics.humidity}%) के कारण पौधे के रंध्र बंद रहते हैं, जिससे दवा का असर कम होगा।`);
  }

  // Verdict Synthesis
  if (riskScore >= 2) {
    const isRain = metrics.isRaining || metrics.rainProb >= 65;
    return {
      riskLevel: "HIGH_RISK",
      isSuitable: false,
      actionText: "⛔ DO NOT SPRAY TODAY",
      actionTextHi: "⛔ आज छिड़काव न करें",
      primaryReason: reasons[0] || "Unfavorable weather conditions for foliar application.",
      primaryReasonHi: reasonsHi[0] || "छिड़काव के लिए मौसम प्रतिकूल है।",
      reasons,
      reasonsHi,
      recommendedWindow: isRain ? "Tomorrow Morning (06:30 - 09:30 AM)" : "Late Afternoon (04:30 - 07:00 PM)",
      recommendedWindowHi: isRain ? "कल सुबह (06:30 - 09:30 बजे)" : "शाम को (04:30 - 07:00 बजे)",
      nextCheckHours: 4,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    };
  }

  if (riskScore === 1) {
    return {
      riskLevel: "MARGINAL",
      isSuitable: true,
      actionText: "⚠️ SPRAY WITH CAUTION (RESTRICTED WINDOW)",
      actionTextHi: "⚠️ सावधानी के साथ छिड़काव करें (सीमित समय)",
      primaryReason: reasons[0] || "Marginal weather conditions; spray with low-pressure drift guard.",
      primaryReasonHi: reasonsHi[0] || "मौसम सीमित है; सावधानी से सुबह या शाम छिड़कें।",
      reasons,
      reasonsHi,
      recommendedWindow: "Early Morning (06:00 - 09:00 AM) or Dusk (05:00 - 07:00 PM)",
      recommendedWindowHi: "सुबह (06:00 - 09:00 बजे) या शाम (05:00 - 07:00 बजे)",
      nextCheckHours: 3,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    };
  }

  return {
    riskLevel: "SAFE",
    isSuitable: true,
    actionText: "✅ OPTIMAL SPRAY WINDOW ACTIVE",
    actionTextHi: "✅ छिड़काव के लिए सर्वोत्तम मौसम",
    primaryReason: `Calm wind (${metrics.windSpeed} km/h), favorable temperature (${metrics.temp}°C), and zero rain risk.`,
    primaryReasonHi: `शांत हवा (${metrics.windSpeed} किमी/घंटा), अनुकूल तापमान (${metrics.temp}°C), और बारिश का कोई खतरा नहीं।`,
    reasons: ["Favorable atmospheric absorption window active for next 6 hours."],
    reasonsHi: ["अगले 6 घंटे दवा अवशोषण के लिए पूर्णतः अनुकूल हैं।"],
    recommendedWindow: "Next 4 to 6 Hours (Optimal Foliar Uptake)",
    recommendedWindowHi: "अगले 4 से 6 घंटे (सर्वोत्तम अवशोषण)",
    nextCheckHours: 6,
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  };
}
