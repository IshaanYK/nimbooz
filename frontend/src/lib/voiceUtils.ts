/**
 * AASRA Authentic Indian Female Voice Engine
 * Real human female voice synthesis configuration for Indian languages.
 */

export function findIndianFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Look specifically for Indian female voices
  for (const voice of voices) {
    const nameLower = voice.name.toLowerCase();
    const langLower = voice.lang.toLowerCase();

    const isIndian =
      langLower.includes("in") ||
      nameLower.includes("india") ||
      nameLower.includes("hindi") ||
      nameLower.includes("marathi");

    const isFemale =
      nameLower.includes("female") ||
      nameLower.includes("heera") ||
      nameLower.includes("swara") ||
      nameLower.includes("veena") ||
      nameLower.includes("kavya") ||
      nameLower.includes("priya") ||
      nameLower.includes("meera") ||
      nameLower.includes("kalpana") ||
      nameLower.includes("google हिन्दी") ||
      nameLower.includes("zira") ||
      nameLower.includes("samantha");

    if (isIndian && isFemale) {
      return voice;
    }
  }

  // Fallback 1: Any Indian voice
  const anyIndian = voices.find(
    (v) =>
      v.lang.toLowerCase().includes("in") ||
      v.name.toLowerCase().includes("india") ||
      v.name.toLowerCase().includes("hindi")
  );
  if (anyIndian) return anyIndian;

  // Fallback 2: Any female voice
  const anyFemale = voices.find(
    (v) =>
      v.name.toLowerCase().includes("female") ||
      v.name.toLowerCase().includes("zira") ||
      v.name.toLowerCase().includes("samantha") ||
      v.name.toLowerCase().includes("victoria")
  );
  return anyFemale || null;
}

export function speakIndianFemaleVoice(
  text: string,
  langCode: string = "hi",
  onStart?: () => void,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  const langMap: Record<string, string> = {
    hi: "hi-IN",
    mr: "mr-IN",
    pa: "pa-IN",
    gu: "gu-IN",
    te: "te-IN",
    ta: "ta-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    bn: "bn-IN",
    or: "or-IN",
    as: "as-IN",
    en: "en-IN",
  };

  utterance.lang = langMap[langCode] || "hi-IN";
  utterance.pitch = 1.18; // Warm, natural human female pitch
  utterance.rate = 0.92; // Natural, clear cadence

  const femaleVoice = findIndianFemaleVoice();
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}
