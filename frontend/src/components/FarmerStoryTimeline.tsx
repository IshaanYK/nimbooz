"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sprout, Sun, AlertTriangle, ShieldCheck, Zap, HeartPulse, Award, CheckCircle2 } from "lucide-react";

const TIMELINE_STAGES = [
  { stage: "01. Plant", title: "Sowing & Germination", desc: "Soybean seeds planted in June rain. GPS location logged in AASRA.", icon: Sprout, color: "text-[#00A878] bg-[#DDF7EC]" },
  { stage: "02. Growth", title: "Vegetative Canopy Development", desc: "Leaves expand. Meteoblue tracks daily GDD & soil moisture levels.", icon: Sun, color: "text-amber-600 bg-amber-100" },
  { stage: "03. Risk", title: "Night Heat Stress Signal", desc: "Night temps reach 25.8°C. Dark respiration stress score rises to 6.3/9.", icon: AlertTriangle, color: "text-rose-600 bg-rose-100" },
  { stage: "04. Advice", title: "Farmer Asks via Voice", desc: "Farmer asks in Hindi dialect. AASRA delivers personalized spray window.", icon: ShieldCheck, color: "text-[#00A878] bg-[#DDF7EC]" },
  { stage: "05. Intervention", title: "Biological Spray Application", desc: "Farmer applies Syngenta Stress Buster (500 ml/ha) on recommended date.", icon: Zap, color: "text-amber-600 bg-amber-100" },
  { stage: "06. Recovery", title: "Cell Membrane Preservation", desc: "Foliar biostimulant preserves flower pods during 3-day dry heat spell.", icon: HeartPulse, color: "text-[#00A878] bg-[#DDF7EC]" },
  { stage: "07. Harvest", title: "Yield Harvesting", desc: "Pod yield harvested at 9.2 q/acre vs region control of 8.5 q/acre.", icon: Award, color: "text-amber-600 bg-amber-100" },
  { stage: "08. Proof", title: "PS-07 Attribution & ROBI", desc: "AASRA attributes +0.5–0.8 q/acre biological contribution with 71% confidence.", icon: CheckCircle2, color: "text-[#00A878] bg-[#DDF7EC]" },
];

export const FarmerStoryTimeline: React.FC = () => {
  return (
    <section className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-16 space-y-12 font-sans">
      {/* Editorial Headline */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-5xl font-black font-display text-[#10241F] tracking-tight">
          Most agricultural advice stops at the recommendation.
        </h2>
        <p className="text-base sm:text-xl text-[#00A878] font-bold font-display">
          AASRA stays with the farmer after the decision.
        </p>
      </div>

      {/* Vertical Season Timeline */}
      <div className="relative border-l-2 border-[#00A878]/30 ml-4 sm:ml-32 space-y-8 pl-6 sm:pl-10">
        {TIMELINE_STAGES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.stage}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="relative group"
            >
              {/* Timeline Connector Dot */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 h-8 w-8 rounded-full bg-white border-2 border-[#00A878] flex items-center justify-center shadow-md group-hover:scale-125 transition-transform">
                <Icon className="h-4 w-4 text-[#00A878]" />
              </div>

              {/* Stage Badge on Left for Desktop */}
              <div className="hidden sm:block absolute -left-36 top-2 text-right w-24">
                <span className="text-xs font-mono font-black text-[#00A878] uppercase">{item.stage}</span>
              </div>

              {/* Content Card */}
              <div className="bg-white p-5 rounded-2xl border border-emerald-500/15 shadow-sm space-y-1.5 hover:shadow-md hover:border-[#00A878] transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base font-display">{item.title}</h3>
                  <span className="sm:hidden text-[10px] font-mono font-bold text-[#00A878]">{item.stage}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
