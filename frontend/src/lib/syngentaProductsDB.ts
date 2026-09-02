export interface SyngentaProduct {
  key: string;
  name: string;
  category: 'insecticide' | 'fungicide' | 'herbicide' | 'seed_treatment' | 'biostimulant' | 'pgr';
  activeIngredient: string;
  modeOfAction: string;
  groupCode: string;
  targetPests: string[];
  approvedCrops: string[];
  dosagePerAcre: string;
  waterPerAcre: number;
  applicationTiming: string;
  applicationsPerSeason: string;
  phi: string;
  packSizes: string[];
  mrpInr: string;
  costPerAcre: number;
  efficacyHeat: number;
  efficacyDrought: number;
  efficacyFungal: number;
  efficacyInsect: number;
  efficacyWeed: number;
  efficacySeedborne: number;
  tankMixSafe: string[];
  tankMixDanger: string[];
  stageSuitability: {
    germination: number;
    vegetative: number;
    flowering: number;
    podFormation: number;
    maturity: number;
  };
  // SCIENTIFIC & FIELD TRIAL VALIDATION
  trialEfficacyPct: number;             // e.g. 91.4% control rate in national trial
  trialCitation: string;                // Research paper / ICAR / State Ag University citation
  etlThreshold: string;                 // ICAR-NCIPM & KVK Economic Threshold Level
  cropwiseStandard: {
    rainfastnessHours: number;          // Hours needed before rainfall
    optimalDeltaT: string;              // Optimal dry/wet bulb Delta T
    droneApplicable: boolean;           // Suitable for drone spraying (8-10 L/acre)
    advisoryNote: string;               // Cropwise grower advisory protocol
  };
}

export const syngentaProducts: SyngentaProduct[] = [
  {
    "key": "virtako",
    "name": "Virtako",
    "category": "insecticide",
    "activeIngredient": "Thiamethoxam 1% + Chlorantraniliprole 0.5% GR",
    "modeOfAction": "Systemic + Contact (IRAC 4A + 28)",
    "groupCode": "IRAC 4A+28",
    "targetPests": [
      "Yellow Stem Borer",
      "Leaf Folder",
      "Early Shoot Borer"
    ],
    "approvedCrops": [
      "Rice",
      "Maize",
      "Sugarcane"
    ],
    "dosagePerAcre": "2.5-4 kg",
    "waterPerAcre": 0,
    "applicationTiming": "Vegetative (tillering in rice / shoot elongation in sugarcane)",
    "applicationsPerSeason": "1-2",
    "phi": "21-30",
    "packSizes": [
      "1kg",
      "2.5kg",
      "5kg"
    ],
    "mrpInr": "\u20b9850-900 (2.5kg)",
    "costPerAcre": 900,
    "efficacyHeat": 0.12,
    "efficacyDrought": 0.1,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.89,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Urea (basal)",
      "DAP",
      "MOP fertilizer granules"
    ],
    "tankMixDanger": [
      "Liquid foliar pesticides (granular broadcast only)"
    ],
    "stageSuitability": {
      "germination": 0.3,
      "vegetative": 0.95,
      "flowering": 0.6,
      "podFormation": 0.3,
      "maturity": 0.1
    },
    "trialEfficacyPct": 89.2,
    "trialCitation": "ICAR-IIRR Hyderabad & PAU Ludhiana Rice Stem Borer Multi-location Trial; 89.2% reduction in dead hearts/white ears",
    "etlThreshold": "1 egg mass/m\u00b2 or 2% dead hearts at vegetative stage (ICAR-NCIPM)",
    "cropwiseStandard": {
      "rainfastnessHours": 0,
      "optimalDeltaT": "N/A (soil broadcast)",
      "droneApplicable": false,
      "advisoryNote": "Broadcast uniformly with 5-10 kg dry sand; maintain 2-3 cm standing water for 48 hours."
    }
  },
  {
    "key": "ampligo",
    "name": "Ampligo",
    "category": "insecticide",
    "activeIngredient": "Chlorantraniliprole 9.3% + Lambda-cyhalothrin 4.6% ZC",
    "modeOfAction": "Systemic + Contact + Rapid Knockdown (IRAC 28 + 3A)",
    "groupCode": "IRAC 28+3A",
    "targetPests": [
      "Bollworms",
      "Fall Armyworm",
      "Stem Borer",
      "Pod Borer",
      "Semilooper"
    ],
    "approvedCrops": [
      "Cotton",
      "Rice",
      "Redgram",
      "Soybean",
      "Maize",
      "Tomato"
    ],
    "dosagePerAcre": "80-100 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Flowering to Pod / Boll Formation",
    "applicationsPerSeason": "1-2",
    "phi": "15-20",
    "packSizes": [
      "80ml",
      "100ml",
      "250ml"
    ],
    "mrpInr": "\u20b9800-900 (100ml)",
    "costPerAcre": 850,
    "efficacyHeat": 0.15,
    "efficacyDrought": 0.1,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.93,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Isabion\u00ae",
      "Quantis\u00ae",
      "Amistar Top\u00ae",
      "NPK 19-19-19"
    ],
    "tankMixDanger": [
      "Strong Alkaline mixtures (pH > 8.5)",
      "Copper Oxychloride"
    ],
    "stageSuitability": {
      "germination": 0.1,
      "vegetative": 0.5,
      "flowering": 0.95,
      "podFormation": 0.9,
      "maturity": 0.3
    },
    "trialEfficacyPct": 92.6,
    "trialCitation": "ICAR-IIMR & UAS Dharwad Fall Armyworm & Bollworm Multi-Center Evaluation; 92.6% larval mortality within 48h",
    "etlThreshold": "1 larva per meter row or 5% damaged squares/bolls/pods (ICAR-CICR / NCIPM)",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "ZC formulation delivers instant knockdown + 14-day ovicidal shield. Drone spray: 10 L/acre with hollow cone nozzle."
    }
  },
  {
    "key": "alika",
    "name": "Alika",
    "category": "insecticide",
    "activeIngredient": "Thiamethoxam 12.6% + Lambda-cyhalothrin 9.5% ZC",
    "modeOfAction": "Systemic + Contact (IRAC 4A + 3A)",
    "groupCode": "IRAC 4A+3A",
    "targetPests": [
      "Aphids",
      "Jassids",
      "Thrips",
      "Whitefly",
      "Bollworms"
    ],
    "approvedCrops": [
      "Cotton",
      "Groundnut",
      "Tomato",
      "Soybean",
      "Chilli"
    ],
    "dosagePerAcre": "80 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Vegetative to Flowering",
    "applicationsPerSeason": "1-2",
    "phi": "21",
    "packSizes": [
      "40ml",
      "80ml",
      "250ml"
    ],
    "mrpInr": "\u20b9550 (80ml)",
    "costPerAcre": 550,
    "efficacyHeat": 0.1,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.89,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Amistar Top\u00ae",
      "Score\u00ae",
      "Isabion\u00ae",
      "Chelated Micronutrients"
    ],
    "tankMixDanger": [
      "Bordeaux mixture",
      "Lime sulfur"
    ],
    "stageSuitability": {
      "germination": 0.1,
      "vegetative": 0.9,
      "flowering": 0.85,
      "podFormation": 0.5,
      "maturity": 0.2
    },
    "trialEfficacyPct": 88.5,
    "trialCitation": "ICAR-CICR Nagpur & TNAU Cotton Sucking Pest & Bollworm Complex Trials; 88.5% reduction in jassid/whitefly index",
    "etlThreshold": "5-10 jassids/leaf or 5-8 thrips/leaf",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Dual systemic + contact action. Spray in early morning (6-9 AM) to avoid pollinator peak activity."
    }
  },
  {
    "key": "chess",
    "name": "Chess",
    "category": "insecticide",
    "activeIngredient": "Pymetrozine 50% WG",
    "modeOfAction": "Selective Systemic (Stylet Paralysis) (IRAC 9B)",
    "groupCode": "IRAC 9B",
    "targetPests": [
      "Brown Plant Hopper (BPH)",
      "White Backed Plant Hopper (WBPH)"
    ],
    "approvedCrops": [
      "Rice"
    ],
    "dosagePerAcre": "120 g",
    "waterPerAcre": 200,
    "applicationTiming": "Tillering to Panicle Initiation",
    "applicationsPerSeason": "1-2",
    "phi": "19",
    "packSizes": [
      "120g",
      "250g",
      "500g"
    ],
    "mrpInr": "\u20b9700 (120g)",
    "costPerAcre": 700,
    "efficacyHeat": 0.05,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.91,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Amistar Top\u00ae",
      "Tilt\u00ae",
      "Urea (1%)"
    ],
    "tankMixDanger": [
      "Highly acidic chemicals (pH < 5)"
    ],
    "stageSuitability": {
      "germination": 0.2,
      "vegetative": 0.95,
      "flowering": 0.7,
      "podFormation": 0.4,
      "maturity": 0.1
    },
    "trialEfficacyPct": 91.4,
    "trialCitation": "ICAR-NRRI Cuttack & AICRP on Rice Trials; 91.4% BPH nymph/adult mortality; preserves mirid bug predator (Cyrtorhinus lividipennis)",
    "etlThreshold": "5-10 hoppers per hill at tillering, 10-15 hoppers/hill at panicle initiation",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Direct spray towards the base of rice hills where hoppers congregate. Immediate stylet paralysis stops sap-drain."
    }
  },
  {
    "key": "pegasus",
    "name": "Pegasus",
    "category": "insecticide",
    "activeIngredient": "Diafenthiuron 50% WP",
    "modeOfAction": "Vapor + Contact + Translaminar (IRAC 12A)",
    "groupCode": "IRAC 12A",
    "targetPests": [
      "Whiteflies",
      "Two-Spotted Mites",
      "Aphids",
      "Diamondback Moth"
    ],
    "approvedCrops": [
      "Cotton",
      "Chilli",
      "Cabbage",
      "Brinjal",
      "Tomato"
    ],
    "dosagePerAcre": "250 g",
    "waterPerAcre": 200,
    "applicationTiming": "Vegetative to Early Fruiting",
    "applicationsPerSeason": "1-2",
    "phi": "7-10",
    "packSizes": [
      "250g",
      "500g"
    ],
    "mrpInr": "\u20b9600 (250g)",
    "costPerAcre": 600,
    "efficacyHeat": 0.1,
    "efficacyDrought": 0.08,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.87,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Score\u00ae",
      "Isabion\u00ae",
      "Zinc Sulfate (chelated)"
    ],
    "tankMixDanger": [
      "Copper-based fungicides",
      "Alkaline washes"
    ],
    "stageSuitability": {
      "germination": 0.1,
      "vegetative": 0.9,
      "flowering": 0.7,
      "podFormation": 0.5,
      "maturity": 0.2
    },
    "trialEfficacyPct": 86.8,
    "trialCitation": "ICAR-IIHR Bengaluru & TNAU Chilli & Cotton Whitefly/Mite Multi-season Evaluation; 86.8% control of nymphs & adults",
    "etlThreshold": "5-10 whiteflies/leaf or 3-5 mites/leaf on top canopy (ICAR-NCIPM)",
    "cropwiseStandard": {
      "rainfastnessHours": 3,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Photochemically converted by sunlight into active carbodiimide. Best applied at ambient temperatures above 25\u00b0C."
    }
  },
  {
    "key": "actara",
    "name": "Actara",
    "category": "insecticide",
    "activeIngredient": "Thiamethoxam 25% WG",
    "modeOfAction": "Systemic (Acropetal Xylem Transport) (IRAC 4A)",
    "groupCode": "IRAC 4A",
    "targetPests": [
      "Aphids",
      "Jassids",
      "Hoppers",
      "Whitefly",
      "Thrips"
    ],
    "approvedCrops": [
      "Rice",
      "Cotton",
      "Vegetables",
      "Wheat",
      "Mustard"
    ],
    "dosagePerAcre": "40-80 g",
    "waterPerAcre": 200,
    "applicationTiming": "Early Vegetative / Seedling Emergence",
    "applicationsPerSeason": "1-2",
    "phi": "14-21",
    "packSizes": [
      "40g",
      "100g",
      "250g"
    ],
    "mrpInr": "\u20b9250 (100g)",
    "costPerAcre": 250,
    "efficacyHeat": 0.08,
    "efficacyDrought": 0.06,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.87,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.15,
    "tankMixSafe": [
      "Ridomil Gold\u00ae",
      "Score\u00ae",
      "Isabion\u00ae"
    ],
    "tankMixDanger": [
      "Highly alkaline chemicals (pH > 8.0)"
    ],
    "stageSuitability": {
      "germination": 0.3,
      "vegetative": 0.95,
      "flowering": 0.6,
      "podFormation": 0.3,
      "maturity": 0.1
    },
    "trialEfficacyPct": 87.2,
    "trialCitation": "PAU Ludhiana & ICAR-IIRR Rice Hopper & Aphid Bioassay; 87.2% pest reduction with acropetal xylem translocation",
    "etlThreshold": "Aphid colonies on 10% twigs or 5 hoppers/hill",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Systemic acropetal transport protects newly unfolding shoots. Avoid application during peak flowering."
    }
  },
  {
    "key": "simodis",
    "name": "Simodis",
    "category": "insecticide",
    "activeIngredient": "Isocycloseram 9.2% w/w DC (PLINAZOLIN\u00ae technology)",
    "modeOfAction": "Contact + Ingestion (GABA Allosteric Modulator) (IRAC 30)",
    "groupCode": "IRAC 30",
    "targetPests": [
      "Invasive Black Thrips (Thrips parvispinus)",
      "Mites",
      "Diamondback Moth",
      "Fruit Borer"
    ],
    "approvedCrops": [
      "Chilli",
      "Cabbage",
      "Tomato",
      "Brinjal"
    ],
    "dosagePerAcre": "240-300 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Vegetative to Early Flowering",
    "applicationsPerSeason": "1-2",
    "phi": "7-10",
    "packSizes": [
      "100ml",
      "250ml",
      "500ml"
    ],
    "mrpInr": "\u20b9900 (100ml)",
    "costPerAcre": 2200,
    "efficacyHeat": 0.08,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.95,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Isabion\u00ae",
      "Quantis\u00ae",
      "Amistar Top\u00ae"
    ],
    "tankMixDanger": [
      "Copper Hydroxide",
      "Sulfur WP"
    ],
    "stageSuitability": {
      "germination": 0.1,
      "vegetative": 0.85,
      "flowering": 0.9,
      "podFormation": 0.5,
      "maturity": 0.2
    },
    "trialEfficacyPct": 94.8,
    "trialCitation": "ICAR-IIHR Bengaluru & TNAU Invasive Thrips (Thrips parvispinus) Emergency Management Trials (2022-2024); 94.8% mortality",
    "etlThreshold": "2-3 thrips per flower/leaf in Chilli (ICAR-IIHR alert)",
    "cropwiseStandard": {
      "rainfastnessHours": 1,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Novel IRAC Group 30 molecule. Overcomes fipronil/spinosad resistance. Rainfast within 60 minutes."
    }
  },
  {
    "key": "evicent",
    "name": "Evicent",
    "category": "insecticide",
    "activeIngredient": "Emamectin benzoate 5% SG",
    "modeOfAction": "Translaminar + Stomach (Chloride Channel Activator) (IRAC 6)",
    "groupCode": "IRAC 6",
    "targetPests": [
      "Gram Pod Borer (Helicoverpa)",
      "Fruit Borers",
      "Caterpillar Complex"
    ],
    "approvedCrops": [
      "Cotton",
      "Chilli",
      "Pigeon pea",
      "Chickpea",
      "Tomato"
    ],
    "dosagePerAcre": "80-100 g",
    "waterPerAcre": 200,
    "applicationTiming": "Flowering to Pod / Fruiting",
    "applicationsPerSeason": "1-2",
    "phi": "7-14",
    "packSizes": [
      "10g",
      "100g",
      "250g"
    ],
    "mrpInr": "\u20b9450 (100g)",
    "costPerAcre": 360,
    "efficacyHeat": 0.05,
    "efficacyDrought": 0.02,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.89,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Score\u00ae",
      "Amistar Top\u00ae",
      "Isabion\u00ae"
    ],
    "tankMixDanger": [
      "Strong alkaline mixtures"
    ],
    "stageSuitability": {
      "germination": 0.05,
      "vegetative": 0.4,
      "flowering": 0.95,
      "podFormation": 0.85,
      "maturity": 0.3
    },
    "trialEfficacyPct": 88.9,
    "trialCitation": "ICAR-IIPR Kanpur Chickpea Pod Borer (Helicoverpa armigera) National Trial; 88.9% pod damage suppression",
    "etlThreshold": "1 larva per meter row or 5% pod damage",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Rapid translaminar reservoir formation; kills hidden larvae feeding on lower leaf surfaces and inside calyx."
    }
  },
  {
    "key": "minecto_xtra",
    "name": "Minecto Xtra",
    "category": "insecticide",
    "activeIngredient": "Cyantraniliprole 16.9% + Lufenuron 16.9% SC",
    "modeOfAction": "Ryanodine Modulator + Chitin Biosynthesis Inhibitor (IRAC 28 + 15)",
    "groupCode": "IRAC 28+15",
    "targetPests": [
      "Diamondback Moth (DBM)",
      "Spodoptera litura",
      "Fruit Borers",
      "Defoliators"
    ],
    "approvedCrops": [
      "Cabbage",
      "Chilli",
      "Cotton",
      "Cauliflower"
    ],
    "dosagePerAcre": "150-200 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Vegetative to Fruiting",
    "applicationsPerSeason": "1",
    "phi": "14",
    "packSizes": [
      "100ml",
      "250ml"
    ],
    "mrpInr": "\u20b91200 (100ml)",
    "costPerAcre": 2400,
    "efficacyHeat": 0.05,
    "efficacyDrought": 0.02,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.93,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Score\u00ae",
      "Isabion\u00ae"
    ],
    "tankMixDanger": [
      "Copper formulations"
    ],
    "stageSuitability": {
      "germination": 0.05,
      "vegetative": 0.5,
      "flowering": 0.85,
      "podFormation": 0.95,
      "maturity": 0.3
    },
    "trialEfficacyPct": 93.1,
    "trialCitation": "ICAR-IIHR & TNAU Diamondback Moth & Spodoptera Multi-Location Trial; 93.1% suppression with chitin synthesis inhibition",
    "etlThreshold": "2 larvae/plant in crucifers or 5% leaf damage",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Dual ovicidal + larvicidal mode of action. Breaks resistance cycle in intensive vegetable production belts."
    }
  },
  {
    "key": "voliam_flexi",
    "name": "Voliam Flexi",
    "category": "insecticide",
    "activeIngredient": "Thiamethoxam 17.5% + Chlorantraniliprole 8.8% SC",
    "modeOfAction": "Systemic + Contact (IRAC 4A + 28)",
    "groupCode": "IRAC 4A+28",
    "targetPests": [
      "Tomato Fruit Borer",
      "Stem Borer",
      "Leaf Folder",
      "Whitefly"
    ],
    "approvedCrops": [
      "Tomato",
      "Rice",
      "Brinjal",
      "Okra"
    ],
    "dosagePerAcre": "80-100 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Vegetative to Early Fruiting",
    "applicationsPerSeason": "1-2",
    "phi": "14",
    "packSizes": [
      "100ml",
      "200ml"
    ],
    "mrpInr": "\u20b9950 (100ml)",
    "costPerAcre": 950,
    "efficacyHeat": 0.08,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.91,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Amistar Top\u00ae",
      "Score\u00ae",
      "Isabion\u00ae"
    ],
    "tankMixDanger": [
      "Alkaline fertilizers"
    ],
    "stageSuitability": {
      "germination": 0.2,
      "vegetative": 0.9,
      "flowering": 0.8,
      "podFormation": 0.6,
      "maturity": 0.2
    },
    "trialEfficacyPct": 91.5,
    "trialCitation": "ICAR-IIVR Varanasi Tomato Fruit Borer & Whitefly Co-management Trial; 91.5% fruit protection and virus suppression",
    "etlThreshold": "1 borer/plant or 5 whiteflies/leaf",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Simultaneous chewing borer + sucking vector protection. 14-day residual window."
    }
  },
  {
    "key": "matador",
    "name": "Matador",
    "category": "insecticide",
    "activeIngredient": "Lambda-cyhalothrin 5% EC",
    "modeOfAction": "Contact + Stomach (Pyrethroid Sodium Channel Modulator) (IRAC 3A)",
    "groupCode": "IRAC 3A",
    "targetPests": [
      "Bollworms",
      "Stem Borer",
      "Thrips",
      "Leaf Folder"
    ],
    "approvedCrops": [
      "Cotton",
      "Paddy",
      "Vegetables",
      "Pigeonpea"
    ],
    "dosagePerAcre": "200-250 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Vegetative to Flowering",
    "applicationsPerSeason": "1-3",
    "phi": "10-15",
    "packSizes": [
      "250ml",
      "500ml",
      "1L"
    ],
    "mrpInr": "\u20b9400 (500ml)",
    "costPerAcre": 200,
    "efficacyHeat": 0.05,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.83,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Carbendazim",
      "Mancozeb",
      "Urea"
    ],
    "tankMixDanger": [
      "Strong alkaline solutions"
    ],
    "stageSuitability": {
      "germination": 0.1,
      "vegetative": 0.85,
      "flowering": 0.75,
      "podFormation": 0.5,
      "maturity": 0.2
    },
    "trialEfficacyPct": 83.4,
    "trialCitation": "ICAR-CICR Nagpur Cotton Bollworm Rapid Knockdown Trial; 83.4% knockdown within 1 hour",
    "etlThreshold": "10% infested flowers or 1-2 larvae/m row",
    "cropwiseStandard": {
      "rainfastnessHours": 1,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Fast-acting contact pyrethroid. Best for immediate knockdown of migrating moth flushes."
    }
  },
  {
    "key": "karate",
    "name": "Karate",
    "category": "insecticide",
    "activeIngredient": "Lambda-cyhalothrin 2.5% EC",
    "modeOfAction": "Contact + Stomach (IRAC 3A)",
    "groupCode": "IRAC 3A",
    "targetPests": [
      "Bollworms",
      "Jassids",
      "Thrips",
      "Leafhoppers"
    ],
    "approvedCrops": [
      "Cotton",
      "Vegetables",
      "Oilseeds"
    ],
    "dosagePerAcre": "300-400 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Vegetative",
    "applicationsPerSeason": "1-3",
    "phi": "10-15",
    "packSizes": [
      "500ml",
      "1L"
    ],
    "mrpInr": "\u20b9300 (500ml)",
    "costPerAcre": 200,
    "efficacyHeat": 0.02,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.81,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Mancozeb",
      "Foliar NPK"
    ],
    "tankMixDanger": [
      "Lime sulfur"
    ],
    "stageSuitability": {
      "germination": 0.1,
      "vegetative": 0.9,
      "flowering": 0.6,
      "podFormation": 0.4,
      "maturity": 0.15
    },
    "trialEfficacyPct": 81.2,
    "trialCitation": "State Agricultural Universities (SAUs) Pest Surveillance Report; 81.2% reduction in early vegetative defoliators",
    "etlThreshold": "10% defoliation at vegetative stage",
    "cropwiseStandard": {
      "rainfastnessHours": 1,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Economic knockdown solution for early vegetative foliage feeders."
    }
  },
  {
    "key": "polytrin_c",
    "name": "Polytrin C",
    "category": "insecticide",
    "activeIngredient": "Profenofos 40% + Cypermethrin 4% EC",
    "modeOfAction": "Contact + Stomach + Ovicidal (IRAC 1B + 3A)",
    "groupCode": "IRAC 1B+3A",
    "targetPests": [
      "Bollworms",
      "Whitefly Nymphs",
      "Defoliators"
    ],
    "approvedCrops": [
      "Cotton",
      "Soybean"
    ],
    "dosagePerAcre": "400-600 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Flowering to Boll Formation",
    "applicationsPerSeason": "2",
    "phi": "14",
    "packSizes": [
      "500ml",
      "1L"
    ],
    "mrpInr": "\u20b9650 (1L)",
    "costPerAcre": 350,
    "efficacyHeat": 0.05,
    "efficacyDrought": 0.02,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.86,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Mancozeb",
      "Carbendazim"
    ],
    "tankMixDanger": [
      "Alkaline washes"
    ],
    "stageSuitability": {
      "germination": 0.05,
      "vegetative": 0.5,
      "flowering": 0.9,
      "podFormation": 0.85,
      "maturity": 0.2
    },
    "trialEfficacyPct": 85.7,
    "trialCitation": "ICAR-CICR Cotton Resistant Bollworm Advisory Bulletin; 85.7% ovicidal + larvicidal efficacy",
    "etlThreshold": "5-10 eggs/100 leaves or 5% square damage",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Strong ovicidal action destroys eggs before hatching. Pungent odor deters ovipositing adult moths."
    }
  },
  {
    "key": "curacron",
    "name": "Curacron",
    "category": "insecticide",
    "activeIngredient": "Profenofos 50% EC",
    "modeOfAction": "Contact + Translaminar (AChE Inhibitor) (IRAC 1B)",
    "groupCode": "IRAC 1B",
    "targetPests": [
      "Spodoptera litura",
      "Bollworms",
      "Mealybugs",
      "Mites"
    ],
    "approvedCrops": [
      "Cotton",
      "Soybean",
      "Vegetables"
    ],
    "dosagePerAcre": "400-500 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Vegetative to Flowering",
    "applicationsPerSeason": "2",
    "phi": "14",
    "packSizes": [
      "500ml",
      "1L"
    ],
    "mrpInr": "\u20b9700 (1L)",
    "costPerAcre": 350,
    "efficacyHeat": 0.05,
    "efficacyDrought": 0.02,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.84,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Isabion\u00ae",
      "Score\u00ae"
    ],
    "tankMixDanger": [
      "Alkaline fungicides"
    ],
    "stageSuitability": {
      "germination": 0.1,
      "vegetative": 0.85,
      "flowering": 0.8,
      "podFormation": 0.5,
      "maturity": 0.15
    },
    "trialEfficacyPct": 84.1,
    "trialCitation": "ICAR-IISR Indore Soybean Spodoptera litura Trial; 84.1% defoliation reduction",
    "etlThreshold": "2 larvae per meter row length in soybean",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Penetrates leaf lamina to reach larvae hiding in leaf folds. Dissolves mealybug waxy bloom."
    }
  },
  {
    "key": "ekalux",
    "name": "Ekalux",
    "category": "insecticide",
    "activeIngredient": "Quinalphos 25% EC",
    "modeOfAction": "Contact + Stomach (IRAC 1B)",
    "groupCode": "IRAC 1B",
    "targetPests": [
      "Stem Borer",
      "Leaf Folder",
      "Pod Borers"
    ],
    "approvedCrops": [
      "Rice",
      "Cotton",
      "Tea",
      "Pulses"
    ],
    "dosagePerAcre": "400-500 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Vegetative",
    "applicationsPerSeason": "2",
    "phi": "21",
    "packSizes": [
      "500ml",
      "1L"
    ],
    "mrpInr": "\u20b9600 (1L)",
    "costPerAcre": 300,
    "efficacyHeat": 0.02,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.8,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Mancozeb",
      "Zineb"
    ],
    "tankMixDanger": [
      "Copper compounds"
    ],
    "stageSuitability": {
      "germination": 0.1,
      "vegetative": 0.9,
      "flowering": 0.5,
      "podFormation": 0.3,
      "maturity": 0.1
    },
    "trialEfficacyPct": 80.5,
    "trialCitation": "ICAR-IIRR AICRP Rice Entomology Trial; 80.5% dead heart reduction in Basmati belts",
    "etlThreshold": "2% dead hearts or 1 moth/m\u00b2",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Broad-spectrum contact and stomach organophosphate for emergency borer flushes."
    }
  },
  {
    "key": "polo",
    "name": "Polo",
    "category": "insecticide",
    "activeIngredient": "Diafenthiuron 50% WP",
    "modeOfAction": "Contact + Stomach + Vapor (IRAC 12A)",
    "groupCode": "IRAC 12A",
    "targetPests": [
      "Whiteflies",
      "Aphids",
      "Mites",
      "Jassids"
    ],
    "approvedCrops": [
      "Cotton",
      "Chilli",
      "Brinjal",
      "Tomato"
    ],
    "dosagePerAcre": "250 g",
    "waterPerAcre": 200,
    "applicationTiming": "Early Infestation / Vegetative",
    "applicationsPerSeason": "1-2",
    "phi": "7",
    "packSizes": [
      "250g",
      "500g"
    ],
    "mrpInr": "\u20b9650 (250g)",
    "costPerAcre": 650,
    "efficacyHeat": 0.08,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.88,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Isabion\u00ae",
      "Score\u00ae"
    ],
    "tankMixDanger": [
      "Bordeaux mixture"
    ],
    "stageSuitability": {
      "germination": 0.1,
      "vegetative": 0.9,
      "flowering": 0.7,
      "podFormation": 0.4,
      "maturity": 0.15
    },
    "trialEfficacyPct": 87.5,
    "trialCitation": "UAS Dharwad & CICR Cotton Whitefly Resistance Mitigation Trials; 87.5% nymphal suppression",
    "etlThreshold": "8-10 whiteflies per leaf (upper canopy)",
    "cropwiseStandard": {
      "rainfastnessHours": 3,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Unique carbodiimide photometabolite mode of action. Apply when temperature is above 25\u00b0C."
    }
  },
  {
    "key": "amistar_top",
    "name": "Amistar Top",
    "category": "fungicide",
    "activeIngredient": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
    "modeOfAction": "Systemic + Translaminar + Greening Effect (FRAC 11 + 3)",
    "groupCode": "FRAC 11+3",
    "targetPests": [
      "Sheath Blight",
      "Blast",
      "Rust",
      "Powdery Mildew",
      "Anthracnose",
      "Alternaria Blight"
    ],
    "approvedCrops": [
      "Paddy",
      "Wheat",
      "Maize",
      "Chilli",
      "Tomato",
      "Soybean"
    ],
    "dosagePerAcre": "200 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive or Early Disease Onset (Booting / Flowering)",
    "applicationsPerSeason": "1-2",
    "phi": "14-21",
    "packSizes": [
      "100ml",
      "200ml",
      "500ml"
    ],
    "mrpInr": "\u20b91300 (200ml)",
    "costPerAcre": 1300,
    "efficacyHeat": 0.25,
    "efficacyDrought": 0.15,
    "efficacyFungal": 0.94,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.1,
    "tankMixSafe": [
      "Isabion\u00ae",
      "Ampligo\u00ae",
      "Quantis\u00ae",
      "NPK 19-19-19"
    ],
    "tankMixDanger": [
      "Copper Oxychloride",
      "Strongly alkaline solutions"
    ],
    "stageSuitability": {
      "germination": 0.2,
      "vegetative": 0.7,
      "flowering": 0.95,
      "podFormation": 0.85,
      "maturity": 0.4
    },
    "trialEfficacyPct": 88.6,
    "trialCitation": "ICAR-IIRR Hyderabad & PAU Ludhiana Rice Sheath Blight & Wheat Rust Multi-location Trials; 88.6% disease severity reduction (PDI); +18.4% yield gain",
    "etlThreshold": "5-10% sheath blight infected tillers or first rust pustule detection",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Strobilurin + Triazole dual shield with distinct physiological greening effect; extends grain filling by 5-7 days."
    }
  },
  {
    "key": "score",
    "name": "Score",
    "category": "fungicide",
    "activeIngredient": "Difenoconazole 25% EC",
    "modeOfAction": "Fast Systemic Triazole (Ergosterol Biosynthesis Block) (FRAC 3)",
    "groupCode": "FRAC 3",
    "targetPests": [
      "Apple Scab",
      "Early Blight",
      "Sheath Blight",
      "Rust",
      "Cercospora Leaf Spot"
    ],
    "approvedCrops": [
      "Apple",
      "Tomato",
      "Rice",
      "Chilli",
      "Groundnut",
      "Pomegranate"
    ],
    "dosagePerAcre": "100 ml",
    "waterPerAcre": 200,
    "applicationTiming": "First Symptom Onset / Disease Warning",
    "applicationsPerSeason": "1-3",
    "phi": "14",
    "packSizes": [
      "100ml",
      "250ml",
      "500ml"
    ],
    "mrpInr": "\u20b9750 (250ml)",
    "costPerAcre": 300,
    "efficacyHeat": 0.12,
    "efficacyDrought": 0.08,
    "efficacyFungal": 0.91,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Actara\u00ae",
      "Quantis\u00ae",
      "Isabion\u00ae",
      "Chelated Micronutrients"
    ],
    "tankMixDanger": [
      "Concentrated EC oil formulations at midday"
    ],
    "stageSuitability": {
      "germination": 0.15,
      "vegetative": 0.6,
      "flowering": 0.9,
      "podFormation": 0.8,
      "maturity": 0.4
    },
    "trialEfficacyPct": 91.2,
    "trialCitation": "SKUAST Kashmir & Dr. YSP UHF Nauni Apple Scab & Tomato Alternaria Blight Trial; 91.2% curative disease control",
    "etlThreshold": "First appearance of circular olive-green or dark brown leaf spots",
    "cropwiseStandard": {
      "rainfastnessHours": 1,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Fast-acting systemic triazole with 48-hour kickback curative action. Rainfast within 60 minutes."
    }
  },
  {
    "key": "kavach",
    "name": "Kavach",
    "category": "fungicide",
    "activeIngredient": "Chlorothalonil 720 g/l SC",
    "modeOfAction": "Multi-site Contact Protectant (FRAC M5)",
    "groupCode": "FRAC M5",
    "targetPests": [
      "Late Blight",
      "Early Blight",
      "Downy Mildew",
      "Anthracnose"
    ],
    "approvedCrops": [
      "Potato",
      "Tomato",
      "Grapes",
      "Chilli",
      "Groundnut"
    ],
    "dosagePerAcre": "400 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive (prior to rain / high humidity)",
    "applicationsPerSeason": "1-3",
    "phi": "7-14",
    "packSizes": [
      "250ml",
      "500ml",
      "1L"
    ],
    "mrpInr": "\u20b9800 (500ml)",
    "costPerAcre": 640,
    "efficacyHeat": 0.05,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.84,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Isabion\u00ae",
      "Ampligo\u00ae",
      "Ridomil Gold\u00ae"
    ],
    "tankMixDanger": [
      "Foliar oils",
      "Surfactants causing excessive penetration"
    ],
    "stageSuitability": {
      "germination": 0.2,
      "vegetative": 0.85,
      "flowering": 0.8,
      "podFormation": 0.7,
      "maturity": 0.3
    },
    "trialEfficacyPct": 83.5,
    "trialCitation": "ICAR-CPRI Shimla Potato Late Blight Multi-site Contact Protectant Trial; 83.5% preventive leaf protection",
    "etlThreshold": "Prophylactic spray prior to forecasted rain/cloudy weather with leaf wetness >8h",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "FRAC Group M5 multi-site contact shield. Zero resistance risk. Wash-off resistant multi-point film."
    }
  },
  {
    "key": "orondis_ultra",
    "name": "Orondis Ultra",
    "category": "fungicide",
    "activeIngredient": "Oxathiapiprolin + Mandipropamid SC",
    "modeOfAction": "Systemic + Translaminar (OSBP Inhibitor + CAA) (FRAC 49 + 40)",
    "groupCode": "FRAC 49+40",
    "targetPests": [
      "Late Blight (Phytophthora)",
      "Downy Mildew (Plasmopara / Pseudoperonospora)"
    ],
    "approvedCrops": [
      "Potato",
      "Grapes",
      "Tomato"
    ],
    "dosagePerAcre": "200 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive (high disease risk window)",
    "applicationsPerSeason": "1-2",
    "phi": "3-7",
    "packSizes": [
      "100ml",
      "200ml"
    ],
    "mrpInr": "\u20b91100 (200ml)",
    "costPerAcre": 1100,
    "efficacyHeat": 0.05,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.96,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Isabion\u00ae",
      "Score\u00ae"
    ],
    "tankMixDanger": [
      "Bordeaux mixture"
    ],
    "stageSuitability": {
      "germination": 0.3,
      "vegetative": 0.85,
      "flowering": 0.9,
      "podFormation": 0.8,
      "maturity": 0.4
    },
    "trialEfficacyPct": 96.4,
    "trialCitation": "ICAR-CPRI Shimla & ICAR-NRC Grapes Pune Oomycete Breakthrough Trials; 96.4% Late Blight & Downy Mildew inhibition",
    "etlThreshold": "Weather advisory indicating high blight risk (temp 12-22\u00b0C, RH >85% for 48h)",
    "cropwiseStandard": {
      "rainfastnessHours": 1,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Active at femtomolar concentrations. Binds to oxysterol-binding protein. Best preventative oomycete tool."
    }
  },
  {
    "key": "ridomil_gold",
    "name": "Ridomil Gold",
    "category": "fungicide",
    "activeIngredient": "Metalaxyl-M 4% + Mancozeb 64% WP",
    "modeOfAction": "Systemic Acropetal + Multi-site Contact Shield (FRAC 4 + M3)",
    "groupCode": "FRAC 4+M3",
    "targetPests": [
      "Late Blight",
      "Downy Mildew",
      "Damping Off (Pythium / Phytophthora)"
    ],
    "approvedCrops": [
      "Potato",
      "Grapes",
      "Tobacco",
      "Tomato",
      "Mustard"
    ],
    "dosagePerAcre": "500-1000 g",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive / Early Curative",
    "applicationsPerSeason": "1-3",
    "phi": "7-14",
    "packSizes": [
      "100g",
      "250g",
      "500g",
      "1kg"
    ],
    "mrpInr": "\u20b91000 (500g)",
    "costPerAcre": 1000,
    "efficacyHeat": 0.08,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.92,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.15,
    "tankMixSafe": [
      "Actara\u00ae",
      "Isabion\u00ae",
      "NPK fertilizers"
    ],
    "tankMixDanger": [
      "Lime sulfur",
      "Alkaline washes"
    ],
    "stageSuitability": {
      "germination": 0.3,
      "vegetative": 0.85,
      "flowering": 0.85,
      "podFormation": 0.7,
      "maturity": 0.3
    },
    "trialEfficacyPct": 91.8,
    "trialCitation": "ICAR-CPRI Potato Late Blight National Coordinated Evaluation; 91.8% protection against Phytophthora infestans",
    "etlThreshold": "At first blight forecast alert or 1% infected canopy in field margins",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Metalaxyl-M is acropetally translocated to protect emerging new shoots, while Mancozeb coats outer foliage."
    }
  },
  {
    "key": "ampect_xtra",
    "name": "Ampect Xtra",
    "category": "fungicide",
    "activeIngredient": "Azoxystrobin 18.2% + Cyproconazole 7.3% SC",
    "modeOfAction": "Systemic (Strobilurin + Triazole) (FRAC 11 + 3)",
    "groupCode": "FRAC 11+3",
    "targetPests": [
      "Sugarcane Smut",
      "Rust",
      "Leaf Spots"
    ],
    "approvedCrops": [
      "Sugarcane",
      "Wheat"
    ],
    "dosagePerAcre": "200 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive / Curative",
    "applicationsPerSeason": "1-2",
    "phi": "21",
    "packSizes": [
      "200ml",
      "500ml"
    ],
    "mrpInr": "\u20b91000 (200ml)",
    "costPerAcre": 1000,
    "efficacyHeat": 0.12,
    "efficacyDrought": 0.06,
    "efficacyFungal": 0.87,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Urea foliar (1%)",
      "Isabion\u00ae"
    ],
    "tankMixDanger": [
      "Copper fungicides"
    ],
    "stageSuitability": {
      "germination": 0.15,
      "vegetative": 0.8,
      "flowering": 0.85,
      "podFormation": 0.7,
      "maturity": 0.35
    },
    "trialEfficacyPct": 87.3,
    "trialCitation": "ICAR-SBI Coimbatore Sugarcane Smut & Rust Management Trials; 87.3% smut incidence reduction",
    "etlThreshold": "First rust pustule on sugarcane foliage or 2% smut whip appearance",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Systemic xylem protection throughout tillering and grand growth period in commercial sugarcane."
    }
  },
  {
    "key": "folio_gold",
    "name": "Folio Gold",
    "category": "fungicide",
    "activeIngredient": "Metalaxyl-M 3.3% + Chlorothalonil 33.1% SC",
    "modeOfAction": "Systemic + Contact Shield (FRAC 4 + M5)",
    "groupCode": "FRAC 4+M5",
    "targetPests": [
      "Late Blight",
      "Downy Mildew",
      "Stemphylium Blight"
    ],
    "approvedCrops": [
      "Potato",
      "Tomato",
      "Onion"
    ],
    "dosagePerAcre": "400 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive (vegetative canopy closure)",
    "applicationsPerSeason": "1-2",
    "phi": "14",
    "packSizes": [
      "250ml",
      "500ml"
    ],
    "mrpInr": "\u20b9850 (500ml)",
    "costPerAcre": 680,
    "efficacyHeat": 0.06,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.89,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Actara\u00ae",
      "Isabion\u00ae"
    ],
    "tankMixDanger": [
      "Highly alkaline mixtures"
    ],
    "stageSuitability": {
      "germination": 0.25,
      "vegetative": 0.85,
      "flowering": 0.8,
      "podFormation": 0.7,
      "maturity": 0.3
    },
    "trialEfficacyPct": 89.4,
    "trialCitation": "ICAR-DOGR Rajgurunagar Onion Downy Mildew & Stemphylium Blight Trial; 89.4% blight suppression",
    "etlThreshold": "Continuous dew formation + night temp 15-20\u00b0C in rabi onion/tomato",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Pre-mix of acropetal systemic Metalaxyl-M + sticking Chlorothalonil SC; superior coverage on waxy onion leaves."
    }
  },
  {
    "key": "tilt",
    "name": "Tilt",
    "category": "fungicide",
    "activeIngredient": "Propiconazole 25% EC",
    "modeOfAction": "Fast Curative & Protective Systemic (FRAC 3)",
    "groupCode": "FRAC 3",
    "targetPests": [
      "Yellow Stripe Rust",
      "Brown Rust",
      "Karnal Bunt",
      "Sheath Blight",
      "Tikka Leaf Spot"
    ],
    "approvedCrops": [
      "Wheat",
      "Rice",
      "Groundnut",
      "Tea",
      "Soybean"
    ],
    "dosagePerAcre": "200 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive / Early Curative (Flag leaf stage in wheat)",
    "applicationsPerSeason": "1-2",
    "phi": "14-21",
    "packSizes": [
      "250ml",
      "500ml",
      "1L"
    ],
    "mrpInr": "\u20b9550 (500ml)",
    "costPerAcre": 220,
    "efficacyHeat": 0.12,
    "efficacyDrought": 0.06,
    "efficacyFungal": 0.88,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Urea (1%)",
      "Zinc Sulfate (chelated)",
      "Isabion\u00ae"
    ],
    "tankMixDanger": [
      "Concentrated EC emulsifiers"
    ],
    "stageSuitability": {
      "germination": 0.15,
      "vegetative": 0.7,
      "flowering": 0.85,
      "podFormation": 0.7,
      "maturity": 0.35
    },
    "trialEfficacyPct": 88.2,
    "trialCitation": "ICAR-IIWBR Karnal Wheat Yellow Rust & Karnal Bunt Management Recommendations; 88.2% stripe rust control",
    "etlThreshold": "Detection of yellow rust foci or 1 pustule per leaf in North-Western Plains Zone",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Standard ICAR-IIWBR recommendation for yellow stripe rust emergency containment in wheat."
    }
  },
  {
    "key": "bravo",
    "name": "Bravo",
    "category": "fungicide",
    "activeIngredient": "Chlorothalonil 75% WP",
    "modeOfAction": "Multi-site Contact Protectant (FRAC M5)",
    "groupCode": "FRAC M5",
    "targetPests": [
      "Early Blight",
      "Late Blight",
      "Anthracnose",
      "Fruit Rot"
    ],
    "approvedCrops": [
      "Grapes",
      "Potato",
      "Vegetables",
      "Groundnut"
    ],
    "dosagePerAcre": "400 g",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive (prior to infection)",
    "applicationsPerSeason": "1-3",
    "phi": "7-14",
    "packSizes": [
      "500g"
    ],
    "mrpInr": "\u20b9650 (500g)",
    "costPerAcre": 520,
    "efficacyHeat": 0.05,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.82,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Isabion\u00ae",
      "Score\u00ae"
    ],
    "tankMixDanger": [
      "Oils",
      "Surfactants"
    ],
    "stageSuitability": {
      "germination": 0.2,
      "vegetative": 0.8,
      "flowering": 0.75,
      "podFormation": 0.65,
      "maturity": 0.3
    },
    "trialEfficacyPct": 82.1,
    "trialCitation": "State Hort. Dept. Package of Practices for Cucurbitaceous Vegetables; 82.1% Anthracnose control",
    "etlThreshold": "Preventative application at onset of monsoon or high morning dew",
    "cropwiseStandard": {
      "rainfastnessHours": 3,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Multi-site protective barrier. Use flat fan nozzles with minimum 200L water/acre for full coverage."
    }
  },
  {
    "key": "splash",
    "name": "Splash",
    "category": "fungicide",
    "activeIngredient": "Fludioxonil 20% WG",
    "modeOfAction": "Contact Shield (Osmotic Signal Transduction Block) (FRAC 12)",
    "groupCode": "FRAC 12",
    "targetPests": [
      "Botrytis Gray Mold",
      "Anthracnose",
      "Fruit Rot"
    ],
    "approvedCrops": [
      "Grapes",
      "Mango",
      "Pomegranate",
      "Strawberry"
    ],
    "dosagePerAcre": "100-150 g",
    "waterPerAcre": 200,
    "applicationTiming": "Fruiting / Pre-harvest window",
    "applicationsPerSeason": "1-2",
    "phi": "7",
    "packSizes": [
      "100g"
    ],
    "mrpInr": "\u20b9800 (100g)",
    "costPerAcre": 1000,
    "efficacyHeat": 0.05,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.86,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Score\u00ae",
      "Isabion\u00ae"
    ],
    "tankMixDanger": [
      "Copper Oxychloride"
    ],
    "stageSuitability": {
      "germination": 0.1,
      "vegetative": 0.3,
      "flowering": 0.7,
      "podFormation": 0.95,
      "maturity": 0.6
    },
    "trialEfficacyPct": 86.5,
    "trialCitation": "ICAR-NRC Grapes Pune Botrytis Bunch Rot Evaluation; 86.5% rot reduction at veraison",
    "etlThreshold": "Pre-closing of bunches or fruit veraison stage prior to harvesting",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Safe pre-harvest interval profile; prevents post-harvest storage transit rot."
    }
  },
  {
    "key": "amistar",
    "name": "Amistar",
    "category": "fungicide",
    "activeIngredient": "Azoxystrobin 23% SC",
    "modeOfAction": "Systemic Strobilurin (QoI Mitochondrial Respiration) (FRAC 11)",
    "groupCode": "FRAC 11",
    "targetPests": [
      "Powdery Mildew",
      "Downy Mildew",
      "Anthracnose",
      "Leaf Spot"
    ],
    "approvedCrops": [
      "Grapes",
      "Mango",
      "Chilli",
      "Tomato",
      "Paddy"
    ],
    "dosagePerAcre": "200 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive (prior to disease outbreak)",
    "applicationsPerSeason": "1-2",
    "phi": "7-14",
    "packSizes": [
      "100ml",
      "200ml"
    ],
    "mrpInr": "\u20b91400 (200ml)",
    "costPerAcre": 1400,
    "efficacyHeat": 0.15,
    "efficacyDrought": 0.08,
    "efficacyFungal": 0.88,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Isabion\u00ae",
      "Quantis\u00ae"
    ],
    "tankMixDanger": [
      "Copper formulations"
    ],
    "stageSuitability": {
      "germination": 0.15,
      "vegetative": 0.7,
      "flowering": 0.9,
      "podFormation": 0.8,
      "maturity": 0.4
    },
    "trialEfficacyPct": 87.8,
    "trialCitation": "TNAU Chilli Powdery Mildew & Anthracnose Management Trials; 87.8% disease index reduction",
    "etlThreshold": "White powdery patches on 5% of foliage",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Single-active strobilurin delivering cellular respiration block and physiological greening benefits."
    }
  },
  {
    "key": "revus",
    "name": "Revus",
    "category": "fungicide",
    "activeIngredient": "Mandipropamid 23.4% SC",
    "modeOfAction": "Translaminar (LOK-FLO technology) (FRAC 40)",
    "groupCode": "FRAC 40",
    "targetPests": [
      "Late Blight",
      "Downy Mildew"
    ],
    "approvedCrops": [
      "Potato",
      "Grapes",
      "Tomato"
    ],
    "dosagePerAcre": "160-200 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive (monsoon rain spell)",
    "applicationsPerSeason": "1-2",
    "phi": "3-5",
    "packSizes": [
      "250ml"
    ],
    "mrpInr": "\u20b9800 (250ml)",
    "costPerAcre": 640,
    "efficacyHeat": 0.05,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.9,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Score\u00ae",
      "Isabion\u00ae"
    ],
    "tankMixDanger": [
      "Alkaline fertilizers"
    ],
    "stageSuitability": {
      "germination": 0.2,
      "vegetative": 0.85,
      "flowering": 0.85,
      "podFormation": 0.75,
      "maturity": 0.35
    },
    "trialEfficacyPct": 90.1,
    "trialCitation": "ICAR-CPRI Shimla High Rainfastness Late Blight Evaluation; 90.1% control under simulated 50mm rainfall",
    "etlThreshold": "Late blight warning during heavy monsoon spells",
    "cropwiseStandard": {
      "rainfastnessHours": 1,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "LOK-FLO technology locks into plant wax within 1 hour; impervious to heavy tropical downpours."
    }
  },
  {
    "key": "priori_top",
    "name": "Priori Top",
    "category": "fungicide",
    "activeIngredient": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
    "modeOfAction": "Systemic + Translaminar (FRAC 11 + 3)",
    "groupCode": "FRAC 11+3",
    "targetPests": [
      "Blast",
      "Sheath Blight",
      "Panicle Blast"
    ],
    "approvedCrops": [
      "Rice"
    ],
    "dosagePerAcre": "200 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive / Curative (heading / panicle emergence)",
    "applicationsPerSeason": "1-2",
    "phi": "14",
    "packSizes": [
      "200ml"
    ],
    "mrpInr": "\u20b91300 (200ml)",
    "costPerAcre": 1300,
    "efficacyHeat": 0.12,
    "efficacyDrought": 0.06,
    "efficacyFungal": 0.9,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Chess\u00ae",
      "Isabion\u00ae"
    ],
    "tankMixDanger": [
      "Copper Oxychloride"
    ],
    "stageSuitability": {
      "germination": 0.15,
      "vegetative": 0.7,
      "flowering": 0.9,
      "podFormation": 0.8,
      "maturity": 0.4
    },
    "trialEfficacyPct": 89.7,
    "trialCitation": "ICAR-NRRI Cuttack Rice Sheath Blight & Neck Blast Multi-season Trials; 89.7% panicle blast control",
    "etlThreshold": "5% panicle infection at heading stage",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Dual preventative and curative action for complete panicle protection during heading/milking."
    }
  },
  {
    "key": "unix",
    "name": "Unix",
    "category": "fungicide",
    "activeIngredient": "Cyprodinil 75% WG",
    "modeOfAction": "Systemic (Methionine Biosynthesis Inhibition) (FRAC 9)",
    "groupCode": "FRAC 9",
    "targetPests": [
      "Apple Scab",
      "Botrytis Gray Mold"
    ],
    "approvedCrops": [
      "Grapes",
      "Apple"
    ],
    "dosagePerAcre": "200 g",
    "waterPerAcre": 200,
    "applicationTiming": "Preventive (early spring / cool temps)",
    "applicationsPerSeason": "1-2",
    "phi": "7-14",
    "packSizes": [
      "250g"
    ],
    "mrpInr": "\u20b91100 (250g)",
    "costPerAcre": 880,
    "efficacyHeat": 0.02,
    "efficacyDrought": 0.02,
    "efficacyFungal": 0.86,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Score\u00ae",
      "Mancozeb"
    ],
    "tankMixDanger": [
      "Alkaline sprays"
    ],
    "stageSuitability": {
      "germination": 0.1,
      "vegetative": 0.5,
      "flowering": 0.85,
      "podFormation": 0.8,
      "maturity": 0.5
    },
    "trialEfficacyPct": 85.9,
    "trialCitation": "Dr. YSP UHF Nauni Apple Scab Early Season Cold Temperature Trial; 85.9% control at 8-15\u00b0C",
    "etlThreshold": "Green tip to pink bud stage in apple when cold temperatures limit triazole uptake",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": false,
      "advisoryNote": "Anilinopyrimidine fungicide active at cool temperatures (<15\u00b0C) where triazoles lose speed."
    }
  },
  {
    "key": "dividend",
    "name": "Dividend",
    "category": "seed_treatment",
    "activeIngredient": "Difenoconazole 3% FS",
    "modeOfAction": "Systemic Flowable Seed Protectant (FRAC 3)",
    "groupCode": "FRAC 3",
    "targetPests": [
      "Karnal Bunt",
      "Loose Smut",
      "Flag Smut"
    ],
    "approvedCrops": [
      "Wheat"
    ],
    "dosagePerAcre": "2 ml/kg seed",
    "waterPerAcre": 0,
    "applicationTiming": "Pre-sowing Seed Treatment",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "50ml",
      "100ml"
    ],
    "mrpInr": "\u20b9250 (100ml)",
    "costPerAcre": 150,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.8,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.96,
    "tankMixSafe": [
      "Cruiser\u00ae 30FS",
      "Vibrance Premium\u00ae"
    ],
    "tankMixDanger": [
      "Direct fertilizer mixing"
    ],
    "stageSuitability": {
      "germination": 0.95,
      "vegetative": 0.1,
      "flowering": 0.0,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 95.8,
    "trialCitation": "ICAR-IIWBR Karnal Wheat Loose Smut & Karnal Bunt Seed Treatment Trial; 95.8% disease suppression",
    "etlThreshold": "Mandatory pre-sowing seed treatment in Karnal Bunt endemic regions",
    "cropwiseStandard": {
      "rainfastnessHours": 0,
      "optimalDeltaT": "N/A (seed treatment)",
      "droneApplicable": false,
      "advisoryNote": "Dye-marked Flowable Concentrate for uniform seed coat adhesion without impairing germination."
    }
  },
  {
    "key": "calaris_xtra",
    "name": "Calaris Xtra",
    "category": "herbicide",
    "activeIngredient": "Mesotrione 2.27% + Atrazine 22.7% SC",
    "modeOfAction": "Systemic Dual Target (HPPD + PS II Inhibitors) (HRAC F2 + C1)",
    "groupCode": "HRAC F2+C1",
    "targetPests": [
      "Trianthema portulacastrum",
      "Echinochloa",
      "Digitaria",
      "Broadleaf Weeds"
    ],
    "approvedCrops": [
      "Maize",
      "Sugarcane"
    ],
    "dosagePerAcre": "1400 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Post-emergence at 2-4 leaf stage of weeds (15-20 DAS)",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "700ml",
      "1.4L"
    ],
    "mrpInr": "\u20b91450 (700ml)",
    "costPerAcre": 2900,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.94,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Atrazine WP (supplement)"
    ],
    "tankMixDanger": [
      "Organophosphate foliar insecticides (wait 7 days)"
    ],
    "stageSuitability": {
      "germination": 0.3,
      "vegetative": 0.95,
      "flowering": 0.2,
      "podFormation": 0.05,
      "maturity": 0.0
    },
    "trialEfficacyPct": 93.5,
    "trialCitation": "ICAR-IIMR & PAU Ludhiana Maize Herbicide Evaluation; 93.5% weed control efficiency (WCE); +24.8% grain yield",
    "etlThreshold": "Post-emergence at 2-4 leaf stage of weeds (15-20 days after sowing)",
    "cropwiseStandard": {
      "rainfastnessHours": 3,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "HPPD inhibitor + PS II inhibitor synergy; bleaches broadleaf weeds and controls grasses in one pass."
    }
  },
  {
    "key": "axial",
    "name": "Axial",
    "category": "herbicide",
    "activeIngredient": "Pinoxaden 5.1% EC",
    "modeOfAction": "Systemic ACCase Inhibitor + Cloquintocet Safener (HRAC A)",
    "groupCode": "HRAC A",
    "targetPests": [
      "Phalaris minor (Canary Grass)",
      "Avena ludoviciana (Wild Oat)"
    ],
    "approvedCrops": [
      "Wheat",
      "Barley"
    ],
    "dosagePerAcre": "400 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Post-emergence (30-35 DAS)",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "400ml"
    ],
    "mrpInr": "\u20b9750 (400ml)",
    "costPerAcre": 750,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.95,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Metsulfuron-methyl",
      "Isoproturon"
    ],
    "tankMixDanger": [
      "2,4-D amine/ester (causes antagonism/reduced grass control)"
    ],
    "stageSuitability": {
      "germination": 0.2,
      "vegetative": 0.95,
      "flowering": 0.1,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 94.6,
    "trialCitation": "ICAR-IIWBR Karnal & PAU Ludhiana Fenoxaprop-resistant Phalaris minor Trial; 94.6% control of canary grass",
    "etlThreshold": "2-3 Phalaris seedlings per square meter at 30-35 DAS",
    "cropwiseStandard": {
      "rainfastnessHours": 1,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Built-in cloquintocet-mexyl safener prevents wheat injury. Controls ALS- and ACCase-resistant Phalaris."
    }
  },
  {
    "key": "topik",
    "name": "Topik",
    "category": "herbicide",
    "activeIngredient": "Clodinafop-propargyl 15% WP",
    "modeOfAction": "Systemic ACCase Inhibitor (HRAC A)",
    "groupCode": "HRAC A",
    "targetPests": [
      "Phalaris minor",
      "Avena fatua"
    ],
    "approvedCrops": [
      "Wheat"
    ],
    "dosagePerAcre": "160 g",
    "waterPerAcre": 150,
    "applicationTiming": "Post-emergence (30-35 days after sowing)",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "160g"
    ],
    "mrpInr": "\u20b9450 (160g)",
    "costPerAcre": 450,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.88,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Metsulfuron (Algrip)"
    ],
    "tankMixDanger": [
      "2,4-D",
      "Foliar nitrogen"
    ],
    "stageSuitability": {
      "germination": 0.2,
      "vegetative": 0.95,
      "flowering": 0.1,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 88.4,
    "trialCitation": "CCSHAU Hisar Wheat Herbicide Performance Bulletin; 88.4% Phalaris minor control in non-resistant belts",
    "etlThreshold": "Grassy weeds at 2-3 leaf stage (30-35 DAS)",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": false,
      "advisoryNote": "Requires flat fan nozzle with 150L water/acre. Do not tank-mix with 2,4-D to avoid antagonism."
    }
  },
  {
    "key": "rifit_plus",
    "name": "Rifit Plus",
    "category": "herbicide",
    "activeIngredient": "Pretilachlor 37% EW",
    "modeOfAction": "Selective Systemic (VLCFA Inhibitor) (HRAC K3)",
    "groupCode": "HRAC K3",
    "targetPests": [
      "Echinochloa crus-galli",
      "Cyperus difformis",
      "Broadleaf Weeds"
    ],
    "approvedCrops": [
      "Rice (Transplanted)"
    ],
    "dosagePerAcre": "600 ml",
    "waterPerAcre": 0,
    "applicationTiming": "Pre-emergence (0-3 Days After Transplanting)",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "600ml",
      "1L"
    ],
    "mrpInr": "\u20b9450 (600ml)",
    "costPerAcre": 450,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.91,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Bensulfuron-methyl"
    ],
    "tankMixDanger": [
      "Post-emergence applications"
    ],
    "stageSuitability": {
      "germination": 0.95,
      "vegetative": 0.3,
      "flowering": 0.0,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 91.2,
    "trialCitation": "ICAR-IIRR Hyderabad Transplanted Rice Weed Management Trials; 91.2% Echinochloa & sedge control",
    "etlThreshold": "Pre-emergence within 0-3 days after transplanting (DAT)",
    "cropwiseStandard": {
      "rainfastnessHours": 0,
      "optimalDeltaT": "N/A (standing water)",
      "droneApplicable": false,
      "advisoryNote": "Maintain 3-5 cm standing water for 48 hours post application. Advanced EW low-odor formulation."
    }
  },
  {
    "key": "fusiflex",
    "name": "Fusiflex",
    "category": "herbicide",
    "activeIngredient": "Fluazifop-p-butyl 13.4% + Fomesafen 11.1% w/w SL",
    "modeOfAction": "Systemic Dual Mode (ACCase + PPO Inhibitor) (HRAC A + E)",
    "groupCode": "HRAC A+E",
    "targetPests": [
      "Commelina benghalensis",
      "Digera arvensis",
      "Echinochloa colona",
      "Grasses & Broadleaf"
    ],
    "approvedCrops": [
      "Soybean",
      "Groundnut"
    ],
    "dosagePerAcre": "400 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Early Post-emergence (15-20 DAS)",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "400ml",
      "1L"
    ],
    "mrpInr": "\u20b9950 (400ml)",
    "costPerAcre": 950,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.9,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Quizalofop (micro-rate)"
    ],
    "tankMixDanger": [
      "Chlorpyrifos",
      "Organophosphate insecticides"
    ],
    "stageSuitability": {
      "germination": 0.2,
      "vegetative": 0.95,
      "flowering": 0.1,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 89.8,
    "trialCitation": "ICAR-IISR Indore Soybean Broadleaf + Grass Weed Coordinated Trial; 89.8% WCE on Commelina & Digera",
    "etlThreshold": "15-20 days after sowing when weeds are at 2-4 leaf stage",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Dual ACCase + PPO inhibitor; simultaneously knocks down difficult Commelina and grassy weeds in soybean."
    }
  },
  {
    "key": "gramoxone",
    "name": "Gramoxone",
    "category": "herbicide",
    "activeIngredient": "Paraquat dichloride 24% SL",
    "modeOfAction": "Non-selective Contact Burndown (Photosystem I Electron Diverter) (HRAC D)",
    "groupCode": "HRAC D",
    "targetPests": [
      "All Emerged Annual & Perennial Weeds"
    ],
    "approvedCrops": [
      "Non-crop",
      "Tea",
      "Plantation Crops",
      "Inter-row directed"
    ],
    "dosagePerAcre": "500-1000 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Active Weed Growth (Directed / Shielded spray)",
    "applicationsPerSeason": "1-2",
    "phi": "N/A",
    "packSizes": [
      "500ml",
      "1L",
      "5L"
    ],
    "mrpInr": "\u20b9400 (1L)",
    "costPerAcre": 300,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.96,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Diuron",
      "Oxyfluorfen"
    ],
    "tankMixDanger": [
      "Direct foliar crop contact"
    ],
    "stageSuitability": {
      "germination": 0.5,
      "vegetative": 0.3,
      "flowering": 0.0,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 96.0,
    "trialCitation": "UPASI Tea Research Foundation Non-crop Burndown Evaluation; 96.0% rapid vegetative desiccation",
    "etlThreshold": "Actively growing emerged weeds in inter-row plantation/non-crop areas",
    "cropwiseStandard": {
      "rainfastnessHours": 0.5,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": false,
      "advisoryNote": "Non-selective contact burndown. Requires protective hood nozzle to prevent drift onto green crop foliage."
    }
  },
  {
    "key": "touchdown",
    "name": "Touchdown",
    "category": "herbicide",
    "activeIngredient": "Glyphosate (Ammonium salt) 5% SL",
    "modeOfAction": "Systemic Non-selective (EPSP Synthase Inhibitor) (HRAC G)",
    "groupCode": "HRAC G",
    "targetPests": [
      "Cyperus rotundus",
      "Cynodon dactylon",
      "Perennial & Annual Weeds"
    ],
    "approvedCrops": [
      "Non-crop",
      "Tea",
      "Orchard Clean-up"
    ],
    "dosagePerAcre": "1 L",
    "waterPerAcre": 200,
    "applicationTiming": "Active Weed Growth (pre-sowing or directed)",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "1L"
    ],
    "mrpInr": "\u20b9600 (1L)",
    "costPerAcre": 600,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.94,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Ammonium Sulfate (activator)"
    ],
    "tankMixDanger": [
      "Turbid/muddy water (deactivates glyphosate molecule)"
    ],
    "stageSuitability": {
      "germination": 0.5,
      "vegetative": 0.3,
      "flowering": 0.0,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 94.2,
    "trialCitation": "ICAR-DWR Jabalpur Perennial Weed Eradication Bulletin; 94.2% rhizome translocation kill",
    "etlThreshold": "Active flush of perennial weeds (Cyperus rotundus, Cynodon dactylon)",
    "cropwiseStandard": {
      "rainfastnessHours": 4,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": false,
      "advisoryNote": "Systemic phloem transport translocates deep into root rhizomes. Allow 7-10 days for full chlorosis."
    }
  },
  {
    "key": "dual_gold",
    "name": "Dual Gold",
    "category": "herbicide",
    "activeIngredient": "S-metolachlor 960 g/l EC",
    "modeOfAction": "Selective Pre-emergence (VLCFA Inhibitor) (HRAC K3)",
    "groupCode": "HRAC K3",
    "targetPests": [
      "Annual Grasses",
      "Sedges",
      "Small-seeded Broadleaf"
    ],
    "approvedCrops": [
      "Maize",
      "Soybean",
      "Cotton",
      "Groundnut"
    ],
    "dosagePerAcre": "400-500 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Pre-emergence (within 48 hours of sowing)",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "500ml",
      "1L"
    ],
    "mrpInr": "\u20b9800 (500ml)",
    "costPerAcre": 720,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.89,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Atrazine",
      "Metribuzin"
    ],
    "tankMixDanger": [
      "Post-emergence crop spray"
    ],
    "stageSuitability": {
      "germination": 0.95,
      "vegetative": 0.3,
      "flowering": 0.0,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 88.7,
    "trialCitation": "ICAR-IIMR Pre-emergence Maize & Soybean Weed Evaluation; 88.7% grass control for 30-40 days",
    "etlThreshold": "Pre-emergence application within 48 hours of sowing prior to weed germination",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Pure active S-isomer delivers double the bio-efficacy of racemic metolachlor at reduced chemical dose."
    }
  },
  {
    "key": "lumax",
    "name": "Lumax",
    "category": "herbicide",
    "activeIngredient": "Mesotrione + S-metolachlor + Atrazine",
    "modeOfAction": "Triple Synergy (HPPD + VLCFA + PS II Inhibitors) (HRAC F2 + K3 + C1)",
    "groupCode": "HRAC F2+K3+C1",
    "targetPests": [
      "Broadleaf Weeds",
      "Annual Grasses",
      "Hard-to-Kill Weeds"
    ],
    "approvedCrops": [
      "Maize"
    ],
    "dosagePerAcre": "1400 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Pre-emergence to Early Post-emergence",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "1L"
    ],
    "mrpInr": "\u20b91500 (1L)",
    "costPerAcre": 2100,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.95,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Atrazine"
    ],
    "tankMixDanger": [
      "Organophosphate insecticides"
    ],
    "stageSuitability": {
      "germination": 0.8,
      "vegetative": 0.95,
      "flowering": 0.1,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 95.1,
    "trialCitation": "PAU Ludhiana One-Pass Maize Weed Control Evaluation; 95.1% total weed suppression",
    "etlThreshold": "Pre-emergence to early post-emergence (up to 2-leaf stage of weeds)",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "3-way synergy provides season-long weed control. Eliminates the need for manual weeding rounds."
    }
  },
  {
    "key": "gesaprim",
    "name": "Gesaprim",
    "category": "herbicide",
    "activeIngredient": "Atrazine 50% WP",
    "modeOfAction": "Selective Photosystem II Inhibitor (HRAC C1)",
    "groupCode": "HRAC C1",
    "targetPests": [
      "Broadleaf Weeds",
      "Annual Grasses"
    ],
    "approvedCrops": [
      "Maize",
      "Sugarcane"
    ],
    "dosagePerAcre": "400-800 g",
    "waterPerAcre": 200,
    "applicationTiming": "Pre-emergence or Early Post",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "500g",
      "1kg"
    ],
    "mrpInr": "\u20b9350 (500g)",
    "costPerAcre": 420,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.84,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Dual Gold\u00ae",
      "Pendimethalin"
    ],
    "tankMixDanger": [
      "Non-tolerant legume crops"
    ],
    "stageSuitability": {
      "germination": 0.8,
      "vegetative": 0.85,
      "flowering": 0.1,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 84.3,
    "trialCitation": "ICAR-SBI Coimbatore Sugarcane & Maize Pre-emergence Bulletin; 84.3% broadleaf weed control",
    "etlThreshold": "Pre-emergence or early post within 10 days of sowing",
    "cropwiseStandard": {
      "rainfastnessHours": 3,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": false,
      "advisoryNote": "Economical broadleaf control. Apply with uniform soil moisture for proper chemical barrier activation."
    }
  },
  {
    "key": "bicep",
    "name": "Bicep",
    "category": "herbicide",
    "activeIngredient": "Atrazine + S-metolachlor",
    "modeOfAction": "Dual Target (PS II + VLCFA Inhibitors) (HRAC C1 + K3)",
    "groupCode": "HRAC C1+K3",
    "targetPests": [
      "Grasses and Broadleaf Weeds"
    ],
    "approvedCrops": [
      "Maize",
      "Sugarcane"
    ],
    "dosagePerAcre": "1 L",
    "waterPerAcre": 200,
    "applicationTiming": "Pre-emergence",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "1L"
    ],
    "mrpInr": "\u20b9800 (1L)",
    "costPerAcre": 800,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.0,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.9,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Urea (basal)"
    ],
    "tankMixDanger": [
      "Standing crop spray"
    ],
    "stageSuitability": {
      "germination": 0.9,
      "vegetative": 0.5,
      "flowering": 0.05,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 90.4,
    "trialCitation": "AICRP on Weed Management Maize Multi-Location Trial; 90.4% broad-spectrum control",
    "etlThreshold": "Pre-emergence after sowing but before crop/weed emergence",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Co-formulated grass and broadleaf shield. Highly stable on soil surface."
    }
  },
  {
    "key": "fortenza_duo",
    "name": "Fortenza Duo",
    "category": "seed_treatment",
    "activeIngredient": "Cyantraniliprole + Thiamethoxam FS",
    "modeOfAction": "Systemic Diamide + Neonicotinoid Seed Care (IRAC 28 + 4A)",
    "groupCode": "IRAC 28+4A",
    "targetPests": [
      "Cutworms",
      "Early Shoot Borer",
      "Stem Borer",
      "Wireworms",
      "Aphids"
    ],
    "approvedCrops": [
      "Maize",
      "Cotton"
    ],
    "dosagePerAcre": "4-6 ml/kg seed",
    "waterPerAcre": 0,
    "applicationTiming": "Pre-sowing Seed Treatment",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "50ml",
      "100ml"
    ],
    "mrpInr": "\u20b9600 (100ml)",
    "costPerAcre": 300,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.12,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.92,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.35,
    "tankMixSafe": [
      "Maxim\u00ae",
      "Vibrance Premium\u00ae"
    ],
    "tankMixDanger": [
      "Strong acids"
    ],
    "stageSuitability": {
      "germination": 0.95,
      "vegetative": 0.3,
      "flowering": 0.0,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 92.4,
    "trialCitation": "ICAR-IIMR Maize Stem Borer & Fall Armyworm Early Shield Seed Care Trial; 92.4% seedling vigor survival",
    "etlThreshold": "High-risk early pest zones (cutworm/stem borer history)",
    "cropwiseStandard": {
      "rainfastnessHours": 0,
      "optimalDeltaT": "N/A (seed treatment)",
      "droneApplicable": false,
      "advisoryNote": "Protects seedlings for 21-28 days from both below-ground soil pests and above-ground shoot borers."
    }
  },
  {
    "key": "cruiser",
    "name": "Cruiser",
    "category": "seed_treatment",
    "activeIngredient": "Thiamethoxam 30% FS",
    "modeOfAction": "Systemic Neonicotinoid Seed Care (IRAC 4A)",
    "groupCode": "IRAC 4A",
    "targetPests": [
      "Jassids",
      "Aphids",
      "Whitefly",
      "Thrips",
      "Shoot Fly"
    ],
    "approvedCrops": [
      "Cotton",
      "Soybean",
      "Maize",
      "Wheat",
      "Sorghum"
    ],
    "dosagePerAcre": "3-5 ml/kg seed",
    "waterPerAcre": 0,
    "applicationTiming": "Pre-sowing Seed Treatment",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "100ml",
      "250ml"
    ],
    "mrpInr": "\u20b9450 (100ml)",
    "costPerAcre": 200,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.08,
    "efficacyFungal": 0.0,
    "efficacyInsect": 0.89,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.25,
    "tankMixSafe": [
      "Vibrance Premium\u00ae",
      "Maxim\u00ae",
      "Rhizobium culture"
    ],
    "tankMixDanger": [
      "Pesticides with alkaline solvents"
    ],
    "stageSuitability": {
      "germination": 0.95,
      "vegetative": 0.2,
      "flowering": 0.0,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 89.1,
    "trialCitation": "ICAR-CICR Nagpur Cotton Seed Treatment National Trials; 89.1% protection against sucking pests for 35 days",
    "etlThreshold": "Standard pre-sowing seed treatment across all cotton/soybean belts",
    "cropwiseStandard": {
      "rainfastnessHours": 0,
      "optimalDeltaT": "N/A (seed treatment)",
      "droneApplicable": false,
      "advisoryNote": "Systemic acropetal movement spreads through roots into developing cotyledons and early true leaves."
    }
  },
  {
    "key": "vibrance_premium",
    "name": "Vibrance Premium",
    "category": "seed_treatment",
    "activeIngredient": "Sedaxane + Fludioxonil + Metalaxyl-M FS",
    "modeOfAction": "Rooting Power SDHI + Oomycete & Seed Rot Shield (FRAC 7 + 12 + 4)",
    "groupCode": "FRAC 7+12+4",
    "targetPests": [
      "Rhizoctonia Damping-Off",
      "Pythium Root Rot",
      "Fusarium",
      "Loose Smut"
    ],
    "approvedCrops": [
      "Wheat",
      "Soybean",
      "Chickpea"
    ],
    "dosagePerAcre": "2-3 ml/kg seed",
    "waterPerAcre": 0,
    "applicationTiming": "Pre-sowing Seed Treatment",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "100ml"
    ],
    "mrpInr": "\u20b9500 (100ml)",
    "costPerAcre": 200,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.15,
    "efficacyFungal": 0.75,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.95,
    "tankMixSafe": [
      "Cruiser\u00ae 30FS",
      "Fortenza Duo\u00ae"
    ],
    "tankMixDanger": [
      "Unbuffered slurry"
    ],
    "stageSuitability": {
      "germination": 0.95,
      "vegetative": 0.15,
      "flowering": 0.0,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 94.7,
    "trialCitation": "ICAR-IIWBR Karnal Seedling Rhizoctonia & Pythium Damping-Off Trial; 94.7% emergence protection; +22% root mass",
    "etlThreshold": "Soil-borne root rot and damping-off history",
    "cropwiseStandard": {
      "rainfastnessHours": 0,
      "optimalDeltaT": "N/A (seed treatment)",
      "droneApplicable": false,
      "advisoryNote": "Sedaxane 'Rooting Power' stimulates lateral root branching and mycorrhizal association."
    }
  },
  {
    "key": "maxim",
    "name": "Maxim",
    "category": "seed_treatment",
    "activeIngredient": "Fludioxonil 480 g/l FS",
    "modeOfAction": "Contact Seed Shield (FRAC 12)",
    "groupCode": "FRAC 12",
    "targetPests": [
      "Seed-Borne Fusarium",
      "Aspergillus",
      "Seed Rot"
    ],
    "approvedCrops": [
      "Soybean",
      "Cotton",
      "Corn"
    ],
    "dosagePerAcre": "2 ml/kg seed",
    "waterPerAcre": 0,
    "applicationTiming": "Pre-sowing Seed Treatment",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "100ml"
    ],
    "mrpInr": "\u20b9350 (100ml)",
    "costPerAcre": 150,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.55,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.91,
    "tankMixSafe": [
      "Cruiser\u00ae",
      "Apron XL\u00ae"
    ],
    "tankMixDanger": [
      "Direct copper salts"
    ],
    "stageSuitability": {
      "germination": 0.95,
      "vegetative": 0.1,
      "flowering": 0.0,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 91.3,
    "trialCitation": "ICAR-IISR Indore Soybean Seed-borne Pathogen Shield Trial; 91.3% seed rot prevention",
    "etlThreshold": "Certified seed conditioning against seed-borne Fusarium, Colletotrichum",
    "cropwiseStandard": {
      "rainfastnessHours": 0,
      "optimalDeltaT": "N/A (seed treatment)",
      "droneApplicable": false,
      "advisoryNote": "Non-systemic contact seed protectant with prolonged persistence on the seed coat."
    }
  },
  {
    "key": "apron_xl",
    "name": "Apron XL",
    "category": "seed_treatment",
    "activeIngredient": "Metalaxyl-M 35% WS",
    "modeOfAction": "Systemic Oomycete Specialist (FRAC 4)",
    "groupCode": "FRAC 4",
    "targetPests": [
      "Downy Mildew",
      "Damping Off (Pythium / Phytophthora)"
    ],
    "approvedCrops": [
      "Maize",
      "Sunflower",
      "Mustard",
      "Bajra"
    ],
    "dosagePerAcre": "2.5 g/kg seed",
    "waterPerAcre": 0,
    "applicationTiming": "Pre-sowing Seed Treatment",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "100g"
    ],
    "mrpInr": "\u20b9300 (100g)",
    "costPerAcre": 120,
    "efficacyHeat": 0.0,
    "efficacyDrought": 0.05,
    "efficacyFungal": 0.65,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.94,
    "tankMixSafe": [
      "Maxim\u00ae",
      "Cruiser\u00ae"
    ],
    "tankMixDanger": [
      "Alkaline slurry"
    ],
    "stageSuitability": {
      "germination": 0.95,
      "vegetative": 0.15,
      "flowering": 0.0,
      "podFormation": 0.0,
      "maturity": 0.0
    },
    "trialEfficacyPct": 93.8,
    "trialCitation": "ICAR-IIOR Hyderabad Sunflower Downy Mildew Seed Care Evaluation; 93.8% systemic downy mildew suppression",
    "etlThreshold": "Mandatory seed care for downy mildew susceptible hybrids",
    "cropwiseStandard": {
      "rainfastnessHours": 0,
      "optimalDeltaT": "N/A (seed treatment)",
      "droneApplicable": false,
      "advisoryNote": "Absorbed by germinating seed and translocated acropetally into growing shoot tip."
    }
  },
  {
    "key": "isabion",
    "name": "Isabion",
    "category": "biostimulant",
    "activeIngredient": "Free L-Amino Acids (62.5%) + Short-chain Peptides",
    "modeOfAction": "Systemic Biostimulant (HSP Activation + Flower Retention)",
    "groupCode": "Bio-Active",
    "targetPests": [
      "Flower Drop",
      "Heat Stress Shock",
      "Poor Fruit Set",
      "Vegetative Stunting"
    ],
    "approvedCrops": [
      "All crops",
      "Soybean",
      "Cotton",
      "Chilli",
      "Tomato",
      "Wheat",
      "Rice"
    ],
    "dosagePerAcre": "400 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Vegetative, Pre-flowering & Fruit Set",
    "applicationsPerSeason": "2-3",
    "phi": "N/A",
    "packSizes": [
      "250ml",
      "500ml",
      "1L"
    ],
    "mrpInr": "\u20b9500 (500ml)",
    "costPerAcre": 400,
    "efficacyHeat": 0.88,
    "efficacyDrought": 0.74,
    "efficacyFungal": 0.15,
    "efficacyInsect": 0.05,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Ampligo\u00ae",
      "Amistar Top\u00ae",
      "Quantis\u00ae",
      "Urea (1%)",
      "Foliar NPK 19-19-19"
    ],
    "tankMixDanger": [
      "Copper fungicides",
      "Bordeaux mixture",
      "Sulfur compounds"
    ],
    "stageSuitability": {
      "germination": 0.3,
      "vegetative": 0.85,
      "flowering": 0.95,
      "podFormation": 0.8,
      "maturity": 0.3
    },
    "trialEfficacyPct": 89.5,
    "trialCitation": "TNAU Coimbatore & PAU Ludhiana Abiotic Stress Multi-crop Evaluation; 28-34% flower drop reduction; +16.2% yield",
    "etlThreshold": "Flowering stage thermal load (>32\u00b0C) or sudden moisture shock",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Provides ready-made building blocks bypassing energy-intensive amino acid synthesis during abiotic stress."
    }
  },
  {
    "key": "quantis",
    "name": "Quantis",
    "category": "biostimulant",
    "activeIngredient": "Amino acids + Potassium + Calcium + Osmoprotectants",
    "modeOfAction": "Systemic Osmoprotectant (Antioxidant Enzyme Cascade Activation)",
    "groupCode": "Bio-Active",
    "targetPests": [
      "Extreme Heat Shock (>35\u00b0C)",
      "Terminal Drought Stress",
      "Cell Membrane Damage"
    ],
    "approvedCrops": [
      "Potato",
      "Soybean",
      "Wheat",
      "Maize",
      "Cotton",
      "Groundnut"
    ],
    "dosagePerAcre": "400 ml",
    "waterPerAcre": 200,
    "applicationTiming": "Pre-flowering / Anticipated Thermal Shock (48h window)",
    "applicationsPerSeason": "2",
    "phi": "N/A",
    "packSizes": [
      "500ml",
      "1L"
    ],
    "mrpInr": "\u20b9600 (1L)",
    "costPerAcre": 300,
    "efficacyHeat": 0.92,
    "efficacyDrought": 0.89,
    "efficacyFungal": 0.1,
    "efficacyInsect": 0.05,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Ampligo\u00ae",
      "Score\u00ae",
      "Isabion\u00ae",
      "Potassium Nitrate (0.5%)"
    ],
    "tankMixDanger": [
      "Strong acids (pH < 4.0)"
    ],
    "stageSuitability": {
      "germination": 0.2,
      "vegetative": 0.8,
      "flowering": 0.92,
      "podFormation": 0.75,
      "maturity": 0.25
    },
    "trialEfficacyPct": 91.0,
    "trialCitation": "Syngenta India & ICAR Wheat/Soybean Terminal Heat Stress Trials (2020-2023); 32% reduction in lipid peroxidation (MDA); +3.1 q/ha protected yield",
    "etlThreshold": "Heatwave forecast (Tmax >35\u00b0C or nighttime Tmin >22\u00b0C during reproductive phase)",
    "cropwiseStandard": {
      "rainfastnessHours": 2,
      "optimalDeltaT": "2-8\u00b0C",
      "droneApplicable": true,
      "advisoryNote": "Activates antioxidant enzyme cascade (SOD, Catalase) and maintains cell membrane turgor under acute heat/drought shock."
    }
  },
  {
    "key": "cultar",
    "name": "Cultar",
    "category": "pgr",
    "activeIngredient": "Paclobutrazol 23% SC",
    "modeOfAction": "Systemic Plant Growth Regulator (Gibberellin Biosynthesis Inhibitor)",
    "groupCode": "PGR-Triazole",
    "targetPests": [
      "Vegetative Flush Suppression",
      "Alternate Bearing Regulation",
      "Flowering Induction"
    ],
    "approvedCrops": [
      "Mango",
      "Onion"
    ],
    "dosagePerAcre": "3-5 ml per meter canopy diameter (diluted in 10-15L water)",
    "waterPerAcre": 0,
    "applicationTiming": "Pre-flowering Soil Collar Drench (90-120 days before bloom)",
    "applicationsPerSeason": "1",
    "phi": "N/A",
    "packSizes": [
      "1L"
    ],
    "mrpInr": "\u20b91600 (1L)",
    "costPerAcre": 2000,
    "efficacyHeat": 0.2,
    "efficacyDrought": 0.15,
    "efficacyFungal": 0.05,
    "efficacyInsect": 0.0,
    "efficacyWeed": 0.0,
    "efficacySeedborne": 0.0,
    "tankMixSafe": [
      "Water collar drench only"
    ],
    "tankMixDanger": [
      "Foliar applications on young non-bearing flush"
    ],
    "stageSuitability": {
      "germination": 0.0,
      "vegetative": 0.9,
      "flowering": 0.95,
      "podFormation": 0.3,
      "maturity": 0.1
    },
    "trialEfficacyPct": 86.2,
    "trialCitation": "ICAR-CISH Lucknow Mango Regular Bearing & Flowering Induction Trials; 78-86% regular flowering in alternate bearing orchards",
    "etlThreshold": "Alternate bearing varieties (Dashehari, Langra, Alphonso) 90-120 days before expected bloom",
    "cropwiseStandard": {
      "rainfastnessHours": 0,
      "optimalDeltaT": "N/A (soil drench)",
      "droneApplicable": false,
      "advisoryNote": "Collar soil drench based on canopy diameter; inhibits gibberellin synthesis to force floral bud differentiation."
    }
  }
];

export function getAllProducts(): SyngentaProduct[] {
  return syngentaProducts;
}

export function getProductByKey(key: string): SyngentaProduct | undefined {
  return syngentaProducts.find(p => p.key === key);
}

export function getProductsByCategory(category: string): SyngentaProduct[] {
  return syngentaProducts.filter(p => p.category === category);
}

export function getProductsForCrop(cropName: string): SyngentaProduct[] {
  const lowerCrop = cropName.toLowerCase();
  return syngentaProducts.filter(p => 
    p.approvedCrops.some(c => c.toLowerCase().includes(lowerCrop) || c.toLowerCase() === 'all crops')
  );
}

export function getProductsForStage(stage: string): SyngentaProduct[] {
  return syngentaProducts.filter(p => {
    const score = (p.stageSuitability as any)[stage];
    return typeof score === 'number' && score > 0.5;
  });
}
