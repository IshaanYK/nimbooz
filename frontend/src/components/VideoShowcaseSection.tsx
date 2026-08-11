"use client";

import React, { useState } from "react";
import { Play, Pause, Volume2, VolumeX, ShieldCheck, Sparkles, Activity, Thermometer, Droplets, Wind } from "lucide-react";
import Image from "next/image";

export const VideoShowcaseSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 font-sans">
      <div className="relative rounded-3xl border-2 border-emerald-500/30 overflow-hidden shadow-2xl bg-slate-950 group">
        {/* Agricultural Farm Background Video Simulation Canvas / Video */}
        <div className="relative w-full h-[360px] sm:h-[480px] overflow-hidden">
          {/* High-def Farm Hero Image with swaying motion & live telemetry layers */}
          <Image
            src="/images/aasra_hero_farm.png"
            alt="Lush green soybean field swaying in sunrise"
            fill
            priority
            className={`object-cover object-center transition-transform duration-1000 ${
              isPlaying ? "scale-110 animate-float-slow" : "scale-100"
            }`}
          />

          {/* Environmental Grass & Nature Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f291e] via-[#0f291e]/40 to-transparent" />
          <div className="absolute inset-0 bg-emerald-950/20 backdrop-contrast-110" />

          {/* Swaying Grass Particles Animation Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f291e] to-transparent pointer-events-none" />

          {/* Floating Live Telemetry Video Overlay Badge (Top Right) */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-500/40 shadow-xl text-xs font-mono">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <span className="font-extrabold text-emerald-950">LIVE TELEMETRY STREAM</span>
          </div>

          {/* Floating Weather Metrics Cards Overlay (Top Left) */}
          <div className="absolute top-6 left-6 z-20 hidden sm:flex flex-col gap-2.5">
            <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/40 shadow-xl text-xs text-slate-800 space-y-1.5 w-52">
              <div className="flex items-center justify-between text-emerald-950 font-black border-b border-emerald-100 pb-1">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <Activity className="h-4 w-4" /> FIELD SENSORS
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                  24/7
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-medium">
                <span className="text-slate-600 flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5 text-amber-500" /> Air Temp:
                </span>
                <span className="font-extrabold text-slate-900">26.5°C</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-medium">
                <span className="text-slate-600 flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-teal-600" /> Soil Moisture:
                </span>
                <span className="font-extrabold text-emerald-700">76% Optimal</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-medium">
                <span className="text-slate-600 flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5 text-sky-600" /> Wind Velocity:
                </span>
                <span className="font-extrabold text-slate-900">12.4 km/h</span>
              </div>
            </div>
          </div>

          {/* Center Play/Pause Interactive Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-5 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-2xl border-4 border-white/80 hover:scale-110 transition-all cursor-pointer group"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-amber-300 fill-amber-300" />
              ) : (
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Caption Bar */}
          <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h4 className="font-black text-slate-950 text-sm sm:text-base font-display">
                  Live Farm Telemetry & Syngenta Biological Science
                </h4>
              </div>
              <p className="text-slate-600 font-medium text-xs sm:text-sm">
                Watch how AASRA measures degree-hour heat accumulation to shield soybean & cotton crops before damage occurs.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-emerald-700" /> : <Volume2 className="h-4 w-4 text-emerald-700" />}
                <span>{isMuted ? "Unmute Sound" : "Mute Sound"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
