// API client for admin panel — connects to the live production AASRA frontend API
export const MAIN_SITE_URL =
  process.env.NEXT_PUBLIC_MAIN_API_URL && process.env.NEXT_PUBLIC_MAIN_API_URL.startsWith("http")
    ? process.env.NEXT_PUBLIC_MAIN_API_URL
    : "https://frontend-phi-flame-21.vercel.app";

export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${MAIN_SITE_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      cache: "no-store",
      headers: {
        "Accept": "application/json",
        ...(options?.headers || {}),
      },
    });
    return res;
  } catch (err) {
    console.error(`Admin API call failed: ${url}`, err);
    throw new Error(`API call failed: ${url} — ${err}`);
  }
}

export async function getDbStats() {
  const res = await apiFetch("/api/database");
  if (!res.ok) throw new Error("Failed to load database");
  return res.json();
}

export async function getFarmers() {
  try {
    const res = await apiFetch("/api/farmers");
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.farmers || [];
  } catch {
    return [];
  }
}

export async function getFields() {
  try {
    const res = await apiFetch("/api/fields");
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.fields || [];
  } catch {
    return [];
  }
}

export async function deleteFarmer(id: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/farmers?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    return res.ok;
  } catch (e) {
    console.error("Failed to delete farmer:", e);
    return false;
  }
}

export async function createFarmer(farmerData: any): Promise<any> {
  const res = await apiFetch("/api/farmers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(farmerData),
  });
  return res.json();
}

export async function getHealthStatus() {
  try {
    const res = await apiFetch("/api/health");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
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

// ── Live Website Controls & Farmer Broadcasts ──
export async function getWebsiteSettings() {
  try {
    const res = await apiFetch("/api/settings");
    if (!res.ok) return null;
    const data = await res.json();
    return data?.settings || null;
  } catch (e) {
    console.error("Failed to fetch website settings:", e);
    return null;
  }
}

export async function updateWebsiteSettings(settings: any) {
  const res = await apiFetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function sendFarmerBroadcast(message: string) {
  const res = await apiFetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      broadcastAlert: {
        message,
        createdAt: new Date().toISOString(),
        active: true,
      },
    }),
  });
  return res.json();
}

export async function clearFarmerBroadcast() {
  const res = await apiFetch("/api/settings", {
    method: "DELETE",
  });
  return res.json();
}
