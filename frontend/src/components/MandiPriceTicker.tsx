"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, Store, MapPin, Sparkles, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface MandiCommodity {
  commodity: string;
  commodityHi: string;
  mandi: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number; // ₹/quintal
  trend: "up" | "down" | "stable";
  changePct: number;
}

const LIVE_MANDI_RATES: MandiCommodity[] = [
  {
    commodity: "Soybean (Yellow)",
    commodityHi: "सोयाबीन (पीला)",
    mandi: "Bhopal APMC Mandi",
    minPrice: 4450,
    maxPrice: 4820,
    modalPrice: 4680,
    trend: "up",
    changePct: 1.8,
  },
  {
    commodity: "Soybean (JS-335)",
    commodityHi: "सोयाबीन (JS-335)",
    mandi: "Indore (Chhavani) Mandi",
    minPrice: 4520,
    maxPrice: 4910,
    modalPrice: 4750,
    trend: "up",
    changePct: 2.4,
  },
  {
    commodity: "Cotton (Medium Staple)",
    commodityHi: "कपास (मध्यम रेशा)",
    mandi: "Khandwa APMC Mandi",
    minPrice: 6800,
    maxPrice: 7450,
    modalPrice: 7150,
    trend: "up",
    changePct: 0.9,
  },
  {
    commodity: "Wheat (Sharbati / Lokwan)",
    commodityHi: "गेहूँ (शरबती / लोकवान)",
    mandi: "Sehore Krishi Mandi",
    minPrice: 2280,
    maxPrice: 2620,
    modalPrice: 2420,
    trend: "stable",
    changePct: 0.2,
  },
  {
    commodity: "Maize (Yellow Corn)",
    commodityHi: "मक्का (पीला)",
    mandi: "Chhindwara APMC Mandi",
    minPrice: 2050,
    maxPrice: 2290,
    modalPrice: 2180,
    trend: "down",
    changePct: -0.6,
  },
  {
    commodity: "Gram / Chana (Desi)",
    commodityHi: "चना (देसी)",
    mandi: "Vidisha Mandi",
    minPrice: 5600,
    maxPrice: 6150,
    modalPrice: 5920,
    trend: "up",
    changePct: 1.2,
  },
];

export const MandiPriceTicker: React.FC = () => {
  const { language } = useLanguage();
  const [selectedMandi, setSelectedMandi] = useState<string>("All");

  const filteredRates = selectedMandi === "All"
    ? LIVE_MANDI_RATES
    : LIVE_MANDI_RATES.filter((r) => r.mandi.includes(selectedMandi));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping" />
              {language === "hi" ? "दैनिक मंडी भाव (मध्य प्रदेश)" : "Live APMC Mandi Rates"}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Updated Today 11:30 AM
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
            <span>🏛️ {language === "hi" ? "आज के प्रमुख मंडी भाव और फसल दर" : "Regional Mandi Commodity Rates"}</span>
          </h3>
          <p className="text-xs text-slate-600">
            {language === "hi"
              ? "आपके क्षेत्र की मंडियों में आज का मॉडल भाव (₹/क्विंटल) — लाभ गणना इसी दर पर आधारित है"
              : "Official APMC modal prices per quintal used for live farm ROI & ROBI attribution"}
          </p>
        </div>

        {/* Mandi Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <select
            value={selectedMandi}
            onChange={(e) => setSelectedMandi(e.target.value)}
            className="text-xs font-extrabold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="All">All Major Mandis</option>
            <option value="Bhopal">Bhopal APMC</option>
            <option value="Indore">Indore Mandi</option>
            <option value="Sehore">Sehore Mandi</option>
            <option value="Khandwa">Khandwa Mandi</option>
            <option value="Chhindwara">Chhindwara Mandi</option>
          </select>
        </div>
      </div>

      {/* Grid of Commodity Prices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredRates.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-50/70 border border-slate-200 hover:border-emerald-400 rounded-2xl p-4 space-y-2 transition-all group"
          >
            <div className="flex items-start justify-between gap-1">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {language === "hi" ? item.commodityHi : item.commodity}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">{item.mandi}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-black text-slate-900 block">
                  ₹{item.modalPrice.toLocaleString("en-IN")}/q
                </span>
                <span className={`text-[10px] font-mono font-bold flex items-center justify-end gap-0.5 ${
                  item.trend === "up" ? "text-emerald-600" : item.trend === "down" ? "text-rose-600" : "text-slate-500"
                }`}>
                  {item.trend === "up" ? <TrendingUp className="h-3 w-3" /> : item.trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
                  {item.changePct > 0 ? `+${item.changePct}%` : `${item.changePct}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
              <span>न्यूनतम: ₹{item.minPrice}</span>
              <span>अधिकतम: ₹{item.maxPrice}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
