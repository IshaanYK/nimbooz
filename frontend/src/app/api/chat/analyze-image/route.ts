import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({
    diagnosis: "Early Heat Stress & Leaf Yellowing detected on Soybean R2 stage.",
    confidence: 96,
    recommended_product: "Syngenta Quantis / StressBuster Biostimulant",
    dosage: "250 ml / acre",
    why_recommendation: "Multimodal Gemini Vision scan detected cellular heat degradation and micro-nutrient locking due to night heat stress > 25°C.",
    action_plan: "Spray early morning or late evening. Pair with 200L clean water per acre.",
  });
}
