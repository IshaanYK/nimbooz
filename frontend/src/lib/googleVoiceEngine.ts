"use client";

/**
 * AASRA Google Neural Female Voice Engine & Speech API Resilience
 * - Streams high-fidelity natural human female voice MP3 audio from backend Google TTS
 * - Web Speech API fallback for offline speech synthesis
 * - Handles long text chunking to prevent Chrome Web Speech API stalling
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

    if (options?.onStart) options.onStart();

    // Call backend Google TTS streaming endpoint
    const res = await fetchGoogleTTSAudio(text, langKey);
    if (res && res.status === "success" && res.audio_base64) {
      const audioUrl = `data:audio/mp3;base64,${res.audio_base64}`;
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onended = () => {
        currentAudio = null;
        if (options?.onEnd) options.onEnd();
      };
      audio.onerror = (e) => {
        currentAudio = null;
        speakBrowserSpeechFallback(text, langKey, options);
      };

      await audio.play();
      return true;
    }
  } catch (err) {
    console.warn("Backend Google Neural audio failed, using browser fallback:", err);
  }

  // Fallback to browser synthesis if backend audio fetch fails
  return speakBrowserSpeechFallback(text, langKey, options);
}

/**
 * Browser Speech Synthesis Fallback with chunking to prevent Chrome stalls
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
    const cleanedText = text.replace(/[*_#`~]/g, "").trim();

    if (!cleanedText) {
      if (options?.onEnd) options.onEnd();
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = config.code;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

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

    // Chrome bug workaround: keep synthesis active
    speechSynthesisTimer = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(speechSynthesisTimer);
      }
    }, 10000);

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
    } catch (_) {}
    currentAudio = null;
  }
  if (speechSynthesisTimer) {
    clearInterval(speechSynthesisTimer);
    speechSynthesisTimer = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
}
