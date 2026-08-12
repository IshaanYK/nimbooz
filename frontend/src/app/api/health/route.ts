import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "AASRA",
    version: "1.0.0",
    // Accurately report which env vars are configured
    demo_mode: !process.env.METEOBLUE_API_KEY,
    meteoblue_configured: !!process.env.METEOBLUE_API_KEY,
    cehub_configured: !!process.env.CEHUB_API_KEY,
    gemini_configured: !!process.env.GOOGLE_API_KEY,
  });
}
