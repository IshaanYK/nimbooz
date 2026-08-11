"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mic, PlusCircle, ArrowRight, Sparkles } from "lucide-react";

export const FinalCTASection: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#063B2D] text-white py-24 px-4 sm:px-6">
      {/* Background Indian Field at Golden Hour */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/aasra_hero_farm.png"
          alt="Golden hour Indian crop field"
          fill
          className="object-cover object-center brightness-75 scale-105"
        />
        {/* Dark Green Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#063B2D]/95 via-[#063B2D]/90 to-[#063B2D]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A878]/30 border border-[#20C98A]/40 text-[#20C98A] text-xs font-mono font-black tracking-widest uppercase">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> AASRA • YOUR FIELD'S INTELLIGENT COMPANION
          </div>

          <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white leading-tight">
            Your field has a story. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C98A] via-[#00A878] to-amber-300">
              AASRA helps you understand it.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto">
            Ask questions in your language, act with confidence using field-aware weather intelligence, and measure true biological outcomes.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Link
            href="/assistant"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#00A878] hover:bg-[#20C98A] text-white font-black text-sm transition-all shadow-xl shadow-[#00A878]/30 flex items-center justify-center gap-3 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Mic className="h-5 w-5 text-amber-300 animate-pulse" />
            <span>Talk to AASRA</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/onboarding"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
          >
            <PlusCircle className="h-4 w-4 text-[#20C98A]" />
            <span>Create My Field</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
