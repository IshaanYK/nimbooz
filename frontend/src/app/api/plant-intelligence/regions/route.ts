import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    punjab: {
      name: "Punjab / Indo-Gangetic Plain",
      crops: ["wheat", "rice", "cotton_bt"],
      lat: 30.9,
      lon: 75.86,
      soil_type: "Alluvial Loam",
      dominant_stresses: ["Heat Waves", "Waterlogging"]
    },
    bhopal: {
      name: "Bhopal / Central India",
      crops: ["soybean", "wheat", "chickpea"],
      lat: 23.2599,
      lon: 77.4126,
      soil_type: "Medium Black Clay",
      dominant_stresses: ["Drought", "Heat Waves"]
    },
    maharashtra_vidarbha: {
      name: "Vidarbha / Maharashtra",
      crops: ["cotton_bt", "soybean", "pigeon_pea"],
      lat: 20.93,
      lon: 77.75,
      soil_type: "Deep Black Clay",
      dominant_stresses: ["Drought", "Heat Waves"]
    },
    gujarat_saurashtra: {
      name: "Saurashtra / Gujarat",
      crops: ["groundnut", "cotton_bt", "sesame"],
      lat: 21.52,
      lon: 70.45,
      soil_type: "Medium Black / Sandy Loam",
      dominant_stresses: ["Drought", "Soil Salinity"]
    },
    jammu: {
      name: "Jammu & Kashmir Valley",
      crops: ["apple", "saffron", "mustard"],
      lat: 34.08,
      lon: 74.79,
      soil_type: "Mountain Meadow / Karewa",
      dominant_stresses: ["Frost / Cold Snap", "Erratic Rainfall"]
    },
    andhra_telangana: {
      name: "Rayalaseema / Andhra Pradesh",
      crops: ["chilli", "groundnut", "rice"],
      lat: 14.68,
      lon: 77.60,
      soil_type: "Red Sandy Loam",
      dominant_stresses: ["Severe Drought", "High VPD"]
    }
  };
  return NextResponse.json(data);
}
