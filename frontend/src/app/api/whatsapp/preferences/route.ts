import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/aasraDb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const farmerId = searchParams.get("farmerId") || "farmer-001";

  const prefs = db.getNotificationPreferences(farmerId);
  return NextResponse.json({ preferences: prefs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const farmerId = body.farmerId || "farmer-001";
    const update = body.preferences || {};

    const updated = db.updateNotificationPreferences(farmerId, update);
    return NextResponse.json({
      success: true,
      preferences: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
