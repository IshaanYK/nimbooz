# 📱 AASRA WhatsApp Integration — Technical Research Report (2026)

## 1. Executive Summary

This document presents official, grounded research on integrating WhatsApp into the **AASRA (Automated Agro-Stress & Resilience Advisor)** platform. The objective is to establish WhatsApp as an additional interaction channel connected to AASRA's unified agricultural engines (Weather, ML Stress, Delta-T Spray Windows, Syngenta Products, and APMC Mandi Rates) while maintaining a single farmer identity and ensuring **zero ongoing operating costs for the prototype**.

---

## 2. Official Meta WhatsApp Cloud API vs. Personal WhatsApp Automation

### The Question: Can a Personal WhatsApp Number Be Automated?

The user requested research on whether an existing personal WhatsApp number can be used for the automated AASRA bot.

| Attribute | Official Meta WhatsApp Cloud API (Recommended) | Unofficial WhatsApp Web Automation (e.g. Baileys / Puppeteer) |
|---|---|---|
| **Mechanism** | Official Meta Graph API v21.0 via REST webhooks & endpoints | Emulating WhatsApp Web browser session via WebSocket reverse-engineering |
| **Personal Number Support** | ❌ **No**. A phone number registered on personal WhatsApp **cannot** be active on Cloud API simultaneously. It must be unlinked from mobile app, OR a dedicated test number must be used. | ⚠️ **Yes (with caveats)**. Can pair via QR code or pairing code with personal phone. |
| **Account Ban / Suspension Risk** | 🟢 **Zero Risk**. 100% compliant with Meta Business Terms of Service. | 🔴 **Extreme Risk**. Violates Section 3 of WhatsApp Terms of Service; accounts are frequently and permanently banned by Meta's anti-bot heuristics. |
| **Cloud-First Requirement (PC Off)** | 🟢 **100% Cloud-First**. Runs entirely on serverless Vercel Edge/Node Functions. Zero local processes needed. | 🔴 **Fails Requirement**. Requires a 24/7 stateful long-running Node.js process (cannot run on serverless Vercel; requires dedicated VM/VPS). |
| **Session Persistence** | 🟢 **Stateless Token**. System User Token is permanent; never logs out. | 🔴 **Brittle**. Session tokens expire, disconnect on app restart, or desynchronize when phone is offline. |
| **Production Classification** | **PRODUCTION READY** | **PROTOTYPE / HIGH RISK ONLY (NON-PRODUCTION)** |

### Verdict & Recommendation
1. **Never use unofficial Web automation for production**: It directly violates the prompt's hard constraint (*"The computer running Antigravity MUST NOT be required for the production bot. The system must be capable of continuing to operate when the developer's computer is completely OFF"*).
2. **Use Official Meta Cloud API with Provider Abstraction**:
   * For Development / Testing: Use Meta's **Free Cloud API Test Phone Number** provisioned instantly inside the Meta for Developers portal. This requires **₹0**, needs no credit card, and allows testing against registered developer phone numbers immediately.
   * For Live Production: Register a dedicated virtual or prepaid SIM number (e.g. standard ₹100 prepaid SIM) unlinked from the WhatsApp consumer app into Meta Business Manager.

---

## 3. WhatsApp Cloud API Architecture & Mechanics (Graph API v21.0)

### A. Endpoint & Authentication
* **Base URL**: `https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages`
* **Authentication**: Permanent System User Access Token sent as `Authorization: Bearer {WHATSAPP_TOKEN}`.
* **Payload Format**: Standard JSON with `messaging_product: "whatsapp"`.

### B. The 24-Hour Customer Service Window
1. **Inbound Trigger**: When a farmer sends a message to AASRA (e.g., `"Kal barish hogi?"` or `"AASRA CONNECT <token>"`), Meta opens a **24-hour Customer Service Window**.
2. **Conversational Replies**: During this 24-hour window, AASRA can send **free-form text, interactive buttons, lists, images, and audio messages with ZERO per-message charges** (classified as "Service Messages" by Meta).
3. **Outbound Proactive Alerts (Outside 24h Window)**: If AASRA initiates an alert (e.g., emergency nocturnal heatwave or heavy rain warning 3 days after last interaction), Meta requires sending an approved **Template Message** (Utility category).

### C. Message Types Supported
* **Text**: Plain text up to 4,096 characters with UTF-8 support (Hindi, Marathi, Punjabi, Gujarati, etc.).
* **Interactive Buttons**: Quick-reply buttons (up to 3 buttons, e.g., `[Spray Window]`, `[Mandi Rates]`, `[Crop Health]`).
* **Interactive Lists**: Structured menus (up to 10 choices grouped into sections, e.g., selecting between Field 1 and Field 2).
* **Media (Inbound & Outbound)**:
  * Images (JPG/PNG up to 5 MB) for crop leaf disease analysis and Syngenta product bottle images.
  * Audio (OGG/MP4/AAC up to 16 MB) for voice note processing.
  * Location (latitude/longitude pin sharing) to automatically locate the farmer's acreage.

---

## 4. Vercel Cloud Serverless Execution & Cron Capabilities

### A. Vercel Serverless Functions
* Next.js App Router API routes (`src/app/api/whatsapp/...`) run as serverless AWS Lambda micro-instances in the cloud.
* Inbound Meta webhooks arrive via HTTPS `POST /api/whatsapp/webhook`.
* Webhooks must respond with HTTP `200 OK` within **3 seconds** to prevent Meta retry storms. Long tasks (e.g., complex Gemini Vision analysis) are processed asynchronously before returning the reply via Graph API.

### B. Vercel Cron Jobs (Scheduled Autonomous Execution)
* Configured in `frontend/vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/monitor-alerts",
      "schedule": "0 1 * * *"
    }
  ]
}
```
* Runs on Vercel's global cloud clock regardless of whether the developer's PC is on or off.
* Secured with `CRON_SECRET` header verification (`Authorization: Bearer ${CRON_SECRET}`).

---

## 5. Architectural Findings for AASRA Integration

1. **Farmer Identity Resolution**:
   * Every incoming WhatsApp message arrives from an E.164 phone number (`from: "919876543210"`).
   * AASRA normalizes the phone number: `+919876543210`.
   * Queries `whatsapp_connections` in `aasraDb.ts` to retrieve `farmer_id`.
   * Loads the farmer's registered profile, acreage, crops, soil type, and location.
2. **Intent Engine & Agronomic Grounding**:
   * Deterministic intent matching for core keywords (`barish`, `weather`, `spray`, `mandi`, `quantis`, `connect`).
   * Fallback to Gemini 2.0 Flash for natural language conversation in native Indian dialects (Hindi, Marathi, Hinglish, etc.).
   * In all cases, Gemini is strictly grounded on AASRA's calculated metrics (Open-Meteo telemetry, Delta-T window, and Syngenta database).
