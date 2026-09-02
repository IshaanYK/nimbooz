# 🛠️ AASRA WhatsApp Setup & Configuration Guide

> **Estimated Setup Time**: 15 minutes for Development/Test sandbox (₹0) | 1 hour for Production dedicated number.

---

## 1. Zero-Cost Quickstart: Using Meta Test Sandbox (Recommended for Prototype)

Meta provides a **100% Free Cloud API Test Sandbox** with a pre-configured virtual phone number. No payment method or credit card is required.

### Step 1: Create a Meta Developer Account & App
1. Go to **[https://developers.facebook.com](https://developers.facebook.com)** and log in with your Facebook credentials.
2. Click **My Apps** → **Create App**.
3. Select **Other** → **Business** (Type: *Empresa / Business*).
4. Enter an App Name (e.g., `AASRA Precision Agriculture`) and your contact email.
5. Click **Create App**.

### Step 2: Add WhatsApp Product
1. On the app dashboard, scroll down to **Add a product** and locate **WhatsApp**.
2. Click **Set Up** and accept the WhatsApp Business terms.
3. You will be redirected to **WhatsApp → API Setup**.

### Step 3: Note Your Identifiers
In **API Setup**, you will see:
* **Temporary access token** (valid for 24 hours).
* **Phone number ID** (e.g., `109876543210987`).
* **WhatsApp Business Account ID (WABA ID)** (e.g., `102345678901234`).
* **Test Phone Number** (e.g., `+1 555 025 8921`).

### Step 4: Add Your Personal WhatsApp Number as a Verified Test Recipient
1. In the **To** dropdown under "Send and receive messages", select **Manage phone number list**.
2. Enter your personal mobile number (with country code `+91`).
3. Meta will send an SMS or WhatsApp code to verify that you own the number.
4. Once verified, the Meta Test Bot can exchange unlimited messages with your phone for free!

---

## 2. Setting Up Permanent System User Token (For 24/7 Cloud Operation)

To ensure the bot never stops working when the 24-hour temporary token expires:
1. Open **[https://business.facebook.com/settings](https://business.facebook.com/settings)**.
2. Under **Users**, click **System Users** → **Add**.
3. Name: `aasra-cloud-bot`, Role: **Admin**.
4. Click **Add Assets** → Select your App (`AASRA Precision Agriculture`) → Enable **Full Control**.
5. Click **Generate New Token**:
   * Token Expiration: **Never (Permanent)**.
   * Permissions required:
     - `whatsapp_business_messaging` (send/receive messages)
     - `whatsapp_business_management` (manage templates & profile)
6. Copy the generated permanent token immediately.

---

## 3. Configuring the Webhook on Meta Dashboard

1. In the Meta Developer Portal, navigate to **WhatsApp → Configuration**.
2. Under **Webhook**, click **Edit**:
   * **Callback URL**: `https://frontend-phi-flame-21.vercel.app/api/whatsapp/webhook`
   * **Verify Token**: Any secure string you define (e.g., `aasra_webhook_secret_2026`).
3. Click **Verify and Save**. AASRA automatically responds to the verification challenge!
4. Under **Webhook fields**, click **Manage** and subscribe to:
   * `messages` (Mandatory: incoming text, voice, images, locations)
   * `message_deliveries` (Optional: delivery acknowledgements)

---

## 4. Environment Variables Reference

Add these variables in your `frontend/.env.local` (local) and Vercel Project Settings (cloud production):

```env
# ──────────────────────────────────────────────────────
# AASRA WhatsApp Cloud API Configuration
# ──────────────────────────────────────────────────────
WHATSAPP_PROVIDER=meta_cloud
WHATSAPP_TOKEN=EAA...Your_Permanent_System_User_Token...
WHATSAPP_PHONE_NUMBER_ID=109876543210987
WHATSAPP_WABA_ID=102345678901234
WHATSAPP_VERIFY_TOKEN=aasra_webhook_secret_2026
WHATSAPP_APP_SECRET=your_app_secret_from_app_settings_basic
WHATSAPP_DISPLAY_PHONE=+1 555 025 8921

# ──────────────────────────────────────────────────────
# AASRA Autonomous Cloud Scheduler (Vercel Cron)
# ──────────────────────────────────────────────────────
CRON_SECRET=aasra_cron_cloud_key_2026
```

---

## 5. Easy Phone Number Migration (Switching from Test Number to Real SIM)

When you are ready to switch from the Meta Test Number to an Indian business number:
1. Acquire a dedicated Indian mobile number (prepaid or virtual SIM).
2. Ensure this number is **NOT currently active on the WhatsApp consumer app** (if it is, open WhatsApp Settings → Account → Delete Account).
3. In Meta Developers → **WhatsApp → API Setup**, click **Add phone number**.
4. Complete the OTP verification via SMS.
5. In Vercel Project Settings, update only two environment variables:
   * `WHATSAPP_PHONE_NUMBER_ID` = `new_phone_number_id`
   * `WHATSAPP_DISPLAY_PHONE` = `+91 XXXXX XXXXX`
6. **Redeploy**. AASRA instantly works with the new number with zero code changes!
