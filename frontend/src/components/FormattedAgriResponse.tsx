"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ShieldCheck,
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Clock,
  FlaskConical,
  Sprout,
} from "lucide-react";
import { addJournalEntry } from "@/lib/api";

interface FormattedAgriResponseProps {
  id: string;
  text: string;
  language: string;
  isSpeaking?: boolean;
  onToggleSpeech?: () => void;
  telemetryUsed?: {
    location?: string;
    temp?: number;
    soil?: number;
    wind?: number;
    isSpraySafe?: boolean;
  };
  mandiRecord?: {
    mandi?: string;
    mandiHi?: string;
    commodity?: string;
    commodityHi?: string;
    modalPrice?: number;
    minPrice?: number;
    maxPrice?: number;
    formattedDate?: string;
    isToday?: boolean;
  };
  matchedField?: {
    id: string;
    name: string;
    area_acres: number;
    crop: string;
    variety?: string;
    soil_type?: string;
  };
  confidenceScore?: number;
  provider?: string;
  whyRecommendation?: string;
  cropName?: string;
  acres?: number;
}

/**
 * Highlights agronomic tokens (temperatures, currencies, dosages, products) with sleek badges
 */
function highlightAgronomicEntities(rawText: string): React.ReactNode[] {
  // Regex matches:
  // 1. **bold text**
  // 2. Temperatures (e.g. 24.6°C, 35°C)
  // 3. Currencies (e.g. ₹5,380, ₹4,850/Q, ₹2,18,250)
  // 4. Dosages (e.g. 400 ml/acre, 250 ml/acre, 200 L, 2.0 Litres)
  // 5. Syngenta products (Quantis, Isabion, Vibrance, Amistar, etc.)
  const tokenRegex = /(\*\*[^*]+\*\*|\b\d+(?:\.\d+)?°C\b|₹[\d,]+(?:\/(?:Q|quintal|क्विंटल))?|\b\d+(?:\.\d+)?\s*(?:ml\/acre|L\/acre|L|Litres|मिली\/एकड़|लीटर)\b|(?:Quantis®?|Isabion®?|Vibrance®?|Amistar®?|क्वांटिस®?|इसाबियन®?))/gi;

  const parts = rawText.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Bold Markdown **text**
    if (part.startsWith("**") && part.endsWith("**")) {
      const clean = part.slice(2, -2);
      return (
        <strong key={idx} className="font-extrabold text-[#0d253d]">
          {clean}
        </strong>
      );
    }

    // Temperature Badge
    if (/^\d+(?:\.\d+)?°C$/i.test(part)) {
      return (
        <span
          key={idx}
          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold text-[11px] shadow-2xs mx-0.5 align-baseline"
        >
          <Thermometer className="h-3 w-3 inline text-blue-600 shrink-0" />
          <span>{part}</span>
        </span>
      );
    }

    // Mandi Currency Badge
    if (/^₹[\d,]+/i.test(part)) {
      return (
        <span
          key={idx}
          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono font-extrabold text-[11px] shadow-2xs mx-0.5 align-baseline"
        >
          <span>{part}</span>
        </span>
      );
    }

    // Chemical / Water Dosage Badge
    if (/\d+(?:\.\d+)?\s*(?:ml\/acre|L\/acre|L|Litres|मिली\/एकड़|लीटर)/i.test(part)) {
      return (
        <span
          key={idx}
          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-mono font-bold text-[11px] shadow-2xs mx-0.5 align-baseline"
        >
          <FlaskConical className="h-3 w-3 inline text-amber-600 shrink-0" />
          <span>{part}</span>
        </span>
      );
    }

    // Syngenta Product Badge
    if (/^(?:Quantis®?|Isabion®?|Vibrance®?|Amistar®?|क्वांटिस®?|इसाबियन®?)$/i.test(part)) {
      return (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-900 font-bold text-[11px] shadow-2xs mx-0.5 align-baseline"
        >
          <ShieldCheck className="h-3 w-3 inline text-purple-600 shrink-0" />
          <span>{part}</span>
        </span>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

export const FormattedAgriResponse: React.FC<FormattedAgriResponseProps> = ({
  id,
  text,
  language,
  isSpeaking = false,
  onToggleSpeech,
  telemetryUsed,
  mandiRecord,
  matchedField,
  confidenceScore = 98,
  provider = "Google Gemini 2.5 Flash",
  whyRecommendation,
  cropName = "Soybean",
  acres = 5.0,
}) => {
  const [copied, setCopied] = useState(false);
  const [showProvenance, setShowProvenance] = useState(false);
  const [savedToJournal, setSavedToJournal] = useState(false);

  // Copy full response text to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Quick save to farmer's journal
  const handleSaveToJournal = () => {
    try {
      addJournalEntry({
        date: new Date().toISOString().split("T")[0],
        activityType: "SPRAY_APPLICATION",
        productUsed: "Syngenta Quantis / Biostimulant",
        dosagePerAcre: "400 ml/acre",
        waterLitersPerAcre: 200,
        acresTreated: acres,
        targetPestOrStress: "Heat Stress / Flowering Protection",
        weatherCondition: telemetryUsed ? `${telemetryUsed.temp}°C, Wind ${telemetryUsed.wind} km/h` : "25°C",
        temperature: telemetryUsed?.temp || 25,
        windSpeed: telemetryUsed?.wind || 10,
        notes: `AI Recommendation from AASRA: ${text.slice(0, 180)}...`,
      });
      setSavedToJournal(true);
      setTimeout(() => setSavedToJournal(false), 3500);
    } catch (err) {
      console.warn("Could not save to journal:", err);
    }
  };

  // Split lines into structured paragraphs or bullet lists
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  return (
    <div className="space-y-3 font-sans">
      
      {/* 1. Verified Telemetry & Plot Anchor Header */}
      {(telemetryUsed || matchedField) && (
        <div className="flex items-center justify-between gap-2 flex-wrap bg-[#f6f9fc] border border-[#e3e8ee] px-3 py-1.5 rounded-xl text-[11px] font-mono shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            {matchedField && (
              <span className="flex items-center gap-1 font-bold text-[#533afd] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                <Sprout className="h-3 w-3 text-[#533afd] shrink-0" />
                <span>{matchedField.name} ({matchedField.area_acres} ac {matchedField.crop})</span>
              </span>
            )}
            {telemetryUsed && (
              <div className="flex items-center gap-1 text-slate-600">
                <MapPin className="h-3 w-3 text-[#533afd] shrink-0" />
                <span className="font-bold text-[#0d253d]">{telemetryUsed.location || "Bhopal, MP"}</span>
              </div>
            )}
          </div>

          {telemetryUsed && (
            <div className="flex items-center gap-2.5 text-slate-500">
              <span className="flex items-center gap-1 font-bold text-[#533afd]">
                <Thermometer className="h-3 w-3 text-[#533afd]" />
                {telemetryUsed.temp}°C
              </span>
              <span className="flex items-center gap-1 font-bold text-emerald-700">
                <Droplets className="h-3 w-3 text-emerald-600" />
                {telemetryUsed.soil}% Soil
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <Wind className="h-3 w-3 text-amber-600" />
                {telemetryUsed.wind} km/h
              </span>
              <span className={`px-1.5 py-0.5 rounded-md font-bold text-[10px] ${
                telemetryUsed.isSpraySafe
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {telemetryUsed.isSpraySafe ? "Safe Spray" : "Spray Caution"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 2. Structured Rich Text Body */}
      <div className="space-y-2.5 text-xs sm:text-sm text-[#0d253d] leading-relaxed">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();

          // Heading lines (e.g. ### Title or **Title:**)
          if (trimmed.startsWith("###") || trimmed.startsWith("##") || (trimmed.startsWith("**") && trimmed.endsWith(":**"))) {
            const cleanTitle = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "");
            return (
              <h4 key={lIdx} className="font-extrabold text-sm sm:text-base text-[#0d253d] font-display pt-1 border-b border-slate-100 pb-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#533afd]" />
                <span>{cleanTitle}</span>
              </h4>
            );
          }

          // Bullet Points (starts with •, *, -, or number)
          if (/^[-*•]\s+/i.test(trimmed) || /^\d+\.\s+/i.test(trimmed)) {
            const bulletContent = trimmed.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "");
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-1 py-0.5 group">
                <span className="h-1.5 w-1.5 rounded-full bg-[#533afd] mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                <p className="flex-1 leading-relaxed">{highlightAgronomicEntities(bulletContent)}</p>
              </div>
            );
          }

          // Regular Paragraph
          return (
            <p key={lIdx} className="leading-relaxed">
              {highlightAgronomicEntities(trimmed)}
            </p>
          );
        })}
      </div>

      {/* 3. Verified APMC Mandi Rate Card (If Present) */}
      {mandiRecord && (
        <div className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 border border-amber-200/90 p-3.5 rounded-2xl space-y-2 font-mono text-xs text-[#0d253d] shadow-2xs">
          <div className="flex items-center justify-between border-b border-amber-200/50 pb-1.5">
            <span className="text-amber-900 font-bold flex items-center gap-1.5">
              <span>🏛️</span>
              <span>{mandiRecord.mandiHi || mandiRecord.mandi} APMC Market Yard</span>
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-2xs ${
              mandiRecord.isToday
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }`}>
              {mandiRecord.formattedDate}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-sans font-medium">Modal Auction Rate:</span>
            <span className="font-black text-[#0d253d] text-sm sm:text-base">
              ₹{mandiRecord.modalPrice?.toLocaleString("en-IN")}/quintal
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans">
            <span>Range: ₹{mandiRecord.minPrice?.toLocaleString("en-IN")} – ₹{mandiRecord.maxPrice?.toLocaleString("en-IN")}</span>
            <span className="font-bold text-slate-700">{mandiRecord.commodityHi || mandiRecord.commodity}</span>
          </div>
        </div>
      )}

      {/* 4. Action Deck: Audio, Copy, Add to Journal, Grounding Accordion */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        
        {/* Left Actions: Copy & Save to Journal */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg border border-[#e3e8ee] hover:bg-slate-50 text-slate-600 hover:text-[#0d253d] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Copy advisory"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Add to Farm Journal */}
          <button
            type="button"
            onClick={handleSaveToJournal}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
              savedToJournal
                ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                : "border-[#e3e8ee] hover:bg-indigo-50 hover:border-indigo-200 text-slate-600 hover:text-[#533afd] font-semibold"
            }`}
            title="Log this recommendation in your Farm Journal"
          >
            {savedToJournal ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <BookOpen className="h-3 w-3" />}
            <span>{savedToJournal ? "Saved in Journal!" : "Log to Journal"}</span>
          </button>

          {/* Provenance Dropdown Trigger */}
          <button
            type="button"
            onClick={() => setShowProvenance(!showProvenance)}
            className="px-2.5 py-1 rounded-lg border border-[#e3e8ee] hover:bg-slate-50 text-slate-600 hover:text-[#0d253d] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <Sparkles className="h-3 w-3 text-[#533afd]" />
            <span>Telemetry Source</span>
            {showProvenance ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Right Action: Neural Audio Playback */}
        {onToggleSpeech && (
          <button
            type="button"
            onClick={onToggleSpeech}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              isSpeaking
                ? "bg-[#533afd] text-white border-[#533afd] shadow-sm animate-pulse-ring"
                : "bg-[#f6f9fc] text-slate-700 hover:text-[#533afd] hover:bg-indigo-50 border-[#e3e8ee]"
            }`}
          >
            {isSpeaking ? (
              <div className="flex items-center gap-0.5 h-3.5 px-0.5">
                <div className="w-0.5 bg-white rounded-full animate-soundwave-1" />
                <div className="w-0.5 bg-white rounded-full animate-soundwave-2" />
                <div className="w-0.5 bg-white rounded-full animate-soundwave-3" />
                <div className="w-0.5 bg-white rounded-full animate-soundwave-4" />
              </div>
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-[#533afd]" />
            )}
            <span>{isSpeaking ? "Playing Voice" : "Listen (बोलकर सुनें)"}</span>
          </button>
        )}
      </div>

      {/* Provenance Details Drawer */}
      {showProvenance && (
        <div className="p-3 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl text-xs text-slate-600 font-mono space-y-1.5 animate-in fade-in duration-150 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="font-bold text-[#0d253d]">Sensor Provenance:</span>
            <span className="text-[10px] font-bold text-[#533afd]">
              {provider} · Confidence {confidenceScore}%
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 font-sans">
            {whyRecommendation || `Verified hyper-local weather & APMC Agmarknet price matrix.`}
          </p>
          <div className="text-[10px] text-slate-400">
            Open-Meteo GPS Engine · Syngenta Certified Agronomic Knowledge Graph
          </div>
        </div>
      )}

    </div>
  );
};
