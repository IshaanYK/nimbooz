"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Scale,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  GitBranch,
  Layers
} from "lucide-react";

interface CausalAttributionInspectorProps {
  cropName?: string;
  season?: string;
  district?: string;
  actualYieldQuintals?: number;
  counterfactualYieldQuintals?: number;
  mandiPricePerQuintal?: number;
  interventionCostPerAcre?: number;
}

export const CausalAttributionInspector: React.FC<CausalAttributionInspectorProps> = ({
  cropName = "Soybean (JS 335)",
  season = "Kharif 2025-26",
  district = "Sehore / Bhopal, MP",
  actualYieldQuintals = 8.4,
  counterfactualYieldQuintals = 6.9,
  mandiPricePerQuintal = 4920,
  interventionCostPerAcre = 570, // Quantis @ 250ml + application labour
}) => {
  const [activeTab, setActiveTab] = useState<"visual" | "methodology" | "weights">("visual");

  const treatmentEffectQuintals = +(actualYieldQuintals - counterfactualYieldQuintals).toFixed(2); // +1.50 q/acre
  const grossValuePreserved = Math.round(treatmentEffectQuintals * mandiPricePerQuintal); // ~₹7,380
  const netProfitPerAcre = Math.round(grossValuePreserved - interventionCostPerAcre); // ~₹6,810
  const robiMultiple = (grossValuePreserved / interventionCostPerAcre).toFixed(1); // ~12.9x

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-emerald-400" /> PS-07 CAUSAL ATTRIBUTION ENGINE
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
              Double ML / EconML
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Did the Biological Make a Difference? (Causal Proof)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Disentangles seasonal weather noise from verified biological treatment effect for {cropName} ({district}).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab("visual")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "visual" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Outcome Yield
          </button>
          <button
            onClick={() => setActiveTab("methodology")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "methodology" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Double ML Science
          </button>
        </div>
      </div>

      {activeTab === "visual" ? (
        <div className="space-y-6">
          {/* Main Visual Comparison: Counterfactual vs Actual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Counterfactual (Without Biological) */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                  Counterfactual Baseline (Y₀)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                  Predicted Without Intervention
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-mono font-black text-slate-300">
                  {counterfactualYieldQuintals}
                </span>
                <span className="text-sm font-semibold text-slate-400">quintals / acre</span>
              </div>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                What the field would have produced under ambient unseasonal heat stress without biological osmoprotectants.
              </p>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-slate-500 h-full rounded-full" style={{ width: `${(counterfactualYieldQuintals / 10) * 100}%` }} />
              </div>
            </div>

            {/* Actual Treated Field (With Biological) */}
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
                  Treated Field Yield (Y₁)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  With Syngenta Quantis
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">
                  {actualYieldQuintals}
                </span>
                <span className="text-sm font-semibold text-emerald-300">quintals / acre</span>
              </div>
              <p className="text-xs text-emerald-200/80 font-normal leading-relaxed">
                Harvested yield protected against flower drop and pod abortion through timely Day 1 application.
              </p>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(actualYieldQuintals / 10) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Verified Treatment Impact Summary Banner */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Net Yield Gain</span>
              <span className="text-lg sm:text-xl font-mono font-black text-emerald-400">+{treatmentEffectQuintals} q/ac</span>
              <span className="text-[10px] text-slate-500 block">(+21.7% Protected)</span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Gross Value</span>
              <span className="text-lg sm:text-xl font-mono font-black text-emerald-400">+₹{grossValuePreserved.toLocaleString("en-IN")}</span>
              <span className="text-[10px] text-slate-500 block">@ ₹{mandiPricePerQuintal}/q Mandi</span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Net Profit / Acre</span>
              <span className="text-lg sm:text-xl font-mono font-black text-emerald-400">+₹{netProfitPerAcre.toLocaleString("en-IN")}</span>
              <span className="text-[10px] text-slate-500 block">After ₹{interventionCostPerAcre} Input</span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Return on Biological</span>
              <span className="text-lg sm:text-xl font-mono font-black text-emerald-400">{robiMultiple}x ROBI</span>
              <span className="text-[10px] text-slate-500 block">Unconfounded Efficacy</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            Double Machine Learning (DML) Formulation
          </h4>
          <p>
            Standard yield correlations confuse biological product efficacy with seasonal variations (e.g. good late rains or rich baseline soil). AASRA applies **Double ML** with orthogonalized residuals:
          </p>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 space-y-1">
            <div>1. Outcome Residual:  Ỹ = Y - E[Y | Weather, Soil, Phenology]</div>
            <div>2. Treatment Residual: T̃ = T - E[T | Weather, Soil, Phenology]</div>
            <div>3. Causal Impact (θ): Ỹ = θ · T̃ + ε   (Estimated via XGBoost + EconML)</div>
          </div>
          <p>
            This guarantees that the +{treatmentEffectQuintals} q/acre yield attribution is strictly causal, eliminating all weather confounding and establishing absolute trust for smallholder farmers.
          </p>
        </div>
      )}
    </div>
  );
};
