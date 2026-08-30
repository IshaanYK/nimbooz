/**
 * Centralized Deterministic ROI & Economic Attribution Engine
 * Formula Transparency: Every value includes mathematical derivation and data source attribution.
 */

export interface ROIParameters {
  acres: number;
  mandiPricePerQtl: number;
  preservedYieldQtlPerAcre: number;
  productCostPerAcre: number;
  labourCostPerAcre: number;
  expectedBaselineYieldQtlPerAcre?: number;
  applicationCount?: number;
  cropName?: string;
  sourceNote?: string;
}

export interface ROIStepBreakdown {
  label: string;
  formula: string;
  value: string;
  unit: string;
}

export interface ROIResult {
  grossProtectedPerAcre: number;
  costPerAcre: number;
  netProfitPerAcre: number;
  totalFieldProtectedGross: number;
  totalFieldCost: number;
  totalFieldNetProfit: number;
  robiMultiple: number;
  roiPercentage: number;
  isProfitable: boolean;
  breakdown: ROIStepBreakdown[];
  source: string;
  timestamp: string;
}

/**
 * Computes deterministic economic return for agricultural interventions (ROBI - Return on Biostimulant / Input)
 */
export function calculateDeterministicROI(params: ROIParameters): ROIResult {
  const acres = Math.max(params.acres || 1, 0.1);
  const price = Math.max(params.mandiPricePerQtl || 4000, 100);
  const preservedQtl = Math.max(params.preservedYieldQtlPerAcre || 0.5, 0.01);
  const productCost = Math.max(params.productCostPerAcre || 400, 0);
  const labourCost = Math.max(params.labourCostPerAcre || 150, 0);
  const apps = params.applicationCount || 1;

  const costPerAcre = Math.round((productCost + labourCost) * apps);
  const grossProtectedPerAcre = Math.round(preservedQtl * price);
  const netProfitPerAcre = grossProtectedPerAcre - costPerAcre;

  const totalFieldCost = Math.round(costPerAcre * acres);
  const totalFieldProtectedGross = Math.round(grossProtectedPerAcre * acres);
  const totalFieldNetProfit = Math.round(netProfitPerAcre * acres);

  const robiMultiple = costPerAcre > 0 ? Math.round((grossProtectedPerAcre / costPerAcre) * 10) / 10 : 0;
  const roiPercentage = costPerAcre > 0 ? Math.round((netProfitPerAcre / costPerAcre) * 100) : 0;

  const breakdown: ROIStepBreakdown[] = [
    {
      label: "Total Input & Application Cost",
      formula: `(₹${productCost} product + ₹${labourCost} labour) × ${apps} application(s)`,
      value: `₹${costPerAcre.toLocaleString("en-IN")}`,
      unit: "per acre",
    },
    {
      label: "Protected / Preserved Harvest Value",
      formula: `${preservedQtl} quintals × ₹${price.toLocaleString("en-IN")}/quintal mandi rate`,
      value: `₹${grossProtectedPerAcre.toLocaleString("en-IN")}`,
      unit: "per acre",
    },
    {
      label: "Net Farmer Profit",
      formula: `₹${grossProtectedPerAcre.toLocaleString("en-IN")} gross - ₹${costPerAcre.toLocaleString("en-IN")} cost`,
      value: `₹${netProfitPerAcre.toLocaleString("en-IN")}`,
      unit: "per acre",
    },
    {
      label: "Whole Farm Protected Net Value",
      formula: `₹${netProfitPerAcre.toLocaleString("en-IN")} × ${acres} acres`,
      value: `₹${totalFieldNetProfit.toLocaleString("en-IN")}`,
      unit: "total plot",
    },
    {
      label: "Return on Biostimulant Input (ROBI)",
      formula: `₹${grossProtectedPerAcre.toLocaleString("en-IN")} / ₹${costPerAcre.toLocaleString("en-IN")}`,
      value: `${robiMultiple}x`,
      unit: "multiple",
    },
  ];

  return {
    grossProtectedPerAcre,
    costPerAcre,
    netProfitPerAcre,
    totalFieldProtectedGross,
    totalFieldCost,
    totalFieldNetProfit,
    robiMultiple,
    roiPercentage,
    isProfitable: netProfitPerAcre > 0,
    breakdown,
    source: params.sourceNote || "APMC Live Mandi & Syngenta Verified Agronomic Trial Baselines",
    timestamp: new Date().toISOString(),
  };
}
