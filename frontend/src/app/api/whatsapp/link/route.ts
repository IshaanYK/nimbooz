import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/aasraDb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const farmerId = searchParams.get("farmerId") || "farmer-001";

  const connection = db.getWhatsAppConnection(farmerId);
  const displayPhone = process.env.WHATSAPP_DISPLAY_PHONE || "+1 555 025 8921";
  const provider = process.env.WHATSAPP_PROVIDER || "meta_cloud";

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

    const farmer = db.getFarmer(farmerId);
    if (!farmer) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
    }

    // Create secure 15-minute activation token
    const tokenRecord = db.createActivationToken(farmerId);
    const displayPhone = process.env.WHATSAPP_DISPLAY_PHONE || "+1 555 025 8921";

    // Clean phone for wa.me URL
    const cleanPhone = displayPhone.replace(/\D/g, "");
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
