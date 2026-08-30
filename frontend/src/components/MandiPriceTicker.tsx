"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Store, MapPin, Sparkles, RefreshCw, Navigation } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getStoredProfile } from "@/lib/userStore";
import { getActiveField } from "@/lib/fieldStore";

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

interface MandiPriceTickerProps {
  district?: string;
  state?: string;
}

export const MandiPriceTicker: React.FC<MandiPriceTickerProps> = ({
  district: propDistrict,
  state: propState,
}) => {
  const { language } = useLanguage();
  const [rates, setRates] = useState<MandiCommodity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sourceTag, setSourceTag] = useState<string>("APMC Daily");
  const [resolvedDistrict, setResolvedDistrict] = useState<string>(propDistrict || "");
  const [resolvedState, setResolvedState] = useState<string>(propState || "");

  // Auto-detect user's actual location if district is not provided
  useEffect(() => {
    async function resolveLocation() {
      if (propDistrict && propDistrict.trim()) {
        setResolvedDistrict(propDistrict.trim());
        setResolvedState(propState || "India");
        return;
      }

      // 1. Check saved farmer profile
      const profile = getStoredProfile();
      if (profile && profile.district && profile.district.trim()) {
        setResolvedDistrict(profile.district.trim());
        setResolvedState(profile.state || "India");
        return;
      }

      // 2. Check active field
      const activeField = getActiveField();
      if (activeField && activeField.district && activeField.district.trim()) {
        setResolvedDistrict(activeField.district.trim());
        setResolvedState(activeField.state || "India");
        return;
      }

      // 3. Auto-detect from browser GPS position if available
      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const res = await fetch(`/api/geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
              if (res.ok) {
                const geo = await res.json();
                if (geo.district) {
                  setResolvedDistrict(geo.district);
                  setResolvedState(geo.state || "India");
                  return;
                }
              }
            } catch (_) {}
            setResolvedDistrict("Your Local Mandi");
            setResolvedState("India");
          },
          () => {
            setResolvedDistrict("Your Local Mandi");
            setResolvedState("India");
          },
          { timeout: 5000 }
        );
      } else {
        setResolvedDistrict("Your Local Mandi");
        setResolvedState("India");
      }
    }

    resolveLocation();
  }, [propDistrict, propState]);

  const activeDistrict = resolvedDistrict || "Your Local Mandi";
  const activeState = resolvedState || "India";

  const fetchRates = async () => {
    if (!activeDistrict) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/mandi/rates?district=${encodeURIComponent(activeDistrict)}&state=${encodeURIComponent(activeState)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.rates && Array.isArray(data.rates)) {
          setRates(data.rates);
          if (data.source) setSourceTag(data.source);
        }
      }
    } catch (e) {
      console.warn("Error fetching mandi rates:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeDistrict) {
      fetchRates();
    }
  }, [activeDistrict, activeState]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping" />
              {language === "hi" ? "दैनिक मंडी भाव (लाइव)" : "Live APMC Mandi Rates"}
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {sourceTag} · {language === "hi" ? "आज अद्यतन" : "Live Market Feed"}
            </span>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
              <MapPin className="h-2.5 w-2.5" />
              {activeDistrict}
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
            <span>🏛️ {language === "hi" ? `प्रमुख मंडी भाव और फसल दर (${activeDistrict})` : `Major market prices and crop rates (${activeDistrict})`}</span>
          </h3>
          <p className="text-xs text-slate-600">
            {language === "hi"
              ? `आपके ${activeDistrict} क्षेत्र की मंडियों में आज का मॉडल भाव (₹/क्विंटल) — लाभ व बचत गणना इसी दर पर आधारित है`
              : `Official APMC modal prices per quintal for ${activeDistrict} used for live farm ROI & financial yield protection`}
          </p>
        </div>

        <button
          onClick={fetchRates}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          <span>{loading ? (language === "hi" ? "लोड हो रहा है..." : "Refreshing...") : (language === "hi" ? "दर रिफ्रेश करें" : "Refresh Rates")}</span>
        </button>
      </div>

      {/* Grid of Commodity Prices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {rates.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-50/70 border border-slate-200 hover:border-emerald-400 rounded-2xl p-4 space-y-2.5 transition-all group"
          >
            <div className="flex items-start justify-between gap-1">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {language === "hi" ? (item.commodityHi || item.commodity) : item.commodity}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">{item.mandi}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-sm text-slate-900 block">
                  ₹{item.modalPrice.toLocaleString("en-IN")}/q
                </span>
                <span
                  className={`text-[10px] font-mono font-bold inline-flex items-center gap-0.5 ${
                    item.trend === "up"
                      ? "text-emerald-600"
                      : item.trend === "down"
                      ? "text-rose-600"
                      : "text-slate-500"
                  }`}
                >
                  {item.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : item.trend === "down" ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  {item.changePct > 0 ? `+${item.changePct}%` : `${item.changePct}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-2">
              <span>Minimum : ₹ {item.minPrice.toLocaleString("en-IN")}</span>
              <span>Maximum : ₹ {item.maxPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
