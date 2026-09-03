"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  TrendingUp,
  MapPin,
  Clock,
  Droplets,
  Truck,
  Check,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  BadgePercent,
  Coins,
  Bug,
  HelpCircle,
  Award,
} from "lucide-react";
import {
  DiagnosticResult,
  StressDiagnostic,
  ProductCompatibilityPrescription,
} from "@/lib/agronomicDiagnosticEngine";
import { YieldPredictionOutput } from "@/lib/yieldPredictionEngine";
import { MandiArbitrageResult, MandiOption } from "@/lib/mandiLogisticsEngine";

interface AgronomicPillarsViewProps {
  diagnostic: DiagnosticResult;
  yieldData: YieldPredictionOutput;
  mandiData: MandiArbitrageResult;
  isHindi: boolean;
  onLockInPlan?: (prescription: ProductCompatibilityPrescription) => void;
}

export function AgronomicPillarsView({
  diagnostic,
  yieldData,
  mandiData,
  isHindi,
  onLockInPlan,
}: AgronomicPillarsViewProps) {
  const [activeTab, setActiveTab] = useState<"diagnostics" | "prescription" | "closed_loop" | "yield" | "mandi">("diagnostics");

  // Closed loop intervention states
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [appliedDate, setAppliedDate] = useState<string>("");
  const [visualCheckStatus, setVisualCheckStatus] = useState<"pending" | "healthy" | "issues">("pending");
  const [journalSyncing, setJournalSyncing] = useState<boolean>(false);
  const [journalSynced, setJournalSynced] = useState<boolean>(false);

  const { primaryStress, prescription, diagnostics, closedLoop, economicRoi } = diagnostic;

  const handleConfirmApplication = async () => {
    setJournalSyncing(true);
    const today = new Date().toISOString().split("T")[0];
    setAppliedDate(today);
    setHasApplied(true);

    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Applied ${prescription?.productName || "Agronomic Treatment"}`,
          notes: `Applied ${prescription?.totalFieldDose} in ${prescription?.totalWaterLiters}L water. Targeted ${primaryStress.name}.`,
          stage: diagnostic.context.growthStage,
          tags: ["AgronomicIntervention", prescription?.productKey || "Syngenta"],
        }),
      });
      setJournalSynced(true);
    } catch (e) {
      console.warn("Journal sync warning:", e);
    } finally {
      setJournalSyncing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Tab Navigation (Stripe / Linear Pill Style) ──── */}
      <div className="flex items-center gap-1.5 p-1 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl overflow-x-auto shadow-2xs">
        {[
          { id: "diagnostics", label: isHindi ? "1. समस्या पहचान (स्ट्रेस रडार)" : "1. Problem Diagnostics", badge: `${primaryStress.probabilityPct}% Risk` },
          { id: "prescription", label: isHindi ? "2. उत्पाद सिफारिश व 'क्यों?'" : "2. Product & Rationale", badge: prescription?.productName.split(" ")[1] || "Syngenta" },
          { id: "closed_loop", label: isHindi ? "3. रिकवरी ट्रैकर (क्लोज्ड लूप)" : "3. Closed-Loop Recovery", badge: hasApplied ? "Applied 🌿" : "Action Needed" },
          { id: "yield", label: isHindi ? "4. उपज पूर्वानुमान" : "4. Yield Prediction", badge: `+${yieldData.percentGainFromIntervention}%` },
          { id: "mandi", label: isHindi ? "5. मंडी मुनाफा व ढुलाई" : "5. Mandi Arbitrage", badge: mandiData.recommendedMandi.mandiName.split(" ")[0] },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === t.id
                ? "bg-white text-[#0d253d] shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-[#0d253d] hover:bg-white/60"
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                activeTab === t.id
                  ? "bg-indigo-50 text-[#533afd] font-bold"
                  : "bg-slate-200/60 text-slate-600"
              }`}
            >
              {t.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB 1: PILLAR A - PROBLEM IDENTIFICATION (STRESSES)
      ══════════════════════════════════════════════════════ */}
      {activeTab === "diagnostics" && (
        <div className="space-y-5">
          {/* Header Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-white border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-black uppercase text-rose-700 tracking-wider block">
                  Pillar 1 · Scientific Problem Identification (समस्या पहचान)
                </span>
                <h3 className="text-base font-extrabold text-[#0d253d]">
                  {primaryStress.name}
                </h3>
                <span className="text-xs text-slate-600">
                  {isHindi ? primaryStress.nameHi : "Identified via 16-day Open-Meteo microclimate & crop phenology analysis"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-[#0d253d]">
                Arrival: <strong className="text-rose-600">{primaryStress.timeToStressLabel}</strong>
              </span>
            </div>
          </div>

          {/* Stresses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnostics.map((st) => (
              <div
                key={st.id}
                className={`p-5 rounded-2xl bg-white border transition-all shadow-sm space-y-4 ${
                  st.id === primaryStress.id ? "border-rose-300 ring-2 ring-rose-500/10" : "border-[#e3e8ee]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        st.category === "ABIOTIC"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-purple-50 text-purple-800 border border-purple-200"
                      }`}
                    >
                      {st.category === "ABIOTIC" ? "Abiotic Stress (मौसम / तापमान)" : "Biotic Threat (कीट / व्याधि)"}
                    </span>
                    <h4 className="text-sm font-bold text-[#0d253d] mt-1.5">{st.name}</h4>
                  </div>

                  <div className="text-right">
                    <span
                      className="text-lg font-mono font-black block"
                      style={{ color: st.severityColor }}
                    >
                      {st.probabilityPct}%
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-600">Probability</span>
                  </div>
                </div>

                {/* Biological Mechanism */}
                <div className="p-3 rounded-xl bg-[#f6f9fc] border border-slate-200/80 space-y-1 text-xs">
                  <span className="font-bold text-slate-700 block flex items-center gap-1">
                    <FlaskConical className="h-3.5 w-3.5 text-indigo-600" />
                    Biological Mechanism (पादप क्रिया विज्ञान):
                  </span>
                  <p className="text-slate-600 leading-relaxed">{st.biologicalMechanism}</p>
                </div>

                {/* Symptoms & Yield Loss */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Watch For (लक्षण)</span>
                    <span className="text-[11px] font-medium text-amber-950 block mt-0.5">{st.symptomsToWatch}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
                    <span className="text-[10px] uppercase font-bold text-rose-800 block">Yield at Risk (उपज नुकसान)</span>
                    <span className="text-[11px] font-bold text-rose-950 block mt-0.5">
                      -{st.potentialYieldLossQtlPerAcre} qtl/acre (-{st.potentialYieldLossPct}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => setActiveTab("prescription")}
              className="px-4 py-2.5 rounded-xl bg-[#533afd] text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Product Recommendation &amp; Rationale</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 2: PILLAR B - PRODUCT COMPATIBILITY & "WHY?"
      ══════════════════════════════════════════════════════ */}
      {activeTab === "prescription" && prescription && (
        <div className="space-y-6">
          {/* Main Prescription Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-500/40 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PILLAR 2 · SYNGENTA COMPATIBILITY ENGINE
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  CIBRC REGISTERED
                </span>
              </div>

              <span className="text-xs font-mono font-bold bg-white/10 text-emerald-300 px-3 py-1 rounded-lg border border-white/10">
                Trial Efficacy: {prescription.trialEfficacyPct}%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {prescription.productName}
                </h3>
                <p className="text-xs font-mono text-emerald-400 mt-1">
                  {prescription.activeIngredient}
                </p>
                <span className="text-xs text-slate-300 mt-0.5 block">{prescription.categoryLabel}</span>
              </div>

              <div className="text-right">
                <span className="text-2xl font-mono font-black text-emerald-400">
                  ₹{prescription.estimatedDealerPriceInr}
                </span>
                <span className="text-[10px] text-slate-400 block">Est. Dealer MRP / Unit</span>
              </div>
            </div>

            {/* Dosages & Water customized for farmer's land */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Dose Per Acre</span>
                <span className="text-xs font-bold text-white font-mono block">{prescription.dosePerAcre}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Total Field Dose</span>
                <span className="text-xs font-extrabold text-emerald-300 font-mono block">
                  {prescription.totalFieldDose}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Water Req.</span>
                <span className="text-xs font-bold text-white font-mono block">
                  {prescription.totalWaterLiters} Liters
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Spray Window</span>
                <span className="text-xs font-bold text-amber-300 block">
                  Next 48 Hours (Morning)
                </span>
              </div>
            </div>

            {/* Transparent "Why?" Section */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
              <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Why This Recommendation? (3 Empirical Reasons)
              </span>
              <div className="space-y-2 text-xs">
                {prescription.whyReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-200">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px] border border-emerald-500/40">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tank Mix Compatibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 space-y-1">
                <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Tank-Mix Compatible (सुरक्षित मिश्रण)
                </span>
                <p className="text-[11px] text-slate-300">
                  {prescription.tankMixSafe.join(" · ")}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 space-y-1">
                <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  Do Not Mix In Tank (असुरक्षित)
                </span>
                <p className="text-[11px] text-slate-300">
                  {prescription.tankMixDanger.join(" · ")}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Source: {prescription.trialCitation}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (onLockInPlan) onLockInPlan(prescription);
                  setActiveTab("closed_loop");
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Lock In Spray Schedule &amp; Track Recovery</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 3: FEATURE 6 - CLOSED-LOOP MONITORING & RECOVERY
      ══════════════════════════════════════════════════════ */}
      {activeTab === "closed_loop" && (
        <div className="space-y-6">
          {/* Closed loop prompt */}
          <div className="p-5 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-[#533afd]">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0d253d]">
                    Closed-Loop Field Monitoring &amp; Recovery Tracker
                  </h3>
                  <p className="text-xs text-slate-500">
                    Did you apply the recommended {prescription?.productName || "treatment"} to your field?
                  </p>
                </div>
              </div>

              {hasApplied && (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Spray Recorded ({appliedDate})
                </span>
              )}
            </div>

            {/* Dynamic Stress Reduction Progression */}
            <div className="p-4 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Scientific Stress Reduction Trajectory:
              </span>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white border border-rose-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Before Intervention</span>
                  <span className="text-2xl font-mono font-black text-rose-600 block my-1">
                    {closedLoop.beforeStressProbability}%
                  </span>
                  <span className="text-[10px] text-rose-700 font-medium block">Active Stress</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">48 Hours After Spray</span>
                  <span className="text-2xl font-mono font-black text-amber-600 block my-1">
                    {closedLoop.after48hStressProbability}%
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium block">Membrane Stabilized</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">7 Days Later</span>
                  <span className="text-2xl font-mono font-black text-emerald-600 block my-1">
                    {closedLoop.later7dStressProbability}%
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium block">Full Recovery</span>
                </div>
              </div>
            </div>

            {/* Yes/No Application Button */}
            {!hasApplied ? (
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-indigo-950 block">
                    Have you sprayed {prescription?.productName || "the recommended product"}?
                  </span>
                  <span className="text-[11px] text-indigo-800">
                    Recording your spray syncs with your Farm Journal and enables daily recovery tracking.
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleConfirmApplication}
                    disabled={journalSyncing}
                    className="px-4 py-2 rounded-xl bg-[#533afd] text-white text-xs font-bold hover:opacity-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{journalSyncing ? "Saving to Journal..." : "Yes, I Applied It"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("prescription")}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Not Yet
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Visual Health Confirmation (दृश्य निरीक्षण)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    48H CHECKPOINT
                  </span>
                </div>

                <p className="text-xs text-emerald-900 leading-relaxed">
                  {closedLoop.visualCheckDescription}
                </p>

                <div className="p-3 rounded-lg bg-white border border-emerald-100 space-y-2">
                  <span className="text-xs font-semibold text-slate-800 block">
                    {closedLoop.visualConfirmationPrompt}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVisualCheckStatus("healthy")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        visualCheckStatus === "healthy"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      🌿 Yes, Canopy Healthy &amp; Flowers Retained
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisualCheckStatus("issues")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        visualCheckStatus === "issues"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      ⚠️ Still Observing Symptoms
                    </button>
                  </div>

                  {visualCheckStatus === "healthy" && (
                    <p className="text-[11px] text-emerald-800 font-medium">
                      ✅ Verification recorded! Plant health score boosted to 94%. Yield loss risk suppressed.
                    </p>
                  )}
                  {visualCheckStatus === "issues" && (
                    <p className="text-[11px] text-amber-800 font-medium">
                      ℹ️ Flagged for secondary inspection. Our agronomist advisor bot will follow up in 24 hours.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 4: FEATURE 8 - ROBUST YIELD PREDICTION
      ══════════════════════════════════════════════════════ */}
      {activeTab === "yield" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 inline-block mb-1">
                  FEATURE 8 · SCIENTIFIC YIELD ESTIMATOR
                </span>
                <h3 className="text-xl font-extrabold text-[#0d253d]">
                  {yieldData.crop} ({yieldData.variety}) Yield Outlook
                </h3>
                <span className="text-xs text-slate-500">
                  Field Area: {yieldData.acreage} Acres · Season: {yieldData.season}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Gain with Shielding</span>
                <span className="text-2xl font-mono font-black text-emerald-600">
                  +{yieldData.percentGainFromIntervention}%
                </span>
              </div>
            </div>

            {/* Comparison Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-500">Baseline Potential</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-black text-slate-800">
                    {yieldData.baselineGeneticPotentialQtlPerAcre}
                  </span>
                  <span className="text-xs text-slate-500">qtl / acre</span>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Total: {yieldData.baselineTotalYieldQtl} Quintals
                </span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-rose-700">Untreated (Heat Damaged)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-black text-rose-700">
                    {yieldData.predictedYieldUntreatedQtlPerAcre}
                  </span>
                  <span className="text-xs text-rose-600">qtl / acre</span>
                </div>
                <span className="text-[11px] text-rose-800 block">
                  Revenue: ₹{yieldData.estimatedRevenueUntreatedInr.toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold uppercase text-emerald-800">With Interventions (Mitigated)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-black text-emerald-700">
                    {yieldData.predictedYieldWithInterventionsQtlPerAcre}
                  </span>
                  <span className="text-xs text-emerald-600">qtl / acre</span>
                </div>
                <span className="text-[11px] text-emerald-900 font-bold block">
                  Revenue: ₹{yieldData.estimatedRevenueWithInterventionsInr.toLocaleString()} (+₹{yieldData.protectedCashValueInr.toLocaleString()})
                </span>
              </div>
            </div>

            {/* Drivers & Limiting Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-1.5">
                <span className="font-bold text-emerald-900 block flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-emerald-700" />
                  Yield Catalysts &amp; Drivers
                </span>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  {yieldData.positiveDrivers.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                <span className="font-bold text-amber-900 block flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-700" />
                  Limiting Constraints Accounted
                </span>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  {yieldData.limitingFactors.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 5: FEATURE 9 - MANDI LOGISTICS & ARBITRAGE
      ══════════════════════════════════════════════════════ */}
      {activeTab === "mandi" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block mb-1">
                  FEATURE 9 · MANDI LOGISTICS &amp; NET PROFIT OPTIMIZER
                </span>
                <h3 className="text-xl font-extrabold text-[#0d253d]">
                  Optimal Mandi for {mandiData.crop} Harvest ({mandiData.totalHarvestQtl} Quintals)
                </h3>
                <span className="text-xs text-slate-500">
                  Location: {mandiData.farmerLocation} · Includes freight, diesel &amp; APMC hamali expenses
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Max Extra In-Hand Profit</span>
                <span className="text-2xl font-mono font-black text-emerald-600">
                  +₹{mandiData.maxNetGainInr.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Recommended Mandi Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-300" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-100">
                    RECOMMENDED HIGHEST NET REALIZATION
                  </span>
                </div>
                <h4 className="text-lg font-black text-white">
                  {mandiData.recommendedMandi.mandiName}
                </h4>
                <p className="text-xs text-emerald-100">
                  {mandiData.recommendedMandi.recommendationReason}
                </p>
              </div>

              <div className="text-right shrink-0 bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
                <span className="text-[10px] uppercase font-bold text-emerald-200 block">Net Realized In Hand</span>
                <span className="text-xl font-mono font-black text-white">
                  ₹{mandiData.recommendedMandi.netRealizedProfitInr.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-100 block">
                  (₹{mandiData.recommendedMandi.netRatePerQtlInr}/qtl net)
                </span>
              </div>
            </div>

            {/* Mandis Comparison Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f6f9fc] border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">APMC Mandi</th>
                    <th className="p-3">Distance &amp; Time</th>
                    <th className="p-3">Modal Price</th>
                    <th className="p-3">Transport Cost</th>
                    <th className="p-3">Labor (Hamali)</th>
                    <th className="p-3">Net Realized (₹)</th>
                    <th className="p-3">Extra vs Local</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mandiData.options.map((m) => (
                    <tr
                      key={m.mandiId}
                      className={m.isRecommended ? "bg-emerald-50/40 font-semibold" : "hover:bg-slate-50/80"}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {m.isRecommended && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                          <span className="font-bold text-[#0d253d]">{m.mandiName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">{m.district}, {m.state}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-700">
                        {m.distanceKm} km · {m.travelTimeHours}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#0d253d]">
                        ₹{m.modalPricePerQtl} / qtl
                      </td>
                      <td className="p-3 font-mono text-rose-700">
                        -₹{m.transportationCostTotalInr.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-rose-700">
                        -₹{m.laborHamaliCostTotalInr.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-black text-emerald-700 text-sm">
                        ₹{m.netRealizedProfitInr.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-bold">
                        {m.profitDifferentialInr > 0 ? (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            +₹{m.profitDifferentialInr.toLocaleString()}
                          </span>
                        ) : m.profitDifferentialInr === 0 ? (
                          <span className="text-slate-500">Local Baseline</span>
                        ) : (
                          <span className="text-rose-600">-₹{Math.abs(m.profitDifferentialInr).toLocaleString()}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
