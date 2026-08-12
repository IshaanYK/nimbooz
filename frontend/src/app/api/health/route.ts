import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "AASRA",
    version: "1.0.0",
    demo_mode: false,
    meteoblue_configured: true,
    cehub_configured: true,
    gemini_configured: true,
  });
}
