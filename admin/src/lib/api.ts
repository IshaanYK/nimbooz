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

export async function updateFarmer(id: string, updates: any): Promise<boolean> {
  try {
    const res = await apiFetch("/api/farmers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to update farmer:", e);
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

export async function deleteField(id: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/fields?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    return res.ok;
  } catch (e) {
    console.error("Failed to delete field:", e);
    return false;
  }
}

export async function updateField(id: string, updates: any): Promise<boolean> {
  try {
    const res = await apiFetch("/api/fields", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to update field:", e);
    return false;
  }
}

export async function createField(fieldData: any): Promise<any> {
  const res = await apiFetch("/api/fields", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fieldData),
  });
  return res.json();
}

export async function deleteJournalEntry(id: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/journal?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    return res.ok;
  } catch (e) {
    console.error("Failed to delete journal entry:", e);
    return false;
  }
}

export async function updateJournalEntry(id: string, updates: any): Promise<boolean> {
  try {
    const res = await apiFetch("/api/journal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to update journal entry:", e);
    return false;
  }
}

export async function createJournalEntry(entryData: any): Promise<any> {
  const res = await apiFetch("/api/journal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entryData),
  });
  return res.json();
}

export async function deleteCollectionRecord(collection: string, id: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/database?collection=${encodeURIComponent(collection)}&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (e) {
    console.error(`Failed to delete record ${id} in ${collection}:`, e);
    return false;
  }
}

export async function updateCollectionRecord(collection: string, id: string, updates: any): Promise<boolean> {
  try {
    const res = await apiFetch("/api/database", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection, id, data: updates }),
    });
    return res.ok;
  } catch (e) {
    console.error(`Failed to update record ${id} in ${collection}:`, e);
    return false;
  }
}

// ── Export Utilities ──
export function exportDataToCsv(filename: string, rows: any[]) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          let val = row[header];
          if (val === undefined || val === null) return '""';
          if (typeof val === "object") val = JSON.stringify(val);
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportDataToJson(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
