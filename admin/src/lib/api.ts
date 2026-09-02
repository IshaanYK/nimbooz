// API client for admin panel — calls the main AASRA frontend API
const BASE = process.env.NEXT_PUBLIC_MAIN_API_URL || "http://localhost:3000";

export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, { ...options, cache: "no-store" });
    return res;
  } catch (err) {
    throw new Error(`API call failed: ${url} — ${err}`);
  }
}

export async function getDbStats() {
  const res = await apiFetch("/api/database");
  if (!res.ok) throw new Error("Failed to load database");
  return res.json();
}

export async function getFarmers() {
  const res = await apiFetch("/api/farmers");
  if (!res.ok) return [];
  return res.json();
}

export async function getFields() {
  const res = await apiFetch("/api/fields");
  if (!res.ok) return [];
  return res.json();
}

export async function deleteFarmer(id: string) {
  const res = await apiFetch(`/api/farmers?id=${id}`, { method: "DELETE" });
  return res.ok;
}

export async function getHealthStatus() {
  const res = await apiFetch("/api/health");
  if (!res.ok) return null;
  return res.json();
}

export async function seedDatabase() {
  const res = await apiFetch("/api/database", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "seed" }),
  });
  return res.json();
}

export async function resetDatabase() {
  const res = await apiFetch("/api/database", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reset" }),
  });
  return res.json();
}
