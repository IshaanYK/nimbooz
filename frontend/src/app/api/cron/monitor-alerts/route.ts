import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/aasraDb";
import { getWhatsAppProvider } from "@/lib/whatsapp";
import { formatAutonomousAlertMessage } from "@/lib/whatsapp/whatsappFormatter";
import { sha256 } from "@/lib/whatsapp/whatsappSecurity";

export async function GET(req: NextRequest) {
  // 1. Cron Secret Verification (Protects against unauthorized external triggering)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }
  }

  const provider = getWhatsAppProvider();
  const connections = db.getWhatsAppConnections().filter((c) => c.status === "active");
  const todayStr = new Date().toISOString().split("T")[0];

  const results: Array<{
    farmerId: string;
    phone: string;
    alertsSent: string[];
    skippedReasons: string[];
  }> = [];

  for (const conn of connections) {
    const farmer = db.getFarmer(conn.farmerId);
    if (!farmer) continue;

    const prefs = db.getNotificationPreferences(farmer.id);
    if (!prefs.enabled) {
      results.push({
        farmerId: farmer.id,
        phone: conn.phoneNumberNormalized,
        alertsSent: [],
        skippedReasons: ["Notifications disabled by farmer"],
      });
      continue;
    }

    const fields = db.getFields();
    const field = fields[0] || { lat: 23.2599, lon: 77.4126, name: "Main Field" };

    const farmerSummary = {
      farmerId: farmer.id,
      phone: conn.phoneNumberNormalized,
      alertsSent: [] as string[],
      skippedReasons: [] as string[],
    };

    try {
      // 2. Query 48-hour Weather Telemetry from Open-Meteo
      const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${field.lat}&longitude=${field.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=2`;
      const wRes = await fetch(wUrl, { cache: "no-store", signal: AbortSignal.timeout(5000) });

      if (wRes.ok) {
        const wData = await wRes.json();
        const rainProb = wData?.daily?.precipitation_probability_max?.[0] ?? 0;
        const rainSum = wData?.daily?.precipitation_sum?.[0] ?? 0;
        const tempMax = wData?.daily?.temperature_2m_max?.[0] ?? 32;
        const tempMin = wData?.daily?.temperature_2m_min?.[0] ?? 22;
        const windSpeed = wData?.current?.wind_speed_10m ?? 8;

        // ── ALERT 1: Heavy Rain Warning ──
        if (prefs.rainAlerts && (rainProb >= 65 || rainSum >= 15)) {
          const fingerprint = sha256(`rain-${farmer.id}-${todayStr}-high`);
          if (!db.isAlertDuplicate(fingerprint, 24)) {
            const title = "भारी बारिश चेतावनी (Heavy Rain Advisory)";
            const msg = `अगले 24 घंटों में आपके खेत पर ${rainProb}% बारिश की संभावना है (${rainSum} mm)।\n\n• सलाह: कोई भी फोलियर स्प्रे या रासायनिक खाद का छिड़काव तुरंत टालें ताकि दवा धुलने का नुकसान ना हो।`;

            const formatted = formatAutonomousAlertMessage("rain", title, msg, farmer.language || "hi");
            await provider.sendText(conn.phoneNumberNormalized, formatted);

            db.recordAlertEvent({
              fingerprint,
              alertType: "rain",
              farmerId: farmer.id,
              fieldId: field.id,
              title,
              message: msg,
              severity: "high",
              status: "sent",
              attempts: 1,
              sentAt: new Date().toISOString(),
            });

            farmerSummary.alertsSent.push("Rain Advisory");
          } else {
            farmerSummary.skippedReasons.push("Rain alert already sent in last 24h (Deduplicated)");
          }
        }

        // ── ALERT 2: Severe Heatwave Warning ──
        if (prefs.heatAlerts && (tempMax >= 37.5 || tempMin >= 24.5)) {
          const fingerprint = sha256(`heat-${farmer.id}-${todayStr}-high`);
          if (!db.isAlertDuplicate(fingerprint, 24)) {
            const title = "अत्यधिक तापमान चेतावनी (Thermal Stress Alert)";
            const msg = `आपके खेत पर अधिकतम तापमान ${tempMax}°C एवं रात का तापमान ${tempMin}°C रहने का अनुमान है।\n\n• जोखिम: 24°C से अधिक रात्रि तापमान से फूल झड़ने (Flower abortion) की आशंका है।\n• अनुशंसा: सिंजेंटा क्वांटिस (Quantis) @ 250ml/एकड़ का सुरक्षात्मक छिड़काव करें।`;

            const formatted = formatAutonomousAlertMessage("heat", title, msg, farmer.language || "hi");
            await provider.sendText(conn.phoneNumberNormalized, formatted);

            db.recordAlertEvent({
              fingerprint,
              alertType: "heat",
              farmerId: farmer.id,
              fieldId: field.id,
              title,
              message: msg,
              severity: "high",
              status: "sent",
              attempts: 1,
              sentAt: new Date().toISOString(),
            });

            farmerSummary.alertsSent.push("Heat Stress Alert");
          } else {
            farmerSummary.skippedReasons.push("Heat alert already sent in last 24h (Deduplicated)");
          }
        }

        // ── ALERT 3: Optimal Spray Window ──
        if (prefs.sprayAlerts && rainProb < 20 && windSpeed < 12 && tempMax < 35) {
          const fingerprint = sha256(`spray-${farmer.id}-${todayStr}-optimal`);
          if (!db.isAlertDuplicate(fingerprint, 24)) {
            const title = "अनुकूल स्प्रे विंडो (Goldilocks Spray Window)";
            const msg = `आज आपके खेत पर छिड़काव के लिए आदर्श वायुमंडलीय परिस्थितियां (हवा ${windSpeed} km/h, वर्षा जोखिम 0%) उपलब्ध हैं।\n\n• सर्वोत्तम समय: सुबह 8:00 AM – 11:30 AM`;

            const formatted = formatAutonomousAlertMessage("spray_window", title, msg, farmer.language || "hi");
            await provider.sendText(conn.phoneNumberNormalized, formatted);

            db.recordAlertEvent({
              fingerprint,
              alertType: "spray_window",
              farmerId: farmer.id,
              fieldId: field.id,
              title,
              message: msg,
              severity: "low",
              status: "sent",
              attempts: 1,
              sentAt: new Date().toISOString(),
            });

            farmerSummary.alertsSent.push("Spray Window Alert");
          } else {
            farmerSummary.skippedReasons.push("Spray window alert already sent in last 24h (Deduplicated)");
          }
        }
      }
    } catch (err: any) {
      farmerSummary.skippedReasons.push(`Telemetry fetch error: ${err.message}`);
    }

    results.push(farmerSummary);
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    activeConnectionsEvaluated: connections.length,
    results,
  });
}
