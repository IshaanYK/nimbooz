"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function PwaRegistration() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register Service Worker in production/browser
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("AASRA ServiceWorker active:", reg.scope))
          .catch((err) => console.log("ServiceWorker registration skipped:", err));
      });
    }

    // Capture install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show install banner on mobile after 3 seconds if not already installed
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
      setInstallPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-6 md:right-auto md:max-w-sm z-50 bg-[#0d253d] text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/30 flex items-center justify-between gap-3 animate-bounce-subtle">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#533afd] flex items-center justify-between shrink-0 p-2">
          <Download className="h-full w-full text-white" />
        </div>
        <div>
          <h4 className="font-bold text-xs">Install AASRA Web App</h4>
          <p className="text-[10px] text-slate-300">Quick 1-tap mobile access for farm fields</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-xl bg-[#533afd] hover:bg-[#432dd8] text-white font-bold text-xs cursor-pointer transition-all"
        >
          Install
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
