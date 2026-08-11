"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#063B2D] text-slate-300 border-t border-[#20C98A]/20 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-xs">
        {/* Brand Column */}
        <div className="space-y-3 text-center md:text-left">
          <Link href="/" className="inline-block">
            <div className="relative h-9 w-36 bg-white/95 p-1 rounded-xl">
              <Image src="/images/aasra_logo.png" alt="AASRA Logo" fill className="object-contain p-1" />
            </div>
          </Link>
          <p className="text-slate-400 max-w-sm leading-relaxed">
            AASRA (آसरा) — Your field's intelligent companion. ASK. ACT. PROVE.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 font-semibold">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#20C98A] uppercase block font-black">Product</span>
            <ul className="space-y-1 text-slate-300">
              <li><Link href="/product" className="hover:text-white transition-colors">PS-04 Voice AI</Link></li>
              <li><Link href="/impact" className="hover:text-white transition-colors">PS-07 ROBI Engine</Link></li>
              <li><Link href="/what-if" className="hover:text-white transition-colors">What-If Simulator</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#20C98A] uppercase block font-black">Farmers</span>
            <ul className="space-y-1 text-slate-300">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">My Field Dashboard</Link></li>
              <li><Link href="/assistant" className="hover:text-white transition-colors">Ask AASRA</Link></li>
              <li><Link href="/journal" className="hover:text-white transition-colors">Season Journal</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#20C98A] uppercase block font-black">Project</span>
            <ul className="space-y-1 text-slate-300">
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/impact-story" className="hover:text-white transition-colors">Impact Story</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">System Diagnostics</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right space-y-1 text-[11px] text-slate-400 font-mono">
          <p>© 2026 AASRA Team. All rights reserved.</p>
          <p className="text-emerald-300">Syngenta India Hackathon Project</p>
        </div>
      </div>
    </footer>
  );
};
