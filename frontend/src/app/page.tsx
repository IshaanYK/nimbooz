"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isUserLoggedIn } from "@/lib/userStore";
import { Loader2, Sprout } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isUserLoggedIn()) {
        router.replace("/dashboard");
      } else {
        router.replace("/signup");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 font-sans">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse shadow-lg">
          <Sprout className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black font-display text-white">Opening AASRA Agricultural Intelligence...</h2>
          <p className="text-xs text-slate-400">Loading your farm dashboard and real-time telemetry</p>
        </div>
        <Loader2 className="h-5 w-5 text-emerald-400 animate-spin mt-2" />
      </div>
    </div>
  );
}
