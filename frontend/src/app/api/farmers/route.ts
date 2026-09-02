import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/aasraDb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const farmer = db.getFarmer(id);
    if (!farmer) return NextResponse.json({ status: "not_found" }, { status: 404 });
    return NextResponse.json({ farmer });
  }
  return NextResponse.json({ farmers: db.getFarmers() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.fullName || !body.mobileNumber) {
      return NextResponse.json({ status: "error", message: "Name and Mobile required" }, { status: 400 });
    }
    const saved = db.saveFarmer(body);
    return NextResponse.json({ status: "success", farmer: saved });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
