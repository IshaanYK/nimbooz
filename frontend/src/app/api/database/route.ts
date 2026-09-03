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

export async function GET() {
  const stats = db.getStats();
  const farmers = db.getFarmers();
  const fields = db.getFields();
  const journal = db.getJournal();
  const robiAudits = db.getRobiAudits();

  return NextResponse.json(
    {
      stats,
      data: {
        farmers,
        fields,
        journal,
        robiAudits,
      },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { collection, id, data } = body;
    const targetId = id || body.id;
    const updates = data || body.updates || body;

    if (!collection || !targetId) {
      return NextResponse.json({ status: "error", message: "collection and id required" }, { status: 400 });
    }

    let updated: any = null;
    if (collection === "farmers") updated = db.updateFarmer(targetId, updates);
    else if (collection === "fields") updated = db.updateField(targetId, updates);
    else if (collection === "journal") updated = db.updateJournalEntry(targetId, updates);
    else if (collection === "robi" || collection === "robi_audits" || collection === "robiAudits") updated = db.updateRobiAudit(targetId, updates);

    if (!updated) {
      return NextResponse.json({ status: "not_found", message: `Record ${targetId} not found in ${collection}` }, { status: 404 });
    }

    return NextResponse.json({ status: "success", record: updated });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection");
    const id = searchParams.get("id");

    if (!collection || !id) {
      return NextResponse.json({ status: "error", message: "collection and id query parameters required" }, { status: 400 });
    }

    let deleted = false;
    if (collection === "farmers") deleted = db.deleteFarmer(id);
    else if (collection === "fields") deleted = db.deleteField(id);
    else if (collection === "journal") deleted = db.deleteJournalEntry(id);
    else if (collection === "robi" || collection === "robi_audits" || collection === "robiAudits") deleted = db.deleteRobiAudit(id);

    return NextResponse.json({ status: deleted ? "success" : "not_found", collection, id });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
