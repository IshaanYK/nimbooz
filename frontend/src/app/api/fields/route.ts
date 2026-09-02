import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/aasraDb";

export async function GET() {
  const fields = db.getFields();
  return NextResponse.json({ fields });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newField = db.addField({
      name: body.name || "My Farm Acreage",
      lat: Number(body.lat) || 23.2599,
      lon: Number(body.lon) || 77.4126,
      area_acres: Number(body.area_acres || (body.area_ha ? body.area_ha * 2.47105 : 5.0)),
      crop: body.crop || "Soybean",
      variety: body.variety || "JS-9560 High Yield",
      soil_type: body.soil_type || "Deep Black Clay Soil",
      polygon: body.polygon || [],
    });
    return NextResponse.json({ status: "success", field: newField });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ status: "error", message: "Field ID required" }, { status: 400 });
    }
    const deleted = db.deleteField(id);
    return NextResponse.json({ status: deleted ? "success" : "not_found", id });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
