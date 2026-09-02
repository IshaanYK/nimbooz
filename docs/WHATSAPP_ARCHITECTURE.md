# 🏛️ AASRA WhatsApp Integration — System Architecture Specification

## 1. Multi-Channel System Topology

AASRA operates on a **Single Core, Multi-Interface** architecture. WhatsApp is not an independent application; it is an external communication gateway to the same scientific algorithms, identity store, and telemetry engines powering the web application.

```
                                  ┌─────────────────────────────────────────────────────────┐
                                  │                     FARMER TOUCHPOINTS                  │
                                  └───────────────┬─────────────────────────┬───────────────┘
                                                  │                         │
                                                  ▼                         ▼
                                       ┌──────────────────────┐  ┌──────────────────────┐
                                       │   AASRA WEB PORTAL   │  │   WHATSAPP GATEWAY   │
                                       │ (Next.js 16 Client)  │  │ (Meta Cloud GraphAPI)│
                                       └──────────┬───────────┘  └──────────┬───────────┘
                                                  │                         │
                                                  ▼                         ▼
                                       ┌────────────────────────────────────────────────┐
                                       │              SERVERLESS API LAYER              │
                                       │      /api/whatsapp/webhook  &  /api/...        │
                                       └──────────────────────┬─────────────────────────┘
                                                              │
                                                              ▼
                                       ┌────────────────────────────────────────────────┐
                                       │          UNIFIED AASRA CORE ENGINE             │
                                       │                                                │
                                       │  ┌───────────────────┐  ┌───────────────────┐  │
                                       │  │  Farmer Identity  │  │  Agronomic Engine │  │
                                       │  │  & Token Security │  │  & Delta-T Rules  │  │
                                       │  └───────────────────┘  └───────────────────┘  │
                                       │  ┌───────────────────┐  ┌───────────────────┐  │
                                       │  │  Weather Engine   │  │  Syngenta Catalog │  │
                                       │  │   (Open-Meteo)    │  │  & Mandi Service  │  │
                                       │  └───────────────────┘  └───────────────────┘  │
                                       │  ┌───────────────────┐  ┌───────────────────┐  │
                                       │  │ Gemini 2.0 Vision │  │ Centralized Alert │  │
                                       │  │  & Multilingual   │  │ & Deduplication   │  │
                                       │  └───────────────────┘  └───────────────────┘  │
                                       └──────────────────────┬─────────────────────────┘
                                                              │
                                                              ▼
                                       ┌────────────────────────────────────────────────┐
                                       │          AASRA PERSISTENT DATA LAYER           │
                                       │  (Farmers, Fields, Connections, Alert Fingerp.)│
                                       └────────────────────────────────────────────────┘
```

---

## 2. One Farmer Identity Resolution

A single farmer account encapsulates all credentials, fields, language preferences, and WhatsApp connections:

```
Farmer Inbound Message ("919876543210")
                  │
                  ▼
       [Phone Normalization E.164]
                  │
                  ▼
   [Query: whatsapp_connections] ───(Active connection found?)───┐
                  │                                              │
                 YES                                             NO
                  ▼                                              ▼
   [Resolve: farmer_id]                             [Check for "AASRA CONNECT <token>"]
                  │                                              │
                  ▼                                      Valid Token Found?
   [Load Farmer Profile & Active Fields]               ├── YES ──> [Link Account & Activate]
                  │                                    └── NO  ──> [Prompt: Please connect via Web]
                  ▼
       [Process with Farm Context]
```

---

## 3. Provider Abstraction Layer (`WhatsAppProvider`)

To ensure **zero vendor lock-in** and allow seamless switching between Meta Cloud API, mock test providers, or future aggregators without rewriting agronomic code, all outbound and inbound communication flows through a strict TypeScript interface:

```typescript
export interface WhatsAppSendOptions {
  to: string; // Normalized E.164 phone number (+919876543210)
  previewUrl?: boolean;
}

export interface IWhatsAppProvider {
  name: string;
  sendText(to: string, body: string, options?: WhatsAppSendOptions): Promise<{ messageId: string }>;
  sendButtons(to: string, body: string, buttons: Array<{ id: string; title: string }>): Promise<{ messageId: string }>;
  sendImage(to: string, imageUrl: string, caption?: string): Promise<{ messageId: string }>;
  sendAudio(to: string, audioUrl: string): Promise<{ messageId: string }>;
  sendLocation(to: string, lat: number, lon: number, name?: string, address?: string): Promise<{ messageId: string }>;
  sendTemplate(to: string, templateName: string, languageCode: string, components?: any[]): Promise<{ messageId: string }>;
  validateWebhookSignature(rawBody: string, signature: string): boolean;
  downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }>;
}
```

### Implementations:
1. **`MetaCloudWhatsAppProvider`**: Calls Meta Graph API v21.0 using `WHATSAPP_TOKEN` and `PHONE_NUMBER_ID`.
2. **`MockWhatsAppProvider`**: Safe in-memory/test provider for local automated test suites and regression tests without requiring live external API credentials.

---

## 4. Database Schema Extensions (`aasraDb.ts`)

The AASRA data store is extended with 4 strictly typed collections, maintaining full backward compatibility:

```typescript
export interface WhatsAppConnectionRecord {
  id: string;
  farmerId: string;
  phoneNumber: string;            // Raw as received, e.g. "919876543210"
  phoneNumberNormalized: string;  // E.164 formatted, e.g. "+919876543210"
  provider: "meta_cloud" | "mock";
  status: "active" | "pending" | "disconnected";
  verifiedAt: string;
  connectedAt: string;
  lastSeenAt: string;
  metadata?: Record<string, any>;
}

export interface ActivationTokenRecord {
  id: string;
  farmerId: string;
  tokenDisplay: string;           // Formatted code: "8FJ3-K92L-7QPA"
  tokenHash: string;              // SHA-256 hash for secure server validation
  expiresAt: string;              // Expiry timestamp (typically 15 minutes)
  usedAt: string | null;          // One-time use guard
  createdAt: string;
}

export interface WhatsAppMessageRecord {
  id: string;
  farmerId: string;
  connectionId: string;
  direction: "inbound" | "outbound";
  messageType: "text" | "image" | "audio" | "location" | "interactive" | "template";
  providerMessageId?: string;
  content: string;
  mediaReference?: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  error?: string;
  createdAt: string;
}

export interface AlertEventRecord {
  id: string;
  fingerprint: string;            // SHA-256 hash(alertType + farmerId + fieldId + eventDate + severity)
  alertType: "rain" | "heat" | "spray_window" | "crop_stress" | "admin_broadcast";
  farmerId: string;
  fieldId?: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "queued" | "sent" | "suppressed" | "failed";
  attempts: number;
  createdAt: string;
  sentAt?: string;
}
```

---

## 5. Intent Routing & Conversational Pipeline

```
Inbound Webhook Payload
           │
           ▼
[Extract text / media / location]
           │
           ▼
[Intent Detection Stage]
├── Text starts with "AASRA CONNECT"? ──> ACTIVATION_TOKEN_INTENT
├── Contains "barish", "rain"? ──────────> RAIN_FORECAST_INTENT (Open-Meteo)
├── Contains "spray", "chhidkaw"? ───────> SPRAY_WINDOW_INTENT (Delta-T 2°C–8°C)
├── Contains "mandi", "bhav", "price"? ──> MANDI_RATES_INTENT (APMC Agmarknet)
├── Contains "quantis", product name? ───> PRODUCT_LOOKUP_INTENT (Syngenta DB)
├── Contains image attachment? ──────────> CROP_VISION_INTENT (Gemini Vision)
├── Contains audio attachment? ──────────> VOICE_INTENT (Speech-to-Text)
├── Contains GPS pin? ───────────────────> FIELD_GEO_INTENT
└── General conversational question ─────> GEMINI_CONVERSATION_INTENT (Grounded in farm telemetry)
```

---

## 6. Autonomous Cloud Alert Engine & Deduplication

* **Execution**: Triggered periodically via Vercel Cron (`/api/cron/monitor-alerts`) or manually by Admin broadcast.
* **Idempotency Fingerprint**:
  $$\text{Fingerprint} = \text{SHA256}(\text{alertType} + \text{farmerId} + \text{eventDate} + \text{severity})$$
  Before enqueueing any alert, AASRA verifies whether an alert with this fingerprint was already sent in the last 24 hours. Duplicate alerts are discarded immediately with an audit log.
