/**
 * ASSARA Crop Service
 * Computes crop phenological stage, days after sowing (DAS), and growth stages.
 */

import { resolveCropThresholds, CropInfo } from "@/lib/cropRegistry";

export interface CropStageInfo {
  cropName: string;
  variety?: string;
  sowingDate: string;
  cropAgeDays: number;
  currentStage: string;
  stageProgressPct: number;
  totalDurationDays: number;
  irrigationType: "Drip" | "Sprinkler" | "Flood" | "Rainfed";
  criticalStageName: string;
  isCriticalWindow: boolean;
  definition?: CropInfo;
}

/**
 * Calculate crop age in days from sowing date string (YYYY-MM-DD)
 */
export function calculateCropAge(sowingDateStr: string): number {
  if (!sowingDateStr) return 45; // Default 45 DAS if unknown
  try {
    const sowing = new Date(sowingDateStr);
    const now = new Date();
    const diffTime = now.getTime() - sowing.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(365, days));
  } catch (_) {
    return 45;
  }
}

/**
 * Compute detailed phenology growth stage info for active farm
 */
export function getCropPhenology(
  crop: string = "Soybean",
  sowingDate: string = "2026-06-25",
  customStage?: string,
  irrigationType: "Drip" | "Sprinkler" | "Flood" | "Rainfed" = "Drip",
  variety?: string
): CropStageInfo {
  const definition = resolveCropThresholds(crop);
  const totalDuration = 105;
  const ageDays = calculateCropAge(sowingDate);

  let currentStage = customStage || "Vegetative Growth (शाकीय वृद्धि)";
  let stageProgressPct = Math.round((ageDays / totalDuration) * 100);
  stageProgressPct = Math.min(100, Math.max(5, stageProgressPct));

  // Determine stage based on age if not overridden
  if (!customStage) {
    if (ageDays < 20) {
      currentStage = "Germination & Seedling Emergence (अंकुरण)";
    } else if (ageDays < 45) {
      currentStage = "Vegetative Branching (शाकीय वृद्धि)";
    } else if (ageDays < 70) {
      currentStage = "Flowering & Pod Initiation (फूल और फली निर्माण)";
    } else if (ageDays < 95) {
      currentStage = "Grain Filling / Pod Maturation (दाने भरना)";
    } else {
      currentStage = "Harvest Maturity (कटाई परिपक्वता)";
    }
  }

  // Critical reproductive stage window: 45 to 75 DAS for most Kharif/Rabi crops
  const isCriticalWindow = ageDays >= 40 && ageDays <= 75;
  const criticalStageName = isCriticalWindow
    ? "R2-R3 Peak Flowering & Early Podding (फूल व फली धारण)"
    : "Vegetative / Maturity Phase";

  return {
    cropName: crop,
    variety: variety || definition?.defaultVariety || "Standard HYV",
    sowingDate,
    cropAgeDays: ageDays,
    currentStage,
    stageProgressPct,
    totalDurationDays: totalDuration,
    irrigationType,
    criticalStageName,
    isCriticalWindow,
    definition,
  };
}
