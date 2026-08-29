import { NextResponse } from "next/server";

export const REGIONS_DATA = {
  punjab_ludhiana: {
    name: "Punjab / Indo-Gangetic Plain (Ludhiana)",
    crops: ["wheat", "rice", "cotton_bt"],
    lat: 30.9,
    lon: 75.86,
    soil_type: "Alluvial Loam",
    dominant_stresses: ["Heat Waves (Terminal Heat)", "Waterlogging", "Nitrogen Leaching"],
  },
  maharashtra_vidarbha: {
    name: "Vidarbha / Maharashtra (Amravati / Nagpur)",
    crops: ["soybean", "cotton_bt", "pigeon_pea"],
    lat: 20.93,
    lon: 77.75,
    soil_type: "Deep Black Vertisol Clay",
    dominant_stresses: ["Drought Spells", "Night Heat Stress > 25°C", "Pod Abortion"],
  },
  madhya_pradesh_malwa: {
    name: "Malwa & Central MP (Bhopal / Indore / Ujjain)",
    crops: ["soybean", "wheat", "gram_chickpea", "maize"],
    lat: 23.2599,
    lon: 77.4126,
    soil_type: "Medium to Deep Black Cotton Soil",
    dominant_stresses: ["Night Heat Stress during Flowering", "Moisture Deficit", "Anthracnose"],
  },
  gujarat_saurashtra: {
    name: "Saurashtra / Gujarat (Rajkot / Junagadh)",
    crops: ["groundnut", "cotton_bt", "sesame", "castor"],
    lat: 21.52,
    lon: 70.45,
    soil_type: "Medium Black / Sandy Loam",
    dominant_stresses: ["Mid-Season Drought", "Soil Salinity", "High Leaf VPD"],
  },
  andhra_telangana: {
    name: "Rayalaseema & Telangana (Kurnool / Warangal)",
    crops: ["chilli", "cotton_bt", "groundnut", "rice"],
    lat: 14.68,
    lon: 77.6,
    soil_type: "Red Sandy Loam / Mixed Red & Black",
    dominant_stresses: ["Severe Drought Deficit", "High Vapor Pressure Deficit", "Thermal Shock"],
  },
  jammu_kashmir: {
    name: "Jammu & Kashmir Valley (Srinagar / Baramulla)",
    crops: ["apple", "saffron", "mustard", "maize"],
    lat: 34.08,
    lon: 74.79,
    soil_type: "Mountain Meadow / Karewa Loam",
    dominant_stresses: ["Frost / Cold Snap during Bloom", "Erratic Rainfall", "Hail Damage"],
  },
  up_eastern: {
    name: "Eastern UP & Bihar (Varanasi / Patna)",
    crops: ["rice", "wheat", "mustard", "sugarcane"],
    lat: 25.3176,
    lon: 82.9739,
    soil_type: "Alluvial Silty Loam",
    dominant_stresses: ["Heat Stress during Grain Filling", "Submergence / Flash Floods", "Zinc Deficiency"],
  },
};

export async function GET() {
  return NextResponse.json(REGIONS_DATA);
}
