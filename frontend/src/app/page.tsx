"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { HeroVoiceCard } from "@/components/HeroVoiceCard";
import { AskActProveSection } from "@/components/AskActProveSection";
import { FarmerStoryTimeline } from "@/components/FarmerStoryTimeline";
import { Ps04SpeechIntelligence } from "@/components/Ps04SpeechIntelligence";
import { FieldIntelligenceCard } from "@/components/FieldIntelligenceCard";
import { WhyScienceSection } from "@/components/WhyScienceSection";
import { Ps07ProofAttribution } from "@/components/Ps07ProofAttribution";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { WhyAasraStories } from "@/components/WhyAasraStories";
import { FinalCTASection } from "@/components/FinalCTASection";

export default function LandingPage() {
  return (
    <AppShell>
      <div className="space-y-12 pb-12 overflow-hidden bg-[#F7F6EF]">
        {/* SECTION 1: HERO SECTION */}
        <HeroVoiceCard />

        {/* SECTION 2: ASK → ACT → PROVE */}
        <AskActProveSection />

        {/* SECTION 3: THE FARMER STORY TIMELINE */}
        <FarmerStoryTimeline />

        {/* SECTION 4: PS-04 SPEECH INTELLIGENCE */}
        <Ps04SpeechIntelligence />

        {/* SECTION 5: FIELD INTELLIGENCE */}
        <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          <FieldIntelligenceCard />
        </section>

        {/* SECTION 6: THE INTELLIGENCE STORY */}
        <WhyScienceSection />

        {/* SECTION 7: PS-07 PROOF ATTRIBUTION */}
        <Ps07ProofAttribution />

        {/* SECTION 8: WHAT-IF SIMULATOR */}
        <WhatIfSimulator />

        {/* SECTION 9: WHY AASRA STORIES */}
        <WhyAasraStories />

        {/* SECTION 10: FINAL CTA */}
        <FinalCTASection />
      </div>
    </AppShell>
  );
}
