import { NextRequest, NextResponse } from "next/server";
import { getRegionalCrops, MASTER_CROPS } from "@/lib/cropRegistry";
import { executeGoogleGeminiPrompt, extractAndParseJson } from "@/lib/geminiEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const district = searchParams.get("district") || "";
  const state = searchParams.get("state") || "";
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const regionalCrops = getRegionalCrops(district, state);

  // If district or state specified, we can also use Gemini to discover hyper-local specialized commercial crops
  if (district && district.length > 2 && district !== "Local District") {
    try {
      const prompt = `You are AASRA Agronomic Intelligence Engine for India.
Identify top 8 agricultural and horticulture crops actively grown by farmers in ${district}, ${state || "India"} (Coordinates: ${lat || "N/A"}, ${lon || "N/A"}).
Include both traditional field crops and high-value cash/horticulture crops native to this district.

Return ONLY a valid JSON array matching this exact schema:
[
  {
    "id": "crop_identifier_slug",
    "name": "Crop Name (हिंदी नाम)",
    "nameHi": "हिंदी नाम",
    "category": "cereal" | "pulse" | "oilseed" | "cash_crop" | "vegetable" | "spice" | "horticulture" | "plantation",
    "defaultVariety": "Common Popular Variety in this district",
    "stage": "Typical Current Season Growth Stage",
    "mspPrice": 3500,
    "t_opt_day": 28,
    "t_limit_day": 38,
    "t_opt_night": 20,
    "t_limit_night": 28,
    "t_frost": 2,
    "t_base_gdd": 10,
    "season": "Kharif" | "Rabi" | "Zaid" | "Year-Round",
    "primaryStates": ["${state || "India"}"]
  }
]`;

      const aiRes = await executeGoogleGeminiPrompt(
        prompt,
        "You are an expert Indian ICAR agronomist. Output ONLY valid JSON array."
      );

      if (aiRes && aiRes.reply) {
        const parsed = extractAndParseJson(aiRes.reply);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          // Merge with master crops avoiding duplicates
          const seen = new Set(parsed.map((p: any) => p.id?.toLowerCase()));
          const combined = [
            ...parsed,
            ...regionalCrops.filter((rc) => !seen.has(rc.id.toLowerCase())),
          ];
          return NextResponse.json({
            success: true,
            crops: combined,
            source: `ICAR / Gemini Dynamic Agro-Climatic Intelligence for ${district}`,
          });
        }
      }
    } catch (e) {
      console.warn("Regional crop AI discovery fallback to registry:", e);
    }
  }

  return NextResponse.json({
    success: true,
    crops: regionalCrops,
    source: `AASRA Master Agro-Climatic Registry (${district || state || "All India"})`,
  });
}
