"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Leaf, ShieldCheck, TrendingUp, Mic } from "lucide-react";

const PHRASES = [
  {
    text: "Protecting Soybean, Cotton & Paddy from Night Heat Stress",
    icon: ShieldCheck,
    highlight: "Night Heat Stress",
    color: "from-emerald-600 to-teal-600",
  },
  {
    text: "Sensing Real Meteoblue Telemetry & Soil Moisture 24/7",
    icon: Sparkles,
    highlight: "Real Telemetry 24/7",
    color: "from-teal-600 to-green-600",
  },
  {
    text: "Guaranteeing +₹8,900/ha Net Profit via ROBI Engine",
    icon: TrendingUp,
    highlight: "+₹8,900/ha Net Profit",
    color: "from-green-600 to-emerald-600",
  },
  {
    text: "Speaking 12 Indian Dialects in Authentic Regional Female Voice",
    icon: Mic,
    highlight: "12 Indian Dialects",
    color: "from-emerald-700 to-teal-700",
  },
  {
    text: "Powered by Syngenta Biological Crop Protection Science",
    icon: Leaf,
    highlight: "Syngenta Biologicals",
    color: "from-teal-700 to-emerald-600",
  },
];

export const AnimatedTextCycler: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % PHRASES.length);
        setFade(true);
      }, 400);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  const current = PHRASES[index];
  const Icon = current.icon;

  return (
    <div className="h-16 sm:h-20 flex items-center justify-center font-display">
      <div
        className={`transition-all duration-500 transform ${
          fade ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-3 scale-95"
        } flex items-center justify-center gap-2.5 sm:gap-3 px-6 py-2.5 rounded-full bg-white/95 border-2 border-emerald-500/30 shadow-xl backdrop-blur-md max-w-3xl mx-auto`}
      >
        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <Icon className="h-4.5 w-4.5 text-amber-300 animate-pulse" />
        </div>

        <p className="text-xs sm:text-base font-black text-[#0f291e] tracking-tight">
          {current.text.split(current.highlight)[0]}
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${current.color} font-black underline decoration-emerald-400/40 decoration-2`}>
            {current.highlight}
          </span>
          {current.text.split(current.highlight)[1]}
        </p>
      </div>
    </div>
  );
};
