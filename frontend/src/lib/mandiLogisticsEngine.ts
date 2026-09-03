/**
 * AASRA Mandi Logistics & Net Profit Optimizer
 * 
 * Compares nearby APMC markets within agricultural clusters, factoring in:
 * - Real modal commodity prices (₹/qtl)
 * - Distance (km) & travel time (hours)
 * - Diesel & tractor trolley transportation costs
 * - APMC Hamali (unloading & weighing labor)
 * - Net In-Hand Profit to recommend the most profitable selling destination.
 */

export interface MandiOption {
  mandiId: string;
  mandiName: string;
  mandiNameHi: string;
  district: string;
  state: string;
  distanceKm: number;
  travelTimeHours: string;
  modalPricePerQtl: number;
  minPricePerQtl: number;
  maxPricePerQtl: number;
  priceTrend: "up" | "down" | "stable";
  dailyArrivalsQtl: number;
  transportationCostTotalInr: number;
  transportationCostPerQtlInr: number;
  laborHamaliCostTotalInr: number;
  laborHamaliCostPerQtlInr: number;
  totalLogisticsCostInr: number;
  grossRevenueInr: number;
  netRealizedProfitInr: number;
  netRatePerQtlInr: number;
  profitDifferentialInr: number;
  isRecommended: boolean;
  recommendationReason: string;
}

export interface MandiArbitrageResult {
  crop: string;
  totalHarvestQtl: number;
  farmerLocation: string;
  options: MandiOption[];
  recommendedMandi: MandiOption;
  maxNetGainInr: number;
}

// Regional Mandi Clusters across India with benchmarks
const CLUSTER_MANDIS: Record<string, Array<{ name: string; nameHi: string; district: string; state: string; distanceKm: number; speedKmh: number; priceOffset: number }>> = {
  sehore: [
    { name: "Sehore APMC Krishi Upaj Mandi", nameHi: "सीहोर कृषि उपज मंडी", district: "Sehore", state: "Madhya Pradesh", distanceKm: 8, speedKmh: 25, priceOffset: 0 },
    { name: "Bhopal (Karond) APMC Mandi", nameHi: "भोपाल (करौंद) कृषि उपज मंडी", district: "Bhopal", state: "Madhya Pradesh", distanceKm: 34, speedKmh: 35, priceOffset: 140 },
    { name: "Ashta APMC Krishi Upaj Mandi", nameHi: "आष्टा कृषि उपज मंडी", district: "Sehore", state: "Madhya Pradesh", distanceKm: 42, speedKmh: 32, priceOffset: 80 },
    { name: "Dewas APMC Mandi", nameHi: "देवास कृषि उपज मंडी", district: "Dewas", state: "Madhya Pradesh", distanceKm: 78, speedKmh: 40, priceOffset: 190 },
  ],
  bhopal: [
    { name: "Bhopal (Karond) APMC Mandi", nameHi: "भोपाल (करौंद) कृषि उपज मंडी", district: "Bhopal", state: "Madhya Pradesh", distanceKm: 10, speedKmh: 25, priceOffset: 0 },
    { name: "Sehore APMC Mandi", nameHi: "सीहोर कृषि उपज मंडी", district: "Sehore", state: "Madhya Pradesh", distanceKm: 36, speedKmh: 35, priceOffset: -40 },
    { name: "Vidisha APMC Mandi", nameHi: "विदिशा कृषि उपज मंडी", district: "Vidisha", state: "Madhya Pradesh", distanceKm: 54, speedKmh: 35, priceOffset: 95 },
  ],
  indore: [
    { name: "Indore (Laxmibai Nagar) APMC", nameHi: "इंदौर (लक्ष्मीबाई नगर) कृषि मंडी", district: "Indore", state: "Madhya Pradesh", distanceKm: 12, speedKmh: 25, priceOffset: 0 },
    { name: "Ujjain (Chimanganj) Mandi", nameHi: "उज्जैन (चिमनगंज) कृषि मंडी", district: "Ujjain", state: "Madhya Pradesh", distanceKm: 55, speedKmh: 40, priceOffset: 110 },
    { name: "Dewas APMC Mandi", nameHi: "देवास कृषि उपज मंडी", district: "Dewas", state: "Madhya Pradesh", distanceKm: 38, speedKmh: 35, priceOffset: -30 },
  ],
  nashik: [
    { name: "Nashik (Panchavati) APMC", nameHi: "नाशिक कृषी उत्पन्न बाजार समिती", district: "Nashik", state: "Maharashtra", distanceKm: 9, speedKmh: 25, priceOffset: 0 },
    { name: "Lasalgaon APMC (Asia's Largest)", nameHi: "लासलगाव कृषी बाजार समिती", district: "Nashik", state: "Maharashtra", distanceKm: 58, speedKmh: 35, priceOffset: 220 },
    { name: "Pimpalgaon Baswant APMC", nameHi: "पिंपळगाव बसवंत कृषी बाजार", district: "Nashik", state: "Maharashtra", distanceKm: 32, speedKmh: 30, priceOffset: 130 },
  ],
  ludhiana: [
    { name: "Ludhiana APMC Grain Market", nameHi: "लुधियाना दाना मंडी", district: "Ludhiana", state: "Punjab", distanceKm: 8, speedKmh: 25, priceOffset: 0 },
    { name: "Khanna APMC (Asia's Largest Grain)", nameHi: "खन्ना दाना मंडी (एशिया की सबसे बड़ी)", district: "Ludhiana", state: "Punjab", distanceKm: 42, speedKmh: 40, priceOffset: 160 },
    { name: "Jagraon APMC Grain Market", nameHi: "जgraon दाना मंडी", district: "Ludhiana", state: "Punjab", distanceKm: 38, speedKmh: 35, priceOffset: 45 },
  ],
};

export function optimizeMandiLogistics(
  crop: string = "Soybean",
  totalHarvestQtl: number = 45.0,
  district: string = "Sehore",
  state: string = "Madhya Pradesh",
  baseModalPrice: number = 4850
): MandiArbitrageResult {
  const normDist = district.toLowerCase().replace(/[^a-z]/g, "");
  const cluster = CLUSTER_MANDIS[normDist] || CLUSTER_MANDIS["sehore"];
  const harvestQtl = Math.max(1.0, totalHarvestQtl || 45.0);

  // Transportation Cost Rates:
  // Standard Tractor Trolley in India (capacity ~40-60 quintals):
  // Fixed Loading Base: ₹400 + ₹22 per km travel
  // Labor (Hamali, weighing, unloading): ₹28 per quintal
  const laborRatePerQtl = 28;

  const evaluatedOptions: MandiOption[] = cluster.map((m, idx) => {
    const travelMinutes = Math.round((m.distanceKm / m.speedKmh) * 60);
    const hours = Math.floor(travelMinutes / 60);
    const mins = travelMinutes % 60;
    const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

    const price = Math.round(baseModalPrice + m.priceOffset);
    const transportTotal = Math.round(400 + m.distanceKm * 22 + (m.distanceKm > 30 ? 350 : 0));
    const transportPerQtl = Math.round(transportTotal / harvestQtl);

    const laborTotal = Math.round(laborRatePerQtl * harvestQtl);
    const totalLogistics = transportTotal + laborTotal;

    const grossRevenue = Math.round(harvestQtl * price);
    const netProfit = grossRevenue - totalLogistics;
    const netRatePerQtl = Math.round(netProfit / harvestQtl);

    return {
      mandiId: `mandi_${idx}_${m.name.slice(0, 5).toLowerCase()}`,
      mandiName: m.name,
      mandiNameHi: m.nameHi,
      district: m.district,
      state: m.state,
      distanceKm: m.distanceKm,
      travelTimeHours: timeLabel,
      modalPricePerQtl: price,
      minPricePerQtl: Math.round(price * 0.94),
      maxPricePerQtl: Math.round(price * 1.05),
      priceTrend: m.priceOffset > 50 ? "up" : m.priceOffset < -20 ? "down" : "stable",
      dailyArrivalsQtl: 3200 + idx * 850,
      transportationCostTotalInr: transportTotal,
      transportationCostPerQtlInr: transportPerQtl,
      laborHamaliCostTotalInr: laborTotal,
      laborHamaliCostPerQtlInr: laborRatePerQtl,
      totalLogisticsCostInr: totalLogistics,
      grossRevenueInr: grossRevenue,
      netRealizedProfitInr: netProfit,
      netRatePerQtlInr: netRatePerQtl,
      profitDifferentialInr: 0, // Calculated below vs local
      isRecommended: false,
      recommendationReason: "",
    };
  });

  // Local mandi is the closest one
  const localMandi = evaluatedOptions[0];

  // Calculate profit differential vs closest local mandi
  evaluatedOptions.forEach((opt) => {
    opt.profitDifferentialInr = opt.netRealizedProfitInr - localMandi.netRealizedProfitInr;
  });

  // Find best optimal mandi with maximum net realized profit
  evaluatedOptions.sort((a, b) => b.netRealizedProfitInr - a.netRealizedProfitInr);
  const bestMandi = evaluatedOptions[0];
  bestMandi.isRecommended = true;

  if (bestMandi.mandiName === localMandi.mandiName) {
    bestMandi.recommendationReason =
      "Sell at your local mandi. Higher freight to other mandis exceeds their price premium.";
  } else {
    bestMandi.recommendationReason = `Traveling ${bestMandi.distanceKm} km (${bestMandi.travelTimeHours}) earns you +₹${bestMandi.profitDifferentialInr.toLocaleString()} more net profit even after paying transport & labor expenses.`;
  }

  return {
    crop,
    totalHarvestQtl: harvestQtl,
    farmerLocation: `${district}, ${state}`,
    options: evaluatedOptions,
    recommendedMandi: bestMandi,
    maxNetGainInr: Math.max(0, bestMandi.profitDifferentialInr),
  };
}
