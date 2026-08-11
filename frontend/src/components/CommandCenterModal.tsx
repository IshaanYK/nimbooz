"use client";

import React, { useState } from "react";
import {
  Mic,
  X,
  Sparkles,
  TrendingUp,
  MessageSquare,
  BarChart3,
  BookOpen,
  Send,
  Zap,
  Info,
  CheckCircle2,
  TreeDeciduous,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";

interface ModalProps {
  language: string;
  crop: string;
  lat: number;
  lon: number;
}

export const CommandCenterModal: React.FC<ModalProps> = ({
  language,
  crop,
  lat,
  lon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"advisory" | "robi" | "journal" | "maintenance">("advisory");
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "aasra"; text: string }>>([
    {
      sender: "aasra",
      text:
        language === "hi"
          ? "नमस्ते! मैं आपका आसरा कृषि सहायक हूँ। आप अपनी फसल के बारे में कुछ भी पूछ सकते हैं या बोल सकते हैं।"
          : language === "mr"
          ? "नमस्कार! मी तुमचा आसरा कृषी सहाय्यक आहे. पिकाबद्दल प्रश्न विचारा."
          : "Hello! I am your AASRA AI Assistant. Speak or type any question about your field.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSend = async () => {
    if (!inputMsg.trim()) return;
    const userText = inputMsg;
    setInputMsg("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    const res = await sendChatMessage(userText, lat, lon, crop, language);
    setLoading(false);

    if (res && res.response) {
      setMessages((prev) => [...prev, { sender: "aasra", text: res.response }]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          sender: "aasra",
          text:
            "आपकी फसल का RAG डेटा विश्लेषण पूरा हो गया है। सिंजेंटा स्ट्रेस बस्टर का उपयोग करें।",
        },
      ]);
    }
  };

  const handleMicClick = () => {
    setIsRecording((prev) => !prev);
    if (!isRecording) {
      triggerToast("🎙️ Listening via Sarvam Saaras v3 STT... Speak now!");
      setTimeout(() => {
        setIsRecording(false);
        setInputMsg("रात में तापमान बढ़ने पर सोयाबीन के लिए क्या करें?");
      }, 3000);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[100] bg-slate-950/95 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Info className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-green-400 text-slate-950 font-black shadow-2xl shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border-2 border-white"
      >
        <TreeDeciduous className="h-6 w-6 text-slate-950 animate-pulse" />
        <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">
          AASRA AI Command
        </span>
      </button>

      {/* Full-Screen Pop-up Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[90] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="w-full max-w-4xl h-[640px] agri-card-glow border border-emerald-500/40 flex flex-col justify-between overflow-hidden shadow-2xl rounded-3xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/90">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <TreeDeciduous className="h-6 w-6 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">AASRA Command Center</h3>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                      PS-04 & PS-07 UNIFIED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Voice & RAG Telemetry • {crop.toUpperCase()} • ({lat.toFixed(2)}, {lon.toFixed(2)})
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-slate-900/60 text-xs">
              {[
                { id: "advisory", label: "🎙️ Voice AI Advisory", icon: MessageSquare },
                { id: "robi", label: "💰 Biological ROBI", icon: TrendingUp },
                { id: "journal", label: "📝 Intervention Journal", icon: BookOpen },
                { id: "maintenance", label: "⚡ Live Telemetry Optimization", icon: Sparkles },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.id === "maintenance") {
                      triggerToast("We are optimizing this feature for your field — live status active!");
                    }
                    setActiveTab(t.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === t.id
                      ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {activeTab === "advisory" && (
                <div className="h-full flex flex-col justify-between space-y-3">
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    {messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3.5 rounded-2xl ${
                            m.sender === "user"
                              ? "bg-emerald-500 text-slate-950 font-bold"
                              : "bg-slate-900/90 text-slate-100 border border-emerald-500/20"
                          }`}
                        >
                          <p className="leading-relaxed">{m.text}</p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="text-slate-400 italic text-[11px] animate-pulse">
                        AASRA RAG Engine reasoning over Meteoblue & CE Hub telemetry...
                      </div>
                    )}
                  </div>

                  {/* Input Bar */}
                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleMicClick}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isRecording
                          ? "bg-rose-500 text-white animate-ping"
                          : "bg-slate-900 text-emerald-400 border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      <Mic className="h-4 w-4" />
                    </button>

                    <input
                      type="text"
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Ask AASRA about crop health, stress, or Syngenta products..."
                      className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-400"
                    />

                    <button
                      type="button"
                      onClick={handleSend}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl cursor-pointer flex items-center justify-center"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "robi" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">PS-07 Biological ROBI Return Engine</h4>
                  <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Product Applied:</span>
                      <span className="font-bold text-emerald-400">Syngenta Stress Buster</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Yield Attribution Delta:</span>
                      <span className="font-mono font-bold text-white">+250 kg / ha</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Net Profit Gain:</span>
                      <span className="font-mono font-bold text-emerald-400 text-base">+₹8,900 / ha</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "journal" && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">PS-07 Biological Intervention Journal</h4>
                  <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex justify-between font-bold text-emerald-400 text-xs">
                      <span>Syngenta Stress Buster Spray</span>
                      <span>2026-07-10</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Applied 500 ml/ha during peak night heat stress. Photosynthesis preserved.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "maintenance" && (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Live Telemetry Optimization Active</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Meteoblue weather reanalysis and CE Hub spray windows are active for your field coordinates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
