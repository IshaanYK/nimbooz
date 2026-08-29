import { NextRequest, NextResponse } from "next/server";
import { executeGoogleGeminiPrompt } from "@/lib/geminiEngine";

export async function POST(req: NextRequest) {
  try {
    const { text = "" } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({
        status: "success",
        parsed_context: { growth_stage: "Vegetative", symptoms: "None", soil_moisture: "Optimal" },
        debug_message: "Default parameters applied",
      });
    }

    // Try Gemini AI Context Extraction
    const prompt = `Extract agricultural parameters from the following farmer note:
"${text}"

Return strictly JSON with keys:
- "growth_stage": one of ["Seedling", "Vegetative", "Flowering", "Fruiting", "Maturity"]
- "symptoms": string describing leaf/crop symptoms or "None"
- "soil_moisture": one of ["Dry", "Optimal", "Waterlogged"]

JSON format only.`;

    try {
      const geminiResult = await executeGoogleGeminiPrompt(
        prompt,
        "You are an agronomic entity extraction model. Return strictly JSON."
      );
      if (geminiResult && geminiResult.data && typeof geminiResult.data === "object") {
        return NextResponse.json({
          status: "success",
          parsed_context: geminiResult.data,
          debug_message: "Extracted via Google Gemini 2.5 Flash",
        });
      }
    } catch (e) {
      console.warn("Gemini intent parsing fallback:", e);
    }

    // Heuristic Fallback
    const t = text.toLowerCase();
    const parsed = { growth_stage: "Vegetative", symptoms: "None", soil_moisture: "Optimal" };

    if (t.includes("flower") || t.includes("bloom") || t.includes("फूल") || t.includes("कली")) parsed.growth_stage = "Flowering";
    else if (t.includes("fruit") || t.includes("pod") || t.includes("फल") || t.includes("फली") || t.includes("दाना")) parsed.growth_stage = "Fruiting";
    else if (t.includes("seed") || t.includes("sprout") || t.includes("अंकुरण") || t.includes("बुवाई")) parsed.growth_stage = "Seedling";

    if (t.includes("wilt") || t.includes("droop") || t.includes("मुरझा") || t.includes("झुलस")) parsed.symptoms = "Wilting & Heat Scorch";
    else if (t.includes("yellow") || t.includes("pale") || t.includes("पीला") || t.includes("क्लोरोसिस")) parsed.symptoms = "Yellowing / Chlorosis";
    else if (t.includes("stunt") || t.includes("slow") || t.includes("रुकी")) parsed.symptoms = "Growth Stunting";
    else if (t.includes("keeda") || t.includes("pest") || t.includes("कीड़ा") || t.includes("इल्ली")) parsed.symptoms = "Foliar Pest / Caterpillar";

    if (t.includes("dry") || t.includes("crack") || t.includes("सूखा") || t.includes("no rain")) parsed.soil_moisture = "Dry";
    else if (t.includes("wet") || t.includes("waterlog") || t.includes("flood") || t.includes("जलभराव") || t.includes("पानी भरा")) parsed.soil_moisture = "Waterlogged";

    return NextResponse.json({
      status: "success",
      parsed_context: parsed,
      debug_message: "Parsed via Semantic Intent Parser",
    });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
