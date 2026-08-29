import { NextRequest, NextResponse } from "next/server";

const GOOGLE_TTS_LANG_MAP: Record<string, string> = {
  hi: "hi",
  mr: "mr",
  pa: "pa",
  gu: "gu",
  te: "te",
  ta: "ta",
  kn: "kn",
  ml: "ml",
  bn: "bn",
  or: "or",
  as: "bn", // fallback for Assamese script audio
  en: "en",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text = "", language = "hi" } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ status: "error", message: "No text provided" }, { status: 400 });
    }

    // Clean text of markdown, symbols, and emojis
    const cleanedText = text
      .replace(/[*_#`~🔴🟢🌾🌧️☀️🌤️⛅☁️🌫️🌦️⛈️❄️🌨️🌩️📌🎯💡]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Truncate cleanly up to 800 characters to speak complete agronomic explanations
    const speechChunk = cleanedText.length > 800 ? cleanedText.slice(0, 795) + "..." : cleanedText;
    const ttsLang = GOOGLE_TTS_LANG_MAP[language] || "hi";

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(speechChunk)}`;

    const audioRes = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (audioRes.ok) {
      const arrayBuffer = await audioRes.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString("base64");

      return NextResponse.json({
        status: "success",
        audio_base64: base64Audio,
        language: ttsLang,
        provider: "Google Neural Voice TTS Engine (Server)",
      });
    }
  } catch (err) {
    console.warn("[Google TTS API Route] Speech generation error:", err);
  }

  return NextResponse.json({
    status: "fallback",
    audio_base64: null,
    message: "Using Web Speech API fallback",
  });
}
