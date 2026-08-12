import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    crop = "soybean",
    yield_with_treatment_kg_per_ha = 2800,
    yield_without_treatment_kg_per_ha = 2200,
    price_per_kg = 48,
    product_cost_per_ha = 1800,
    application_cost_per_ha = 500,
    field_area_ha = 1.7,
  } = body;

  const yieldGainKgHa = yield_with_treatment_kg_per_ha - yield_without_treatment_kg_per_ha;
  const grossGainPerHa = yieldGainKgHa * price_per_kg;
  const totalCostPerHa = product_cost_per_ha + application_cost_per_ha;
  const netProfitPerHa = grossGainPerHa - totalCostPerHa;

  const totalNetProfitField = netProfitPerHa * field_area_ha;
  const robiPercentage = Math.round((netProfitPerHa / totalCostPerHa) * 100);

  return NextResponse.json({
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
  });
}
