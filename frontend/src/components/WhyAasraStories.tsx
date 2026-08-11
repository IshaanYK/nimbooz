"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mic, MapPin, BookOpen, Award, Sparkles } from "lucide-react";
import Image from "next/image";

const STORIES = [
  {
    tag: "VOICE FIRST",
    title: "Speak naturally.",
    desc: "Speak naturally in your mother tongue. AASRA understands 12 Indian regional dialects and translates farmer questions into precise agricultural guidance.",
    icon: Mic,
    image: "/images/aasra_farmer_voice.png",
  },
  {
    tag: "FIELD AWARE",
    title: "Advice based on YOUR field.",
    desc: "No generic farming tips. AASRA combines real-time weather telemetry, soil moisture, and your crop's exact growth stage (R1, R2, R3).",
    icon: MapPin,
    image: "/images/aasra_hero_farm.png",
  },
  {
    tag: "REMEMBERS",
    title: "Your actions stay connected.",
    desc: "Every spray, weather alert, and crop observation stays saved in a structured season journal so advice builds on past actions.",
    icon: BookOpen,
    image: "/images/aasra_biologicals.png",
  },
  {
    tag: "PROVES",
    title: "See what changed.",
    desc: "Measures actual harvest vs baseline control to attribute biological gain and calculate your true Return on Biological Investment (ROBI).",
    icon: Award,
    image: "/images/aasra_hero_farm.png",
  },
];

export const WhyAasraStories: React.FC = () => {
  return (
    <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-20 space-y-12 font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DDF7EC] text-[#063B2D] text-xs font-mono font-black tracking-widest uppercase border border-[#00A878]/30">
          <Sparkles className="h-3.5 w-3.5 text-[#00A878]" /> Why AASRA
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-[#10241F] tracking-tight">
          Designed for real farms. <br />
          <span className="text-[#00A878]">Built for real outcomes.</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          Four foundational pillars that transform agricultural advisory from generic advice into proven field success.
        </p>
      </div>

      <div className="space-y-8">
        {STORIES.map((story, idx) => {
          const Icon = story.icon;
          const isEven = idx % 2 === 0;

          return (
            <motion.div
              key={story.tag}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`bg-white rounded-3xl border border-[#063B2D]/15 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center hover:shadow-2xl hover:border-[#00A878]/30 transition-all ${
                isEven ? "" : ""
              }`}
            >
              {/* Text Side */}
              <div className={`p-8 sm:p-12 lg:col-span-7 space-y-4 ${isEven ? "" : "lg:order-2"}`}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DDF7EC] text-[#063B2D] text-xs font-mono font-black uppercase border border-[#00A878]/30">
                  <Icon className="h-4 w-4 text-[#00A878]" /> {story.tag}
                </div>
                <h3 className="text-2xl sm:text-4xl font-black font-display text-[#10241F] leading-tight">
                  {story.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                  {story.desc}
                </p>
              </div>

              {/* Image Side */}
              <div className={`relative h-64 sm:h-80 lg:col-span-5 ${isEven ? "" : "lg:order-1"}`}>
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#063B2D]/60 via-transparent to-transparent" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
