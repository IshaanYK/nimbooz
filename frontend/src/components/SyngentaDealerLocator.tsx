"use client";

import React from "react";
import {
  SyngentaDealer,
  getNearbySyngentaDealers,
  generateWhatsAppOrderLink,
  SYNGENTA_HELPLINE,
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
  farmerName = "Farm Owner",
  crop = "Soybean",
  fieldAcres = 12.5,
  productName = "Syngenta Quantis / Stress Buster",
  compact = false,
}) => {
  const { language } = useLanguage();
  const effectiveDistrict = district || "Bhopal";
  const dealers = getNearbySyngentaDealers(effectiveDistrict);

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
            <span>📍 {language === "hi" ? `निकटतम सिंजेंटा अधिकृत विक्रेता (${effectiveDistrict})` : `Nearest Syngenta Authorized Dealers (${effectiveDistrict})`}</span>
          </h3>
          <p className="text-xs text-slate-600">
            {language === "hi"
              ? `आपके ${fieldAcres} एकड़ खेत के लिए ${neededLiters}L ${productName} नजदीकी विक्रेताओं के पास उपलब्ध है`
              : `Authorized local dealers with live verified stock of ${productName} for your ${fieldAcres} acres`}
          </p>
        </div>

        {/* Local Verified District Indicator (No far-away district selector) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold shrink-0">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span>{effectiveDistrict} Local Zone</span>
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
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                      {dealer.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Proprietor: <strong>{dealer.proprietor}</strong>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {dealer.distanceKm} km {language === "hi" ? "दूरी" : "away"}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold justify-end mt-1">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{dealer.rating} ({dealer.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-start gap-1.5 text-[11px]">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{dealer.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" /> {dealer.timings}
                    </span>
                    {dealer.deliveryAvailable && (
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Truck className="h-3 w-3" /> {language === "hi" ? "होम डिलीवरी" : "Home Delivery"}
                      </span>
                    )}
                  </div>
                </div>

                {/* In-Stock Badges */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {dealer.stockStatus.quantis && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                      Quantis In-Stock
                    </span>
                  )}
                  {dealer.stockStatus.isabion && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                      Isabion In-Stock
                    </span>
                  )}
                  {dealer.stockStatus.stressBuster && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                      Stress Buster In-Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                <a
                  href={`tel:${dealer.phone}`}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-600" />
                  <span>{language === "hi" ? "कॉल करें" : "Call Dealer"}</span>
                </a>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Syngenta Kisan Toll-Free Bar */}
      <div className="bg-[#063B2D] text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Phone className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <span className="font-bold text-white block">
              {language === "hi" ? "सिंजेंटा किसान टोल-फ्री हेल्पलाइन" : "Syngenta Kisan Toll-Free Helpline"}
            </span>
            <span className="text-[11px] text-slate-300">
              {language === "hi" ? "प्रत्यक्ष एग्रोनॉमिक सहायता एवं डीलर लोकेटर" : "Direct agronomic support & dealer locator assistance across India"}
            </span>
          </div>
        </div>

        <a
          href={`tel:${SYNGENTA_HELPLINE.tollFree}`}
          className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-emerald-50 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm shrink-0"
        >
          <Phone className="h-3.5 w-3.5 text-emerald-700" />
          <span>{SYNGENTA_HELPLINE.tollFree}</span>
        </a>
      </div>
    </div>
  );
};
