"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Sparkles, ShieldCheck, AlertTriangle, Zap, Sliders, Activity, Flame, Droplets, Leaf } from "lucide-react";
import { DataBadge } from "./DataBadge";

interface BiologicalSimulationAnimationProps {
  crop?: string;
}

export const BiologicalSimulationAnimation: React.FC<BiologicalSimulationAnimationProps> = ({
  crop = "Soybean",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation controls state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simDay, setSimDay] = useState<number>(0);
  const [delayDays, setDelayDays] = useState<number>(0);
  const [nightTemp, setNightTemp] = useState<number>(32);
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [selectedCrop, setSelectedCrop] = useState<string>(crop);

  // Animation Loop Effect
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setSimDay((prevDay) => {
          const next = prevDay + delta * animSpeed * 1.5;
          return next > 14 ? 0 : next; // Loop day 0 to 14
        });
      }

      // Draw Canvas Animation
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          // Background Gradient (Sky to Soil)
          const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
          skyGradient.addColorStop(0, "#F8FAFC");
          skyGradient.addColorStop(0.7, "#E2E8F0");
          skyGradient.addColorStop(1, "#CBD5E1");
          ctx.fillStyle = skyGradient;
          ctx.fillRect(0, 0, w, h);

          // Divider Line between Unmanaged (Left) vs Managed (Right)
          const midX = w / 2;
          ctx.strokeStyle = "#94A3B8";
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(midX, 0);
          ctx.lineTo(midX, h);
          ctx.stroke();
          ctx.setLineDash([]);

          const progress = simDay / 14; // 0 to 1

          // -------------------------------------------------------------
          // LEFT SIDE: UNMANAGED / DELAYED SPRAY SCENARIO
          // -------------------------------------------------------------

          // 1. Heat Wave Particles (Rising Red Particles)
          const particleCount = Math.floor((nightTemp - 20) * 1.5);
          for (let i = 0; i < particleCount; i++) {
            const px = 20 + ((i * 37 + time * 0.05) % (midX - 40));
            const py = h - 60 - ((i * 23 + time * 0.08) % (h - 100));
            ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + (i % 3) * 0.1})`;
            ctx.beginPath();
            ctx.arc(px, py, 3 + (i % 4), 0, Math.PI * 2);
            ctx.fill();
          }

          // 2. Unmanaged Soil
          ctx.fillStyle = "#B45309";
          ctx.fillRect(0, h - 35, midX - 5, 35);

          // 3. Unmanaged Plant Base
          const plantX1 = midX * 0.5;
          const plantY1 = h - 35;

          // Leaf color degradation based on heat stress & delay
          const stressFactor = Math.min(1, (nightTemp - 25) / 10 + (delayDays / 3));
          const leafColorLeft = progress > 0.3 && stressFactor > 0.4
            ? `rgb(${Math.floor(180 + progress * 50)}, ${Math.floor(180 - progress * 100)}, 40)`
            : "#16A34A";

          // Plant Stem
          ctx.strokeStyle = progress > 0.5 && stressFactor > 0.5 ? "#A16207" : "#15803D";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(plantX1, plantY1);
          ctx.lineTo(plantX1, plantY1 - 90);
          ctx.stroke();

          // Leaves (Wilting angle)
          const wiltAngle = progress * stressFactor * 0.5;
          ctx.fillStyle = leafColorLeft;
          ctx.beginPath();
          ctx.ellipse(plantX1 - 25, plantY1 - 50 + wiltAngle * 10, 18, 9, -0.4 + wiltAngle, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.ellipse(plantX1 + 25, plantY1 - 65 + wiltAngle * 10, 18, 9, 0.4 - wiltAngle, 0, Math.PI * 2);
          ctx.fill();

          // Aborting Pods (Dropping down)
          if (progress > 0.4 && stressFactor > 0.3) {
            const dropY = plantY1 - 40 + ((time * 0.1) % 40);
            ctx.fillStyle = "#DC2626";
            ctx.beginPath();
            ctx.arc(plantX1 + 10, dropY, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Label Left
          ctx.fillStyle = "#991B1B";
          ctx.font = "bold 11px Inter, sans-serif";
          ctx.fillText("🔴 UNMANAGED / DELAYED SPRAY", 15, 25);
          ctx.fillStyle = "#7F1D1D";
          ctx.font = "10px Inter, sans-serif";
          ctx.fillText(`Respiration Loss: ${Math.round(progress * stressFactor * 45)}%`, 15, 42);

          // -------------------------------------------------------------
          // RIGHT SIDE: MANAGED SCENARIO (Syngenta Stress Buster)
          // -------------------------------------------------------------

          // 1. Biostimulant Green Droplets Falling
          for (let i = 0; i < 15; i++) {
            const dx = midX + 20 + ((i * 41 + time * 0.04) % (midX - 40));
            const dy = 20 + ((i * 19 + time * 0.12) % (h - 70));
            ctx.fillStyle = "rgba(16, 185, 129, 0.6)";
            ctx.beginPath();
            ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // 2. Managed Soil
          ctx.fillStyle = "#047857";
          ctx.fillRect(midX + 5, h - 35, midX - 5, 35);

          // 3. Managed Plant
          const plantX2 = midX + midX * 0.5;
          const plantY2 = h - 35;

          // Healthy Stem
          ctx.strokeStyle = "#047857";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(plantX2, plantY2);
          ctx.lineTo(plantX2, plantY2 - 105);
          ctx.stroke();

          // Protective Bio-Aura Shield around Plant
          ctx.strokeStyle = "rgba(52, 211, 153, 0.4)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(plantX2, plantY2 - 60, 45, 0, Math.PI * 2);
          ctx.stroke();

          // Vibrant Green Leaves
          ctx.fillStyle = "#059669";
          ctx.beginPath();
          ctx.ellipse(plantX2 - 28, plantY2 - 60, 22, 11, -0.3, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.ellipse(plantX2 + 28, plantY2 - 75, 22, 11, 0.3, 0, Math.PI * 2);
          ctx.fill();

          // Healthy Flower Pods (Firm & Growing)
          ctx.fillStyle = "#F59E0B";
          ctx.beginPath();
          ctx.arc(plantX2 - 8, plantY2 - 80, 4, 0, Math.PI * 2);
          ctx.arc(plantX2 + 8, plantY2 - 90, 4, 0, Math.PI * 2);
          ctx.fill();

          // Label Right
          ctx.fillStyle = "#065F46";
          ctx.font = "bold 11px Inter, sans-serif";
          ctx.fillText("🟢 MANAGED (Syngenta Stress Buster)", midX + 15, 25);
          ctx.fillStyle = "#047857";
          ctx.font = "10px Inter, sans-serif";
          ctx.fillText(`Yield Retention: 98% · Bio-Efficacy: Active`, midX + 15, 42);

          // Day Scrubber Banner on Canvas bottom
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(midX - 70, h - 28, 140, 22);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 10px Space Grotesk, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`SIMULATION DAY: ${Math.floor(simDay)} / 14`, midX, h - 13);
          ctx.textAlign = "left";
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, simDay, delayDays, nightTemp, animSpeed]);

  // Derived Telemetry Metrics for active frame
  const cellIntegrityLeft = Math.max(38, Math.round(98 - (simDay * 3.8) - (delayDays * 8)));
  const cellIntegrityRight = Math.min(99, Math.round(98 - (simDay * 0.3)));
  const netGainQAc = Math.round(((cellIntegrityRight - cellIntegrityLeft) / 100) * 0.85 * 100) / 100;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm font-body text-slate-900">
      
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1 font-accent">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase">
              2D BIOPHYSICAL CELLULAR SIMULATOR
            </span>
            <DataBadge type="MODELLED" customText="SHAPLEY BIO-ENGINE 4.2" />
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900">
            Abiotic Heat Stress vs Biological Protection Simulation
          </h3>
          <p className="text-xs text-slate-600">
            Real-time animation comparing cellular respiration loss in unmanaged crop vs biostimulant protected crop ({selectedCrop}).
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 flex-wrap font-accent">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? "Pause Simulation" : "Play Simulation"}</span>
          </button>

          <button
            onClick={() => setSimDay(0)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Restart Animation to Day 0"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <select
            value={animSpeed}
            onChange={(e) => setAnimSpeed(Number(e.target.value))}
            className="bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value={0.5}>0.5x Speed</option>
            <option value={1}>1.0x Speed</option>
            <option value={2}>2.0x Speed</option>
            <option value={4}>4.0x Speed</option>
          </select>
        </div>
      </div>

      {/* Main Canvas Simulation Stage */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100 h-[280px] w-full">
        <canvas
          ref={canvasRef}
          width={800}
          height={280}
          className="w-full h-full object-cover block"
        />
      </div>

      {/* Interactive Sliders Parameter Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 font-accent text-xs">
        
        {/* Spray Delay Scrubber Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-emerald-600" />
              Intervention Delay:
            </label>
            <span className="font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
              {delayDays === 0 ? "Day 0 (Optimal)" : `+${delayDays} Days Delay`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={delayDays}
            onChange={(e) => setDelayDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
            <span>Day 0</span>
            <span>+2 Days</span>
            <span>+5 Days</span>
          </div>
        </div>

        {/* Night Temperature Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-rose-500" />
              Night Temperature:
            </label>
            <span className="font-bold text-rose-600 bg-white px-2.5 py-0.5 rounded-full border border-rose-200">
              {nightTemp}°C ({nightTemp > 25 ? "High Heat Risk" : "Normal"})
            </span>
          </div>
          <input
            type="range"
            min={22}
            max={38}
            step={1}
            value={nightTemp}
            onChange={(e) => setNightTemp(Number(e.target.value))}
            className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
            <span>22°C</span>
            <span>30°C</span>
            <span>38°C (Extreme)</span>
          </div>
        </div>

        {/* Crop Type Selector */}
        <div className="space-y-2">
          <label className="font-bold text-slate-800 block">Crop Type:</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600"
          >
            <option value="Soybean">Soybean (Flowering Stage)</option>
            <option value="Wheat">Wheat (Grain Filling)</option>
            <option value="Cotton">Cotton (Square Stage)</option>
            <option value="Corn">Corn (Tasseling)</option>
          </select>
          <p className="text-[10px] text-slate-500">
            Simulating abiotic stress impact on {selectedCrop} cell membrane.
          </p>
        </div>

      </div>

      {/* Real-Time Live Telemetry Output Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-accent">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">Unmanaged Membrane Integrity</span>
          <span className="text-2xl font-bold text-rose-600 font-display">{cellIntegrityLeft}%</span>
          <span className="text-[10px] text-slate-500 block">Cell degradation active</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-emerald-200 space-y-1">
          <span className="text-[10px] text-emerald-800 font-bold block uppercase">Managed Membrane Integrity</span>
          <span className="text-2xl font-bold text-emerald-600 font-display">{cellIntegrityRight}%</span>
          <span className="text-[10px] text-emerald-700 block font-bold">Shielded by Stress Buster</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-emerald-300 space-y-1">
          <span className="text-[10px] text-emerald-800 font-bold block uppercase">Net Yield Protected</span>
          <span className="text-2xl font-bold text-emerald-600 font-display">+{netGainQAc} q/ac</span>
          <span className="text-[10px] text-emerald-700 block font-bold">Saved from heat loss</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">Simulation Frame Day</span>
          <span className="text-2xl font-bold text-slate-900 font-display">Day {Math.floor(simDay)} / 14</span>
          <span className="text-[10px] text-slate-500 block">14-Day Growth Cycle</span>
        </div>
      </div>

    </div>
  );
};
