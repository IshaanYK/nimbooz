"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Store, MapPin, Sparkles, RefreshCw, Navigation } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getStoredProfile } from "@/lib/userStore";
import { getActiveField } from "@/lib/fieldStore";

import { useWeather } from "@/context/WeatherContext";

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
  const { weather } = useWeather();
  const [rates, setRates] = useState<MandiCommodity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sourceTag, setSourceTag] = useState<string>("APMC Daily");
  const [resolvedDistrict, setResolvedDistrict] = useState<string>(propDistrict || "");
  const [resolvedState, setResolvedState] = useState<string>(propState || "");

  // Sync prop changes immediately
  useEffect(() => {
    if (propDistrict && propDistrict.trim()) {
      setResolvedDistrict(propDistrict.trim());
    }
    if (propState && propState.trim()) {
      setResolvedState(propState.trim());
    }
  }, [propDistrict, propState]);

  // Fallback auto-detection if props are absent
  useEffect(() => {
    if (propDistrict && propDistrict.trim()) return;

    if (weather.district && weather.district !== "Local District") {
      setResolvedDistrict(weather.district);
      setResolvedState(weather.state || "India");
      return;
    }

    const profile = getStoredProfile();
    if (profile && profile.district && profile.district.trim()) {
      setResolvedDistrict(profile.district.trim());
      setResolvedState(profile.state || "India");
      return;
    }

    const activeField = getActiveField();
    if (activeField && activeField.district && activeField.district.trim()) {
      setResolvedDistrict(activeField.district.trim());
      setResolvedState(activeField.state || "India");
      return;
    }
  }, [propDistrict, weather.district, weather.state]);

  const activeDistrict = resolvedDistrict || weather.district || "Your Local Mandi";
  const activeState = resolvedState || weather.state || "India";

  const fetchRates = useCallback(async () => {
    if (!activeDistrict) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        district: activeDistrict,
        state: activeState,
        lat: String(weather.lat || 23.2599),
        lon: String(weather.lon || 77.4126),
      });
      const res = await fetch(`/api/mandi/rates?${queryParams.toString()}`);
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
  }, [activeDistrict, activeState, weather.lat, weather.lon]);

  useEffect(() => {
    if (activeDistrict) {
      fetchRates();
    }
  }, [activeDistrict, activeState, fetchRates]);

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
          <p className="text-xs text-slate-500">
            {language === "hi"
              ? `आपके क्षेत्र (${activeDistrict}) में वास्तविक उत्पादित फसलों के सरकारी APMC मॉडल भाव`
              : `Official APMC modal prices per quintal for crops actively cultivated in ${activeDistrict}`}
          </p>
        </div>

        <button
          onClick={fetchRates}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{language === "hi" ? "दरें रीफ्रेश करें" : "Refresh Rates"}</span>
        </button>
      </div>

      {loading && rates.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2 font-mono text-xs">
          <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Fetching official APMC rates for {activeDistrict}...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {rates.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 transition-all space-y-2 relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {language === "hi" ? item.commodityHi : item.commodity}
                  </h4>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Store className="h-3 w-3 text-slate-400" />
                    {item.mandi}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-slate-900 font-mono block">
                    ₹{item.modalPrice.toLocaleString("en-IN")}
                    <span className="text-[10px] text-slate-500 font-normal">/q</span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold ${
                      item.trend === "up"
                        ? "text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded"
                        : item.trend === "down"
                        ? "text-rose-700 bg-rose-100/80 px-1.5 py-0.2 rounded"
                        : "text-slate-600 bg-slate-200/80 px-1.5 py-0.2 rounded"
                    }`}
                  >
                    {item.trend === "up" ? (
                      <TrendingUp className="h-2.5 w-2.5" />
                    ) : item.trend === "down" ? (
                      <TrendingDown className="h-2.5 w-2.5" />
                    ) : null}
                    {item.changePct > 0 ? `+${item.changePct}%` : `${item.changePct}%`}
                  </span>
                </div>
              </div>

              {/* Price Band Min - Max */}
              <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[10px] font-mono text-slate-500">
                <span>Minimum : ₹{item.minPrice.toLocaleString("en-IN")}</span>
                <span>Maximum : ₹{item.maxPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
