# 🔒 AASRA WhatsApp Integration — Security & Compliance Architecture

## 1. Webhook Signature Verification (HMAC-SHA256)

Every inbound webhook event sent by Meta includes the HTTP header `X-Hub-Signature-256`. AASRA cryptographically verifies this signature against the raw request payload before processing any data.

### Implementation Pattern
```typescript
import crypto from "crypto";

export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=") || !appSecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody, "utf-8")
    .digest("hex");

  const expectedBuffer = Buffer.from(`sha256=${expectedSignature}`);
  const actualBuffer = Buffer.from(signatureHeader);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  // Use timingSafeEqual to prevent side-channel timing attacks
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}
```

---

## 2. Activation Token Cryptography & Lifecycle

AASRA prevents account takeover and impersonation through an unguessable, cryptographically secure activation mechanism:

1. **High Entropy Token**: Generated via `crypto.randomBytes(16)` and formatted as a human-readable 16-character code (e.g., `8FJ3-K92L-7QPA-4M1B`).
2. **One-Way SHA-256 Hashing**: Only the SHA-256 hash of the token is stored in the database:
   $$\text{StoredHash} = \text{SHA256}(\text{tokenDisplay})$$
3. **Strict Expiry & Invalidation**:
   * Token validity is capped at **15 minutes**.
   * Single-use only: Once linked, `usedAt` is timestamped. Any subsequent message with the same token is immediately rejected.
   * If a farmer generates a new token on the website, any prior unconfirmed tokens for that farmer are automatically invalidated.
4. **Sender Phone Association**: The token binds the validated `farmer_id` directly to the sender's normalized E.164 phone number.

---

## 3. Media Ingestion Security

1. **Strict MIME Filtering**: Only accepts standard image types (`image/jpeg`, `image/png`, `image/webp`) and audio types (`audio/ogg`, `audio/mp4`, `audio/aac`).
2. **Payload Size Limits**:
   * Images capped at **5 MB**.
   * Voice notes capped at **16 MB**.
   * Any oversized media is discarded with a polite warning to the farmer.
3. **In-Memory Streaming**: Media buffers are parsed in transient serverless execution memory and never written as executable files to disk.

---

## 4. Rate Limiting & DoS Protection

* Inbound webhooks from unverified phone numbers are throttled to a maximum of **10 messages per minute per phone number**.
* Duplicate webhook deliveries (retried by Meta due to transient network latency) are identified by `provider_message_id` and handled idempotently without re-executing AI or agronomic pipelines.

---

## 5. Secrets Isolation & Environment Governance

* **Zero Frontend Exposure**: `WHATSAPP_TOKEN`, `WHATSAPP_APP_SECRET`, and `CRON_SECRET` are strictly server-side environment variables. None are prefixed with `NEXT_PUBLIC_`.
* **Zero Hardcoded Secrets**: Secrets are never checked into Git. The repository contains only `.env.example` with blank keys.
