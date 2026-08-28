"use client";

import React, { useState } from "react";
import {
  SyngentaDealer,
  getNearbySyngentaDealers,
  generateWhatsAppOrderLink,
  SYNGENTA_HELPLINE,
  SYNGENTA_DISTRICT_DEALERS,
} from "@/lib/syngentaDealers";
import { useLanguage } from "@/context/LanguageContext";
import {
  Phone,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Navigation,
  Star,
  Clock,
  Truck,
  ShieldCheck,
  Building,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface SyngentaDealerLocatorProps {
  district?: string;
  farmerName?: string;
  crop?: string;
  fieldAcres?: number;
  productName?: string;
  compact?: boolean;
}

export const SyngentaDealerLocator: React.FC<SyngentaDealerLocatorProps> = ({
  district = "Bhopal",
  farmerName = "Ramesh Patel",
  crop = "Soybean",
  fieldAcres = 12.5,
  productName = "Syngenta Quantis / Stress Buster",
  compact = false,
}) => {
  const { language } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState<string>(district);
  const dealers = getNearbySyngentaDealers(selectedDistrict);
  const districtList = Object.keys(SYNGENTA_DISTRICT_DEALERS);

  const neededLiters = Math.round((250 * fieldAcres) / 100) / 10;

  return (
    <div className="bg-white rounded-3xl border border-emerald-200 p-5 sm:p-6 space-y-5 shadow-sm font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-700" />
              Verified Syngenta Network
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Live Stock Updated
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display flex items-center gap-2">
            <span>📍 {language === "hi" ? "निकटतम सिंजेंटा विक्रेता संपर्क" : "Nearby Syngenta Authorized Dealers"}</span>
          </h3>
          <p className="text-xs text-slate-600">
            {language === "hi"
              ? `आपके ${fieldAcres} एकड़ खेत के लिए ${neededLiters}L ${productName} उपलब्ध है`
              : `Authorized dealers with live stock of ${productName} for your ${fieldAcres} acres`}
          </p>
        </div>

        {/* District Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="text-xs font-extrabold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {districtList.map((d) => (
              <option key={d} value={d}>
                {d} District
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dealers Cards Grid */}
      <div className={`grid grid-cols-1 ${compact ? "gap-3" : "md:grid-cols-2 gap-4"}`}>
        {dealers.map((dealer) => {
          const waLink = generateWhatsAppOrderLink(dealer, farmerName, crop, fieldAcres, productName);
          return (
            <div
              key={dealer.id}
              className="bg-slate-50/70 border-2 border-slate-200 hover:border-emerald-400 rounded-2xl p-4 sm:p-5 space-y-3.5 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Dealer Title & Distance Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {dealer.name}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {language === "hi" ? "संचालक" : "Proprietor"}: <strong className="text-slate-900">{dealer.proprietor}</strong>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[11px] font-mono font-black text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-lg">
                      {dealer.distanceKm} km away
                    </span>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{dealer.rating} ({dealer.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Address & Timings */}
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{dealer.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {dealer.timings}
                    </span>
                    {dealer.deliveryAvailable && (
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Truck className="h-3 w-3" />
                        Home Delivery
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Quantis In-Stock
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Stress Buster In-Stock
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Isabion In-Stock
                  </span>
                </div>
              </div>

              {/* Action Buttons: 1-Tap Call & 1-Tap WhatsApp */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <a
                  href={`tel:${dealer.phone}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition-all cursor-pointer text-center"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{language === "hi" ? "कॉल करें" : "Call Dealer"}</span>
                </a>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black text-xs shadow-xs transition-all cursor-pointer text-center"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{language === "hi" ? "WhatsApp पूछताछ" : "WhatsApp"}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Syngenta Kisan Toll-Free Helpline Footer */}
      <div className="bg-emerald-950 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="font-extrabold text-amber-300 font-display">
              Syngenta Kisan Toll-Free Helpline
            </span>
          </div>
          <p className="text-emerald-200 text-[11px]">
            Direct agronomic support & dealer locator assistance across India
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${SYNGENTA_HELPLINE.tollFree.replace(/-/g, "")}`}
            className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-emerald-100 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-700" />
            <span>{SYNGENTA_HELPLINE.tollFree}</span>
          </a>
        </div>
      </div>

    </div>
  );
};
