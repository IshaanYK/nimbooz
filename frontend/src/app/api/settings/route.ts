import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/aasraDb";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET() {
  const settings = db.getSettings();
  return NextResponse.json(
    { settings },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = db.updateSettings(body);
    return NextResponse.json(
      { status: "success", settings: updated },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

export async function DELETE() {
  // Clear active broadcast alert
  const updated = db.updateSettings({ broadcastAlert: null });
  return NextResponse.json(
    { status: "success", message: "Broadcast alert cleared", settings: updated },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
