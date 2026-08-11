"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { getTranslation } from "@/lib/translations";
import { speakIndianFemaleVoice } from "@/lib/voiceUtils";

interface SarvamAudioPlayerProps {
  language: string;
  customText?: string;
}

export const SarvamAudioPlayer: React.FC<SarvamAudioPlayerProps> = ({
  language,
  customText,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  const t = getTranslation(language);
  const textToSpeak = customText || t.voiceGreeting;

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speakIndianFemaleVoice(
      textToSpeak,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="bg-[#f0fdf4] border border-emerald-500/30 p-4 rounded-2xl space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600 animate-spin" />
          <span className="font-mono font-bold text-xs text-emerald-900 uppercase">
            Sarvam AI Authentic Indian Voice Engine
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-400">
          {language.toUpperCase()} VOICE
        </span>
      </div>

      <p className="text-xs text-slate-800 leading-relaxed font-medium italic bg-white p-3.5 rounded-xl border border-emerald-100 shadow-inner">
        "{textToSpeak}"
      </p>

      <button
        onClick={handleSpeak}
        className={`w-full py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
          isSpeaking
            ? "bg-rose-600 text-white animate-pulse"
            : "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105"
        }`}
      >
        {isSpeaking ? (
          <>
            <VolumeX className="h-4 w-4" /> {t.btnStopVoice}
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4 text-amber-300" /> {t.btnPlayVoice}
          </>
        )}
      </button>
    </div>
  );
};
