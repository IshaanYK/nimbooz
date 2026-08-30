import { NextRequest, NextResponse } from "next/server";
import { executeGoogleGeminiPrompt, extractAndParseJson, executeGoogleGeminiVisionPrompt } from "@/lib/geminiEngine";
import { resolveCropThresholds } from "@/lib/cropRegistry";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cropName = "",
      imageBase64 = null,
      district = "Local Region",
      state = "India",
      soilType = "Alluvial / Black Clay",
    } = body;

    // 1. If Image is provided -> Multimodal Crop & Variety Detection
    if (imageBase64) {
      const visionPrompt = `You are AASRA AI Vision Agronomist for Indian agriculture.
Analyze this crop plant or leaf photo.
1. Identify the exact crop name (English and Hindi).
2. Identify likely crop variety or growth stage.
3. Assess disease symptoms, leaf thermal scorch, or pest pressure if visible.
4. Provide optimal temperature range, base GDD, and current Indian market MSP benchmark.

Location context: ${district}, ${state}, Soil: ${soilType}.

Return ONLY valid JSON matching this schema:
{
  "detectedCrop": "Crop Name in English",
  "detectedCropHi": "हिंदी में फसल का नाम",
  "category": "cereal" | "pulse" | "oilseed" | "cash_crop" | "vegetable" | "spice" | "horticulture" | "plantation",
  "variety": "Suggested Variety",
  "growthStage": "Observed Growth Stage",
  "healthCondition": "Healthy | Moderate Stress | Critical Disease",
  "t_opt_day": 28,
  "t_limit_day": 38,
  "t_opt_night": 20,
  "t_limit_night": 28,
  "t_frost": 2,
  "t_base_gdd": 10,
  "mspEstimate": 3500,
  "recommendedAction": "Actionable agronomic advice in 1 sentence"
}`;

      try {
        const visionRes = await executeGoogleGeminiVisionPrompt(
          imageBase64,
          visionPrompt,
          "You are an expert AI Crop Vision detector. Return ONLY valid JSON."
        );

        if (visionRes && visionRes.reply) {
          const parsed = extractAndParseJson(visionRes.reply);
          if (parsed && parsed.detectedCrop) {
            return NextResponse.json({
              success: true,
              detection: parsed,
              source: "Google Gemini 2.5 Flash Vision Multimodal Detector",
            });
          }
        }
      } catch (err) {
        console.warn("Vision crop detection fallback:", err);
      }
    }

    // 2. Text-based Dynamic Crop Agronomic Profiler
    if (cropName && cropName.trim()) {
      const standard = resolveCropThresholds(cropName);

      try {
        const prompt = `You are AASRA AI Agronomic Profiler.
Provide detailed scientific agronomic parameters for the crop: "${cropName}" when grown in ${district}, ${state} (Soil: ${soilType}).

Return ONLY valid JSON:
{
  "detectedCrop": "${cropName}",
  "detectedCropHi": "हिंदी नाम",
  "category": "${standard.category}",
  "variety": "${standard.defaultVariety}",
  "growthStage": "${standard.stage}",
  "healthCondition": "Healthy",
  "t_opt_day": ${standard.t_opt_day},
  "t_limit_day": ${standard.t_limit_day},
  "t_opt_night": ${standard.t_opt_night},
  "t_limit_night": ${standard.t_limit_night},
  "t_frost": ${standard.t_frost},
  "t_base_gdd": ${standard.t_base_gdd},
  "mspEstimate": ${standard.mspPrice || 3200},
  "season": "${standard.season}",
  "recommendedAction": "Agronomic recommendation tailored to ${district}"
}`;

        const aiRes = await executeGoogleGeminiPrompt(
          prompt,
          "You are an agronomist. Return ONLY valid JSON."
        );

        if (aiRes && aiRes.reply) {
          const parsed = extractAndParseJson(aiRes.reply);
          if (parsed && parsed.detectedCrop) {
            return NextResponse.json({
              success: true,
              detection: parsed,
              source: "AASRA AI Agronomic Engine",
            });
          }
        }
      } catch (_) {}

      return NextResponse.json({
        success: true,
        detection: {
          detectedCrop: standard.name,
          detectedCropHi: standard.nameHi,
          category: standard.category,
          variety: standard.defaultVariety,
          growthStage: standard.stage,
          healthCondition: "Healthy",
          t_opt_day: standard.t_opt_day,
          t_limit_day: standard.t_limit_day,
          t_opt_night: standard.t_opt_night,
          t_limit_night: standard.t_limit_night,
          t_frost: standard.t_frost,
          t_base_gdd: standard.t_base_gdd,
          mspEstimate: standard.mspPrice || 3200,
          season: standard.season,
          recommendedAction: `Optimal growing temperature is ${standard.t_opt_day}°C day / ${standard.t_opt_night}°C night.`,
        },
        source: "AASRA Master Crop Database",
      });
    }

    return NextResponse.json({
      success: false,
      error: "Please provide either cropName or imageBase64",
    }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || "Crop detection failed",
    }, { status: 500 });
  }
}
