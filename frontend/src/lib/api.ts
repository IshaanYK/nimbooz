/**
 * AASRA API Client
 * Connects Next.js frontend to FastAPI backend at http://localhost:8000
 */

const API_BASE = "http://localhost:8000/api";

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

export async function sendChatMessage(message: string, lat: number, lon: number, crop: string, language: string) {
  try {
    const res = await fetch(`${API_BASE}/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, lat, lon, crop, language }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend chat API unreachable:", err);
    return null;
  }
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

export async function fetchROBICalculation(payload: {
  crop: string;
  yield_with_treatment_kg_per_ha: number;
  yield_without_treatment_kg_per_ha: number;
  price_per_kg: number;
  product_cost_per_ha: number;
  application_cost_per_ha: number;
  field_area_ha: number;
}) {
  try {
    const res = await fetch(`${API_BASE}/impact/robi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend ROBI API unreachable:", err);
    return null;
  }
}

export async function fetchJournalEntries() {
  try {
    const res = await fetch(`${API_BASE}/journal/`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend Journal API unreachable:", err);
    return null;
  }
}

export async function addJournalEntry(payload: any) {
  try {
    const res = await fetch(`${API_BASE}/journal/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend Journal Add API unreachable:", err);
    return null;
  }
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    if (!res.ok) return false;
    return await res.json();
  } catch (err) {
    return false;
  }
}
