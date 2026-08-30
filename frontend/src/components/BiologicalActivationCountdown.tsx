"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
  Droplets,
  Activity,
  CheckCircle2,
  Calendar
} from "lucide-react";

interface BiologicalActivationCountdownProps {
  initialHoursRemaining?: number;
  cropName?: string;
  fieldAcres?: number;
  stressType?: string;
  onApplyClick?: () => void;
}

export const BiologicalActivationCountdown: React.FC<BiologicalActivationCountdownProps> = ({
  initialHoursRemaining = 38,
  cropName = "Soybean",
  fieldAcres = 12.5,
  stressType = "Heatwave & Moisture Deficit (V4 Growth Stage)",
  onApplyClick,
}) => {
  const [selectedDay, setSelectedDay] = useState<1 | 2 | 3 | 4>(1);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: initialHoursRemaining,
    minutes: 42,
    seconds: 15,
  });

  const acresNum = Number(fieldAcres) || 12.5;

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Yield preservation statistics based on intervention timing
  const windowStats = {
    1: {
      label: "Day 1 (Optimal - Preventive)",
      preservation: "94%",
      ratePerAcre: 2450,
      damagePrevented: "₹2,450 / acre",
      totalFarmGain: Math.round(2450 * acresNum),
      mode: "Pre-stress cellular priming & osmotic stabilization active",
      status: "OPTIMAL WINDOW",
      statusColor: "bg-emerald-500 text-white",
      borderColor: "border-emerald-500",
      description: "Applying biologicals (e.g. Syngenta Quantis / Isabion) on Day 1 induces heat-shock protein synthesis before leaf stomatal collapse.",
    },
    2: {
      label: "Day 2 (Moderate Efficacy)",
      preservation: "72%",
      ratePerAcre: 1680,
      damagePrevented: "₹1,680 / acre",
      totalFarmGain: Math.round(1680 * acresNum),
      mode: "Partial cellular protection; slight flower bud abortion starts",
      status: "WINDOW CLOSING",
      statusColor: "bg-amber-500 text-white",
      borderColor: "border-amber-500",
      description: "Cellular water deficit begins. Yield recovery is partial; input dosage efficiency drops by ~28%.",
    },
    3: {
      label: "Day 3 (High Degradation)",
      preservation: "38%",
      ratePerAcre: 720,
      damagePrevented: "₹720 / acre",
      totalFarmGain: Math.round(720 * acresNum),
      mode: "Post-onset rescue mode; significant pollen sterility observed",
      status: "CRITICAL RISK",
      statusColor: "bg-orange-500 text-white",
      borderColor: "border-orange-500",
      description: "Stomata permanently close during peak noon. Significant economic loss occurs even with intervention.",
    },
    4: {
      label: "Day 4+ (Irreversible Damage)",
      preservation: "8%",
      ratePerAcre: 150,
      damagePrevented: "₹150 / acre",
      totalFarmGain: Math.round(150 * acresNum),
      mode: "Permanent tissue damage; biological cannot reverse cellular death",
      status: "WINDOW EXPIRED",
      statusColor: "bg-red-500 text-white",
      borderColor: "border-red-500",
      description: "Cellular lysing and premature pod shed occur. Chemical or biological inputs provide negligible ROI.",
    },
  };

  const current = windowStats[selectedDay];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-400" /> PS-02 BIOLOGICAL ACTIVATION CLOCK
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${current.statusColor}`}>
              {current.status}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            Climate Stress Preventive Window ({cropName})
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            {stressType} · {acresNum} Registered Acres
          </p>
        </div>

        {/* Live Countdown Display */}
        <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 flex items-center gap-4 shrink-0 shadow-lg">
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">HOURS</span>
          </div>
          <span className="text-xl font-bold text-slate-600">:</span>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">MINS</span>
          </div>
          <span className="text-xl font-bold text-slate-600">:</span>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 animate-pulse">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">SECS</span>
          </div>
        </div>
      </div>

      {/* Interactive Day Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="font-bold uppercase tracking-wider">Select Application Timing Horizon:</span>
          <span>Degradation: -18% to -28% per day delayed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((dayNum) => {
            const stat = windowStats[dayNum as 1 | 2 | 3 | 4];
            const isSelected = selectedDay === dayNum;
            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(dayNum as 1 | 2 | 3 | 4)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? `${stat.borderColor} bg-slate-800/90 shadow-lg ring-2 ring-emerald-500/20`
                    : "border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Day {dayNum} {dayNum === 1 ? "(Today)" : `(+${dayNum - 1}d)`}
                  </span>
                  <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full ${stat.statusColor}`}>
                    {stat.preservation}
                  </span>
                </div>
                <div className="text-sm font-black font-mono text-slate-100">
                  {stat.damagePrevented}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  Total Farm: +₹{stat.totalFarmGain.toLocaleString("en-IN")}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Deep Dive Card */}
      <div className={`bg-slate-950/90 border ${current.borderColor} rounded-2xl p-5 sm:p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              {current.label}
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Mode: {current.mode}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">TOTAL FARM PRESERVATION</span>
              <span className="text-lg font-black font-mono text-emerald-400">
                +₹{current.totalFarmGain.toLocaleString("en-IN")} ({acresNum} Ac)
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          {current.description}
        </p>

        {/* Agronomic Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Droplets className="h-4 w-4 text-sky-400" />
            <span>Optimal Application Window: <strong>04:30 PM – 07:00 PM</strong></span>
          </div>

          <button
            onClick={onApplyClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Lock In Day {selectedDay} Spray Plan</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
