/**
 * ASSARA Agricultural ROI Rules Engine
 * Computes deterministic farm economics with complete arithmetic transparency.
 */

export interface FarmEconomicsBreakdown {
  fieldAreaAcres: number;
  cropName: string;
  expectedYieldQuintalsPerAcre: number;
  totalProductionQuintals: number;
  mandiPricePerQuintalInr: number;
  grossRevenueInr: number;
  costsPerAcreInr: {
    seed: number;
    fertilizer: number;
    cropProtection: number;
    labor: number;
    irrigation: number;
    harvesting: number;
  };
  totalCostPerAcreInr: number;
  totalFieldProductionCostInr: number;
  totalFieldNetProfitInr: number;
  roiPercentage: number;
  robiMultiple: number; // Return On Biological Investment
  arithmeticProof: {
    grossFormula: string;
    grossValue: number;
    costFormula: string;
    costValue: number;
    profitFormula: string;
    profitValue: number;
    roiFormula: string;
    roiValue: number;
  };
}

const CROP_DEFAULT_ECONOMICS: Record<
  string,
  { yieldQtl: number; seedCost: number; fertCost: number; protCost: number; laborCost: number; irrigCost: number; harvestCost: number }
> = {
  soybean: { yieldQtl: 9.5, seedCost: 3200, fertCost: 2800, protCost: 2200, laborCost: 3500, irrigCost: 1200, harvestCost: 2100 },
  wheat: { yieldQtl: 18.0, seedCost: 2400, fertCost: 3500, protCost: 1400, laborCost: 3000, irrigCost: 2200, harvestCost: 2500 },
  cotton: { yieldQtl: 11.0, seedCost: 3800, fertCost: 4200, protCost: 3800, laborCost: 5500, irrigCost: 2000, harvestCost: 3200 },
  rice: { yieldQtl: 22.0, seedCost: 1800, fertCost: 3800, protCost: 1800, laborCost: 6000, irrigCost: 3000, harvestCost: 2800 },
  maize: { yieldQtl: 24.0, seedCost: 2600, fertCost: 3600, protCost: 1600, laborCost: 3200, irrigCost: 1800, harvestCost: 2400 },
  tomato: { yieldQtl: 140.0, seedCost: 6500, fertCost: 9500, protCost: 8000, laborCost: 14000, irrigCost: 4000, harvestCost: 7000 },
  onion: { yieldQtl: 90.0, seedCost: 5500, fertCost: 6500, protCost: 4500, laborCost: 11000, irrigCost: 3500, harvestCost: 5500 },
  potato: { yieldQtl: 100.0, seedCost: 12000, fertCost: 8000, protCost: 5000, laborCost: 9000, irrigCost: 3500, harvestCost: 6000 },
  chickpea: { yieldQtl: 7.5, seedCost: 2800, fertCost: 2000, protCost: 1800, laborCost: 2800, irrigCost: 1000, harvestCost: 1800 },
  mustard: { yieldQtl: 8.0, seedCost: 1200, fertCost: 2200, protCost: 1200, laborCost: 2600, irrigCost: 1200, harvestCost: 1800 },
};

export function calculateFarmEconomics(
  crop: string = "Soybean",
  fieldAreaAcres: number = 5.0,
  mandiPricePerQuintalInr: number = 4850,
  customYield?: number
): FarmEconomicsBreakdown {
  const cleanCrop = (crop || "soybean").toLowerCase().trim();
  const eco = CROP_DEFAULT_ECONOMICS[cleanCrop] || CROP_DEFAULT_ECONOMICS["soybean"];
  const area = Math.max(0.1, fieldAreaAcres);
  const yieldPerAcre = customYield && customYield > 0 ? customYield : eco.yieldQtl;
  const price = Math.max(100, mandiPricePerQuintalInr);

  const totalProductionQtl = Math.round(yieldPerAcre * area * 10) / 10;
  const grossRevenue = Math.round(totalProductionQtl * price);

  const costsPerAcre = {
    seed: eco.seedCost,
    fertilizer: eco.fertCost,
    cropProtection: eco.protCost,
    labor: eco.laborCost,
    irrigation: eco.irrigCost,
    harvesting: eco.harvestCost,
  };

  const totalCostPerAcre =
    costsPerAcre.seed +
    costsPerAcre.fertilizer +
    costsPerAcre.cropProtection +
    costsPerAcre.labor +
    costsPerAcre.irrigation +
    costsPerAcre.harvesting;

  const totalFieldCost = Math.round(totalCostPerAcre * area);
  const totalFieldNetProfit = grossRevenue - totalFieldCost;
  const roiPercentage = totalFieldCost > 0 ? Math.round((totalFieldNetProfit / totalFieldCost) * 100 * 10) / 10 : 0;
  const robiMultiple = totalFieldCost > 0 ? Math.round((grossRevenue / totalFieldCost) * 100) / 100 : 1;

  return {
    fieldAreaAcres: area,
    cropName: crop,
    expectedYieldQuintalsPerAcre: yieldPerAcre,
    totalProductionQuintals: totalProductionQtl,
    mandiPricePerQuintalInr: price,
    grossRevenueInr: grossRevenue,
    costsPerAcreInr: costsPerAcre,
    totalCostPerAcreInr: totalCostPerAcre,
    totalFieldProductionCostInr: totalFieldCost,
    totalFieldNetProfitInr: totalFieldNetProfit,
    roiPercentage,
    robiMultiple,
    arithmeticProof: {
      grossFormula: `${yieldPerAcre} q/ac × ${area} ac × ₹${price}/q`,
      grossValue: grossRevenue,
      costFormula: `₹${totalCostPerAcre}/ac × ${area} ac`,
      costValue: totalFieldCost,
      profitFormula: `₹${grossRevenue.toLocaleString("en-IN")} - ₹${totalFieldCost.toLocaleString("en-IN")}`,
      profitValue: totalFieldNetProfit,
      roiFormula: `(₹${totalFieldNetProfit.toLocaleString("en-IN")} ÷ ₹${totalFieldCost.toLocaleString("en-IN")}) × 100`,
      roiValue: roiPercentage,
    },
  };
}
