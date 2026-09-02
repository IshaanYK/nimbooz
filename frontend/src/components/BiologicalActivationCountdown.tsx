"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Clock,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Droplets,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Sun,
  Flame,
} from "lucide-react";

interface BiologicalActivationCountdownProps {
  initialHoursRemaining?: number;
  cropName?: string;
  fieldAcres?: number;
  stressType?: string;
  onApplyClick?: (day: number) => void;
}

export const BiologicalActivationCountdown: React.FC<BiologicalActivationCountdownProps> = ({
  cropName = "Soybean",
  fieldAcres = 12.5,
  stressType = "Heatwave & Moisture Deficit",
  onApplyClick,
}) => {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const [selectedDay, setSelectedDay] = useState<1 | 2 | 3 | 4>(1);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const acresNum = Number(fieldAcres) || 12.5;

  const handleLockIn = () => {
    setIsSaved(true);
    if (onApplyClick) {
      onApplyClick(selectedDay);
    }
    setTimeout(() => setIsSaved(false), 3500);
  };

  // Yield preservation statistics based on intervention timing
  const windowStats = {
    1: {
      labelEn: "Day 1 (Today - Recommended)",
      labelHi: "दिन 1 (आज - सबसे उत्तम समय)",
      preservation: "94%",
      ratePerAcre: 2450,
      damagePrevented: "₹2,450 / acre",
      totalFarmGain: Math.round(2450 * acresNum),
      statusEn: "OPTIMAL WINDOW",
      statusHi: "सर्वोत्तम समय",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      borderColor: "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20",
      descEn: "Applying biostimulant (Syngenta Quantis) today protects flower buds and leaf stomata before thermal heat stress affects your crop.",
      descHi: "आज सिंजेंटा क्वांटिस का छिड़काव करने से फसल के फूल और पत्तियां गर्मी व लू से पूरी तरह सुरक्षित रहती हैं।",
    },
    2: {
      labelEn: "Day 2 (Tomorrow - Moderate)",
      labelHi: "दिन 2 (कल - मध्यम लाभ)",
      preservation: "72%",
      ratePerAcre: 1680,
      damagePrevented: "₹1,680 / acre",
      totalFarmGain: Math.round(1680 * acresNum),
      statusEn: "WINDOW CLOSING",
      statusHi: "समय समाप्त हो रहा है",
      statusColor: "bg-amber-100 text-amber-900 border-amber-200",
      borderColor: "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20",
      descEn: "Mild heat stress begins. Crop recovery is partial; product efficacy drops by ~28% compared to Day 1.",
      descHi: "गर्मी का हल्का असर शुरू हो जाता है। फसल की सुरक्षा लगभग 72% ही हो पाती है।",
    },
    3: {
      labelEn: "Day 3 (In 2 Days - Critical)",
      labelHi: "दिन 3 (परसों - अधिक जोखिम)",
      preservation: "38%",
      ratePerAcre: 720,
      damagePrevented: "₹720 / acre",
      totalFarmGain: Math.round(720 * acresNum),
      statusEn: "CRITICAL RISK",
      statusHi: "गंभीर जोखिम",
      statusColor: "bg-orange-100 text-orange-900 border-orange-200",
      borderColor: "border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20",
      descEn: "Leaves experience moisture deficit. Spraying now only prevents severe crop loss, but maximum yield is already compromised.",
      descHi: "पत्तियों में नमी कम होने लगती है। अब छिड़काव करने से केवल बड़ा नुकसान बचता है, पैदावार घट सकती है।",
    },
    4: {
      labelEn: "Day 4+ (Too Late - High Loss)",
      labelHi: "दिन 4+ (देरी - भारी नुकसान)",
      preservation: "8%",
      ratePerAcre: 150,
      damagePrevented: "₹150 / acre",
      totalFarmGain: Math.round(150 * acresNum),
      statusEn: "WINDOW EXPIRED",
      statusHi: "समय समाप्त",
      statusColor: "bg-rose-100 text-rose-900 border-rose-200",
      borderColor: "border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20",
      descEn: "Severe heat shock has already occurred. Chemical or biological inputs provide very little return at this late stage.",
      descHi: "गर्मी व लू से फसल को स्थायी नुकसान हो चुका होता है। इस चरण में किसी दवा का अधिक लाभ नहीं मिलता।",
    },
  };

  const current = windowStats[selectedDay];

  return (
    <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 transition-all">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              {isHindi ? "मौसम व फसल सुरक्षा खिड़की" : "Optimal Crop Protection Window"}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${current.statusColor}`}>
              {isHindi ? current.statusHi : current.statusEn}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#0d253d] font-display tracking-tight">
            {isHindi ? `${cropName} फसल सुरक्षा समय-सारणी` : `Climate Stress Preventive Window (${cropName})`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            {isHindi
              ? `आपके ${acresNum} एकड़ खेत के लिए मौसम पूर्वानुमान के आधार पर स्प्रे करने का सबसे सही दिन और अनुमानित मुनाफा`
              : `Calibrated for ${acresNum} Registered Acres based on 14-day agro-meteorological forecast.`}
          </p>
        </div>

        {/* Recommended Daily Window Highlight */}
        <div className="bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl p-3 px-4 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              {isHindi ? "दैनिक स्प्रे का समय" : "Best Spray Hours Today"}
            </span>
            <span className="text-xs font-bold text-[#0d253d]">
              06:00 – 09:00 AM / 04:30 – 07:00 PM
            </span>
          </div>
        </div>
      </div>

      {/* Interactive 4-Day Horizon Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span className="font-bold uppercase tracking-wider">
            {isHindi ? "स्प्रे करने का दिन चुनें:" : "Select Application Timing:"}
          </span>
          <span className="text-amber-700 font-medium">
            {isHindi ? "देरी से छिड़काव करने पर लाभ घटता है" : "Delayed intervention reduces yield protection"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((dayNum) => {
            const stat = windowStats[dayNum as 1 | 2 | 3 | 4];
            const isSelected = selectedDay === dayNum;
            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDay(dayNum as 1 | 2 | 3 | 4)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? stat.borderColor
                    : "border-[#e3e8ee] bg-[#f6f9fc] hover:bg-slate-100/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#0d253d]">
                    {dayNum === 1
                      ? (isHindi ? "दिन 1 (आज)" : "Day 1 (Today)")
                      : dayNum === 2
                      ? (isHindi ? "दिन 2 (कल)" : "Day 2 (+1d)")
                      : dayNum === 3
                      ? (isHindi ? "दिन 3 (परसों)" : "Day 3 (+2d)")
                      : (isHindi ? "दिन 4+ (देरी)" : "Day 4+ (+3d)")}
                  </span>
                  <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full border ${stat.statusColor}`}>
                    {stat.preservation}
                  </span>
                </div>
                <div className="text-sm font-black font-mono text-[#0d253d]">
                  {stat.damagePrevented}
                </div>
                <div className="text-[10px] font-mono text-emerald-700 font-bold truncate">
                  {isHindi ? "कुल बचत" : "Farm Gain"}: +₹{stat.totalFarmGain.toLocaleString("en-IN")}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Deep Dive Card */}
      <div className="bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div>
            <h4 className="font-bold text-base text-[#0d253d] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              {isHindi ? current.labelHi : current.labelEn}
            </h4>
            <p className="text-xs text-slate-600 font-normal mt-0.5">
              {isHindi ? current.descHi : current.descEn}
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">
              {isHindi ? "कुल खेत का अनुमानित लाभ" : "TOTAL FARM PRESERVATION"}
            </span>
            <span className="text-lg font-black font-mono text-emerald-700">
              +₹{current.totalFarmGain.toLocaleString("en-IN")} ({acresNum} Ac)
            </span>
          </div>
        </div>

        {/* Agronomic Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Droplets className="h-4 w-4 text-sky-600" />
            <span>
              {isHindi ? "सर्वोत्तम स्प्रे समय:" : "Optimal Application Window:"}{" "}
              <strong className="text-[#0d253d]">06:00 – 09:00 AM या 04:30 – 07:00 PM</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleLockIn}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
              isSaved
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gradient-to-r from-[#533afd] to-[#4434d4] hover:opacity-95"
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-200 animate-bounce" />
                <span>{isHindi ? `दिन ${selectedDay} प्लान सुरक्षित हो गया! ✓` : `Day ${selectedDay} Plan Locked In! ✓`}</span>
              </>
            ) : (
              <>
                <span>{isHindi ? `दिन ${selectedDay} का स्प्रे प्लान सुरक्षित करें` : `Lock In Day ${selectedDay} Spray Plan`}</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
