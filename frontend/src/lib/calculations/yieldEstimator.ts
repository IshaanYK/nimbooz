/**
 * Centralized Agricultural Yield Range & Uncertainty Estimation Engine
 * Produces realistic bounded yield intervals based on crop physiology, heat stress, GDD, and water balance.
 */

export interface CropYieldBaseline {
  minQtlPerAcre: number;
  maxQtlPerAcre: number;
  avgQtlPerAcre: number;
  unit: string;
}

export const CROP_YIELD_BASELINES: Record<string, CropYieldBaseline> = {
  soybean: { minQtlPerAcre: 6.5, maxQtlPerAcre: 10.5, avgQtlPerAcre: 8.5, unit: "quintal/acre" },
  cotton: { minQtlPerAcre: 7.0, maxQtlPerAcre: 12.0, avgQtlPerAcre: 9.5, unit: "quintal/acre" },
  wheat: { minQtlPerAcre: 16.0, maxQtlPerAcre: 22.0, avgQtlPerAcre: 19.0, unit: "quintal/acre" },
  rice: { minQtlPerAcre: 18.0, maxQtlPerAcre: 26.0, avgQtlPerAcre: 22.0, unit: "quintal/acre" },
  maize: { minQtlPerAcre: 20.0, maxQtlPerAcre: 30.0, avgQtlPerAcre: 25.0, unit: "quintal/acre" },
  mustard: { minQtlPerAcre: 6.0, maxQtlPerAcre: 9.5, avgQtlPerAcre: 7.5, unit: "quintal/acre" },
  gram: { minQtlPerAcre: 5.5, maxQtlPerAcre: 8.5, avgQtlPerAcre: 7.0, unit: "quintal/acre" },
  sugarcane: { minQtlPerAcre: 280.0, maxQtlPerAcre: 420.0, avgQtlPerAcre: 350.0, unit: "quintal/acre" },
  default: { minQtlPerAcre: 8.0, maxQtlPerAcre: 14.0, avgQtlPerAcre: 11.0, unit: "quintal/acre" },
};

export interface YieldEstimationResult {
  cropName: string;
  acres: number;
  minQtlPerAcre: number;
  maxQtlPerAcre: number;
  avgQtlPerAcre: number;
  minTotalQuintals: number;
  maxTotalQuintals: number;
  avgTotalQuintals: number;
  minTotalTonnes: number;
  maxTotalTonnes: number;
  heatStressReductionPercent: number;
  confidenceRangeText: string;
  limitingFactors: string[];
}

/**
 * Computes realistic yield range with uncertainty bounds.
 */
export function estimateYieldRange(
  cropName: string,
  acres: number,
  stressFactors: {
    isNightHeatStress?: boolean;
    heatStressPercent?: number;
    soilMoistureDeficitPercent?: number;
    isBiostimulantProtected?: boolean;
  }
): YieldEstimationResult {
  const normCrop = (cropName || "default").toLowerCase();
  const matchedKey = Object.keys(CROP_YIELD_BASELINES).find((k) => normCrop.includes(k)) || "default";
  const baseline = CROP_YIELD_BASELINES[matchedKey];

  const limitingFactors: string[] = [];
  let penalty = 0.0;

  if (stressFactors.isNightHeatStress) {
    const stressPenalty = stressFactors.isBiostimulantProtected ? 0.03 : 0.12; // 12% loss if unmitigated
    penalty += stressPenalty;
    limitingFactors.push(
      stressFactors.isBiostimulantProtected
        ? "Night heat stress partially mitigated by active biostimulant."
        : "Unmitigated night heat stress (>25°C) causes floral respiration loss."
    );
  }

  if (stressFactors.soilMoistureDeficitPercent && stressFactors.soilMoistureDeficitPercent > 40) {
    penalty += 0.08;
    limitingFactors.push(`Soil moisture deficit (${stressFactors.soilMoistureDeficitPercent}%) restricting biomass.`);
  }

  const effectiveMin = Math.round(baseline.minQtlPerAcre * (1 - penalty) * 10) / 10;
  const effectiveMax = Math.round(baseline.maxQtlPerAcre * (1 - penalty) * 10) / 10;
  const effectiveAvg = Math.round(baseline.avgQtlPerAcre * (1 - penalty) * 10) / 10;

  const minTotal = Math.round(effectiveMin * acres * 10) / 10;
  const maxTotal = Math.round(effectiveMax * acres * 10) / 10;
  const avgTotal = Math.round(effectiveAvg * acres * 10) / 10;

  return {
    cropName,
    acres,
    minQtlPerAcre: effectiveMin,
    maxQtlPerAcre: effectiveMax,
    avgQtlPerAcre: effectiveAvg,
    minTotalQuintals: minTotal,
    maxTotalQuintals: maxTotal,
    avgTotalQuintals: avgTotal,
    minTotalTonnes: Math.round((minTotal / 10) * 10) / 10,
    maxTotalTonnes: Math.round((maxTotal / 10) * 10) / 10,
    heatStressReductionPercent: Math.round(penalty * 100),
    confidenceRangeText: `${effectiveMin} – ${effectiveMax} qtl/acre (${minTotal} – ${maxTotal} quintals total for ${acres} acres)`,
    limitingFactors: limitingFactors.length > 0 ? limitingFactors : ["Optimal atmospheric growth conditions."],
  };
}
