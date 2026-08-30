/**
 * ASSARA Market Service
 * Fetches verified APMC mandi commodity price records across India.
 * Provides transparent provenance and honest empty states.
 */

import { findCropMandiRate, MandiRateItem } from "@/lib/mandiEngine";

export interface MarketPriceResult {
  isAvailable: boolean;
  crop: string;
  cropHi?: string;
  mandi: string;
  district: string;
  state: string;
  modalPrice: number; // ₹/quintal
  minPrice: number;
  maxPrice: number;
  unit: string;
  trend: "up" | "down" | "stable";
  changePct: number;
  updatedAt: string;
  source: string;
  note?: string;
}

/**
 * Fetch verified APMC market prices for a given crop and district
 */
export async function getMarketPrice(
  crop: string,
  district: string = "Indore",
  state: string = "Madhya Pradesh"
): Promise<MarketPriceResult> {
  if (!crop || !crop.trim()) {
    return {
      isAvailable: false,
      crop: "Unknown",
      mandi: district,
      district,
      state,
      modalPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      unit: "₹/quintal",
      trend: "stable",
      changePct: 0,
      updatedAt: new Date().toISOString(),
      source: "Agmarknet / APMC Network",
      note: "No crop specified for market price lookup.",
    };
  }

  try {
    const rate: MandiRateItem = findCropMandiRate(crop, district, state);
    if (rate && rate.modalPrice > 0) {
      return {
        isAvailable: true,
        crop: rate.commodity,
        cropHi: rate.commodityHi,
        mandi: rate.mandi,
        district: district,
        state: state,
        modalPrice: rate.modalPrice,
        minPrice: rate.minPrice,
        maxPrice: rate.maxPrice,
        unit: "₹/quintal",
        trend: rate.trend,
        changePct: rate.changePct,
        updatedAt: new Date().toISOString().split("T")[0],
        source: "Directorate of Marketing & Inspection (Agmarknet)",
      };
    }
  } catch (err) {
    console.warn("[MarketService] Mandi lookup failed:", err);
  }

  return {
    isAvailable: false,
    crop,
    mandi: `${district} Mandi`,
    district,
    state,
    modalPrice: 0,
    minPrice: 0,
    maxPrice: 0,
    unit: "₹/quintal",
    trend: "stable",
    changePct: 0,
    updatedAt: new Date().toISOString(),
    source: "APMC Network",
    note: `Market price currently unavailable for ${crop} in ${district}.`,
  };
}
