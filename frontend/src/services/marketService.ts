/**
 * AASRA Market Service
 * Fetches verified APMC mandi commodity price records across India.
 * Provides transparent provenance, actual dates, and honest empty states.
 */

import { getLatestMandiPrice, NormalizedMandiRecord } from "@/lib/mandiPriceService";

export interface MarketPriceResult {
  isAvailable: boolean;
  crop: string;
  cropHi?: string;
  variety?: string;
  varietyRequested?: string;
  varietyMatched?: boolean;
  varietyNotice?: string;
  grade?: string;
  mandi: string;
  mandiHi?: string;
  district: string;
  state: string;
  userLocation?: string;
  modalPrice: number; // ₹/quintal
  minPrice: number;
  maxPrice: number;
  unit: string;
  trend: "up" | "down" | "stable";
  changePct: number;
  marketDate: string;
  formattedDate: string;
  isToday: boolean;
  updatedAt: string;
  source: string;
  sourceRecordId?: string;
  distanceKm?: number;
  note?: string;
}

/**
 * Fetch verified APMC market prices for a given crop, variety, and location
 */
export async function getMarketPrice(
  crop: string,
  district: string = "Bhopal",
  state: string = "Madhya Pradesh",
  lat?: number,
  lon?: number,
  variety?: string
): Promise<MarketPriceResult> {
  if (!crop || !crop.trim()) {
    return {
      isAvailable: false,
      crop: "Unknown",
      mandi: district,
      district,
      state,
      userLocation: `${district}, ${state}`,
      modalPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      unit: "₹/quintal",
      trend: "stable",
      changePct: 0,
      marketDate: new Date().toISOString().split("T")[0],
      formattedDate: "Today",
      isToday: true,
      updatedAt: new Date().toISOString(),
      source: "Agmarknet / APMC Network",
      note: "No crop specified for market price lookup.",
    };
  }

  try {
    const record: NormalizedMandiRecord = await getLatestMandiPrice({
      commodity: crop,
      variety,
      location: { district, state, lat, lon },
    });

    if (record && record.modalPrice > 0) {
      return {
        isAvailable: true,
        crop: record.commodity,
        cropHi: record.commodityHi,
        variety: record.variety,
        varietyRequested: record.varietyRequested,
        varietyMatched: record.varietyMatched,
        varietyNotice: record.varietyNotice,
        grade: record.grade,
        mandi: record.mandi,
        mandiHi: record.mandiHi,
        district: record.district,
        state: record.state,
        userLocation: record.userLocation,
        modalPrice: record.modalPrice,
        minPrice: record.minPrice,
        maxPrice: record.maxPrice,
        unit: record.unit,
        trend: record.trend,
        changePct: record.changePct,
        marketDate: record.marketDate,
        formattedDate: record.formattedDate,
        isToday: record.isToday,
        updatedAt: record.fetchedAt,
        source: record.source,
        sourceRecordId: record.sourceRecordId,
        distanceKm: record.distanceKm,
        note: record.note,
      };
    }
  } catch (err) {
    console.warn("[MarketService] Mandi lookup failed:", err);
  }

  return {
    isAvailable: false,
    crop,
    mandi: `${district} APMC Mandi`,
    district,
    state,
    userLocation: `${district}, ${state}`,
    modalPrice: 0,
    minPrice: 0,
    maxPrice: 0,
    unit: "₹/quintal",
    trend: "stable",
    changePct: 0,
    marketDate: new Date().toISOString().split("T")[0],
    formattedDate: "N/A",
    isToday: false,
    updatedAt: new Date().toISOString(),
    source: "APMC Network",
    note: `Market price currently unavailable for ${crop} in ${district}.`,
  };
}
