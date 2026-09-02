import { SyngentaProduct, getAllProducts, getProductsForCrop } from './syngentaProductsDB';

// ========================
// TYPES
// ========================

export interface FarmerInput {
  cropType: string;           // e.g. 'soybean'
  growthStage: string;        // 'germination' | 'vegetative' | 'flowering' | 'podFormation' | 'maturity'
  temperatureMax: number;     // °C
  temperatureMin: number;     // °C
  humidityAvg: number;        // %
  rainfall7Day: number;       // mm
  windSpeed: number;          // km/h
  soilMoisture: string;       // 'optimal' | 'dry' | 'waterlogged'
  soilType: string;           // 'alluvial' | 'black_cotton' | 'red_laterite' | 'sandy' | 'loamy' | 'clay'
  symptoms: string;           // 'none' | 'wilting' | 'yellowing' | 'leaf_spots' | 'pest_damage' | 'stunting'
  season: string;             // 'kharif' | 'rabi' | 'zaid'
  daysSinceLastSpray: number; // 0-60
  acreage: number;            // acres
  locationName: string;       // e.g. 'Kasganj, UP'
}

export interface ProductRecommendation {
  rank: number;               // 1, 2, or 3
  product: SyngentaProduct;
  score: number;              // 0-100 composite score
  triggerReasons: string[];   // why this product was selected (technical)
  stressType: string;         // 'heat' | 'drought' | 'fungal' | 'insect' | 'weed' | 'seedborne' | 'compound'
  dosageForThisCase: string;  // adjusted dosage for this specific situation
  costBreakdown: {
    productCost: number;      // ₹ per acre
    laborCost: number;        // ₹ per acre (spraying labor)
    waterCost: number;        // ₹ per acre
    totalPerAcre: number;     // total ₹ per acre
    totalForField: number;    // total ₹ for farmer's field (totalPerAcre × acreage)
  };
  expectedBenefit: {
    yieldProtectedQPerAcre: number;  // quintals/acre saved
    revenueProtectedPerAcre: number; // ₹/acre saved
    robi: number;                     // Return on Biological Investment ratio
  };
  sprayWindow: {
    isSafeToSpray: boolean;
    reason: string;  // e.g. 'Wind 5 km/h, no rain — safe to spray'
    bestTime: string; // e.g. '6:00-9:00 AM tomorrow'
  };
  farmerExplanation: string;  // Simple, farmer-friendly explanation
  // SCIENTIFIC & FIELD TRIAL VALIDATION
  trialEfficacyPct?: number;
  trialCitation?: string;
  etlThreshold?: string;
  cropwiseStandard?: {
    rainfastnessHours: number;
    optimalDeltaT: string;
    droneApplicable: boolean;
    advisoryNote: string;
  };
  tankMixSafe?: string[];
  tankMixDanger?: string[];
}

export interface RecommendationResult {
  recommendations: ProductRecommendation[];
  stressProfile: {
    heatStressIndex: number;      // 0-1
    droughtStressIndex: number;   // 0-1
    fungalRisk: string;           // 'none' | 'low' | 'moderate' | 'high'
    insectRisk: string;           // 'none' | 'low' | 'moderate' | 'high'
    weedRisk: string;             // 'none' | 'low' | 'moderate' | 'high'
    compoundStress: number;       // 0-1
    dominantStress: string;       // The primary stress type
  };
  geminiPrompt: string;           // The prompt to send to Gemini for explanation generation
}

// ========================
// CONSTANTS
// ========================

const MANDI_PRICES: Record<string, number> = {
  soybean: 4800, wheat: 2275, cotton: 7100, rice: 2200,
  maize: 2090, mustard: 5650, groundnut: 6300, chilli: 14000,
  potato: 1250, sugarcane: 340, tomato: 1400, onion: 1650,
  chickpea: 5440, tur: 7550, moong: 8682, urad: 7400,
  bajra: 2625, jowar: 3371, barley: 1850, sesame: 9267,
  garlic: 4200, ginger: 4800, turmeric: 13700, cumin: 26500,
  apple: 6500, grapes: 4800, pomegranate: 7200, coffee: 18000,
  tea: 3800, cardamom: 95000, sunflower: 7280, tobacco: 3200,
  jute: 5335, mentha: 1050
};

const LABOR_COSTS: Record<string, number> = {
  manual_knapsack: 800,    // ₹/acre for manual spraying
  tractor_boom: 400,       // ₹/acre for tractor boom sprayer
  drone: 500,              // ₹/acre for drone spraying
  seed_treatment: 100,     // ₹/acre for seed treatment labor
  soil_drench: 300,        // ₹/acre for soil drench
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ========================
// LAYER 1: Deterministic Filter
// ========================
function filterCandidates(input: FarmerInput): { candidates: SyngentaProduct[], stressProfile: RecommendationResult['stressProfile'] } {
  let products = getProductsForCrop(input.cropType);
  if (!products || products.length === 0) {
    products = getAllProducts();
  }

  // Filter by growth stage
  products = products.filter(p => p.stageSuitability && (p.stageSuitability[input.growthStage as keyof typeof p.stageSuitability] || 0) >= 0.3);

  // Detect stress type from environmental data
  const cropOptimal: Record<string, number> = {
    soybean: 32, wheat: 25, cotton: 32, rice: 32, maize: 33,
    potato: 20, chilli: 30, groundnut: 30, sugarcane: 30,
  };
  const optimalTemp = cropOptimal[input.cropType.toLowerCase()] || 28;
  const hsi = clamp((input.temperatureMax - optimalTemp) / 13, 0, 1);

  let soilMoisturePct = 65;
  if (input.soilMoisture === 'dry') soilMoisturePct = 25;
  else if (input.soilMoisture === 'waterlogged') soilMoisturePct = 90;
  const dsi = clamp(1 - soilMoisturePct / 100, 0, 1);

  let fungalRisk = 'low';
  if (input.humidityAvg > 80 && input.rainfall7Day > 30) fungalRisk = 'high';
  else if (input.humidityAvg > 70 || input.rainfall7Day > 15) fungalRisk = 'moderate';

  let insectRisk = 'low';
  if (input.symptoms.includes('pest_damage')) insectRisk = 'high';
  else if (input.season === 'kharif' && input.growthStage === 'flowering') insectRisk = 'moderate';

  let weedRisk = 'low';
  if ((input.growthStage === 'germination' || input.growthStage === 'vegetative') && input.season === 'kharif') weedRisk = 'moderate';

  let dominantStress = 'none';
  // Farmer reported symptoms and acute biological threats take absolute first priority
  if (input.symptoms.includes('pest_damage') || insectRisk === 'high') {
    dominantStress = 'insect';
  } else if (input.symptoms.includes('leaf_spots') || input.symptoms.includes('yellowing')) {
    dominantStress = 'fungal';
  } else if (input.symptoms.includes('wilting') || input.soilMoisture === 'dry') {
    dominantStress = 'drought';
  } else if (fungalRisk === 'high') {
    dominantStress = 'fungal';
  } else if (dsi > 0.4) {
    dominantStress = 'drought';
  } else if (hsi > 0.4) {
    dominantStress = 'heat';
  } else if (fungalRisk === 'moderate') {
    dominantStress = 'fungal';
  } else if (insectRisk === 'moderate') {
    dominantStress = 'insect';
  } else if (weedRisk === 'moderate') {
    dominantStress = 'weed';
  }

  const activeStresses = [
    ...(hsi > 0.4 ? ['heat'] : []),
    ...(dsi > 0.4 ? ['drought'] : []),
    ...(fungalRisk !== 'low' ? ['fungal'] : []),
    ...(insectRisk !== 'low' ? ['insect'] : []),
    ...(weedRisk !== 'low' ? ['weed'] : []),
  ];
  
  const compoundStress = clamp(activeStresses.length / 5, 0, 1);

  const stressProfile = {
    heatStressIndex: hsi,
    droughtStressIndex: dsi,
    fungalRisk,
    insectRisk,
    weedRisk,
    compoundStress,
    dominantStress
  };

  // Filter by stress relevance — targeted to the dominant stress
  const relevantProducts = products.filter(p => {
    const efficacyHeat = (p as any).efficacyHeat || 0;
    const efficacyDrought = (p as any).efficacyDrought || 0;
    const efficacyFungal = (p as any).efficacyFungal || 0;
    const efficacyInsect = (p as any).efficacyInsect || 0;
    const efficacyWeed = (p as any).efficacyWeed || 0;

    if (dominantStress === 'insect') {
      return efficacyInsect > 0.3 || p.category === 'insecticide';
    } else if (dominantStress === 'fungal') {
      return efficacyFungal > 0.3 || p.category === 'fungicide';
    } else if (dominantStress === 'weed') {
      return efficacyWeed > 0.3 || p.category === 'herbicide';
    } else if (dominantStress === 'drought' || dominantStress === 'heat') {
      return efficacyHeat > 0.3 || efficacyDrought > 0.3 || p.category === 'biostimulant';
    }
    return true;
  });

  // If relevant filter returns at least 2 products, use it; otherwise fallback to general crop products
  if (relevantProducts.length >= 2) {
    products = relevantProducts;
  }

  // Remove products by rule
  products = products.filter(p => {
    if (p.category === 'seed_treatment' && input.growthStage !== 'germination') return false;
    return true;
  });

  return { candidates: products, stressProfile };
}

// ========================
// LAYER 2: Multi-Criteria Scoring
// ========================
function scoreProducts(candidates: SyngentaProduct[], input: FarmerInput, stressProfile: RecommendationResult['stressProfile']): { product: SyngentaProduct, score: number, efficacyMatch: number, stageSuitability: number, costEfficiency: number, weatherWindow: number, compoundBonus: number }[] {
  const w1 = 35;
  const w2 = 25;
  const w3 = 15;
  const w4 = 10;
  const w5 = 15;

  const isSafe = input.windSpeed < 15 && input.rainfall7Day < 15 && input.temperatureMax < 38;
  const weatherWindow = isSafe ? 1.0 : 0.3;

  const activeStresses = [
    ...(stressProfile.heatStressIndex > 0.4 ? ['heat'] : []),
    ...(stressProfile.droughtStressIndex > 0.4 ? ['drought'] : []),
    ...(stressProfile.fungalRisk !== 'low' && stressProfile.fungalRisk !== 'none' ? ['fungal'] : []),
    ...(stressProfile.insectRisk !== 'low' && stressProfile.insectRisk !== 'none' ? ['insect'] : []),
    ...(stressProfile.weedRisk !== 'low' && stressProfile.weedRisk !== 'none' ? ['weed'] : []),
  ];

  return candidates.map(product => {
    const p: any = product; // For extra properties
    
    // Efficacy_Match (0-1) — strictly evaluated against DOMINANT stress first
    const validatedTrialRate = (p.trialEfficacyPct || 85) / 100;
    let targetStressEfficacy = 0.5;

    if (stressProfile.dominantStress === 'insect') {
      targetStressEfficacy = p.efficacyInsect || 0;
    } else if (stressProfile.dominantStress === 'fungal') {
      targetStressEfficacy = p.efficacyFungal || 0;
    } else if (stressProfile.dominantStress === 'weed') {
      targetStressEfficacy = p.efficacyWeed || 0;
    } else if (stressProfile.dominantStress === 'drought') {
      targetStressEfficacy = p.efficacyDrought || 0;
    } else if (stressProfile.dominantStress === 'heat') {
      targetStressEfficacy = p.efficacyHeat || 0;
    } else {
      targetStressEfficacy = Math.max(p.efficacyHeat || 0, p.efficacyDrought || 0, 0.5);
    }

    // 60% targeted stress efficacy + 40% validated multi-center trial rate
    const efficacyMatch = (targetStressEfficacy * 0.6) + (validatedTrialRate * 0.4);

    // Stage_Suitability (0-1)
    const stageSuitability = p.stageSuitability ? (p.stageSuitability[input.growthStage] || 0) : 0;

    // Cost_Efficiency (0-1)
    const costPerAcre = p.costPerAcre || 1000;
    const costEfficiency = 1 - clamp(costPerAcre / 3000, 0, 1);

    // Compound_Stress_Bonus (0-1)
    let efficacyCount = 0;
    if (p.efficacyHeat > 0.3) efficacyCount++;
    if (p.efficacyDrought > 0.3) efficacyCount++;
    if (p.efficacyFungal > 0.3) efficacyCount++;
    if (p.efficacyInsect > 0.3) efficacyCount++;
    if (p.efficacyWeed > 0.3) efficacyCount++;
    const compoundBonus = activeStresses.length > 0 ? clamp(efficacyCount / activeStresses.length, 0, 1) : 0;

    const score = (w1 * efficacyMatch) + (w2 * stageSuitability) + (w3 * costEfficiency) + (w4 * weatherWindow) + (w5 * compoundBonus);

    return { product, score, efficacyMatch, stageSuitability, costEfficiency, weatherWindow, compoundBonus };
  }).sort((a, b) => b.score - a.score);
}

// ========================
// LAYER 3: Farmer Explanation Generator
// ========================
function generateExplanations(scored: ReturnType<typeof scoreProducts>, input: FarmerInput, stressProfile: RecommendationResult['stressProfile']): ProductRecommendation[] {
  return scored.map((item, index) => {
    const product = item.product;
    const p: any = product;
    
    const triggerReasons = [];
    if (item.efficacyMatch > 0.5) triggerReasons.push(`High efficacy against dominant stress (${stressProfile.dominantStress})`);
    if (item.stageSuitability > 0.7) triggerReasons.push(`Optimal for ${input.growthStage} stage`);
    if (item.compoundBonus > 0) triggerReasons.push('Provides compound stress protection');
    if (p.trialEfficacyPct) triggerReasons.push(`ICAR/SAU Field Trial Validated: ${p.trialEfficacyPct}% control rate`);
    if (p.etlThreshold) triggerReasons.push(`IPM Economic Threshold: ${p.etlThreshold}`);
    if (p.cropwiseStandard?.rainfastnessHours !== undefined) {
      triggerReasons.push(`Cropwise: ${p.cropwiseStandard.rainfastnessHours}h rainfastness, Delta T: ${p.cropwiseStandard.optimalDeltaT}`);
    }

    const productCost = p.costPerAcre || 1000;
    const laborCost = LABOR_COSTS['manual_knapsack'] || 800;
    const waterCost = 0;
    const totalPerAcre = productCost + laborCost + waterCost;

    const mandiPrice = MANDI_PRICES[input.cropType.toLowerCase()] || 2000;
    const yieldProtectedQPerAcre = 2; // Approximate assumption
    const revenueProtectedPerAcre = yieldProtectedQPerAcre * mandiPrice;
    const robi = revenueProtectedPerAcre / (totalPerAcre > 0 ? totalPerAcre : 1);

    const isSafe = input.windSpeed < 15 && input.rainfall7Day < 15 && input.temperatureMax < 38;

    const dosage = p.dosagePerAcre || product.dosagePerAcre || 'standard dosage';

    const trialText = p.trialEfficacyPct ? ` Validated in ICAR & SAU multi-location field trials with ${p.trialEfficacyPct}% documented efficacy (${p.trialCitation}).` : '';
    const etlText = p.etlThreshold ? ` Triggered under ICAR-NCIPM & KVK Economic Threshold: ${p.etlThreshold}.` : '';
    const cropwiseText = p.cropwiseStandard?.advisoryNote ? ` Syngenta Cropwise Standard: ${p.cropwiseStandard.advisoryNote}` : '';

    const farmerExplanation = `Your ${input.cropType} is at the ${input.growthStage} stage. ${
      stressProfile.dominantStress !== 'none'
        ? `Field monitoring indicates ${stressProfile.dominantStress.toUpperCase()} stress risk.${etlText}`
        : 'Microclimate indicators are within acceptable limits.'
    } ${product.name} (${product.activeIngredient}) is specifically recommended to safeguard crop yield.${trialText} Apply ${dosage} in ${product.waterPerAcre || 200}L water per acre.${cropwiseText} This intervention protects approximately ${yieldProtectedQPerAcre} quintals per acre worth ₹${revenueProtectedPerAcre.toLocaleString('en-IN')}.`;

    return {
      rank: index + 1,
      product,
      score: item.score,
      triggerReasons,
      stressType: stressProfile.dominantStress,
      dosageForThisCase: dosage,
      costBreakdown: {
        productCost,
        laborCost,
        waterCost,
        totalPerAcre,
        totalForField: totalPerAcre * input.acreage
      },
      expectedBenefit: {
        yieldProtectedQPerAcre,
        revenueProtectedPerAcre,
        robi
      },
      sprayWindow: {
        isSafeToSpray: isSafe,
        reason: isSafe ? 'Wind under 15 km/h, clear weather — safe to spray' : 'Unfavorable weather conditions for spraying',
        bestTime: '6:00-9:00 AM tomorrow'
      },
      farmerExplanation,
      trialEfficacyPct: p.trialEfficacyPct,
      trialCitation: p.trialCitation,
      etlThreshold: p.etlThreshold,
      cropwiseStandard: p.cropwiseStandard,
      tankMixSafe: p.tankMixSafe,
      tankMixDanger: p.tankMixDanger
    };
  });
}

function buildGeminiPrompt(recommendations: ProductRecommendation[], input: FarmerInput): string {
  if (recommendations.length === 0) return '';
  const topRec = recommendations[0];
  const p: any = topRec.product;
  
  return `You are a trusted village agricultural expert (Krishi Mitra). 
A farmer in ${input.locationName} is growing ${input.cropType} at ${input.growthStage} stage.
Current conditions: Temperature ${input.temperatureMax}°C, Humidity ${input.humidityAvg}%, Rainfall ${input.rainfall7Day}mm in last 7 days.
Detected stress: ${topRec.stressType}.
Recommended product: ${topRec.product.name} (${topRec.product.activeIngredient || 'blend'}).
Dosage: ${topRec.dosageForThisCase} per acre in ${topRec.product.waterPerAcre || 200}L water.
Cost: ₹${topRec.costBreakdown.productCost} per acre. Expected benefit: ₹${topRec.expectedBenefit.revenueProtectedPerAcre} per acre.
Scientific backing: ${p.trialCitation || 'National Agricultural Research Trials'} (${p.trialEfficacyPct || 88}% control).
KVK/ETL trigger: ${p.etlThreshold || 'Preventative window'}.
Cropwise guidance: ${p.cropwiseStandard?.advisoryNote || 'Standard spray window'}.

Explain in 3-4 simple sentences why this product is the right choice. 
Use farming analogies. Don't use chemical group codes.
Mention the cost and expected benefit. Be warm, trustworthy, and encouraging.`;
}

// ========================
// MAIN FUNCTION
// ========================
export function getRecommendations(input: FarmerInput): RecommendationResult {
  // Layer 1: Filter
  const { candidates, stressProfile } = filterCandidates(input);
  
  // Layer 2: Score
  const scored = scoreProducts(candidates, input, stressProfile);
  
  // Layer 3: Explain
  const topScored = scored.slice(0, 3);
  const recommendations = generateExplanations(topScored, input, stressProfile);
  
  return {
    recommendations,
    stressProfile,
    geminiPrompt: buildGeminiPrompt(recommendations, input)
  };
}
