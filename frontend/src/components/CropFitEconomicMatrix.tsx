"use client";

import React, { useState } from "react";
import { useFarm } from "@/context/FarmContext";
import { calculateDeterministicROI } from "@/lib/calculations/roiEngine";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Layers,
  Scale,
  Sparkles,
  Sliders,
  ChevronRight,
  Shield,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface CropFitEconomicMatrixProps {
  cropName?: string;
  fieldAcres?: number;
  mandiPricePerQuintal?: number;
  productName?: string;
  productCostPerAcre?: number;
  labourCostPerAcre?: number;
}

export const CropFitEconomicMatrix: React.FC<CropFitEconomicMatrixProps> = ({
  cropName,
  fieldAcres,
  mandiPricePerQuintal = 4850,
  productName = "Syngenta Quantis / Isabion",
  productCostPerAcre = 420,
  labourCostPerAcre = 150,
}) => {
  const { activeFarm } = useFarm();
  const effectiveCrop = cropName || activeFarm.primaryCrop || "Soybean";
  const effectiveAcres = fieldAcres || activeFarm.areaAcres || 5.0;

  const [dosageMlPerAcre, setDosageMlPerAcre] = useState<number>(250);
  const [activeDecisionTab, setActiveDecisionTab] = useState<"apply" | "delay" | "skip">("apply");

  // Confidence Score breakdown (Formula 3.3 in Concept Note)
  const forecastReliability = 0.92; // 92%
  const productConditionMatch = 0.89; // 89%
  const trialEvidence = 0.95; // 95%
  const compositeConfidenceScore = Math.round(
    (0.40 * forecastReliability + 0.35 * productConditionMatch + 0.25 * trialEvidence) * 100
  );

  // Economic calculations based on Apply, Delay, Skip
  const totalCostPerAcre = productCostPerAcre + labourCostPerAcre;
  const totalFieldCost = Math.round(totalCostPerAcre * effectiveAcres);

  // Scenario calculations (in quintals preserved and rupee gain per acre)
  const scenarios = {
    apply: {
      title: "1. Apply Now (Day 1 Recommendation)",
      badge: "HIGHEST ROI",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      protectedYieldQuintals: 0.52, // quintals per acre
      grossValuePerAcre: Math.round(0.52 * mandiPricePerQuintal), // ~₹2,558
      netProfitPerAcre: Math.round(0.52 * mandiPricePerQuintal - totalCostPerAcre), // ~₹1,988
      robiMultiple: ((0.52 * mandiPricePerQuintal) / totalCostPerAcre).toFixed(1), // ~4.5x
      totalFieldGain: Math.round((0.52 * mandiPricePerQuintal - totalCostPerAcre) * effectiveAcres),
      verdict: "Recommended Action: Prevent unseasonal heat stress at flowering stage. High certainty of return.",
      riskLevel: "Low Risk",
    },
    delay: {
      title: "2. Delay Application (+48 Hours)",
      badge: "SUB-OPTIMAL",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      protectedYieldQuintals: 0.21,
      grossValuePerAcre: Math.round(0.21 * mandiPricePerQuintal), // ~₹1,033
      netProfitPerAcre: Math.round(0.21 * mandiPricePerQuintal - totalCostPerAcre), // ~₹463
      robiMultiple: ((0.21 * mandiPricePerQuintal) / totalCostPerAcre).toFixed(1), // ~1.8x
      totalFieldGain: Math.round((0.21 * mandiPricePerQuintal - totalCostPerAcre) * effectiveAcres),
      verdict: "Sub-optimal: Irreversible flower drop reduces biological efficacy by 60%. Marginal profit.",
      riskLevel: "Moderate Risk",
    },
    skip: {
      title: "3. Skip Intervention (Zero Input)",
      badge: "NET LOSS RISK",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
      protectedYieldQuintals: 0.0,
      grossValuePerAcre: 0,
      netProfitPerAcre: -Math.round(0.65 * mandiPricePerQuintal), // Expected stress loss ~₹3,198/acre
      robiMultiple: "0.0",
      totalFieldGain: -Math.round(0.65 * mandiPricePerQuintal * effectiveAcres),
      verdict: "Avoid: Unmitigated climate stress causes unrecoverable yield loss exceeding ₹3,000/acre.",
      riskLevel: "Severe Stress Risk",
    },
  };

  const selectedScenario = scenarios[activeDecisionTab];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-emerald-400" /> PS-03 MARGINAL ECONOMIC OPTIMIZER
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
              Live Mandi Price: ₹{mandiPricePerQuintal.toLocaleString("en-IN")}/q
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Field Decision Matrix: Apply vs. Delay vs. Skip
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Calculated for <strong className="text-slate-200">{fieldAcres} Acres</strong> of {cropName} using Agmarknet wholesale benchmarks.
          </p>
        </div>

        {/* Confidence Badge (Formula 3.3) */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 px-4 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-black text-sm">
            {compositeConfidenceScore}%
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Confidence Score (Fmla 3.3)
            </span>
            <span className="text-xs font-semibold text-slate-200">
              0.40(Fcst) + 0.35(Match) + 0.25(Evid)
            </span>
          </div>
        </div>
      </div>

      {/* Decision Option Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["apply", "delay", "skip"] as const).map((tab) => {
          const sc = scenarios[tab];
          const isSelected = activeDecisionTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveDecisionTab(tab)}
              className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                isSelected
                  ? "bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${sc.badgeColor}`}>
                  {sc.badge}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {tab === "apply" ? "ROBI " + sc.robiMultiple + "x" : tab === "delay" ? "ROBI " + sc.robiMultiple + "x" : "Loss Risk"}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 mb-1">{sc.title}</h4>
              <div className="flex items-baseline gap-1">
                <span className={`text-base sm:text-lg font-mono font-black ${
                  sc.netProfitPerAcre >= 0 ? "text-emerald-400" : "text-red-400"
                }`}>
                  {sc.netProfitPerAcre >= 0 ? `+₹${sc.netProfitPerAcre.toLocaleString("en-IN")}` : `-₹${Math.abs(sc.netProfitPerAcre).toLocaleString("en-IN")}`}
                </span>
                <span className="text-[11px] text-slate-400">/ acre</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scenario Financial & Agronomic Deep-Dive Card */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Selected Strategy Analysis
            </span>
            <h4 className="text-lg font-black text-white">{selectedScenario.title}</h4>
            <p className="text-xs text-slate-400 font-normal">{selectedScenario.verdict}</p>
          </div>

          <div className="p-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-right shrink-0">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total {fieldAcres} Acre Financial Impact</span>
            <span className={`text-xl font-mono font-black ${
              selectedScenario.totalFieldGain >= 0 ? "text-emerald-400" : "text-red-400"
            }`}>
              {selectedScenario.totalFieldGain >= 0
                ? `+₹${selectedScenario.totalFieldGain.toLocaleString("en-IN")}`
                : `-₹${Math.abs(selectedScenario.totalFieldGain).toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>

        {/* Breakdown Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">Target Biological</span>
            <span className="font-bold text-slate-200 block truncate">{productName}</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">Input + Labour Cost</span>
            <span className="font-bold text-slate-200 block">₹{totalCostPerAcre} / acre</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">Yield Protected</span>
            <span className="font-bold text-slate-200 block">{selectedScenario.protectedYieldQuintals} q / acre</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">ROBI Multiplier</span>
            <span className="font-bold text-emerald-400 block">{selectedScenario.robiMultiple}x Return</span>
          </div>
        </div>

        {/* Live Dosage Slider for PS-03 */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span className="font-bold text-slate-300">CropFit Dosage Calibrator</span>
            </div>
            <span className="font-mono font-black text-emerald-400">{dosageMlPerAcre} ml / acre (Total: {((dosageMlPerAcre * effectiveAcres) / 1000).toFixed(1)} L)</span>
          </div>
          <input
            type="range"
            min={150}
            max={400}
            step={25}
            value={dosageMlPerAcre}
            onChange={(e) => setDosageMlPerAcre(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>150 ml (Mild Deficit)</span>
            <span>250 ml (Standard Stress)</span>
            <span>400 ml (Severe Compound Stress)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
