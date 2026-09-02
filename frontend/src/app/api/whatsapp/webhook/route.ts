import { NextRequest, NextResponse } from "next/server";
import { verifyMetaWebhookSignature } from "@/lib/whatsapp/whatsappSecurity";
import { processIncomingWhatsAppMessage, IncomingWhatsAppMessage } from "@/lib/whatsapp/whatsappRouter";

/**
 * GET — Meta Webhook Challenge Verification
 * When configuring the webhook in the Meta Developer portal, Meta sends a GET request
 * with hub.mode, hub.verify_token, and hub.challenge.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "aasra_webhook_secret_2026";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[WhatsApp Webhook] Verification successful. Challenge accepted.");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[WhatsApp Webhook] Verification failed. Invalid verify_token:", token);
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST — Inbound WhatsApp Event Ingestion
 * Receives messages, button clicks, images, and delivery acknowledgements from Meta Graph API.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    // 1. HMAC-SHA256 Signature Verification (if APP_SECRET configured)
    if (appSecret) {
      const signature = req.headers.get("x-hub-signature-256");
      const isValid = verifyMetaWebhookSignature(rawBody, signature, appSecret);
      if (!isValid) {
        console.warn("[WhatsApp Webhook] Rejected: Invalid HMAC signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    // Ensure it is a whatsapp_business_account event
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return NextResponse.json({ status: "no_value" }, { status: 200 });
    }

    // 2. Process Delivery Status Updates (Sent, Delivered, Read, Failed)
    if (Array.isArray(value.statuses) && value.statuses.length > 0) {
      for (const st of value.statuses) {
        console.log(`[WhatsApp Status] Message ${st.id} -> ${st.status} (recipient: ${st.recipient_id})`);
      }
      return NextResponse.json({ status: "statuses_logged" }, { status: 200 });
    }

    // 3. Process Inbound Messages
    if (Array.isArray(value.messages) && value.messages.length > 0) {
      for (const m of value.messages) {
        const from = m.from; // Sender's phone number
        const messageId = m.id;
        const timestamp = m.timestamp;
        const type = m.type;

        const incomingMsg: IncomingWhatsAppMessage = {
          from,
          messageId,
          timestamp,
          type,
          text: m.text?.body,
          image: m.image,
          audio: m.audio,
          location: m.location,
          interactive: m.interactive,
        };

        // Process message asynchronously
        await processIncomingWhatsAppMessage(incomingMsg);
      }
    }

    // Acknowledge receipt to Meta within 3 seconds
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err: any) {
    console.error("[WhatsApp Webhook] Processing error:", err);
    // Always return 200 to prevent Meta from disabling the webhook endpoint
    return NextResponse.json({ status: "error_handled", message: err.message }, { status: 200 });
  }
}
