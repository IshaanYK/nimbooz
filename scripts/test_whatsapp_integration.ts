/**
 * AASRA Automated WhatsApp Integration & Multi-Channel Test Suite
 */

import {
  normalizePhoneNumber,
  generateActivationToken,
  sha256,
  verifyMetaWebhookSignature,
} from "../frontend/src/lib/whatsapp/whatsappSecurity";
import { MockWhatsAppProvider } from "../frontend/src/lib/whatsapp/mockProvider";
import { processIncomingWhatsAppMessage } from "../frontend/src/lib/whatsapp/whatsappRouter";
import { db } from "../frontend/src/lib/db/aasraDb";

async function runTestSuite() {
  console.log("=================================================");
  console.log("  AASRA WHATSAPP INTEGRATION AUTOMATED TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // ── TEST 1: Phone Normalization ──
  console.log("--- TEST GROUP 1: Phone Number Normalization ---");
  assert(normalizePhoneNumber("9876543210") === "+919876543210", "10-digit Indian number normalizes to +91");
  assert(normalizePhoneNumber("09876543210") === "+919876543210", "11-digit number with leading zero normalizes to +91");
  assert(normalizePhoneNumber("+91 98765 43210") === "+919876543210", "Formatted +91 with spaces strips non-digits");
  assert(normalizePhoneNumber("+1 (555) 025-8921") === "+15550258921", "US international number normalizes with original CC");

  // ── TEST 2: Security & HMAC Signatures ──
  console.log("\n--- TEST GROUP 2: Security & Token Cryptography ---");
  const tokenDisplay = generateActivationToken();
  assert(tokenDisplay.length === 19, "Activation token has 19 chars (XXXX-XXXX-XXXX-XXXX)");
  assert(tokenDisplay.split("-").length === 4, "Token has 4 hyphen-separated blocks");

  const testBody = JSON.stringify({ object: "whatsapp_business_account", entry: [] });
  const secret = "test_app_secret_12345";
  const crypto = await import("crypto");
  const hmac = crypto.createHmac("sha256", secret).update(testBody).digest("hex");
  const validHeader = `sha256=${hmac}`;
  assert(verifyMetaWebhookSignature(testBody, validHeader, secret), "Valid HMAC signature passes verification");
  assert(!verifyMetaWebhookSignature(testBody, "sha256=invalidhash", secret), "Invalid signature correctly rejected");

  // ── TEST 3: Account Linking & Activation Lifecycle ──
  console.log("\n--- TEST GROUP 3: Account Linking Flow ---");
  const farmerId = "farmer-001";
  const testPhone = "+919876543210";

  // Create token
  const tokenRecord = db.createActivationToken(farmerId);
  assert(Boolean(tokenRecord.tokenDisplay), "Activation token generated in DB");

  // Connect via WhatsApp Router
  const mockProvider = new MockWhatsAppProvider();
  await processIncomingWhatsAppMessage({
    from: testPhone,
    messageId: "msg-link-001",
    timestamp: "1725300000",
    type: "text",
    text: `AASRA CONNECT ${tokenRecord.tokenDisplay}`,
  });

  const connection = db.getWhatsAppConnection(farmerId);
  assert(connection !== null && connection.status === "active", "WhatsApp connection marked active in DB");
  assert(connection?.phoneNumberNormalized === testPhone, "Connection stored with E.164 phone number");

  // Verify single-use token invalidation
  const reuseResult = db.validateActivationToken(tokenRecord.tokenDisplay, testPhone);
  assert(!reuseResult.success, "Reusing expired or used activation token is rejected");

  // ── TEST 4: Conversational Agronomic Intent Queries ──
  console.log("\n--- TEST GROUP 4: Conversational Intent Routing ---");

  // Intent A: Weather Query
  await processIncomingWhatsAppMessage({
    from: testPhone,
    messageId: "msg-weather-001",
    timestamp: "1725300010",
    type: "text",
    text: "आज बारिश होगी क्या?",
  });
  const waMessages = db.getWhatsAppMessages(farmerId);
  const weatherReply = waMessages[0];
  assert(
    weatherReply.content.includes("मौसम रिपोर्ट") || weatherReply.content.includes("Weather Report"),
    "Hindi weather query returns formatted Open-Meteo weather report"
  );

  // Intent B: Spray Window & Delta-T
  await processIncomingWhatsAppMessage({
    from: testPhone,
    messageId: "msg-spray-001",
    timestamp: "1725300020",
    type: "text",
    text: "Kya main abhi spray kar sakta hoon?",
  });
  const sprayMessages = db.getWhatsAppMessages(farmerId);
  const sprayReply = sprayMessages[0];
  assert(
    sprayReply.content.includes("स्प्रे विंडो") || sprayReply.content.includes("Delta-T"),
    "Hinglish spray query triggers Delta-T Goldilocks physics verdict"
  );

  // Intent C: Mandi Rates
  await processIncomingWhatsAppMessage({
    from: testPhone,
    messageId: "msg-mandi-001",
    timestamp: "1725300030",
    type: "text",
    text: "सोयाबीन का आज का मंडी भाव क्या है?",
  });
  const mandiMessages = db.getWhatsAppMessages(farmerId);
  const mandiReply = mandiMessages[0];
  assert(
    mandiReply.content.includes("मंडी भाव") || mandiReply.content.includes("Mandi"),
    "Mandi query returns verified APMC commodity price data"
  );

  // Intent D: Syngenta Product Lookup
  await processIncomingWhatsAppMessage({
    from: testPhone,
    messageId: "msg-prod-001",
    timestamp: "1725300040",
    type: "text",
    text: "Quantis biostimulant का dosage क्या है?",
  });
  const prodMessages = db.getWhatsAppMessages(farmerId);
  const prodReply = prodMessages[0];
  assert(
    prodReply.content.includes("QUANTIS") || prodReply.content.includes("सिंजेंटा उत्पाद जानकारी"),
    "Product query looks up verified Syngenta catalog"
  );

  // ── TEST 5: Alert Deduplication & Idempotency ──
  console.log("\n--- TEST GROUP 5: Alert Deduplication & Cloud Cron ---");
  const testFingerprint = sha256(`rain-farmer-001-${Date.now()}-high`);
  assert(!db.isAlertDuplicate(testFingerprint, 24), "New alert fingerprint is not duplicate");

  db.recordAlertEvent({
    fingerprint: testFingerprint,
    alertType: "rain",
    farmerId,
    title: "Heavy Rain Warning",
    message: "Postpone spraying",
    severity: "high",
    status: "sent",
    attempts: 1,
    sentAt: new Date().toISOString(),
  });

  assert(db.isAlertDuplicate(testFingerprint, 24), "Duplicate alert within 24h is suppressed (Idempotent)");

  console.log("\n=================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution encountered unexpected error:", err);
  process.exit(1);
});
