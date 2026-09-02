# 🧪 AASRA WhatsApp Integration — Comprehensive Verification & Testing Protocol

## 1. Account Linking Test Suite

| Test ID | Scenario | Input / Action | Expected Result |
|---|---|---|---|
| **LINK-01** | User token generation | Farmer clicks "Connect WhatsApp" in Settings | High-entropy token displayed (e.g. `8FJ3-K92L-7QPA-4M1B`) with 15-minute countdown |
| **LINK-02** | Deep-link click | Click "Open WhatsApp to Connect" | Opens WhatsApp with pre-filled message `AASRA CONNECT <token>` to configured phone |
| **LINK-03** | Valid activation | Send valid activation token from phone | Webhook validates hash, sets `status: 'active'`, responds with welcome message in Hindi/English |
| **LINK-04** | Expired token | Send token after 15 minutes | Rejected with message: *"Your link code has expired. Please generate a new code on the website."* |
| **LINK-05** | Token replay attack | Send the same used token again | Rejected with message: *"This activation code has already been used."* |
| **LINK-06** | Malformed token | Send random text `AASRA CONNECT XYZ` | Rejected with polite instructions to obtain code from website |

---

## 2. Inbound Agronomic Query Test Matrix

| Test ID | Query Type | Sample Input | Expected Behavior |
|---|---|---|---|
| **AGRI-01** | Weather & Rain | *"Kal barish hogi kya Bhopal me?"* | Pulls live Open-Meteo telemetry for farmer's acreage; returns exact rain probability & expected hours |
| **AGRI-02** | Spray Safety (Delta-T) | *"Aaj spray kar sakte hain?"* | Evaluates atmospheric Delta-T and wind speed; provides specific spray window recommendation |
| **AGRI-03** | Mandi Rates | *"Soybean ka mandi bhav kya hai?"* | Queries APMC Mandi database; returns latest modal price and break-even comparison |
| **AGRI-04** | Syngenta Product | *"What is Quantis and how to use it?"* | Queries `syngentaProductsDB.ts`; returns verified active ingredients, dosage (250ml/ac), and target stress |
| **AGRI-05** | Crop Leaf Photo | Farmer uploads photo of yellowing soybean leaf | Gemini 2.0 Vision identifies symptoms; provides diagnosis and verified product prescription |
| **AGRI-06** | Voice Note | Farmer sends audio message in Hindi | Transcribes audio via Speech-to-Text; routes to agronomic engine and replies in text |
| **AGRI-07** | GPS Location Pin | Farmer sends WhatsApp location pin | Verifies coordinates; confirms with farmer before updating farm acreage location |

---

## 3. Multilingual Dialect Test Cases

* **Hindi**: *"मेरी सोयाबीन की फसल में फूल गिर रहे हैं, क्या करूँ?"* → Responds in natural Hindi with Quantis foliar prescription.
* **Marathi**: *"माझ्या शेतात आज फवारणी करता येईल का?"* → Responds in Marathi with Delta-T spray window verdict.
* **Punjabi**: *"ਕੱਲ੍ਹ ਮੌਸਮ ਕਿਵੇਂ ਰਹੇਗਾ?"* → Responds in Punjabi with temperature and rain forecast.
* **Hinglish**: *"Bhopal mandi me aaj ka rate batao"* → Responds in clean conversational Hinglish.
* **English**: *"Is it safe to spray biostimulants today?"* → Responds in formal English with atmospheric metrics.

---

## 4. Autonomous Cloud Alert & Deduplication Test Cases

* **ALERT-01 (Heavy Rain Risk)**: Triggered when 24h rainfall forecast exceeds 25mm. Alert formatted with rain window and spray delay advisory.
* **ALERT-02 (Extreme Heat Stress)**: Triggered when nocturnal temperature exceeds 24°C respiration threshold.
* **ALERT-03 (Idempotency Deduplication)**: When cron fires 2 hours later under unchanged forecast, alert fingerprint suppresses redundant notification.
* **ALERT-04 (Admin Broadcast)**: Broadcast sent from Admin Panel to "Soybean Farmers" arrives promptly on farmer WhatsApp with admin badge.

---

## 5. Offline Computer Test Protocol

1. Deploy AASRA update to Vercel production (`https://frontend-phi-flame-21.vercel.app`).
2. **Completely shut down the development computer / close all terminals**.
3. From a mobile phone, send a WhatsApp message to the AASRA WhatsApp number:
   `"What's the weather at my farm today?"`
4. **Pass Criteria**: Within 5 seconds, AASRA returns a real-time weather advisory with live Open-Meteo telemetry for Bhopal acreage.
5. Wait for scheduled Vercel Cron trigger.
6. **Pass Criteria**: Vercel executes cloud function independently and processes active farmer alerts without any local machine connection.

---

## 6. Regression Testing Checklist (Preserving 100% Existing Functionality)

- [ ] Farmer Landing Page (`/`) renders hero, animations, and architecture links
- [ ] Kisan Action Verdict on Dashboard (`/dashboard`) shows live Delta-T and mandi rate
- [ ] Vernacular Voice Assistant (`/assistant`) executes live speech recognition and audio playback
- [ ] Field Mapping (`/fields`) supports interactive GPS polygon drawing and acreage calculation
- [ ] 100-Day Climate Simulator (`/what-if`) renders growth comparison slider from Day 0 to 100
- [ ] ROBI Certification (`/impact`) generates verifiable certificates with cryptographic hashes
- [ ] Farm Journal (`/journal`) displays verified treatment timeline
- [ ] Admin Console (`https://admin-self-mu-33.vercel.app`) loads telemetry, users, diagnostics, and website controls
- [ ] All existing serverless APIs (`/api/chat`, `/api/weather/current`, `/api/farmers`, `/api/settings`) return HTTP 200
