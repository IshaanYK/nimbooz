import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    punjab: {
      name: "Indo-Gangetic Plain (Punjab / Haryana)",
      crops: ["wheat", "rice", "cotton_bt", "mustard"],
      lat: 30.9,
      lon: 75.86,
      soil_type: "Alluvial Loam",
      dominant_stresses: ["Heat Waves", "Waterlogging"]
    },
    bhopal: {
      name: "Central Plateau & Malwa (Madhya Pradesh)",
      crops: ["soybean", "wheat", "chickpea", "mustard"],
      lat: 23.2599,
      lon: 77.4126,
      soil_type: "Medium Black Clay",
      dominant_stresses: ["Drought", "Heat Waves"]
    },
    rajasthan_arid: {
      name: "Western Arid Zone (Rajasthan)",
      crops: ["mustard", "wheat", "chickpea", "cluster_bean", "cumin"],
      lat: 26.45,
      lon: 74.64,
      soil_type: "Arid Sandy Loam",
      dominant_stresses: ["Severe Heat", "Extreme Drought", "High VPD"]
    },
    maharashtra_vidarbha: {
      name: "Deccan Plateau & Vidarbha (Maharashtra)",
      crops: ["cotton_bt", "soybean", "pigeon_pea", "onion"],
      lat: 20.93,
      lon: 77.75,
      soil_type: "Deep Black Clay (Vertisol)",
      dominant_stresses: ["Drought", "Heat Waves"]
    },
    gujarat_saurashtra: {
      name: "Saurashtra & Semi-Arid Zone (Gujarat)",
      crops: ["groundnut", "cotton_bt", "sesame", "cumin"],
      lat: 21.52,
      lon: 70.45,
      soil_type: "Medium Black / Sandy Loam",
      dominant_stresses: ["Drought", "Soil Salinity"]
    },
    karnataka_deccan: {
      name: "Deccan Plateau (Karnataka)",
      crops: ["maize", "cotton_bt", "chilli", "tomato"],
      lat: 15.41,
      lon: 75.09,
      soil_type: "Red Clay Loam",
      dominant_stresses: ["Early Season Drought", "Nutrient Leaching"]
    },
    eastern_gangetic: {
      name: "Eastern Gangetic Plain (Bihar / West Bengal)",
      crops: ["rice", "wheat", "maize", "jute", "potato"],
      lat: 25.59,
      lon: 85.14,
      soil_type: "Deep Alluvial Silt",
      dominant_stresses: ["Waterlogging / Flood", "High Humidity Fungal Pressure"]
    },
    jammu: {
      name: "North-Western Himalayan Zone (J&K / Himachal)",
      crops: ["apple", "saffron", "mustard", "maize"],
      lat: 34.08,
      lon: 74.79,
      soil_type: "Mountain Meadow / Karewa",
      dominant_stresses: ["Frost / Cold Snap", "Erratic Rainfall"]
    },
    andhra_telangana: {
      name: "Rayalaseema & Telangana Semi-Arid",
      crops: ["chilli", "groundnut", "rice", "cotton_bt"],
      lat: 14.68,
      lon: 77.60,
      soil_type: "Red Sandy Loam",
      dominant_stresses: ["Severe Drought", "High VPD Atmospheric Pull"]
    }
  };
  return NextResponse.json(data);
}
