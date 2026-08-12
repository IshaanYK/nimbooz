import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text = "नमस्कार किसान भाई", language = "hi" } = body;

  return NextResponse.json({
    audio_content: null,
    text,
    language,
    provider: "Google Chirp 3 HD Voice (Vercel)",
    message: "Web Speech API fallback enabled for client playback",
  });
}
