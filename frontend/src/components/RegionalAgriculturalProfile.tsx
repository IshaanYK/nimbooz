"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { CropInfo, getRegionalCrops } from "@/lib/cropRegistry";
import { SYNGENTA_LOCAL_DEALS, SyngentaDeal } from "@/lib/syngentaDealers";
import {
  Sprout,
  ShieldCheck,
  TrendingUp,
  Tag,
  Sparkles,
  Layers,
  ChevronRight,
  Droplets,
  Calendar,
  CheckCircle2,
  Building2,
  ExternalLink,
  Award,
} from "lucide-react";

interface RegionalAgriculturalProfileProps {
  district: string;
  state: string;
  currentCrop?: string;
  acres?: number;
  onSelectCrop?: (cropName: string) => void;
}

const CROP_REAL_IMAGES: Record<string, string> = {
  soybean: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80",
  wheat: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
  cotton: "https://images.unsplash.com/photo-1594488555845-a74cb67a9749?auto=format&fit=crop&w=600&q=80",
  mustard: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
  tomato: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80",
  rice: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80",
  paddy: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80",
  maize: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
  chana: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80",
  gram: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80",
  onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80",
  chilli: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80",
  groundnut: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80",
  sugarcane: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
  garlic: "https://images.unsplash.com/photo-1615477550927-6ec7e05a0d3a?auto=format&fit=crop&w=600&q=80",
  bajra: "https://images.unsplash.com/photo-1601308365287-1725b8109bf5?auto=format&fit=crop&w=600&q=80",
  jowar: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
  tur: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80",
  moong: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80",
};

export function RegionalAgriculturalProfile({
  district,
  state,
  currentCrop = "Soybean",
  acres = 5.0,
  onSelectCrop,
}: RegionalAgriculturalProfileProps) {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);
  const [showAllCrops, setShowAllCrops] = React.useState<boolean>(false);

  const cleanDistrict = district || "Local Region";
  const cleanState = state || "India";

  const allRegionalCrops = getRegionalCrops(cleanDistrict, cleanState);
  const regionalCrops = showAllCrops ? allRegionalCrops : allRegionalCrops.slice(0, 9);

  // Relevant Syngenta local deals
  const relevantDeals = SYNGENTA_LOCAL_DEALS.filter((d) =>
    d.eligibleCrops.some((c) => c.toLowerCase() === currentCrop.toLowerCase())
  ).slice(0, 2);

  const displayDeals = relevantDeals.length > 0 ? relevantDeals : SYNGENTA_LOCAL_DEALS.slice(0, 2);

  return (
    <div className="space-y-6 select-none">
      {/* ── 1. Major Regional Crops Grid ───────────────────────────── */}
      <div className="bg-white border border-[#e3e8ee] shadow-sm rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-xs">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-[#0d253d] flex items-center gap-2">
                <span>{isHindi ? `${cleanDistrict} (${cleanState}) की प्रमुख फसलें व कृषि प्रोफ़ाइल` : `Major Crops & Agronomic Profile for ${cleanDistrict}, ${cleanState}`}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi
                  ? "क्षेत्रीय मिट्टी, जल स्तर और मौसम के अनुसार सर्वाधिक उगाई जाने वाली फसलें।"
                  : "Dominant commercial and food crops calibrated to local soil & agro-climatic zone."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
              📍 {cleanDistrict.toUpperCase()} AGRO-ZONE ({allRegionalCrops.length} CROPS)
            </span>
          </div>
        </div>

        {/* Real Photographic Crop Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionalCrops.map((c) => {
            const cropKey = c.id.toLowerCase();
            const photoUrl = CROP_REAL_IMAGES[cropKey] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80";
            const isCurrentActive = c.name.toLowerCase().includes(currentCrop.toLowerCase()) || currentCrop.toLowerCase().includes(c.id.toLowerCase());

            return (
              <div
                key={c.id}
                onClick={() => onSelectCrop && onSelectCrop(c.name.split(" ")[0])}
                className={`rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 group ${
                  isCurrentActive
                    ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "bg-white hover:border-slate-300 border-[#e3e8ee]"
                }`}
              >
                {/* Real High-Res Crop Photo Header */}
                <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                  <Image
                    src={photoUrl}
                    alt={c.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-white bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20">
                      {c.season} Season
                    </span>

                    {isCurrentActive && (
                      <span className="text-[9px] font-mono font-bold text-emerald-950 bg-emerald-400 px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> ACTIVE CROP
                      </span>
                    )}
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-2 left-2.5 right-2.5">
                    <h4 className="text-white font-bold font-display text-sm tracking-tight drop-shadow-sm">
                      {isHindi ? c.nameHi : c.name}
                    </h4>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-3.5 space-y-2.5 bg-slate-50/50">
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200/80">
                      <span className="text-slate-400 text-[9px] block">Opt. Temp Range</span>
                      <span className="font-bold text-slate-800">{c.t_opt_day}°C - {c.t_opt_night}°C</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200/80">
                      <span className="text-slate-400 text-[9px] block">Govt. MSP Rate</span>
                      <span className="font-bold text-[#533afd]">₹{c.mspPrice}/qtl</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                    <span className="truncate">Var: <strong className="text-slate-800">{c.defaultVariety.split("/")[0]}</strong></span>
                    <span className="text-emerald-700 font-bold text-[10px] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      {isCurrentActive ? "Active ✓" : "Select Crop →"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Regional Crops Toggle */}
        {allRegionalCrops.length > 9 && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowAllCrops(!showAllCrops)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs"
            >
              {showAllCrops ? (isHindi ? "कम फसलें दिखाएं ↑" : "Show Fewer Crops ↑") : (isHindi ? `सभी ${allRegionalCrops.length} क्षेत्रीय फसलें देखें ↓` : `View All ${allRegionalCrops.length} Regional Crops ↓`)}
            </button>
          </div>
        )}
      </div>

      {/* ── 2. Location-Based Syngenta Deals & Mandi Offers ───────── */}
      <div className="bg-white border border-[#e3e8ee] shadow-sm rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-[#533afd] border border-indigo-200">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-display text-[#0d253d]">
                {isHindi
                  ? `${cleanDistrict} में सिंजेंटा प्रमाणित कृषि छूट व ऑफ़र`
                  : `Active Syngenta Mandi Offers & Rebates (${cleanDistrict})`}
              </h3>
              <p className="text-xs text-slate-500">
                Direct procurement vouchers redeemable at authorized Krishi Seva Kendras in {cleanDistrict}.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-[#533afd] font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 shadow-2xs">
            VERIFIED LOCAL DEALS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayDeals.map((deal) => (
            <div
              key={deal.id}
              className="p-5 rounded-2xl bg-gradient-to-br from-[#ffffff] to-indigo-50/40 border border-indigo-200/80 space-y-3 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#533afd] bg-indigo-100 px-2.5 py-0.5 rounded-md border border-indigo-200">
                  {deal.badge}
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-medium">
                  {deal.validTill}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#0d253d] font-display">{deal.title}</h4>
                <p className="text-xs text-emerald-700 font-bold mt-1">{deal.discountSummary}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{deal.terms}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-indigo-100 text-xs font-mono">
                <span className="text-slate-700 font-bold">
                  Code: <strong className="text-[#533afd] bg-white px-2 py-0.5 rounded border border-indigo-200">{deal.couponCode}</strong>
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Valid at {cleanDistrict} Mandi
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
