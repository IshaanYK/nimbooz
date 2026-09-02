import fs from "fs";
import path from "path";

export interface FarmerDbRecord {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  language: string;
  state: string;
  district: string;
  village: string;
  fieldAreaAcres: number;
  primaryCrop: string;
  cropVariety: string;
  sowingDate: string;
  soilType: string;
  irrigationType: string;
  hasKisanCreditCard: boolean;
  pmKisanBeneficiary: boolean;
  updatedAt: string;
}

export interface FieldDbRecord {
  id: string;
  name: string;
  lat: number;
  lon: number;
  area_acres: number;
  crop: string;
  variety?: string;
  soil_type?: string;
  polygon: Array<[number, number]>;
  created_at: string;
}

export interface JournalDbRecord {
  id: string;
  category: "spray" | "heat" | "ai" | "planting";
  title: string;
  subtitle: string;
  date: string;
  badge: string;
  badgeColor: "emerald" | "rose" | "indigo" | "amber";
  metrics: Array<{ label: string; value: string; highlight?: boolean }>;
  notes: string;
  costINR?: number;
  returnINR?: number;
  created_at: string;
}

export interface RobiAuditDbRecord {
  id: string;
  certificateNo: string;
  farmerName: string;
  fieldAcres: number;
  crop: string;
  savedHarvestQuintals: number;
  inputCostINR: number;
  netProfitINR: number;
  robiMultiplier: number;
  verificationHash: string;
  issueDate: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  broadcastAlert: {
    message: string;
    createdAt: string;
    active: boolean;
  } | null;
  featureFlags: {
    voiceAssistant: boolean;
    mandiPrices: boolean;
    weatherTelemetry: boolean;
    journalFeature: boolean;
    fieldMapping: boolean;
    robiAudit: boolean;
    plantIntelligence: boolean;
  };
}

export interface DatabaseSchema {
  version: string;
  lastUpdated: string;
  farmers: FarmerDbRecord[];
  fields: FieldDbRecord[];
  journal: JournalDbRecord[];
  robi_audits: RobiAuditDbRecord[];
  settings?: SystemSettings;
}

const DEFAULT_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  maintenanceMessage: "AASRA is currently performing scheduled agricultural system updates. Farm telemetry remains active.",
  broadcastAlert: null,
  featureFlags: {
    voiceAssistant: true,
    mandiPrices: true,
    weatherTelemetry: true,
    journalFeature: true,
    fieldMapping: true,
    robiAudit: true,
    plantIntelligence: true,
  },
};

const DEFAULT_DB_DATA: DatabaseSchema = {
  version: "1.0.0-mvp",
  lastUpdated: new Date().toISOString(),
  settings: DEFAULT_SETTINGS,
  farmers: [
    {
      id: "farmer-001",
      fullName: "Ishaan Sen",
      mobileNumber: "9876543210",
      email: "ishaan@syngenta-aasra.in",
      language: "hi",
      state: "Madhya Pradesh",
      district: "Bhopal",
      village: "Phanda Kalan",
      fieldAreaAcres: 5.0,
      primaryCrop: "Soybean",
      cropVariety: "JS-9560 High Yield",
      sowingDate: "2026-06-25",
      soilType: "Deep Black Clay Soil",
      irrigationType: "Rainfed + Borewell Drip",
      hasKisanCreditCard: true,
      pmKisanBeneficiary: true,
      updatedAt: new Date().toISOString(),
    },
  ],
  fields: [
    {
      id: "f-bhopal-main",
      name: "Main Acreage (Soybean North)",
      lat: 23.2599,
      lon: 77.4126,
      area_acres: 5.0,
      crop: "Soybean",
      variety: "JS-9560 High Yield",
      soil_type: "Deep Black Clay Soil",
      polygon: [
        [23.2625, 77.4110],
        [23.2630, 77.4155],
        [23.2580, 77.4150],
        [23.2575, 77.4105],
      ],
      created_at: "2026-06-20T10:00:00Z",
    },
    {
      id: "f-sehore-river",
      name: "Riverbank Plot (Gram / Chana)",
      lat: 23.2014,
      lon: 77.0845,
      area_acres: 3.2,
      crop: "Gram / Chana",
      variety: "JG-11 Desi",
      soil_type: "Loamy Alluvial",
      polygon: [
        [23.2030, 77.0820],
        [23.2045, 77.0860],
        [23.2000, 77.0870],
        [23.1990, 77.0830],
      ],
      created_at: "2026-07-02T14:30:00Z",
    },
    {
      id: "f-phanda-trial",
      name: "Biological Trial Plot (Quantis Test)",
      lat: 23.2450,
      lon: 77.3890,
      area_acres: 1.8,
      crop: "Soybean",
      variety: "JS-335 Benchmark",
      soil_type: "Clay Loam",
      polygon: [
        [23.2465, 77.3875],
        [23.2470, 77.3910],
        [23.2435, 77.3905],
        [23.2430, 77.3870],
      ],
      created_at: "2026-07-15T09:15:00Z",
    },
  ],
  journal: [
    {
      id: "j-001",
      category: "spray",
      title: "Syngenta Quantis / Stress Buster Application",
      subtitle: "Main Acreage · Soybean (JS-9560 High Yield) · 5.0 Acres",
      date: "2026-08-28",
      badge: "VERIFIED TREATMENT · 4.46x ROBI",
      badgeColor: "emerald",
      metrics: [
        { label: "Dosage", value: "250 ml / acre (Tractor Boom)" },
        { label: "Net Cash Gain", value: "+₹22,120", highlight: true },
        { label: "Pod Retention", value: "98% Preserved" },
        { label: "Weather Trigger", value: "24.8°C Night Heatwave" },
      ],
      notes: "Applied 36 hours before 38.5°C peak heat wave wavefront. Flower abortion halted, cellular osmolyte turgor sustained, preventing 1.24 q/ac loss.",
      costINR: 6400,
      returnINR: 28520,
      created_at: "2026-08-28T06:30:00Z",
    },
    {
      id: "j-002",
      category: "heat",
      title: "Nocturnal Heat Stress Warning (25.8°C Night Peak)",
      subtitle: "Open-Meteo Satellite Reanalysis Telemetry · Bhopal Station",
      date: "2026-08-26",
      badge: "HIGH THERMAL RISK",
      badgeColor: "rose",
      metrics: [
        { label: "Peak Night Temp", value: "25.8°C (Limit: 24°C)" },
        { label: "Respiration Penalty", value: "-1.24 q/ac if untreated" },
        { label: "Blossom Abortion", value: "Up to 42% Risk" },
        { label: "Action Window", value: "Spraying recommended within 48h" },
      ],
      notes: "AASRA detected +4.8 nocturnal degree-hours above the 24°C respiration limit. Initiated biological countdown timer for foliar osmoprotectant application.",
      created_at: "2026-08-26T23:15:00Z",
    },
    {
      id: "j-003",
      category: "ai",
      title: "Google Gemini Multimodal Voice Consultation",
      subtitle: "Kisan Voice Advisory in Hindi (Google Chirp 3 HD Audio)",
      date: "2026-08-25",
      badge: "VOICE PRESCRIPTION",
      badgeColor: "indigo",
      metrics: [
        { label: "Farmer Query", value: '"गरमी में फूल गिरने से कैसे बचाएं?"' },
        { label: "AI Prescription", value: "Syngenta Quantis @ 250ml/ac" },
        { label: "Projected Profit", value: "+₹22,120 for 5 Acres", highlight: true },
        { label: "Confidence", value: "94.8% Agro-Agronomic" },
      ],
      notes: "AASRA combined real-time weather telemetry with phenology to recommend timely biostimulant spraying with exact break-even APMC Mandi economics.",
      created_at: "2026-08-25T11:20:00Z",
    },
    {
      id: "j-004",
      category: "planting",
      title: "R2 Full Flowering Stage Reached",
      subtitle: "Phenology Model (Growing Degree Days: 640 °C-Days)",
      date: "2026-08-15",
      badge: "CRITICAL PHENOLOGY WINDOW",
      badgeColor: "amber",
      metrics: [
        { label: "Phenological Stage", value: "R2 Full Bloom" },
        { label: "Vegetative Index", value: "NDVI 0.76 (Dense Canopy)" },
        { label: "Flower Abundance", value: "18-24 blossoms / plant" },
        { label: "Vulnerability", value: "Extreme Heat Sensitivity" },
      ],
      notes: "Crop entered maximum reproductive flowering. Any heat spike >35°C daytime or >24°C nighttime causes acute flower drop without osmoprotection.",
      created_at: "2026-08-15T08:00:00Z",
    },
    {
      id: "j-005",
      category: "spray",
      title: "Syngenta Isabion Amino Acid Foliar Tonic",
      subtitle: "Vegetative V4 Stage Root Expansion · 5.0 Acres",
      date: "2026-08-04",
      badge: "NUTRIENT BIO-STIMULANT",
      badgeColor: "emerald",
      metrics: [
        { label: "Dosage", value: "400 ml / acre" },
        { label: "Input Cost", value: "₹1,800 Total" },
        { label: "Root Proliferation", value: "+22% Root Volume" },
        { label: "Chlorophyll Gain", value: "+8.4 SPAD Index" },
      ],
      notes: "Applied natural free amino acids to accelerate root branching, soil nutrient uptake, and build vigor prior to reproductive phase.",
      costINR: 1800,
      created_at: "2026-08-04T07:45:00Z",
    },
  ],
  robi_audits: [
    {
      id: "robi-aud-01",
      certificateNo: "AASRA-ROBI-2026-89421",
      farmerName: "Ishaan Sen",
      fieldAcres: 5.0,
      crop: "Soybean (JS-9560 High Yield)",
      savedHarvestQuintals: 6.2,
      inputCostINR: 6400,
      netProfitINR: 22120,
      robiMultiplier: 4.46,
      verificationHash: "8f9b4a1c720e3d51f962ab00c41d7e82",
      issueDate: "2026-08-28",
    },
    {
      id: "robi-aud-02",
      certificateNo: "AASRA-ROBI-2026-78310",
      farmerName: "Ramesh Patel",
      fieldAcres: 12.5,
      crop: "Soybean (JS-335)",
      savedHarvestQuintals: 15.5,
      inputCostINR: 16000,
      netProfitINR: 55300,
      robiMultiplier: 4.46,
      verificationHash: "3d7b9e2a114f6c88e001ac89de7721ab",
      issueDate: "2026-08-20",
    },
  ],
};

// Memory fallback cache
let memoryCache: DatabaseSchema = { ...DEFAULT_DB_DATA };

function getDbFilePath(): string {
  // Check writable paths: local data/ directory or /tmp for serverless Vercel
  const localDataDir = path.join(process.cwd(), "data");
  if (fs.existsSync(localDataDir)) {
    return path.join(localDataDir, "aasra_mvp.json");
  }
  // If in temporary serverless environment
  return path.join(process.env.TMPDIR || process.env.TEMP || "/tmp", "aasra_mvp.json");
}

export class AasraDatabase {
  private static instance: AasraDatabase;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): AasraDatabase {
    if (!AasraDatabase.instance) {
      AasraDatabase.instance = new AasraDatabase();
    }
    return AasraDatabase.instance;
  }

  private ensureInitialized(): void {
    try {
      const localDataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(localDataDir)) {
        try {
          fs.mkdirSync(localDataDir, { recursive: true });
        } catch {}
      }

      const filePath = getDbFilePath();
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(DEFAULT_DB_DATA, null, 2), "utf-8");
        memoryCache = { ...DEFAULT_DB_DATA };
      } else {
        const raw = fs.readFileSync(filePath, "utf-8");
        memoryCache = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("AasraDatabase disk initialization notice, running in memory-safe mode:", e);
    }
  }

  private persist(): void {
    memoryCache.lastUpdated = new Date().toISOString();
    try {
      const filePath = getDbFilePath();
      fs.writeFileSync(filePath, JSON.stringify(memoryCache, null, 2), "utf-8");
    } catch (e) {
      // In readonly serverless environments, memoryCache remains valid across function warm invocations
    }
  }

  // ── Farmers CRUD ──
  public getFarmers(): FarmerDbRecord[] {
    return memoryCache.farmers;
  }

  public getFarmer(idOrMobile: string): FarmerDbRecord | undefined {
    const clean = idOrMobile.replace(/\D/g, "");
    return memoryCache.farmers.find(
      (f) => f.id === idOrMobile || (clean && f.mobileNumber.replace(/\D/g, "").includes(clean))
    );
  }

  public saveFarmer(farmer: Partial<FarmerDbRecord> & { fullName: string; mobileNumber: string }): FarmerDbRecord {
    const existingIdx = memoryCache.farmers.findIndex(
      (f) => f.mobileNumber.replace(/\D/g, "") === farmer.mobileNumber.replace(/\D/g, "")
    );
    const updated: FarmerDbRecord = {
      id: farmer.id || `farmer-${Date.now().toString().slice(-4)}`,
      fullName: farmer.fullName,
      mobileNumber: farmer.mobileNumber,
      email: farmer.email || "",
      language: farmer.language || "hi",
      state: farmer.state || "Madhya Pradesh",
      district: farmer.district || "Bhopal",
      village: farmer.village || "Phanda Kalan",
      fieldAreaAcres: farmer.fieldAreaAcres || 5.0,
      primaryCrop: farmer.primaryCrop || "Soybean",
      cropVariety: farmer.cropVariety || "JS-9560 High Yield",
      sowingDate: farmer.sowingDate || new Date().toISOString().split("T")[0],
      soilType: farmer.soilType || "Deep Black Clay Soil",
      irrigationType: farmer.irrigationType || "Rainfed",
      hasKisanCreditCard: farmer.hasKisanCreditCard ?? true,
      pmKisanBeneficiary: farmer.pmKisanBeneficiary ?? true,
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      memoryCache.farmers[existingIdx] = updated;
    } else {
      memoryCache.farmers.unshift(updated);
    }
    this.persist();
    return updated;
  }

  public deleteFarmer(id: string): boolean {
    const initialLen = memoryCache.farmers.length;
    memoryCache.farmers = memoryCache.farmers.filter((f) => f.id !== id);
    if (memoryCache.farmers.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // ── Fields CRUD ──
  public getFields(): FieldDbRecord[] {
    return memoryCache.fields;
  }

  public getField(id: string): FieldDbRecord | undefined {
    return memoryCache.fields.find((f) => f.id === id);
  }

  public addField(field: Omit<FieldDbRecord, "id" | "created_at">): FieldDbRecord {
    const newField: FieldDbRecord = {
      id: `f-${Date.now().toString().slice(-6)}`,
      name: field.name,
      lat: field.lat,
      lon: field.lon,
      area_acres: field.area_acres,
      crop: field.crop,
      variety: field.variety,
      soil_type: field.soil_type,
      polygon: field.polygon || [],
      created_at: new Date().toISOString(),
    };
    memoryCache.fields.push(newField);
    this.persist();
    return newField;
  }

  public deleteField(id: string): boolean {
    const initialLen = memoryCache.fields.length;
    memoryCache.fields = memoryCache.fields.filter((f) => f.id !== id);
    if (memoryCache.fields.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // ── Journal CRUD ──
  public getJournal(category?: string): JournalDbRecord[] {
    if (!category || category === "all") return memoryCache.journal;
    return memoryCache.journal.filter((j) => j.category === category);
  }

  public addJournalEntry(entry: Omit<JournalDbRecord, "id" | "created_at">): JournalDbRecord {
    const newEntry: JournalDbRecord = {
      id: `j-${Date.now().toString().slice(-4)}`,
      ...entry,
      created_at: new Date().toISOString(),
    };
    memoryCache.journal.unshift(newEntry);
    this.persist();
    return newEntry;
  }

  // ── ROBI Audits CRUD ──
  public getRobiAudits(): RobiAuditDbRecord[] {
    return memoryCache.robi_audits;
  }

  public addRobiAudit(audit: Omit<RobiAuditDbRecord, "id">): RobiAuditDbRecord {
    const newAudit: RobiAuditDbRecord = {
      id: `robi-${Date.now().toString().slice(-4)}`,
      ...audit,
    };
    memoryCache.robi_audits.unshift(newAudit);
    this.persist();
    return newAudit;
  }

  // ── System Stats ──
  public getStats() {
    return {
      status: "operational",
      engine: "AASRA Embedded Zero-Latency Hybrid Engine (JSON-FS + Serverless Memory)",
      version: memoryCache.version,
      lastUpdated: memoryCache.lastUpdated,
      counts: {
        farmers: memoryCache.farmers.length,
        fields: memoryCache.fields.length,
        journal: memoryCache.journal.length,
        robi_audits: memoryCache.robi_audits.length,
      },
      storageLocation: getDbFilePath(),
    };
  }

  // ── Website Controls & Settings ──
  public getSettings(): SystemSettings {
    if (!memoryCache.settings) {
      memoryCache.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
    return memoryCache.settings || DEFAULT_SETTINGS;
  }

  public updateSettings(update: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated: SystemSettings = {
      ...current,
      ...update,
      featureFlags: {
        ...current.featureFlags,
        ...(update.featureFlags || {}),
      },
      broadcastAlert:
        update.broadcastAlert !== undefined ? update.broadcastAlert : current.broadcastAlert,
    };
    memoryCache.settings = updated;
    this.persist();
    return updated;
  }

  public resetToDefault(): void {
    memoryCache = JSON.parse(JSON.stringify(DEFAULT_DB_DATA));
    this.persist();
  }
}

export const db = AasraDatabase.getInstance();
