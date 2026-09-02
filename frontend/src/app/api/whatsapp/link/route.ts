import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/aasraDb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const farmerId = searchParams.get("farmerId") || "farmer-001";

  const connection = db.getWhatsAppConnection(farmerId);
  const displayPhone = process.env.WHATSAPP_DISPLAY_PHONE || "+91 72229 49347";
  const provider = process.env.WHATSAPP_PROVIDER || "personal";

  return NextResponse.json({
    connected: Boolean(connection && connection.status === "active"),
    connection: connection || null,
    displayPhone,
    provider,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const farmerId = body.farmerId || "farmer-001";
    const action = body.action;

    const farmer = db.getFarmer(farmerId);
    if (!farmer) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
    }

    // Manual / Fast Connect mode (for personal WhatsApp 7222949347)
    if (action === "manual_verify" || action === "connect_number") {
      const rawPhone = body.phoneNumber || farmer.mobileNumber || "7222949347";
      const cleanDigits = rawPhone.replace(/\D/g, "");
      const normalizedPhone = cleanDigits.startsWith("91") && cleanDigits.length === 12
        ? `+${cleanDigits}`
        : cleanDigits.length === 10
        ? `+91${cleanDigits}`
        : `+${cleanDigits}`;

      const connection = db.saveWhatsAppConnection({
        id: `conn-${Date.now()}`,
        farmerId,
        phoneNumber: normalizedPhone,
        phoneNumberNormalized: normalizedPhone,
        provider: "personal",
        status: "active",
        verifiedAt: new Date().toISOString(),
        connectedAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      });
      return NextResponse.json({
        success: true,
        connected: true,
        message: "WhatsApp connected successfully!",
        connection,
      });
    }

    // Create secure 15-minute activation token
    const tokenRecord = db.createActivationToken(farmerId);
    const displayPhone = process.env.WHATSAPP_DISPLAY_PHONE || "+91 72229 49347";
    const cleanPhone = (process.env.WHATSAPP_BOT_PHONE || "917222949347").replace(/\D/g, "");

    // Clean phone for wa.me URL
    const prefilledMessage = encodeURIComponent(`AASRA CONNECT ${tokenRecord.tokenDisplay}`);
    const deepLink = `https://wa.me/${cleanPhone}?text=${prefilledMessage}`;

    return NextResponse.json({
      success: true,
      tokenDisplay: tokenRecord.tokenDisplay,
      expiresAt: tokenRecord.expiresAt,
      deepLink,
      displayPhone,
      farmerName: farmer.fullName,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const farmerId = searchParams.get("farmerId") || "farmer-001";

    const disconnected = db.disconnectWhatsApp(farmerId);
    return NextResponse.json({
      success: disconnected,
      message: disconnected ? "WhatsApp disconnected successfully" : "No active connection found",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
