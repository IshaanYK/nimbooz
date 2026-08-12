import { NextRequest, NextResponse } from "next/server";

let fieldsMemory = [
  {
    id: "f-primary-1",
    name: "Primary Farm Plot",
    lat: 23.2599,
    lon: 77.4126,
    area_ha: 1.7,
    crop: "soybean",
    polygon: [
      [23.2610, 77.4115],
      [23.2612, 77.4140],
      [23.2588, 77.4138],
      [23.2585, 77.4112],
    ],
  },
];

export async function GET() {
  return NextResponse.json({ fields: fieldsMemory });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newField = {
    id: `f-${Date.now()}`,
    name: body.name || "My New Field",
    lat: body.lat || 23.2599,
    lon: body.lon || 77.4126,
    area_ha: body.area_ha || 1.5,
    crop: body.crop || "soybean",
    polygon: body.polygon || [],
  };
  fieldsMemory.push(newField);
  return NextResponse.json({ status: "success", field: newField });
}
