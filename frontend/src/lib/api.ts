/**
 * AASRA API Client
 * Routes to Next.js API routes (/api) on Vercel, or FastAPI backend on local dev.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function fetchCurrentWeather(lat: number, lon: number, crop: string) {
  try {
    const res = await fetch(`${API_BASE}/weather/current?lat=${lat}&lon=${lon}&crop=${crop}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend weather API unreachable:", err);
    return null;
  }
}

export async function sendChatMessage(
  message: string,
  lat: number,
  lon: number,
  crop: string,
  language: string,
  location?: string,
  night_temp?: number | null
) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, lat, lon, crop, language, location, night_temp }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend chat API error:", err);
    return null;
  }
}

export async function saveFieldToBackend(fieldData: any) {
  try {
    const res = await fetch(`${API_BASE}/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fieldData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Save field backend error:", err);
    return null;
  }
}

export async function fetchFieldsFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/fields`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Fetch fields backend error:", err);
    return null;
  }
}

export async function fetchJournalEntries() {
  try {
    const res = await fetch(`${API_BASE}/journal`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Fetch journal entries error:", err);
    return [];
  }
}

export async function addJournalEntry(entry: any) {
  try {
    const res = await fetch(`${API_BASE}/journal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Add journal entry error:", err);
    return null;
  }
}

export async function fetchApiStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Fetch API status error:", err);
    return { status: "degraded", message: "API server offline or using Vercel serverless fallbacks" };
  }
}

export async function checkBackendHealth() {
  return fetchApiStatus();
}

export async function transcribeSpeechSaaras(audioBlob: Blob, languageCode: string = "hi-IN") {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "farmer_speech.wav");
    const res = await fetch(`${API_BASE}/chat/speech-to-text?language_code=${encodeURIComponent(languageCode)}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Sarvam STT unreachable:", err);
    return null;
  }
}

export async function synthesizeSpeechBulbul(text: string, languageCode: string = "hi-IN") {
  try {
    const res = await fetch(`${API_BASE}/chat/text-to-speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language_code: languageCode }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Sarvam TTS unreachable:", err);
    return null;
  }
}

export async function fetchGoogleTTSAudio(text: string, language: string = "hi", voiceName: string = "hi-IN-Chirp3-HD-Kore") {
  try {
    const res = await fetch(`${API_BASE}/chat/google-tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language, voice_name: voiceName }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Google TTS audio fetch unreachable:", err);
    return null;
  }
}

export async function analyzeCropLeafImage(imageFile: File, crop: string = "soybean", language: string = "hi") {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("crop", crop);
    formData.append("language", language);

    const res = await fetch(`${API_BASE}/chat/analyze-image`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Analyze crop leaf image error:", err);
    return null;
  }
}
