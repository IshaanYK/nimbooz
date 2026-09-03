import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/aasraDb";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-KEY, x-api-key",
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "all";
  const entries = db.getJournal(category);
  return NextResponse.json(
    { entries },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = db.addJournalEntry({
      category: body.category || "spray",
      title: body.title || body.product_name || "Syngenta Field Application",
      subtitle: body.subtitle || `${body.field_name || "Main Field"} · ${body.crop || "Soybean"}`,
      date: body.date || body.application_date || new Date().toISOString().split("T")[0],
      badge: body.badge || "USER LOGGED",
      badgeColor: body.badgeColor || (body.category === "spray" ? "emerald" : "indigo"),
      metrics: body.metrics || [
        { label: "Dosage", value: body.dose_per_ha || "250 ml / acre" },
        { label: "Net Gain", value: body.net_profit_gain_inr ? `+₹${body.net_profit_gain_inr}` : "Calculated" },
      ],
      notes: body.notes || "Logged by farmer via AASRA Season Journal.",
      costINR: body.costINR || body.product_cost_inr || 1280,
      returnINR: body.returnINR || 5400,
    });
    return NextResponse.json({ status: "success", entry });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ status: "error", message: "Journal Entry ID required" }, { status: 400 });
    }
    const updated = db.updateJournalEntry(id, body);
    if (!updated) {
      return NextResponse.json({ status: "not_found", message: `Journal entry ${id} not found` }, { status: 404 });
    }
    return NextResponse.json({ status: "success", entry: updated });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ status: "error", message: "Journal Entry ID required" }, { status: 400 });
    }
    const deleted = db.deleteJournalEntry(id);
    return NextResponse.json({ status: deleted ? "success" : "not_found", id });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
