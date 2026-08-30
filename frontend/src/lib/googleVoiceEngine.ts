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
export function cleanTextForNaturalSpeech(rawText: string): string {
  if (!rawText) return "";
  let clean = rawText
    .replace(/^\s*\{\s*"reply"\s*:\s*"/i, "")
    .replace(/"\s*,\s*"why_recommendation"[\s\S]*$/i, "")
    .replace(/["{}]/g, "")
    .replace(/[*_#`~🔴🟢🌾🌧️☀️🌤️⛅☁️🌫️🌦️⛈️❄️🌨️🌩️📌🎯💡⚡⚠️✅✕]/g, "")
    .replace(/\(.*?\)/g, "") // Remove parenthetical technical notes
    .replace(/₹/g, "rupees ")
    .replace(/@/g, "at ")
    .replace(/\/acre/g, " per acre")
    .replace(/\/ac/g, " per acre")
    .replace(/\/ha/g, " per hectare")
    .replace(/\bml\b/gi, "millilitres")
    .replace(/\bq\b/gi, "quintals")
    .replace(/\s+/g, " ")
    .trim();

  return clean;
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
    const spokenText = cleanTextForNaturalSpeech(text);
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
  return speakBrowserSpeechFallback(cleanTextForNaturalSpeech(text), langKey, options);
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
    const cleanedText = cleanTextForNaturalSpeech(text);

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
