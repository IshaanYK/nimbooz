/**
 * AASRA Master Crop Intelligence & Custom Crop Registry
 * Covers comprehensive commercial, food, cash, horticulture, spice, and plantation crops across India.
 * Provides location-aware crop discovery and allows farmers to add custom crops dynamically.
 */

export interface CropInfo {
  id: string;
  name: string;
  nameHi: string;
  category: "cereal" | "pulse" | "oilseed" | "cash_crop" | "vegetable" | "spice" | "horticulture" | "plantation";
  defaultVariety: string;
  stage: string;
  mspPrice?: number; // ₹/quintal
  t_opt_day: number;
  t_limit_day: number;
  t_opt_night: number;
  t_limit_night: number;
  t_frost: number;
  t_base_gdd: number;
  season: "Kharif" | "Rabi" | "Zaid" | "Year-Round";
  primaryStates: string[];
  isCustom?: boolean;
}

export const MASTER_CROPS: CropInfo[] = [
  // ─── Cereals ───
  {
    id: "wheat",
    name: "Wheat (गेहूँ)",
    nameHi: "गेहूँ",
    category: "cereal",
    defaultVariety: "HD-2967 / Sharbati / Lokwan",
    stage: "Tillering to Heading",
    mspPrice: 2275,
    t_opt_day: 22,
    t_limit_day: 35,
    t_opt_night: 15,
    t_limit_night: 25,
    t_frost: 0,
    t_base_gdd: 5,
    season: "Rabi",
    primaryStates: ["uttar pradesh", "punjab", "haryana", "madhya pradesh", "rajasthan", "bihar", "gujarat"],
  },
  {
    id: "rice",
    name: "Rice / Paddy (धान)",
    nameHi: "धान",
    category: "cereal",
    defaultVariety: "Pusa Basmati 1121 / PR-126 / Sona Masoori",
    stage: "Panicle Initiation to Grain Filling",
    mspPrice: 2300,
    t_opt_day: 30,
    t_limit_day: 38,
    t_opt_night: 24,
    t_limit_night: 30,
    t_frost: 8,
    t_base_gdd: 10,
    season: "Kharif",
    primaryStates: ["punjab", "haryana", "uttar pradesh", "west bengal", "andhra pradesh", "telangana", "odisha", "chhattisgarh", "bihar", "tamil nadu"],
  },
  {
    id: "maize",
    name: "Maize (मक्का)",
    nameHi: "मक्का",
    category: "cereal",
    defaultVariety: "HQPM-1 / Pioneer 3396 / Bio-9681",
    stage: "Tasseling to Silking",
    mspPrice: 2090,
    t_opt_day: 28,
    t_limit_day: 38,
    t_opt_night: 18,
    t_limit_night: 27,
    t_frost: 2,
    t_base_gdd: 10,
    season: "Kharif",
    primaryStates: ["karnataka", "madhya pradesh", "maharashtra", "bihar", "telangana", "rajasthan", "uttar pradesh", "andhra pradesh"],
  },
  {
    id: "bajra",
    name: "Bajra / Pearl Millet (बाजरा)",
    nameHi: "बाजरा",
    category: "cereal",
    defaultVariety: "HHB-67 / GHB-558",
    stage: "Vegetative / Booting",
    mspPrice: 2625,
    t_opt_day: 32,
    t_limit_day: 42,
    t_opt_night: 20,
    t_limit_night: 30,
    t_frost: 4,
    t_base_gdd: 12,
    season: "Kharif",
    primaryStates: ["rajasthan", "uttar pradesh", "haryana", "gujarat", "maharashtra"],
  },
  {
    id: "jowar",
    name: "Jowar / Sorghum (ज्वार)",
    nameHi: "ज्वार",
    category: "cereal",
    defaultVariety: "CSH-16 / Maldandi",
    stage: "Flowering / Grain Development",
    mspPrice: 3371,
    t_opt_day: 30,
    t_limit_day: 40,
    t_opt_night: 19,
    t_limit_night: 29,
    t_frost: 4,
    t_base_gdd: 10,
    season: "Kharif",
    primaryStates: ["maharashtra", "karnataka", "rajasthan", "tamil nadu", "andhra pradesh", "madhya pradesh"],
  },
  {
    id: "barley",
    name: "Barley / Jau (जौ)",
    nameHi: "जौ",
    category: "cereal",
    defaultVariety: "RD-2035 / DWRB-101",
    stage: "Stem Extension",
    mspPrice: 1850,
    t_opt_day: 20,
    t_limit_day: 32,
    t_opt_night: 12,
    t_limit_night: 22,
    t_frost: -2,
    t_base_gdd: 4,
    season: "Rabi",
    primaryStates: ["rajasthan", "uttar pradesh", "haryana", "punjab", "madhya pradesh"],
  },

  // ─── Oilseeds ───
  {
    id: "soybean",
    name: "Soybean (सोयाबीन)",
    nameHi: "सोयाबीन",
    category: "oilseed",
    defaultVariety: "JS-335 / JS-9560 / NRC-37",
    stage: "R2 Full Flowering / Pod Fill",
    mspPrice: 4892,
    t_opt_day: 30,
    t_limit_day: 40,
    t_opt_night: 22,
    t_limit_night: 30,
    t_frost: 2,
    t_base_gdd: 10,
    season: "Kharif",
    primaryStates: ["madhya pradesh", "maharashtra", "rajasthan", "karnataka", "telangana", "gujarat"],
  },
  {
    id: "mustard",
    name: "Mustard / Sarson (सरसों / राई)",
    nameHi: "सरसों",
    category: "oilseed",
    defaultVariety: "Pusa Bold / Giriraj / RH-749",
    stage: "Pod Formation & Seed Filling",
    mspPrice: 5650,
    t_opt_day: 24,
    t_limit_day: 34,
    t_opt_night: 12,
    t_limit_night: 22,
    t_frost: 0,
    t_base_gdd: 5,
    season: "Rabi",
    primaryStates: ["rajasthan", "haryana", "uttar pradesh", "madhya pradesh", "punjab", "west bengal", "gujarat"],
  },
  {
    id: "groundnut",
    name: "Groundnut (मूंगफली)",
    nameHi: "मूंगफली",
    category: "oilseed",
    defaultVariety: "GG-20 / TAG-24 / Kadiri-6",
    stage: "Pegging to Pod Development",
    mspPrice: 6783,
    t_opt_day: 30,
    t_limit_day: 38,
    t_opt_night: 20,
    t_limit_night: 28,
    t_frost: 4,
    t_base_gdd: 10,
    season: "Kharif",
    primaryStates: ["gujarat", "rajasthan", "andhra pradesh", "tamil nadu", "karnataka", "telangana", "maharashtra"],
  },
  {
    id: "sesame",
    name: "Sesame / Til (तिल)",
    nameHi: "तिल",
    category: "oilseed",
    defaultVariety: "Guj-Til-10 / RT-351",
    stage: "Capsule Maturation",
    mspPrice: 9267,
    t_opt_day: 32,
    t_limit_day: 42,
    t_opt_night: 22,
    t_limit_night: 30,
    t_frost: 5,
    t_base_gdd: 12,
    season: "Kharif",
    primaryStates: ["gujarat", "west bengal", "rajasthan", "tamil nadu", "madhya pradesh", "uttar pradesh"],
  },
  {
    id: "sunflower",
    name: "Sunflower (सूरजमुखी)",
    nameHi: "सूरजमुखी",
    category: "oilseed",
    defaultVariety: "KBSH-44 / DRSH-1",
    stage: "Ray Floret Opening / Head Fill",
    mspPrice: 7280,
    t_opt_day: 28,
    t_limit_day: 38,
    t_opt_night: 18,
    t_limit_night: 28,
    t_frost: 2,
    t_base_gdd: 8,
    season: "Kharif",
    primaryStates: ["karnataka", "andhra pradesh", "maharashtra", "bihar", "odisha", "tamil nadu"],
  },

  // ─── Pulses ───
  {
    id: "chana",
    name: "Gram / Chana (चना)",
    nameHi: "चना",
    category: "pulse",
    defaultVariety: "JG-11 / Dollar Chana / JAKI-9218",
    stage: "Pod Development & Seed Bulking",
    mspPrice: 5440,
    t_opt_day: 24,
    t_limit_day: 35,
    t_opt_night: 12,
    t_limit_night: 24,
    t_frost: 0,
    t_base_gdd: 6,
    season: "Rabi",
    primaryStates: ["madhya pradesh", "maharashtra", "rajasthan", "karnataka", "uttar pradesh", "andhra pradesh", "gujarat"],
  },
  {
    id: "tur",
    name: "Arhar / Tur / Pigeonpea (तुअर / अरहर)",
    nameHi: "अरहर",
    category: "pulse",
    defaultVariety: "BDN-711 / Asha / Maruti",
    stage: "Pod Borer Critical Window",
    mspPrice: 7550,
    t_opt_day: 30,
    t_limit_day: 40,
    t_opt_night: 20,
    t_limit_night: 28,
    t_frost: 4,
    t_base_gdd: 10,
    season: "Kharif",
    primaryStates: ["maharashtra", "madhya pradesh", "karnataka", "uttar pradesh", "gujarat", "telangana", "andhra pradesh"],
  },
  {
    id: "moong",
    name: "Green Gram / Moong (मूंग)",
    nameHi: "मूंग",
    category: "pulse",
    defaultVariety: "IPM-02-03 / Samrat",
    stage: "Pod Maturation",
    mspPrice: 8682,
    t_opt_day: 30,
    t_limit_day: 40,
    t_opt_night: 22,
    t_limit_night: 30,
    t_frost: 5,
    t_base_gdd: 10,
    season: "Kharif",
    primaryStates: ["rajasthan", "madhya pradesh", "maharashtra", "karnataka", "bihar", "gujarat"],
  },
  {
    id: "urad",
    name: "Black Gram / Urad (उड़द)",
    nameHi: "उड़द",
    category: "pulse",
    defaultVariety: "Pant U-31 / Shekhar-2",
    stage: "Pod Setting",
    mspPrice: 7400,
    t_opt_day: 30,
    t_limit_day: 38,
    t_opt_night: 21,
    t_limit_night: 29,
    t_frost: 4,
    t_base_gdd: 10,
    season: "Kharif",
    primaryStates: ["madhya pradesh", "uttar pradesh", "andhra pradesh", "maharashtra", "tamil nadu"],
  },

  // ─── Commercial & Cash Crops ───
  {
    id: "cotton",
    name: "Cotton / Kapas (कपास)",
    nameHi: "कपास",
    category: "cash_crop",
    defaultVariety: "Bt Cotton II / RCH-659 / Shankar-6",
    stage: "Boll Development & Bursting",
    mspPrice: 7121,
    t_opt_day: 32,
    t_limit_day: 40,
    t_opt_night: 22,
    t_limit_night: 30,
    t_frost: 5,
    t_base_gdd: 15,
    season: "Kharif",
    primaryStates: ["gujarat", "maharashtra", "telangana", "andhra pradesh", "punjab", "haryana", "rajasthan", "madhya pradesh", "karnataka"],
  },
  {
    id: "sugarcane",
    name: "Sugarcane (गन्ना)",
    nameHi: "गन्ना",
    category: "cash_crop",
    defaultVariety: "Co-0238 / Co-86032 / Co-0118",
    stage: "Grand Growth / Cane Elongation",
    mspPrice: 340, // FRP per quintal
    t_opt_day: 30,
    t_limit_day: 40,
    t_opt_night: 20,
    t_limit_night: 28,
    t_frost: 5,
    t_base_gdd: 12,
    season: "Year-Round",
    primaryStates: ["uttar pradesh", "maharashtra", "karnataka", "tamil nadu", "bihar", "gujarat", "haryana", "punjab", "andhra pradesh"],
  },
  {
    id: "mentha",
    name: "Mentha / Peppermint (मेंथा / पिपरमेंट)",
    nameHi: "मेंथा",
    category: "cash_crop",
    defaultVariety: "Kosi / CIM-Kranti",
    stage: "Vegetative / Pre-Distillation",
    mspPrice: 1050, // Oil equivalent base
    t_opt_day: 30,
    t_limit_day: 42,
    t_opt_night: 20,
    t_limit_night: 28,
    t_frost: 2,
    t_base_gdd: 10,
    season: "Zaid",
    primaryStates: ["uttar pradesh", "bihar", "punjab", "haryana"],
  },
  {
    id: "tobacco",
    name: "Tobacco (तंबाकू)",
    nameHi: "तंबाकू",
    category: "cash_crop",
    defaultVariety: "FCV / Anand-119",
    stage: "Leaf Curing / Harvesting",
    mspPrice: 3200,
    t_opt_day: 28,
    t_limit_day: 38,
    t_opt_night: 18,
    t_limit_night: 28,
    t_frost: 2,
    t_base_gdd: 10,
    season: "Rabi",
    primaryStates: ["andhra pradesh", "gujarat", "karnataka", "tamil nadu", "bihar", "west bengal"],
  },
  {
    id: "jute",
    name: "Jute (पटसन / जूट)",
    nameHi: "पटसन",
    category: "cash_crop",
    defaultVariety: "JRO-524 / JRO-204",
    stage: "Retting & Fibre Extraction",
    mspPrice: 5335,
    t_opt_day: 32,
    t_limit_day: 40,
    t_opt_night: 24,
    t_limit_night: 30,
    t_frost: 8,
    t_base_gdd: 12,
    season: "Kharif",
    primaryStates: ["west bengal", "assam", "bihar", "odisha", "andhra pradesh"],
  },

  // ─── Vegetables & Horticulture ───
  {
    id: "potato",
    name: "Potato (आलू)",
    nameHi: "आलू",
    category: "vegetable",
    defaultVariety: "Kufri Chipsona / Pukhraj / Jyoti",
    stage: "Tuber Bulking",
    mspPrice: 1250,
    t_opt_day: 20,
    t_limit_day: 30,
    t_opt_night: 12,
    t_limit_night: 20,
    t_frost: -1,
    t_base_gdd: 4,
    season: "Rabi",
    primaryStates: ["uttar pradesh", "west bengal", "bihar", "punjab", "gujarat", "madhya pradesh", "karnataka"],
  },
  {
    id: "onion",
    name: "Onion (प्याज / कांदा)",
    nameHi: "प्याज",
    category: "vegetable",
    defaultVariety: "Nasik Red / Bhima Super / Agrifound Light Red",
    stage: "Bulb Enlargement",
    mspPrice: 1650,
    t_opt_day: 25,
    t_limit_day: 35,
    t_opt_night: 15,
    t_limit_night: 24,
    t_frost: 2,
    t_base_gdd: 6,
    season: "Rabi",
    primaryStates: ["maharashtra", "madhya pradesh", "karnataka", "gujarat", "rajasthan", "bihar", "andhra pradesh"],
  },
  {
    id: "tomato",
    name: "Tomato (टमाटर)",
    nameHi: "टमाटर",
    category: "vegetable",
    defaultVariety: "Abhinav / US-440 / Arka Rakshak",
    stage: "Fruiting & Ripening",
    mspPrice: 1400,
    t_opt_day: 26,
    t_limit_day: 36,
    t_opt_night: 16,
    t_limit_night: 24,
    t_frost: 2,
    t_base_gdd: 10,
    season: "Year-Round",
    primaryStates: ["andhra pradesh", "madhya pradesh", "karnataka", "odisha", "gujarat", "maharashtra", "bihar", "west bengal"],
  },
  {
    id: "garlic",
    name: "Garlic (लहसुन)",
    nameHi: "लहसुन",
    category: "vegetable",
    defaultVariety: "G-282 / Yamuna Safed / Amleta",
    stage: "Clove & Bulb Development",
    mspPrice: 4200,
    t_opt_day: 22,
    t_limit_day: 32,
    t_opt_night: 12,
    t_limit_night: 22,
    t_frost: 0,
    t_base_gdd: 5,
    season: "Rabi",
    primaryStates: ["madhya pradesh", "rajasthan", "gujarat", "uttar pradesh", "maharashtra", "punjab"],
  },
  {
    id: "ginger",
    name: "Ginger (अदरक)",
    nameHi: "अदरक",
    category: "spice",
    defaultVariety: "Maran / Rio de Janeiro / IISR Varada",
    stage: "Rhizome Bulking",
    mspPrice: 4800,
    t_opt_day: 28,
    t_limit_day: 36,
    t_opt_night: 18,
    t_limit_night: 26,
    t_frost: 4,
    t_base_gdd: 10,
    season: "Kharif",
    primaryStates: ["assam", "kerala", "karnataka", "maharashtra", "meghalaya", "odisha", "west bengal"],
  },
  {
    id: "chilli",
    name: "Red Chilli (लाल मिर्च)",
    nameHi: "लाल मिर्च",
    category: "spice",
    defaultVariety: "Teja 334 / Byadgi / G-4",
    stage: "Fruit Maturation & Drying",
    mspPrice: 15400,
    t_opt_day: 28,
    t_limit_day: 38,
    t_opt_night: 18,
    t_limit_night: 26,
    t_frost: 4,
    t_base_gdd: 10,
    season: "Kharif",
    primaryStates: ["andhra pradesh", "telangana", "karnataka", "madhya pradesh", "maharashtra", "rajasthan", "gujarat"],
  },
  {
    id: "turmeric",
    name: "Turmeric (हल्दी)",
    nameHi: "हल्दी",
    category: "spice",
    defaultVariety: "Salem / Pragati / IISR Pratibha",
    stage: "Rhizome Maturation",
    mspPrice: 13700,
    t_opt_day: 30,
    t_limit_day: 38,
    t_opt_night: 20,
    t_limit_night: 28,
    t_frost: 5,
    t_base_gdd: 10,
    season: "Kharif",
    primaryStates: ["telangana", "maharashtra", "tamil nadu", "andhra pradesh", "karnataka", "odisha", "west bengal"],
  },
  {
    id: "cumin",
    name: "Cumin / Jeera (जीरा)",
    nameHi: "जीरा",
    category: "spice",
    defaultVariety: "GC-4 / RZ-223",
    stage: "Seed Filling & Ripening",
    mspPrice: 26500,
    t_opt_day: 24,
    t_limit_day: 32,
    t_opt_night: 10,
    t_limit_night: 18,
    t_frost: 0,
    t_base_gdd: 6,
    season: "Rabi",
    primaryStates: ["gujarat", "rajasthan"],
  },

  // ─── Fruits & Plantation ───
  {
    id: "apple",
    name: "Apple (सेब)",
    nameHi: "सेब",
    category: "horticulture",
    defaultVariety: "Royal Delicious / Gala / Fuji",
    stage: "Fruit Sizing / Coloring",
    mspPrice: 6500,
    t_opt_day: 20,
    t_limit_day: 28,
    t_opt_night: 8,
    t_limit_night: 18,
    t_frost: -5,
    t_base_gdd: 4,
    season: "Year-Round",
    primaryStates: ["jammu & kashmir", "himachal pradesh", "uttarakhand"],
  },
  {
    id: "grapes",
    name: "Grapes (अंगूर)",
    nameHi: "अंगूर",
    category: "horticulture",
    defaultVariety: "Thomson Seedless / Manik Chaman / Sharad Seedless",
    stage: "Berry Softening & Sugar Accumulation",
    mspPrice: 4800,
    t_opt_day: 28,
    t_limit_day: 38,
    t_opt_night: 15,
    t_limit_night: 25,
    t_frost: 0,
    t_base_gdd: 10,
    season: "Year-Round",
    primaryStates: ["maharashtra", "karnataka", "tamil nadu", "andhra pradesh", "punjab"],
  },
  {
    id: "pomegranate",
    name: "Pomegranate / Anar (अनार)",
    nameHi: "अनार",
    category: "horticulture",
    defaultVariety: "Bhagawa / Arakta",
    stage: "Aril Development",
    mspPrice: 7200,
    t_opt_day: 32,
    t_limit_day: 42,
    t_opt_night: 18,
    t_limit_night: 28,
    t_frost: 2,
    t_base_gdd: 10,
    season: "Year-Round",
    primaryStates: ["maharashtra", "gujarat", "karnataka", "rajasthan", "andhra pradesh", "madhya pradesh"],
  },
  {
    id: "coffee",
    name: "Coffee (कॉफ़ी)",
    nameHi: "कॉफ़ी",
    category: "plantation",
    defaultVariety: "Arabica / Robusta S-795",
    stage: "Berry Maturation",
    mspPrice: 18000,
    t_opt_day: 25,
    t_limit_day: 32,
    t_opt_night: 15,
    t_limit_night: 22,
    t_frost: 2,
    t_base_gdd: 10,
    season: "Year-Round",
    primaryStates: ["karnataka", "kerala", "tamil nadu", "andhra pradesh", "odisha"],
  },
  {
    id: "tea",
    name: "Tea (चाय)",
    nameHi: "चाय",
    category: "plantation",
    defaultVariety: "Assamica / TV-1",
    stage: "Two Leaves and a Bud Flush",
    mspPrice: 3800,
    t_opt_day: 26,
    t_limit_day: 34,
    t_opt_night: 16,
    t_limit_night: 24,
    t_frost: 2,
    t_base_gdd: 10,
    season: "Year-Round",
    primaryStates: ["assam", "west bengal", "tamil nadu", "kerala", "himachal pradesh"],
  },
  {
    id: "cardamom",
    name: "Cardamom / Elaichi (इलायची)",
    nameHi: "इलायची",
    category: "spice",
    defaultVariety: "Malabar / Mysore / Vazhukka",
    stage: "Capsule Filling",
    mspPrice: 95000,
    t_opt_day: 22,
    t_limit_day: 30,
    t_opt_night: 14,
    t_limit_night: 20,
    t_frost: 4,
    t_base_gdd: 10,
    season: "Year-Round",
    primaryStates: ["kerala", "karnataka", "tamil nadu", "sikkim"],
  },
];

const STORAGE_KEY_CUSTOM_CROPS = "aasra_farmer_custom_crops_v1";

/**
 * Retrieves custom crops created by the user from localStorage.
 */
export function getCustomCrops(): CropInfo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_CROPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Failed to parse custom crops:", e);
  }
  return [];
}

/**
 * Saves a new custom crop defined by the user.
 */
export function saveCustomCrop(customCrop: Partial<CropInfo> & { name: string }): CropInfo {
  const customList = getCustomCrops();
  const cleanId = customCrop.id || customCrop.name.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
  
  const newCrop: CropInfo = {
    id: cleanId,
    name: customCrop.name,
    nameHi: customCrop.nameHi || customCrop.name,
    category: customCrop.category || "cash_crop",
    defaultVariety: customCrop.defaultVariety || "Standard Farm Variety",
    stage: customCrop.stage || "Active Vegetative Stage",
    mspPrice: customCrop.mspPrice || 3500,
    t_opt_day: customCrop.t_opt_day ?? 28,
    t_limit_day: customCrop.t_limit_day ?? 38,
    t_opt_night: customCrop.t_opt_night ?? 20,
    t_limit_night: customCrop.t_limit_night ?? 28,
    t_frost: customCrop.t_frost ?? 2,
    t_base_gdd: customCrop.t_base_gdd ?? 10,
    season: customCrop.season || "Year-Round",
    primaryStates: customCrop.primaryStates || ["All Regions"],
    isCustom: true,
  };

  const filtered = customList.filter((c) => c.id !== newCrop.id);
  const updated = [newCrop, ...filtered];

  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CUSTOM_CROPS, JSON.stringify(updated));
    }
  } catch (e) {
    console.error("Failed to save custom crop:", e);
  }

  return newCrop;
}

/**
 * Returns regional native crops tailored to the user's specific district and state,
 * merged with any custom crops created by the user.
 */
export function getRegionalCrops(
  district: string = "",
  state: string = ""
): CropInfo[] {
  const normState = (state || "").toLowerCase().trim();
  const normDist = (district || "").toLowerCase().trim();

  const customCrops = getCustomCrops();

  // Score crops by state/district relevance
  const scored = MASTER_CROPS.map((crop) => {
    let score = 0;
    const inState = normState ? crop.primaryStates.some((s) => normState.includes(s) || s.includes(normState)) : false;
    if (inState) score += 10;

    // District-specific micro-climate heuristics
    if (normDist.includes("kasganj") || normDist.includes("etah") || normDist.includes("agra") || normDist.includes("aligarh")) {
      if (["wheat", "mustard", "potato", "bajra", "sugarcane", "maize", "mentha", "rice"].includes(crop.id)) score += 20;
    } else if (normDist.includes("bhopal") || normDist.includes("sehore") || normDist.includes("indore") || normDist.includes("ujjain") || normDist.includes("vidisha")) {
      if (["soybean", "wheat", "chana", "garlic", "onion", "mustard", "cotton", "maize"].includes(crop.id)) score += 20;
    } else if (normDist.includes("nashik") || normDist.includes("pune") || normDist.includes("nagpur") || normDist.includes("jalgaon")) {
      if (["cotton", "soybean", "onion", "grapes", "pomegranate", "tur", "sugarcane", "turmeric"].includes(crop.id)) score += 20;
    } else if (normDist.includes("ludhiana") || normDist.includes("karnal") || normDist.includes("bathinda")) {
      if (["wheat", "rice", "mustard", "cotton", "potato", "sugarcane", "maize"].includes(crop.id)) score += 20;
    } else if (normDist.includes("guntur") || normDist.includes("warangal") || normDist.includes("kurnool")) {
      if (["chilli", "cotton", "rice", "tobacco", "turmeric", "groundnut", "maize"].includes(crop.id)) score += 20;
    } else if (normDist.includes("rajkot") || normDist.includes("gondal") || normDist.includes("junagadh")) {
      if (["groundnut", "cotton", "cumin", "sesame", "wheat", "castor", "garlic"].includes(crop.id)) score += 20;
    } else if (normDist.includes("shimla") || normDist.includes("kullu") || normDist.includes("srinagar") || normDist.includes("anantnag")) {
      if (["apple", "walnut", "saffron", "potato", "maize"].includes(crop.id)) score += 25;
    }

    return { crop, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const sortedMaster = scored.map((s) => s.crop);
  // Custom crops always available at top
  return [...customCrops, ...sortedMaster];
}

/**
 * Finds agronomic specifications and thresholds for any crop name (even unlisted or custom)
 */
export function resolveCropThresholds(cropName: string): CropInfo {
  const norm = (cropName || "").toLowerCase().trim();

  // 1. Check user custom crops
  const customList = getCustomCrops();
  const customMatch = customList.find(
    (c) => norm.includes(c.id) || norm.includes(c.name.toLowerCase()) || norm.includes(c.nameHi.toLowerCase())
  );
  if (customMatch) return customMatch;

  // 2. Check Master Crops
  for (const c of MASTER_CROPS) {
    if (
      norm.includes(c.id) ||
      norm.includes(c.name.toLowerCase()) ||
      norm.includes(c.nameHi.toLowerCase()) ||
      c.name.toLowerCase().includes(norm)
    ) {
      return c;
    }
  }

  // 3. Dynamic Fallback for ANY completely unknown custom crop
  const titleName = cropName.trim() ? cropName.trim() : "Custom Farm Crop";
  return {
    id: norm.replace(/[^a-z0-9]/g, "_").slice(0, 20) || "custom_crop",
    name: titleName,
    nameHi: titleName,
    category: "cash_crop",
    defaultVariety: "High Yield Cultivar",
    stage: "Active Growth Stage",
    mspPrice: 3200,
    t_opt_day: 28,
    t_limit_day: 38,
    t_opt_night: 20,
    t_limit_night: 28,
    t_frost: 2,
    t_base_gdd: 10,
    season: "Year-Round",
    primaryStates: ["All Regions"],
    isCustom: true,
  };
}
