"use client";

import React, { useState } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  RefreshCw,
  Sprout,
  Calendar,
  Layers
} from "lucide-react";
import Image from "next/image";

interface GrowthStageEstimate {
  stageName: string;
  stageCode: string;
  estimatedSowingDaysAgo: number;
  confidence: number;
  visualFeatures: string[];
  recommendedBiologicalWindow: string;
  accumulatedGddEst: number;
}

export const GeminiVisionGrowthEstimator: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<string>("sample_flowering");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [customFile, setCustomFile] = useState<string | null>(null);

  const sampleImages: Record<string, { label: string; url: string; result: GrowthStageEstimate }> = {
    sample_flowering: {
      label: "Soybean - Early Flowering (R1)",
      url: "https://images.unsplash.com/photo-1599818818584-c8c366ff40cf?auto=format&fit=crop&w=600&q=80",
      result: {
        stageName: "Early Flowering / Petal Opening",
        stageCode: "R1 Stage",
        estimatedSowingDaysAgo: 48,
        confidence: 94,
        visualFeatures: ["Open purple/white corollas at upper nodes", "Active trifoliate expansion", "No pod elongation yet visible"],
        recommendedBiologicalWindow: "Day 1-2 Heat Stress Shield (Quantis / Isabion @ 250ml/ac)",
        accumulatedGddEst: 640,
      },
    },
    sample_vegetative: {
      label: "Soybean - Vegetative (V4)",
      url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80",
      result: {
        stageName: "Late Vegetative Branching",
        stageCode: "V4 Stage",
        estimatedSowingDaysAgo: 32,
        confidence: 91,
        visualFeatures: ["4 fully unrolled trifoliate leaves", "Active root nodulation", "Pre-budding canopy coverage ~70%"],
        recommendedBiologicalWindow: "Root Architecture & Microbial Stimulant (Quantis @ 200ml/ac)",
        accumulatedGddEst: 420,
      },
    },
    sample_pod: {
      label: "Soybean - Pod Development (R3)",
      url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80",
      result: {
        stageName: "Pod Elongation & Grain Filling",
        stageCode: "R3 / R4 Stage",
        estimatedSowingDaysAgo: 65,
        confidence: 96,
        visualFeatures: ["Pods 5mm+ at one of 4 uppermost nodes", "Seed filling initiation", "High water demand peak"],
        recommendedBiologicalWindow: "Grain Weight Sustenance & Anti-Transpirant Spray",
        accumulatedGddEst: 890,
      },
    },
  };

  const currentResult = sampleImages[selectedSample]?.result;

  const handleSimulateAnalysis = (key: string) => {
    setIsAnalyzing(true);
    setSelectedSample(key);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> PS-04 & 03.3 GEMINI VISION FALLBACK
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
              Multimodal Fallback
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Sowing Date Unknown? Gemini Vision Phenology Estimator
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Concept Note Section 03.3: If farmer cannot provide exact sowing date, Gemini Vision analyzes crop photo to derive growth stage.
          </p>
        </div>
      </div>

      {/* Interactive Selection / Upload Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Image selector / Camera view */}
        <div className="lg:col-span-5 space-y-4">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
            Select Field Photograph or Upload:
          </label>

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(sampleImages).map(([key, sample]) => (
              <button
                key={key}
                onClick={() => handleSimulateAnalysis(key)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedSample === key
                    ? "bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="relative h-16 w-full rounded-lg overflow-hidden mb-1.5 bg-slate-900">
                  <Image
                    src={sample.url}
                    alt={sample.label}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-300 block truncate">
                  {sample.label.split(" - ")[1]}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-center space-y-2">
            <Camera className="h-6 w-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400 font-normal">
              Or snap photo via WhatsApp / Web app camera
            </p>
          </div>
        </div>

        {/* Right: Gemini Vision Extracted Agronomic Twin */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                Gemini 1.5 Pro Phenology Inspection
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {currentResult.confidence}% Visual Confidence
            </span>
          </div>

          {isAnalyzing ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-emerald-400">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="text-xs font-mono text-slate-400">Extracting canopy features & stage metrics...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Detected Stage</span>
                  <span className="text-sm font-black text-emerald-400 block">{currentResult.stageCode}</span>
                  <span className="text-[11px] text-slate-400 block truncate">{currentResult.stageName}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Inferred Sowing Age</span>
                  <span className="text-sm font-black text-white block">~{currentResult.estimatedSowingDaysAgo} Days Ago</span>
                  <span className="text-[11px] text-slate-400 block">Derived Sowing Window</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">GDD Heat Units</span>
                  <span className="text-sm font-black text-amber-400 block">{currentResult.accumulatedGddEst} °C-days</span>
                  <span className="text-[11px] text-slate-400 block">Formula 3.1 Synchronized</span>
                </div>
              </div>

              {/* Identified Biological Landmarks */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block">
                  Identified Morphological Features:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {currentResult.visualFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target Biological Prescription Window */}
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <Sprout className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-emerald-300 block">Synchronized Recommendation Window:</span>
                  <span className="text-slate-300">{currentResult.recommendedBiologicalWindow}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
