import { NextRequest, NextResponse } from "next/server";
import { getRecommendations, FarmerInput } from "@/lib/recommendationEngine";

const META_ACCESS_TOKEN =
  process.env.META_WHATSAPP_ACCESS_TOKEN ||
  "EAA5Aigmq5tEBSUA2A3VNZCgXuk7t1VZCl06rUxspYoEMffKVhemDp9C0XMtPrAGP9PSXAljgP4sJQfKZAuRkjiO9IZCHz1fo9UUUzfS3ZBdfadJNtAZAvLVdY1TboqYh3jyekGmAuRXZBw9TWlfq7mC8nTJuG8XvIO5zQ8ft6rqzkB9jLVqpFf9qrZBaPntW0agE16k5oFwcygUOyPsnChmZArLzzSkGX4xtosDHdO8RvgVDosDH15B50GXYglaWHQZBY13gl3tHtrWjdnsTSA4QmQzg6M";

const META_PHONE_ID = process.env.META_WHATSAPP_PHONE_NUMBER_ID || "1280974545099009";
const META_VERIFY_TOKENS = [
  process.env.META_WHATSAPP_VERIFY_TOKEN,
  "annam-kisan-verify-2026",
  "aros-meta-verify-2026",
  "annam-ai-verify-2026",
].filter(Boolean);

const GRAPH_API_VERSION = "v22.0";

/**
 * Helper: Send a WhatsApp message back to user via Meta Cloud API
 */
async function sendWhatsAppMessage(to: string, textBody: string) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PHONE_ID}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: textBody },
      }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    console.error("[Meta WhatsApp] Send message error:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Helper: Mark incoming message as read (blue ticks)
 */
async function markMessageAsRead(messageId: string) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PHONE_ID}/messages`;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });
  } catch {}
}

/**
 * Parse farmer query into structured agronomic parameters
 */
function parseFarmerQuery(text: string): {
  cropType: string;
  growthStage: string;
  symptoms: string;
  soilMoisture: string;
  isGreeting: boolean;
} {
  const t = (text || "").toLowerCase();

  const isGreeting =
    /^(hi|hello|hey|namaste|pranam|ram ram|kisan|start|menu|help|info)$/i.test(t.trim()) ||
    t.trim().length < 4;

  // Crop detection
  let cropType = "wheat";
  if (t.includes("soy") || t.includes("soya")) cropType = "soybean";
  else if (t.includes("wheat") || t.includes("gehu") || t.includes("gehun")) cropType = "wheat";
  else if (t.includes("cotton") || t.includes("kapas") || t.includes("narma")) cropType = "cotton_bt";
  else if (t.includes("paddy") || t.includes("rice") || t.includes("dhan")) cropType = "rice";
  else if (t.includes("maize") || t.includes("makka")) cropType = "maize";
  else if (t.includes("chilli") || t.includes("mirch")) cropType = "chilli";
  else if (t.includes("potato") || t.includes("aloo")) cropType = "potato";
  else if (t.includes("tomato") || t.includes("tamatar")) cropType = "tomato";
  else if (t.includes("groundnut") || t.includes("mungfali")) cropType = "groundnut";
  else if (t.includes("sugarcane") || t.includes("ganna")) cropType = "sugarcane";
  else if (t.includes("chickpea") || t.includes("chana")) cropType = "chickpea";
  else if (t.includes("mustard") || t.includes("sarson")) cropType = "mustard";

  // Growth stage detection
  let growthStage = "vegetative";
  if (t.includes("flower") || t.includes("phool") || t.includes("bloom")) growthStage = "flowering";
  else if (t.includes("pod") || t.includes("fali") || t.includes("dana") || t.includes("grain") || t.includes("fruit") || t.includes("boll")) growthStage = "podFormation";
  else if (t.includes("seed") || t.includes("germ") || t.includes("ankuran") || t.includes("bowai")) growthStage = "germination";
  else if (t.includes("mature") || t.includes("katayi") || t.includes("pak")) growthStage = "maturity";

  // Symptoms detection
  let symptoms = "none";
  if (t.includes("pest") || t.includes("keeda") || t.includes("kida") || t.includes("sundi") || t.includes("caterpillar") || t.includes("borer") || t.includes("worm") || t.includes("damage")) {
    symptoms = "pest_damage";
  } else if (t.includes("yellow") || t.includes("peela") || t.includes("peeli") || t.includes("chlorosis")) {
    symptoms = "yellowing";
  } else if (t.includes("spot") || t.includes("dhabba") || t.includes("rust") || t.includes("blight") || t.includes("mildew") || t.includes("blast")) {
    symptoms = "leaf_spots";
  } else if (t.includes("wilt") || t.includes("murjha") || t.includes("sukha") || t.includes("dry")) {
    symptoms = "wilting";
  }

  // Moisture
  let soilMoisture = "optimal";
  if (t.includes("dry") || t.includes("sukha") || t.includes("pani nahi") || t.includes("paani ki kami")) {
    soilMoisture = "dry";
  } else if (t.includes("flood") || t.includes("waterlog") || t.includes("bahut pani") || t.includes("jalbharav")) {
    soilMoisture = "waterlogged";
  }

  return { cropType, growthStage, symptoms, soilMoisture, isGreeting };
}

/**
 * Format intelligent WhatsApp response for farmer
 */
function buildWhatsAppAdvice(
  farmerQuery: string,
  parsed: ReturnType<typeof parseFarmerQuery>,
  recResult: ReturnType<typeof getRecommendations>
): string {
  if (parsed.isGreeting) {
    return (
      `🌾 *Namaste! Welcome to ANNAM AI — Kisan Assistant* 🌾\n` +
      `_(Powered by AASRA & Syngenta Science)_\n\n` +
      `Main aapka digital kisan mitra hoon. Apni fasal ki samasya likhkar bhejein, jaise:\n\n` +
      `👉 *"Gehu me peele patte aur kida lag raha hai"*\n` +
      `👉 *"Soybean flowering stage me pod borer attack"*\n` +
      `👉 *"Cotton me sundi aur patte sookh rahe hain"*\n\n` +
      `Aapko milega:\n` +
      `✅ Sahi Syngenta utpaad & dose\n` +
      `🔬 ICAR field trial pramanit control %\n` +
      `💰 Prati acre kharch aur bachat\n` +
      `⏱️ Spray karne ka sahi samay (Rainfastness)`
    );
  }

  const top1 = recResult.recommendations[0];
  const top2 = recResult.recommendations[1];
  const stress = recResult.stressProfile.dominantStress;

  if (!top1) {
    return (
      `🌾 *ANNAM AI Krishi Salah*\n\n` +
      `Aapki fasal (${parsed.cropType.toUpperCase()}) ke liye hamara engine vishleshan kar raha hai. Kripya thoda aur vistar se likhein (Fasal ka naam, awastha, aur lakshan).`
    );
  }

  const p = top1.product;
  const stressNameHindi =
    stress === "insect"
      ? "Keet / Borer Prakop (Insect Attack)"
      : stress === "fungal"
      ? "Fafundi Rog (Fungal Disease / Blight)"
      : stress === "drought"
      ? "Sukha / Nami ki kami (Moisture Deficit)"
      : stress === "heat"
      ? "Taapman Vridhi (Heat Stress)"
      : "Samanya Swasthya & Fasal Badhav";

  let response =
    `🌾 *ANNAM AI — Syngenta Validated Crop Advisory* 🌾\n\n` +
    `📍 *Fasal:* ${parsed.cropType.toUpperCase()} | *Awastha:* ${parsed.growthStage}\n` +
    `⚠️ *Mukhya Samasya:* ${stressNameHindi}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🥇 *Sifarish Kiya Gaya Utpaad:* *${p.name}*\n` +
    `🏷️ *Varg:* ${p.category.toUpperCase()}\n` +
    `🧪 *Active Salt:* ${p.activeIngredient}\n\n` +
    `📋 *Dose (Matra):* *${top1.dosageForThisCase}*\n` +
    `💧 *Pani ki Matra:* ${p.waterPerAcre} Litre prati acre\n` +
    `💰 *Kharch:* ₹${top1.costBreakdown.productCost}/acre (MRP: ${p.mrpInr})\n\n` +
    `🔬 *ICAR Vigyanik Praman:*\n` +
    `• *${top1.trialEfficacyPct}% Control Rate*\n` +
    `• _${top1.trialCitation}_\n\n` +
    `🎯 *KVK / ETL Trigger:* ${top1.etlThreshold || "N/A"}\n\n` +
    `📱 *Cropwise Spray Radar:*\n` +
    `• Rainfastness: *${top1.cropwiseStandard?.rainfastnessHours || 2} ghante* (Barish se pehle itna samay chahiye)\n` +
    `• Delta T: *${top1.cropwiseStandard?.optimalDeltaT || "2-8°C"}*\n` +
    (top1.cropwiseStandard?.droneApplicable ? `• 🚁 *Drone Spray Yojya* (8-10 L/acre)\n` : "");

  if (p.tankMixSafe && p.tankMixSafe.length > 0) {
    response += `\n🧪 *Safe Tank-Mix Partner:*\n` + `✓ Inke sath mila sakte hain: ${p.tankMixSafe.slice(0, 3).join(", ")}\n`;
  }

  if (top2) {
    response +=
      `\n━━━━━━━━━━━━━━━━━━━━\n` +
      `🥈 *Vikalpik Utpaad (#2):* *${top2.product.name}* (Score: ${top2.score.toFixed(1)})\n` +
      `Dose: ${top2.dosageForThisCase} | ₹${top2.costBreakdown.productCost}/ac`;
  }

  response += `\n\n💡 _Yeh salah ICAR & Syngenta Bharat ke 50 field-trial pramanit protocols par aadharit hai._`;

  return response;
}

/**
 * GET: Meta Webhook Verification Handshake
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log(`[Meta Webhook Handshake] mode=${mode}, token=${token}`);

  if (mode === "subscribe" && token && META_VERIFY_TOKENS.includes(token)) {
    console.log("[Meta Webhook Handshake] ✅ Webhook verified successfully!");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[Meta Webhook Handshake] ❌ Verification token mismatch");
  return new Response("Verification token mismatch", { status: 403 });
}

/**
 * POST: Incoming WhatsApp Message Receiver
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Check if event is from WhatsApp Business Account
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const value = change.value || {};

        // Skip delivery receipt status events (sent, delivered, read)
        if (value.statuses && !value.messages) {
          continue;
        }

        const messages = value.messages || [];
        for (const msg of messages) {
          const from = msg.from; // Sender's WhatsApp number (e.g. 919720413710)
          const messageId = msg.id;

          let textBody = "";
          if (msg.type === "text") {
            textBody = msg.text?.body || "";
          } else if (msg.type === "interactive") {
            textBody =
              msg.interactive?.button_reply?.title ||
              msg.interactive?.list_reply?.title ||
              "";
          } else if (msg.type === "button") {
            textBody = msg.button?.text || "";
          }

          if (!from || !textBody) continue;

          console.log(`[Meta Webhook] 📩 Incoming message from ${from}: "${textBody}"`);

          // 1. Mark as read (blue ticks) immediately
          await markMessageAsRead(messageId);

          // 2. Parse farmer query
          const parsed = parseFarmerQuery(textBody);

          // 3. Formulate input for 3-layer recommendation engine
          const farmerInput: FarmerInput = {
            cropType: parsed.cropType,
            growthStage: parsed.growthStage,
            temperatureMax: 34,
            temperatureMin: 24,
            humidityAvg: 75,
            rainfall7Day: 10,
            windSpeed: 8,
            soilMoisture: parsed.soilMoisture,
            soilType: "alluvial",
            symptoms: parsed.symptoms,
            season: "kharif",
            daysSinceLastSpray: 14,
            acreage: 2,
            locationName: "Farmer WhatsApp Query",
          };

          // 4. Run Syngenta 50-product hybrid engine
          const recResult = getRecommendations(farmerInput);

          // 5. Generate formatted WhatsApp message
          const replyText = buildWhatsAppAdvice(textBody, parsed, recResult);

          // 6. Send reply back to farmer via Meta Cloud API
          const sendRes = await sendWhatsAppMessage(from, replyText);
          console.log(`[Meta Webhook] 📤 Reply sent to ${from}: status=${sendRes.status || "ok"}`);
        }
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err: any) {
    console.error("[Meta Webhook] Error processing event:", err);
    return NextResponse.json({ status: "error", error: err.message }, { status: 500 });
  }
}
