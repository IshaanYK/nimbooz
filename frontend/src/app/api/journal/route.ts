import { NextRequest, NextResponse } from "next/server";

let journalEntriesMemory = [
  {
    id: "j-101",
    date: "2026-08-10",
    farmer: "Ramesh Patel",
    field_name: "Primary Field Plot",
    crop: "Soybean",
    product: "Syngenta Quantis / StressBuster",
    trigger: "Night Temp > 25.5°C threshold",
    net_return_inr: 6850,
    robi_percentage: 215,
    verified_by_satellite: true,
  },
];

export async function GET() {
  return NextResponse.json({
    entries: journalEntriesMemory,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newEntry = {
    id: `j-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    farmer: body.farmer || "Ramesh Patel",
    field_name: body.field_name || "Main Field",
    crop: body.crop || "Soybean",
    product: body.product || "Syngenta StressBuster",
    trigger: body.trigger || "AASRA AI Advisory Intervention",
    net_return_inr: body.net_return_inr || 5400,
    robi_percentage: body.robi_percentage || 195,
    verified_by_satellite: true,
  };
  journalEntriesMemory.unshift(newEntry);
  return NextResponse.json({ status: "success", entry: newEntry });
}
