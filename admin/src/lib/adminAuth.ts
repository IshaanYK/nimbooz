// Simple client-side auth helper for admin panel
// Auth state is stored in sessionStorage (cleared on browser close)

const SESSION_KEY = "aasra_admin_auth";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function adminLogin(password: string): boolean {
  // In production, this would call an API endpoint to verify
  // For MVP, we check against a hardcoded env var
  const secret = process.env.NEXT_PUBLIC_ADMIN_SECRET || "aasra-admin-2026";
  if (password === secret) {
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function adminLogout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
