/**
 * ASSARA AI Router Service
 * Routes queries between Fast (Flash Lite), Reasoning (Flash/Pro), and Vision models.
 * Injects verified farm context and enforces structured [ACTION, WHY, WHEN, CONFIDENCE, DATA] responses.
 */

export interface FarmDecisionContext {
  farmerName: string;
  farmName: string;
  location: {
    lat: number;
    lon: number;
    district: string;
    state: string;
  };
  areaAcres: number;
  crop: {
    name: string;
    variety?: string;
    ageDays: number;
    stage: string;
    sowingDate: string;
  };
  weather: {
    temp: number;
    nightTemp?: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    rainProb: number;
    description: string;
    updatedAt: string;
  };
  soil?: {
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    provenance: string;
  };
  market?: {
    modalPrice: number;
    mandi: string;
    updatedAt: string;
  };
  interventions?: Array<{
    date: string;
    action: string;
    product: string;
  }>;
}

export interface AIStructuredDecision {
  action: string;
  why: string;
  when: string;
  confidence: "High" | "Medium" | "Low";
  dataUsed: string[];
  clarificationRequired?: string;
}

export type QueryComplexity = "SIMPLE" | "COMPLEX" | "IMAGE" | "KNOWLEDGE";

/**
 * Classifies the incoming query to select the optimal model
 */
export function classifyQuery(message: string, hasImage: boolean): QueryComplexity {
  if (hasImage) return "IMAGE";
  const lower = message.toLowerCase();
  
  if (
    lower.includes("why") ||
    lower.includes("diagnose") ||
    lower.includes("disease") ||
    lower.includes("yellow") ||
    lower.includes("pest") ||
    lower.includes("compare") ||
    lower.includes("what if") ||
    lower.includes("calculate")
  ) {
    return "COMPLEX";
  }

  if (
    lower.includes("rate") ||
    lower.includes("price") ||
    lower.includes("weather") ||
    lower.includes("temperature") ||
    lower.includes("temp") ||
    lower.includes("wind") ||
    lower.includes("rain") ||
    lower.includes("humidity")
  ) {
    return "SIMPLE";
  }

  return "KNOWLEDGE";
}

/**
 * Build the grounded system prompt with verified farm facts
 */
export function buildGroundedSystemPrompt(context: FarmDecisionContext): string {
  return `You are ASSARA, an evidence-based agricultural decision-support engine.
Your sole job is to answer the farmer's question using their real farm data.

CRITICAL RULES:
1. ONLY USE THE PROVIDED FARM CONTEXT FACTS. Never invent numbers, fake temperatures, fake rates, or fake lab tests.
2. If the user asks a simple fact (e.g. "what is today's rate?", "current temperature?"), give the exact number immediately.
3. If giving an actionable recommendation, follow this structure:
   - ACTION: Clear directive of what to do.
   - WHY: Atmospheric & biological rationale (e.g. temperature, wind speed, rain risk).
   - WHEN: Precise time window (e.g. "Today between 4 PM and 7 PM", "Tomorrow morning").
   - CONFIDENCE: High / Medium / Low.
   - DATA: Specific parameters used (e.g. Open-Meteo 12 km/h wind, Agmarknet ₹4,850/qtl).
4. IF CRITICAL DATA IS MISSING to answer properly, DO NOT GUESS. Ask 1-2 targeted clarifying questions (e.g. "How old is the crop?", "Please upload a photo of the affected leaf").
5. Keep responses concise, direct, and actionable.

ACTIVE FARM CONTEXT:
- Farmer: ${context.farmerName || "Farmer"}
- Farm Plot: ${context.farmName} (${context.areaAcres} Acres)
- Location: ${context.location.district}, ${context.location.state} (${context.location.lat.toFixed(4)}°N, ${context.location.lon.toFixed(4)}°E)
- Crop: ${context.crop.name} (${context.crop.variety || "Standard"}) | Sown: ${context.crop.sowingDate} (${context.crop.ageDays} Days Old) | Stage: ${context.crop.stage}
- Current Weather (${context.weather.updatedAt}): ${context.weather.temp}°C (Night: ${context.weather.nightTemp ?? context.weather.temp}°C) | Humidity: ${context.weather.humidity}% | Wind: ${context.weather.windSpeed} km/h | Rain Prob: ${context.weather.rainProb}% | ${context.weather.description}
- Soil: pH ${context.soil?.ph ?? "N/A"}, N: ${context.soil?.nitrogen ?? "N/A"}, P: ${context.soil?.phosphorus ?? "N/A"}, K: ${context.soil?.potassium ?? "N/A"} (${context.soil?.provenance || "No Soil Test"})
- Market APMC Rate: ₹${context.market?.modalPrice || "Unavailable"}/quintal (${context.market?.mandi || "Local Mandi"})
- Past Interventions: ${context.interventions && context.interventions.length > 0 ? context.interventions.map(i => `${i.date}: ${i.action} (${i.product})`).join(", ") : "None recorded"}`;
}
