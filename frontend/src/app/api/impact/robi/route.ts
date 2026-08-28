import { NextRequest, NextResponse } from "next/server";

function calculateRobiMetrics(params: {
  crop?: string;
  yield_with_treatment_kg_per_ha?: number;
  yield_without_treatment_kg_per_ha?: number;
  price_per_kg?: number;
  product_cost_per_ha?: number;
  application_cost_per_ha?: number;
  field_area_ha?: number;
}) {
  const {
    crop = "soybean",
    yield_with_treatment_kg_per_ha = 2800,
    yield_without_treatment_kg_per_ha = 2200,
    price_per_kg = 48,
    product_cost_per_ha = 1800,
    application_cost_per_ha = 500,
    field_area_ha = 1.7,
  } = params;

  const yieldGainKgHa = yield_with_treatment_kg_per_ha - yield_without_treatment_kg_per_ha;
  const grossGainPerHa = yieldGainKgHa * price_per_kg;
  const totalCostPerHa = product_cost_per_ha + application_cost_per_ha;
  const netProfitPerHa = grossGainPerHa - totalCostPerHa;

  const totalNetProfitField = netProfitPerHa * field_area_ha;
  const robiPercentage = Math.round((netProfitPerHa / totalCostPerHa) * 100);

  return {
    crop,
    field_area_ha,
    yield_gain_kg_per_ha: yieldGainKgHa,
    gross_gain_per_ha: grossGainPerHa,
    total_cost_per_ha: totalCostPerHa,
    net_profit_per_ha: netProfitPerHa,
    total_net_profit_field: Math.round(totalNetProfitField),
    robi_percentage: robiPercentage,
    attribution: {
      biological_product_contribution_pct: 68,
      weather_conduciveness_pct: 18,
      baseline_field_potential_pct: 14,
    },
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const crop = searchParams.get("crop") || "soybean";
  const acres = parseFloat(searchParams.get("acres") || "12.5");
  const field_area_ha = acres * 0.404686;

  const result = calculateRobiMetrics({
    crop,
    field_area_ha,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = calculateRobiMetrics(body);
  return NextResponse.json(result);
}
