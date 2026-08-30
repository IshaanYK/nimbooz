/**
 * ASSARA Agricultural Fertilizer Rules Engine
 * Computes elemental N-P2O5-K2O targets vs commercial fertilizer bags (DAP, Urea, MOP).
 */

export interface FertilizerDosePlan {
  crop: string;
  fieldAreaAcres: number;
  targetNPK_KgPerAcre: { n: number; p: number; k: number };
  adjustedNPK_KgPerAcre: { n: number; p: number; k: number };
  commercialProducts: Array<{
    name: string;
    bags50Kg: number;
    totalKg: number;
    timing: string;
    timingHi: string;
  }>;
  totalCostEstimateInr: number;
  provenance: string;
}

const CROP_NPK_TARGETS: Record<string, { n: number; p: number; k: number }> = {
  soybean: { n: 12, p: 32, k: 16 }, // Soybean fixes nitrogen; needs starter N + high P & K
  wheat: { n: 48, p: 24, k: 16 },
  cotton: { n: 40, p: 20, k: 20 },
  rice: { n: 40, p: 20, k: 20 },
  maize: { n: 48, p: 24, k: 20 },
  sugarcane: { n: 100, p: 40, k: 40 },
  chickpea: { n: 8, p: 24, k: 12 },
  mustard: { n: 32, p: 16, k: 16 },
  tomato: { n: 60, p: 40, k: 40 },
  onion: { n: 40, p: 20, k: 30 },
  potato: { n: 60, p: 40, k: 50 },
};

export function calculateFertilizerPlan(
  cropName: string,
  fieldAreaAcres: number,
  soilReport?: { ph: number; nitrogen: number; phosphorus: number; potassium: number; provenance?: string }
): FertilizerDosePlan {
  const cleanCrop = (cropName || "soybean").toLowerCase().trim();
  const baseTarget = CROP_NPK_TARGETS[cleanCrop] || CROP_NPK_TARGETS["soybean"];

  // Adjust for soil status if known (low / medium / high)
  let nAdj = baseTarget.n;
  let pAdj = baseTarget.p;
  let kAdj = baseTarget.k;

  if (soilReport) {
    if (soilReport.nitrogen > 280) nAdj *= 0.8;
    else if (soilReport.nitrogen < 180) nAdj *= 1.25;

    if (soilReport.phosphorus > 25) pAdj *= 0.75;
    else if (soilReport.phosphorus < 12) pAdj *= 1.3;

    if (soilReport.potassium > 320) kAdj *= 0.8;
    else if (soilReport.potassium < 150) kAdj *= 1.25;
  }

  nAdj = Math.round(nAdj * 10) / 10;
  pAdj = Math.round(pAdj * 10) / 10;
  kAdj = Math.round(kAdj * 10) / 10;

  const totalArea = Math.max(0.1, fieldAreaAcres);
  const totalTargetN = nAdj * totalArea;
  const totalTargetP = pAdj * totalArea;
  const totalTargetK = kAdj * totalArea;

  // 1 bag DAP (50kg) provides 9kg N + 23kg P2O5
  const dapBags = Math.max(1, Math.round((totalTargetP / 23) * 10) / 10);
  const nProvidedByDap = dapBags * 9;

  // Remaining N supplied by Urea (50kg bag = 23kg N)
  const remainingN = Math.max(0, totalTargetN - nProvidedByDap);
  const ureaBags = Math.max(1, Math.round((remainingN / 23) * 10) / 10);

  // K supplied by MOP (50kg bag = 30kg K2O)
  const mopBags = Math.max(0.5, Math.round((totalTargetK / 30) * 10) / 10);

  // Estimated subsidised Govt MRP prices
  const dapCost = dapBags * 1350;
  const ureaCost = ureaBags * 266;
  const mopCost = mopBags * 1700;
  const totalCost = Math.round(dapCost + ureaCost + mopCost);

  return {
    crop: cropName,
    fieldAreaAcres: totalArea,
    targetNPK_KgPerAcre: baseTarget,
    adjustedNPK_KgPerAcre: { n: nAdj, p: pAdj, k: kAdj },
    commercialProducts: [
      {
        name: "DAP (18-46-0)",
        bags50Kg: dapBags,
        totalKg: Math.round(dapBags * 50),
        timing: "Basal application at sowing",
        timingHi: "बुवाई के समय बेसल डोज",
      },
      {
        name: "Neem Coated Urea (46% N)",
        bags50Kg: ureaBags,
        totalKg: Math.round(ureaBags * 50),
        timing: "Split top-dressing (30 & 50 DAS)",
        timingHi: "दो बार में टॉप ड्रेसिंग (30 व 50 दिन)",
      },
      {
        name: "Muriate of Potash - MOP (60% K2O)",
        bags50Kg: mopBags,
        totalKg: Math.round(mopBags * 50),
        timing: "Basal or early vegetative stage",
        timingHi: "बुवाई या शुरुआती शाकीय अवस्था",
      },
    ],
    totalCostEstimateInr: totalCost,
    provenance: soilReport?.provenance || "Based on ICAR standard crop nutritional recommendations",
  };
}
