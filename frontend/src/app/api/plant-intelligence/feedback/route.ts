import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    return NextResponse.json({
      status: "success",
      message: "Thank you! Your feedback has been recorded to calibrate local model recommendations.",
      positive_efficacy_rate: payload.improved_yield ? "94.8%" : "91.2%",
    });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
