"use client";

/**
 * AASRA Google Neural Human Voice Engine & Speech Synthesis
 * - Streams natural high-fidelity Indian human voices from Google TTS
 * - Dynamic voice selector matching Google Neural & Microsoft Natural Speech synthesis
 * - Clean phoneme preprocessing to ensure warm, empathetic, and natural speech without robotic pauses
 */

import { fetchGoogleTTSAudio } from "@/lib/api";

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  langCode: string;
  name: string;
  isGoogle: boolean;
}

export const BCP47_MAP: Record<string, { code: string; fallbackCodes: string[]; defaultName: string }> = {
  hi: { code: "hi-IN", fallbackCodes: ["hi_IN", "hi"], defaultName: "Google हिन्दी (Female)" },
  en: { code: "en-IN", fallbackCodes: ["en_IN", "en-US", "en-GB"], defaultName: "Google English (India)" },
  mr: { code: "mr-IN", fallbackCodes: ["mr_IN", "mr", "hi-IN"], defaultName: "Google मराठी (Female)" },
  pa: { code: "pa-IN", fallbackCodes: ["pa_IN", "pa", "hi-IN"], defaultName: "Google ਪੰਜਾਬੀ (Female)" },
  gu: { code: "gu-IN", fallbackCodes: ["gu_IN", "gu", "hi-IN"], defaultName: "Google ગુજરાતી (Female)" },
  te: { code: "te-IN", fallbackCodes: ["te_IN", "te", "en-IN"], defaultName: "Google తెలుగు (Female)" },
  ta: { code: "ta-IN", fallbackCodes: ["ta_IN", "ta", "en-IN"], defaultName: "Google தமிழ் (Female)" },
  kn: { code: "kn-IN", fallbackCodes: ["kn_IN", "kn", "en-IN"], defaultName: "Google ಕನ್ನಡ (Female)" },
  ml: { code: "ml-IN", fallbackCodes: ["ml_IN", "ml", "en-IN"], defaultName: "Google മലയാളം (Female)" },
  bn: { code: "bn-IN", fallbackCodes: ["bn_IN", "bn", "hi-IN"], defaultName: "Google বাংলা (Female)" },
  or: { code: "or-IN", fallbackCodes: ["or_IN", "or", "hi-IN"], defaultName: "Google ଓଡ଼ିଆ (Female)" },
  as: { code: "as-IN", fallbackCodes: ["as-IN", "as", "bn-IN", "hi-IN"], defaultName: "Google অসমীয়া (Female)" },
};

let currentAudio: HTMLAudioElement | null = null;
let speechSynthesisTimer: any = null;

/**
 * Pre-clean text for natural, conversational human cadence:
 * - Removes markdown syntax, emojis, URL brackets, complex JSON fragments
 * - Expands or cleans technical symbols so speech sounds natural
 */
export function cleanTextForNaturalSpeech(rawText: string, langKey: string = "hi"): string {
  if (!rawText) return "";
  let clean = rawText
    .replace(/^\s*\{\s*"reply"\s*:\s*"/i, "")
    .replace(/"\s*,\s*"why_recommendation"[\s\S]*$/i, "")
    .replace(/["{}]/g, "")
    .replace(/[*_#`~🔴🟢🌾🌧️☀️🌤️⛅☁️🌫️🌦️⛈️❄️🌨️🌩️📌🎯💡⚡⚠️✅✕🛡️🏛️📍💧💨🌡️]/g, " ")
    .replace(/\(.*?\)/g, "") // Remove parenthetical technical notes
    .replace(/https?:\/\/\S+/g, "");

  if (langKey === "mr") {
    clean = clean
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
  } else if (langKey === "pa") {
    clean = clean
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
  } else if (langKey === "gu") {
    clean = clean
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
  } else if (langKey === "te") {
    clean = clean
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
  } else if (langKey === "ta") {
    clean = clean
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
  } else if (langKey === "kn") {
    clean = clean
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
  } else if (langKey === "ml") {
    clean = clean
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
  } else if (langKey === "bn") {
    clean = clean
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
  } else if (langKey === "or") {
    clean = clean
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
  } else if (langKey === "as") {
    clean = clean
      .replace(/₹\s*([0-9,]+)/g, "$1 টকা")
      .replace(/₹/g, " টকা ")
      .replace(/\/acre|\/ac\b/gi, " প্ৰতি একৰ ")
      .replace(/\/ha\b/gi, " প্ৰତି হেক্টৰ ")
      .replace(/\bml\b/gi, " মিলিলিটাৰ ")
      .replace(/\bkg\b/gi, " কিলোগ্ৰাম ")
      .replace(/\bq\b|\bquintal\b/gi, " কুইণ্টল ")
      .replace(/°C|°c/g, " ডিগ্ৰী চেলচিয়াছ ")
      .replace(/km\/h|kmph/gi, " কিলোমিটাৰ প্ৰতি ঘণ্টা ")
      .replace(/%/g, " শতাংশ ");
  } else if (langKey === "hi") {
    clean = clean
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
    clean = clean
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

  return clean.replace(/\s+/g, " ").trim();
}

/**
 * Play high-quality natural Google Neural MP3 Audio Stream from backend
 */
export async function playGoogleNeuralSpeech(
  text: string,
  langKey: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<boolean> {
  try {
    stopGoogleSpeech();
    const spokenText = cleanTextForNaturalSpeech(text, langKey);
    if (!spokenText) {
      if (options?.onEnd) options.onEnd();
      return false;
    }

    if (options?.onStart) options.onStart();

    // Call backend Google TTS streaming endpoint
    const res = await fetchGoogleTTSAudio(spokenText, langKey);
    if (res && res.status === "success" && res.audio_base64) {
      const audioUrl = `data:audio/mp3;base64,${res.audio_base64}`;
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.playbackRate = 1.0; // Natural, lively human conversational rate

      audio.onended = () => {
        currentAudio = null;
        if (options?.onEnd) options.onEnd();
      };
      audio.onerror = () => {
        currentAudio = null;
        speakBrowserSpeechFallback(spokenText, langKey, options);
      };

      await audio.play();
      return true;
    }
  } catch (err) {
    console.warn("Backend Google Neural audio failed, using browser fallback:", err);
  }

  // Fallback to browser synthesis if backend audio fetch fails
  return speakBrowserSpeechFallback(cleanTextForNaturalSpeech(text, langKey), langKey, options);
}

/**
 * Browser Speech Synthesis Fallback with Best Natural Voice Match
 */
export function speakBrowserSpeechFallback(
  text: string,
  langKey: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (options?.onError) options.onError("Web Speech API not supported");
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    if (speechSynthesisTimer) clearInterval(speechSynthesisTimer);

    const config = BCP47_MAP[langKey] || BCP47_MAP["hi"];
    const cleanedText = cleanTextForNaturalSpeech(text, langKey);

    if (!cleanedText) {
      if (options?.onEnd) options.onEnd();
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = config.code;
    utterance.rate = 1.0; // Humanized, comfortable conversational speed
    utterance.pitch = 1.0;

    // Pick highest quality Google Neural or Microsoft Natural voice
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices && availableVoices.length > 0) {
      const preferredVoice = availableVoices.find(
        (v) =>
          (v.lang.startsWith(config.code) || config.fallbackCodes.some((fc) => v.lang.includes(fc))) &&
          (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Neural"))
      ) || availableVoices.find((v) => v.lang.startsWith(config.code));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onstart = () => {
      if (options?.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (speechSynthesisTimer) clearInterval(speechSynthesisTimer);
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      if (speechSynthesisTimer) clearInterval(speechSynthesisTimer);
      console.warn("SpeechSynthesis error:", e);
      if (options?.onEnd) options.onEnd();
    };

    // Keep synthesis active in Chromium engines
    speechSynthesisTimer = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(speechSynthesisTimer);
      }
    }, 8000);

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.warn("Browser Speech Synthesis exception:", e);
    if (options?.onEnd) options.onEnd();
    return false;
  }
}

/**
 * Stop any playing Google Speech Audio
 */
export function stopGoogleSpeech() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (_) { }
    currentAudio = null;
  }
  if (speechSynthesisTimer) {
    clearInterval(speechSynthesisTimer);
    speechSynthesisTimer = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) { }
  }
}
