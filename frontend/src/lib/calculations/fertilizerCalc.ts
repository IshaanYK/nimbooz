/**
 * Centralized Fertilizer & NPK Nutrition Formulation Engine
 * Separates elemental nutrient requirements from commercial product formulation.
 */

export interface SoilTestValues {
  availableN_kgPerHa?: number; // Normal: 280-560 kg/ha
  availableP_kgPerHa?: number; // Normal: 10-25 kg/ha
  availableK_kgPerHa?: number; // Normal: 110-280 kg/ha
  organicCarbonPercent?: number; // Normal: 0.5 - 0.75%
  ph?: number; // Normal: 6.5 - 7.5
  electricalConductivity?: number;
  zincPpm?: number;
  testedDate?: string;
  labName?: string;
}

export interface FertilizerProduct {
  name: string;
  nPercent: number;
  pPercent: number;
  kPercent: number;
  bagWeightKg: number;
  costPerBagRs: number;
}

export const COMMON_FERTILIZERS: FertilizerProduct[] = [
  { name: "Urea (46-0-0)", nPercent: 0.46, pPercent: 0.0, kPercent: 0.0, bagWeightKg: 45, costPerBagRs: 266 },
  { name: "DAP (18-46-0)", nPercent: 0.18, pPercent: 0.46, kPercent: 0.0, bagWeightKg: 50, costPerBagRs: 1350 },
  { name: "MOP (0-0-60)", nPercent: 0.0, pPercent: 0.0, kPercent: 0.60, bagWeightKg: 50, costPerBagRs: 1700 },
  { name: "NPK (12-32-16)", nPercent: 0.12, pPercent: 0.32, kPercent: 0.16, bagWeightKg: 50, costPerBagRs: 1470 },
  { name: "SSP (0-16-0 + 11% S)", nPercent: 0.0, pPercent: 0.16, kPercent: 0.0, bagWeightKg: 50, costPerBagRs: 480 },
];

export interface CropNutrientTarget {
  targetN_kgPerAcre: number;
  targetP_kgPerAcre: number;
  targetK_kgPerAcre: number;
}

export const CROP_BASE_TARGETS: Record<string, CropNutrientTarget> = {
  soybean: { targetN_kgPerAcre: 12, targetP_kgPerAcre: 24, targetK_kgPerAcre: 16 },
  cotton: { targetN_kgPerAcre: 48, targetP_kgPerAcre: 24, targetK_kgPerAcre: 24 },
  wheat: { targetN_kgPerAcre: 48, targetP_kgPerAcre: 24, targetK_kgPerAcre: 16 },
  rice: { targetN_kgPerAcre: 40, targetP_kgPerAcre: 20, targetK_kgPerAcre: 20 },
  maize: { targetN_kgPerAcre: 48, targetP_kgPerAcre: 24, targetK_kgPerAcre: 20 },
  sugarcane: { targetN_kgPerAcre: 100, targetP_kgPerAcre: 40, targetK_kgPerAcre: 48 },
  mustard: { targetN_kgPerAcre: 32, targetP_kgPerAcre: 16, targetK_kgPerAcre: 16 },
  gram: { targetN_kgPerAcre: 10, targetP_kgPerAcre: 20, targetK_kgPerAcre: 12 },
  default: { targetN_kgPerAcre: 30, targetP_kgPerAcre: 20, targetK_kgPerAcre: 16 },
};

export interface FertilizerCalculationResult {
  cropName: string;
  acres: number;
  isSoilTestAvailable: boolean;
  requiredElementalN_kg: number;
  requiredElementalP_kg: number;
  requiredElementalK_kg: number;
  productRecommendations: Array<{
    product: string;
    kgTotal: number;
    bagsTotal: number;
    estimatedCostRs: number;
    timing: string;
  }>;
  totalEstimatedFertilizerCostRs: number;
  soilStatusExplanation: string;
}

/**
 * Calculates required N, P, K nutrients and exact fertilizer product bags based on farm area and soil report.
 */
export function calculateFertilizerPlan(
  cropName: string,
  acres: number,
  soilTest?: SoilTestValues | null
): FertilizerCalculationResult {
  const normCrop = (cropName || "default").toLowerCase();
  const matchedTargetKey = Object.keys(CROP_BASE_TARGETS).find((k) => normCrop.includes(k)) || "default";
  const base = CROP_BASE_TARGETS[matchedTargetKey];

  let nMultiplier = 1.0;
  let pMultiplier = 1.0;
  let kMultiplier = 1.0;
  let explanation = "Calculated using ICAR & State Agricultural University baseline targets.";

  const hasSoilTest = Boolean(soilTest && (soilTest.availableN_kgPerHa || soilTest.availableP_kgPerHa || soilTest.ph));

  if (hasSoilTest && soilTest) {
    if (soilTest.availableN_kgPerHa) {
      if (soilTest.availableN_kgPerHa < 250) nMultiplier = 1.25;
      else if (soilTest.availableN_kgPerHa > 450) nMultiplier = 0.75;
    }
    if (soilTest.availableP_kgPerHa) {
      if (soilTest.availableP_kgPerHa < 12) pMultiplier = 1.3;
      else if (soilTest.availableP_kgPerHa > 25) pMultiplier = 0.7;
    }
    if (soilTest.availableK_kgPerHa) {
      if (soilTest.availableK_kgPerHa < 120) kMultiplier = 1.25;
      else if (soilTest.availableK_kgPerHa > 280) kMultiplier = 0.75;
    }
    explanation = `Grounded in verified soil lab test (${soilTest.labName || "Soil Health Card"}). Multipliers adjusted for actual soil nutrient reserves.`;
  }

  const requiredN = Math.round(base.targetN_kgPerAcre * nMultiplier * acres);
  const requiredP = Math.round(base.targetP_kgPerAcre * pMultiplier * acres);
  const requiredK = Math.round(base.targetK_kgPerAcre * kMultiplier * acres);

  // Formulate standard Indian combo: DAP (for P and some N) + MOP (for K) + Urea (for remaining N)
  // DAP is 46% P2O5 and 18% N
  const dapKg = Math.round(requiredP / 0.46);
  const dapBags = Math.ceil(dapKg / 50);
  const dapCost = dapBags * 1350;
  const nProvidedByDap = dapKg * 0.18;

  // Remaining N provided by Urea (46% N)
  const remainingN = Math.max(0, requiredN - nProvidedByDap);
  const ureaKg = Math.round(remainingN / 0.46);
  const ureaBags = Math.ceil(ureaKg / 45);
  const ureaCost = ureaBags * 266;

  // MOP (60% K2O)
  const mopKg = Math.round(requiredK / 0.60);
  const mopBags = Math.ceil(mopKg / 50);
  const mopCost = mopBags * 1700;

  const totalCost = dapCost + ureaCost + mopCost;

  return {
    cropName,
    acres,
    isSoilTestAvailable: hasSoilTest,
    requiredElementalN_kg: requiredN,
    requiredElementalP_kg: requiredP,
    requiredElementalK_kg: requiredK,
    productRecommendations: [
      {
        product: "DAP (18-46-0)",
        kgTotal: dapKg,
        bagsTotal: dapBags,
        estimatedCostRs: dapCost,
        timing: "Basal dose at sowing / transplanting time",
      },
      {
        product: "Urea (46-0-0)",
        kgTotal: ureaKg,
        bagsTotal: ureaBags,
        estimatedCostRs: ureaCost,
        timing: "Split application (50% basal / 50% top dressing at 30-40 DAS)",
      },
      {
        product: "MOP (0-0-60)",
        kgTotal: mopKg,
        bagsTotal: mopBags,
        estimatedCostRs: mopCost,
        timing: "Basal application with DAP",
      },
    ],
    totalEstimatedFertilizerCostRs: totalCost,
    soilStatusExplanation: explanation,
  };
}
