import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/aasraDb";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-KEY, x-api-key",
    },
  });
}

export async function GET() {
  const stats = db.getStats();
  const farmers = db.getFarmers();
  const fields = db.getFields();
  const journal = db.getJournal();
  const robiAudits = db.getRobiAudits();

  return NextResponse.json({
    stats,
    data: {
      farmers,
      fields,
      journal,
      robiAudits,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    if (action === "reset" || action === "seed") {
      db.resetToDefault();
      return NextResponse.json({
        status: "success",
        message: "Database reseeded successfully with verified benchmark datasets.",
        stats: db.getStats(),
      });
    }

    return NextResponse.json({ status: "error", message: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
