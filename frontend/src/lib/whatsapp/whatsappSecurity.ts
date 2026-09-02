import crypto from "crypto";

/**
 * Normalizes Indian and international phone numbers into standard E.164 format (+91XXXXXXXXXX).
 * Handles numbers with or without leading zeros, pluses, dashes, spaces, and country codes.
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return "";
  
  // Strip all non-digit characters except leading plus if present
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, "");
  
  // If already starts with +
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  
  // If starts with 00 (international prefix notation)
  if (cleaned.startsWith("00")) {
    return `+${cleaned.slice(2)}`;
  }
  
  // If 10-digit Indian mobile number (e.g. 9876543210)
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  
  // If 11-digit starting with 0 (e.g. 09876543210)
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned.slice(1)}`;
  }
  
  // If 12-digit starting with 91 (e.g. 919876543210)
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  
  // Default fallback: prefix with plus
  return `+${cleaned}`;
}

/**
 * Generates a high-entropy, human-friendly 16-character activation code.
 * Format: XXXX-XXXX-XXXX-XXXX (e.g. 8FJ3-K92L-7QPA-4M1B)
 */
export function generateActivationToken(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Base32-like, omitting ambiguous 0, O, 1, I
  const randomBytes = crypto.randomBytes(16);
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  // Group in 4s with dashes
  return `${result.slice(0, 4)}-${result.slice(4, 8)}-${result.slice(8, 12)}-${result.slice(12, 16)}`;
}

/**
 * Creates a deterministic SHA-256 hash of a string (e.g. activation token or alert fingerprint).
 */
export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input.trim().toUpperCase()).digest("hex");
}

/**
 * Verifies Meta WhatsApp webhook signature with timingSafeEqual to prevent side-channel timing attacks.
 */
export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=") || !appSecret) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", appSecret)
      .update(rawBody, "utf-8")
      .digest("hex");

    const expectedBuffer = Buffer.from(`sha256=${expectedSignature}`);
    const actualBuffer = Buffer.from(signatureHeader);

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (err) {
    console.error("[WhatsApp Security] Signature verification error:", err);
    return false;
  }
}
