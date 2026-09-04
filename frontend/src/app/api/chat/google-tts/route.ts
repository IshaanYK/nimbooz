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
  or: "hi", // Odia phonetic fallback on backend audio; browser voice selector uses native or-IN
  as: "bn", // Assamese uses Eastern Nagari script identical to Bengali; fluent with bn
  en: "en",
};

/**
 * Humanize and normalize text for speech synthesis across all 12 Indian languages
 */
function normalizeTextForSpeech(text: string, lang: string): string {
  if (!text) return "";

  let cleaned = text
    .replace(/^\s*\{\s*"reply"\s*:\s*"/i, "")
    .replace(/"\s*,\s*"why_recommendation"[\s\S]*$/i, "")
    .replace(/["{}]/g, "")
    .replace(/[*_#`~🔴🟢🌾🌧️☀️🌤️⛅☁️🌫️🌦️⛈️❄️🌨️🌩️📌🎯💡⚡⚠️✅✕🛡️🏛️📍💧💨🌡️]/g, " ")
    .replace(/\(.*?\)/g, "") // Remove parenthetical technical codes
    .replace(/https?:\/\/\S+/g, "");

  if (lang === "mr") {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "$1 रुपये")
      .replace(/₹/g, " रुपये ")
      .replace(/\/acre|\/ac\b/gi, " प्रति एकर ")
      .replace(/\/ha\b/gi, " प्रति हेक्टर ")
      .replace(/\bml\b/gi, " मिलीलीटर ")
      .replace(/\bkg\b/gi, " किलोग्राम ")
      .replace(/\bq\b|\bquintal\b/gi, " क्विंटल ")
      .replace(/°C|°c/g, " अंश सेल्सिअस ")
      .replace(/km\/h|kmph/gi, " किलोमीटर प्रति तास ")
      .replace(/%/g, " टक्के ");
  } else if (lang === "pa") {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "$1 ਰੁਪਏ")
      .replace(/₹/g, " ਰੁਪਏ ")
      .replace(/\/acre|\/ac\b/gi, " ਪ੍ਰਤੀ ਏਕੜ ")
      .replace(/\/ha\b/gi, " ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ ")
      .replace(/\bml\b/gi, " ਮਿਲੀਲੀਟਰ ")
      .replace(/\bkg\b/gi, " ਕਿਲੋਗ੍ਰਾਮ ")
      .replace(/\bq\b|\bquintal\b/gi, " ਕੁਇੰਟਲ ")
      .replace(/°C|°c/g, " ਡਿਗਰੀ ਸੈਲਸੀਅਸ ")
      .replace(/km\/h|kmph/gi, " ਕਿਲੋਮੀਟਰ ਪ੍ਰਤੀ ਘੰਟਾ ")
      .replace(/%/g, " ਪ੍ਰਤੀਸ਼ਤ ");
  } else if (lang === "gu") {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "$1 રૂપિયા")
      .replace(/₹/g, " રૂપિયા ")
      .replace(/\/acre|\/ac\b/gi, " પ્રતિ એકર ")
      .replace(/\/ha\b/gi, " પ્રતિ હેક્ટર ")
      .replace(/\bml\b/gi, " મિલીલીટર ")
      .replace(/\bkg\b/gi, " કિલોગ્રામ ")
      .replace(/\bq\b|\bquintal\b/gi, " ક્વિન્ટલ ")
      .replace(/°C|°c/g, " ડિગ્રી સેલ્સિયસ ")
      .replace(/km\/h|kmph/gi, " કિલોમીટર પ્રતિ કલાક ")
      .replace(/%/g, " ટકા ");
  } else if (lang === "te") {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "$1 రూపాయలు")
      .replace(/₹/g, " రూపాయలు ")
      .replace(/\/acre|\/ac\b/gi, " ఎకరాకు ")
      .replace(/\/ha\b/gi, " హెక్టారుకు ")
      .replace(/\bml\b/gi, " మిల్లీలీటర్లు ")
      .replace(/\bkg\b/gi, " కిలోగ్రాములు ")
      .replace(/\bq\b|\bquintal\b/gi, " క్వింటాలు ")
      .replace(/°C|°c/g, " డిగ్రీ సెల్సియస్ ")
      .replace(/km\/h|kmph/gi, " కిలోమీటర్లు ప్రతి గంటకు ")
      .replace(/%/g, " శాతం ");
  } else if (lang === "ta") {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "$1 ரூபாய்")
      .replace(/₹/g, " ரூபாய் ")
      .replace(/\/acre|\/ac\b/gi, " ஏக்கருக்கு ")
      .replace(/\/ha\b/gi, " ஹெக்டேருக்கு ")
      .replace(/\bml\b/gi, " மில்லிலிட்டர் ")
      .replace(/\bkg\b/gi, " கிலோகிராம் ")
      .replace(/\bq\b|\bquintal\b/gi, " குவிண்டால் ")
      .replace(/°C|°c/g, " டிகிரி செல்சியஸ் ")
      .replace(/km\/h|kmph/gi, " கிமீ / மணி ")
      .replace(/%/g, " சதவீதம் ");
  } else if (lang === "kn") {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "$1 ರೂಪಾಯಿ")
      .replace(/₹/g, " ರೂಪಾಯಿ ")
      .replace(/\/acre|\/ac\b/gi, " ಎಕರೆಗೆ ")
      .replace(/\/ha\b/gi, " ಹೆಕ್ಟೇರಿಗೆ ")
      .replace(/\bml\b/gi, " ಮಿಲಿಲೀಟರ್ ")
      .replace(/\bkg\b/gi, " ಕಿಲೋಗ್ರಾಂ ")
      .replace(/\bq\b|\bquintal\b/gi, " ಕ್ವಿಂಟಾಲ್ ")
      .replace(/°C|°c/g, " ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್ ")
      .replace(/km\/h|kmph/gi, " ಕಿಮೀ ಪ್ರತಿ ಗಂಟೆಗೆ ")
      .replace(/%/g, " ಶೇಕಡಾ ");
  } else if (lang === "ml") {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "$1 രൂപ")
      .replace(/₹/g, " രൂപ ")
      .replace(/\/acre|\/ac\b/gi, " ഏക്കറിന് ")
      .replace(/\/ha\b/gi, " ഹെക്ടറിന് ")
      .replace(/\bml\b/gi, " മില്ലിലിറ്റർ ")
      .replace(/\bkg\b/gi, " കിലോഗ്രാം ")
      .replace(/\bq\b|\bquintal\b/gi, " ക്വിന്റൽ ")
      .replace(/°C|°c/g, " ഡിഗ്രി സെൽഷ്യസ് ")
      .replace(/km\/h|kmph/gi, " കിലോമീറ്റർ പ്രതി മണിക്കൂറിൽ ")
      .replace(/%/g, " ശതമാനം ");
  } else if (lang === "bn") {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "$1 টাকা")
      .replace(/₹/g, " টাকা ")
      .replace(/\/acre|\/ac\b/gi, " প্রতি একর ")
      .replace(/\/ha\b/gi, " প্রতি হেক্টর ")
      .replace(/\bml\b/gi, " মিলিলিটার ")
      .replace(/\bkg\b/gi, " কিলোগ্রাম ")
      .replace(/\bq\b|\bquintal\b/gi, " কুইন্টাল ")
      .replace(/°C|°c/g, " ডিগ্রি সেলসিয়াস ")
      .replace(/km\/h|kmph/gi, " কিলোমিটার প্রতি ঘণ্টা ")
      .replace(/%/g, " শতাংশ ");
  } else if (lang === "or") {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "$1 ଟଙ୍କା")
      .replace(/₹/g, " ଟଙ୍କା ")
      .replace(/\/acre|\/ac\b/gi, " ପ୍ରତି ଏକର ")
      .replace(/\/ha\b/gi, " ପ୍ରତି ହେକ୍ଟର ")
      .replace(/\bml\b/gi, " ମିଲିଲିଟର ")
      .replace(/\bkg\b/gi, " କିଲୋଗ୍ରାମ ")
      .replace(/\bq\b|\bquintal\b/gi, " କ୍ୱିଣ୍ଟାଲ ")
      .replace(/°C|°c/g, " ଡିଗ୍ରୀ ସେଲସିୟସ ")
      .replace(/km\/h|kmph/gi, " କିଲୋମିଟର ପ୍ରତି ଘଣ୍ଟା ")
      .replace(/%/g, " ପ୍ରତିଶତ ");
  } else if (lang === "as") {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "$1 টকা")
      .replace(/₹/g, " টকা ")
      .replace(/\/acre|\/ac\b/gi, " প্ৰতি একৰ ")
      .replace(/\/ha\b/gi, " প্ৰতি হেক্টৰ ")
      .replace(/\bml\b/gi, " মিলিলিটাৰ ")
      .replace(/\bkg\b/gi, " কিলোগ্ৰাম ")
      .replace(/\bq\b|\bquintal\b/gi, " কুইণ্টল ")
      .replace(/°C|°c/g, " ডিগ্ৰী চেলচিয়াছ ")
      .replace(/km\/h|kmph/gi, " কিলোমিটাৰ প্ৰতি ঘণ্টা ")
      .replace(/%/g, " শতাংশ ");
  } else if (lang === "hi") {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "$1 रुपये")
      .replace(/₹/g, " रुपये ")
      .replace(/\/acre|\/ac\b/gi, " प्रति एकड़ ")
      .replace(/\/ha\b/gi, " प्रति हेक्टेयर ")
      .replace(/\bml\b/gi, " मिलीलीटर ")
      .replace(/\bkg\b/gi, " किलोग्राम ")
      .replace(/\bq\b|\bquintal\b/gi, " क्विंटल ")
      .replace(/°C|°c/g, " डिग्री सेल्सियस ")
      .replace(/km\/h|kmph/gi, " किलोमीटर प्रति घंटा ")
      .replace(/%/g, " प्रतिशत ");
  } else {
    cleaned = cleaned
      .replace(/₹\s*([0-9,]+)/g, "rupees $1")
      .replace(/₹/g, "rupees ")
      .replace(/@\s*/g, "at ")
      .replace(/\/acre|\/ac\b/gi, " per acre ")
      .replace(/\/ha\b/gi, " per hectare ")
      .replace(/\bml\b/gi, " millilitres ")
      .replace(/\bkg\b/gi, " kilograms ")
      .replace(/\bq\b|\bquintal\b/gi, " quintals ")
      .replace(/°C|°c/g, " degrees Celsius ")
      .replace(/km\/h|kmph/gi, " kilometers per hour ")
      .replace(/%/g, " percent ");
  }

  return cleaned.replace(/\s+/g, " ").trim();
}

/**
 * Split text into natural sentence / phrase chunks (< 175 characters each)
 * to respect Google translate_tts URL query limits and prevent cutoffs.
 */
function splitIntoTtsChunks(text: string, maxLen: number = 170): string[] {
  // Split on punctuation: purna viram (।), full stop (.), exclamation (!), question mark (?), newlines
  const rawSegments = text.split(/(?<=[।.!?\n])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const seg of rawSegments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    if ((currentChunk + " " + trimmed).trim().length <= maxLen) {
      currentChunk = (currentChunk + " " + trimmed).trim();
    } else {
      if (currentChunk) chunks.push(currentChunk);

      if (trimmed.length <= maxLen) {
        currentChunk = trimmed;
      } else {
        // Break on comma, semicolon, or dash
        const subParts = trimmed.split(/(?<=[,;:\-])\s+/);
        let subCurrent = "";
        for (const part of subParts) {
          if ((subCurrent + " " + part).trim().length <= maxLen) {
            subCurrent = (subCurrent + " " + part).trim();
          } else {
            if (subCurrent) chunks.push(subCurrent);
            if (part.length <= maxLen) {
              subCurrent = part;
            } else {
              // Word boundary split
              const words = part.split(/\s+/);
              for (const w of words) {
                if ((subCurrent + " " + w).trim().length <= maxLen) {
                  subCurrent = (subCurrent + " " + w).trim();
                } else {
                  if (subCurrent) chunks.push(subCurrent);
                  subCurrent = w;
                }
              }
            }
          }
        }
        currentChunk = subCurrent;
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  // Cap at 8 chunks (~1200 characters) to ensure low latency and high quality
  return chunks.slice(0, 8);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text = "", language = "hi" } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ status: "error", message: "No text provided" }, { status: 400 });
    }

    const ttsLang = GOOGLE_TTS_LANG_MAP[language] || "hi";
    const cleanedText = normalizeTextForSpeech(text, ttsLang);

    if (!cleanedText) {
      return NextResponse.json({ status: "error", message: "Cleaned text is empty" }, { status: 400 });
    }

    const chunks = splitIntoTtsChunks(cleanedText, 170);
    if (chunks.length === 0) {
      return NextResponse.json({ status: "fallback", audio_base64: null });
    }

    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    // Fetch audio chunks from Google TTS
    const fetchPromises = chunks.map(async (chunk) => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": userAgent },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`Google TTS HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    });

    const audioBuffers = await Promise.all(fetchPromises);

    if (audioBuffers.length > 0) {
      // Concatenate valid MP3 audio frames into a single continuous stream
      const combinedBuffer = Buffer.concat(audioBuffers);
      const base64Audio = combinedBuffer.toString("base64");

      return NextResponse.json({
        status: "success",
        audio_base64: base64Audio,
        language: ttsLang,
        provider: "Google Humanized Voice TTS Engine (Multi-Chunk Concatenated)",
        chunk_count: audioBuffers.length,
      });
    }
  } catch (err) {
    console.warn("[Google TTS API Route] Speech generation fallback triggered:", err);
  }

  return NextResponse.json({
    status: "fallback",
    audio_base64: null,
    message: "Using Web Speech API fallback",
  });
}
