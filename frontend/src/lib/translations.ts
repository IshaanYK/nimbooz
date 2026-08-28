/**
 * AASRA Dynamic Multilingual Dictionary (Farmer-First Simple Words)
 * Supports 12 Major Indian Languages for complete UI translation.
 */

export interface TranslationDict {
  // Brand & Nav
  brandName: string;
  tagline: string;
  navDashboard: string;
  navAdvisory: string;
  navRobi: string;
  navWeather: string;
  navProfile: string;
  navWhatIf: string;
  navJournal: string;
  navLogin: string;
  navGetStarted: string;
  navPlantAi: string;
  navFields: string;
  navLogout: string;
  selectLanguage: string;

  // Hero & Landing Page
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  trustQuote: string;
  btnStartFarm: string;
  btnExploreMap: string;
  voiceTitle: string;
  voiceDesc: string;
  btnPlayVoice: string;
  btnStopVoice: string;
  robiTitle: string;
  robiDesc: string;
  extraYieldLabel: string;
  netProfitLabel: string;
  robiRatioLabel: string;
  mapTitle: string;
  mapDesc: string;
  welcomePrefix: string;
  stressAlertTitle: string;
  stressAlertDesc: string;
  recommendationTitle: string;
  voiceGreeting: string;

  // PS-02 / PS-03 Plant Stress Showcase
  plantStressEngineBadge: string;
  plantStressEngineTitle: string;
  plantStressEngineDesc: string;
  forecastHorizon: string;
  mlAccuracy: string;
  stressTypes: string;
  launchPlantIntelligence: string;
  coreIntelligenceJourney: string;
  askActProve: string;

  // Dashboard
  fieldCommandCenter: string;
  welcomeUser: string;
  activeFieldLabel: string;
  locationLabel: string;
  openAiAssistant: string;
  collapseAssistant: string;
  exploreEngine: string;
  viewMapLayers: string;
  calculateRobi: string;
  runSimulation: string;
  liveTelemetryTitle: string;
  nightHeatStressWarning: string;
  plantHealthAI: string;
  voiceAdvisory: string;
  weatherSensors: string;
  whatIfSim: string;
  robiProof: string;

  // Assistant & Chat
  assistantBadge: string;
  askAasraTitle: string;
  askAasraDesc: string;
  quickLanguageLabel: string;
  tryAskingLabel: string;
  sampleQ1: string;
  sampleQ2: string;
  sampleQ3: string;
  sampleQ4: string;
  sampleQ5: string;
  liveFieldTelemetry: string;
  chatWelcome: string;
  chatPlaceholder: string;
  listenLabel: string;
  speakingLabel: string;
  processingLabel: string;
  explainableAiTitle: string;
  suggestedFollowUps: string;
  safeSprayWindowActive: string;
  sprayCautionActive: string;
  quickQ1: string;
  quickQ2: string;
  quickQ3: string;
  quickQ4: string;
  quickQ5: string;

  // Fields Portfolio
  farmPortfolioBadge: string;
  myFieldsTitle: string;
  myFieldsDesc: string;
  registeredFieldsCount: string;
  registeredFarmFields: string;
  healthScoreLabel: string;
  fieldCommandQuickLinks: string;

  // Weather
  atmosphericTelemetryBadge: string;
  microClimateTitle: string;
  microClimateSubtitle: string;
  sevenDaySummary: string;
  maxTempLabel: string;
  minTempLabel: string;
  sevenDayRainLabel: string;
  soilMoistureLabel: string;
  cumulativeGddLabel: string;
  runForecastCta: string;
  runForecastDesc: string;
  dataSourceArchitecture: string;
  refreshLabel: string;
  retryLabel: string;

  // Impact & ROBI
  yieldAttributionBadge: string;
  robiAttributionTitle: string;
  robiAttributionDesc: string;
  exportVerifiedProofCard: string;
  verifiedNetRobi: string;
  extraIncomeAcre: string;
  yieldUpliftProven: string;
  podRecoveryRate: string;
  returnOnBioInvestment: string;
  vsUntreatedControl: string;
  synBioVsControl: string;
  duringR2HeatEvent: string;
  seasonComparisonRegional: string;
  regionalUntreatedControl: string;
  aasraProtectedField: string;
  verifiedRobiReturn: string;
  robiConfidenceLabel: string;
  weatherAdjusted: string;
  yieldDecomposition: string;
  biologicalGain: string;
  seasonComparison: string;
  exportProofCard: string;
  baselineYield: string;
  actualYield: string;
  heatStressEffect: string;
  soilContribution: string;
  fieldManagement: string;
  biologicalSprayEffect: string;
  finalYield: string;
  fieldContextTitle: string;
  liveTelemetry: string;
  nightTempLabel: string;
  heatRiskLabel: string;
  recentActionLabel: string;
  growthStageLabel: string;

  // What-If & Simulation
  whatIfBadge: string;
  whatIfTitle: string;
  whatIfSubtitle: string;
  sprayDelayBannerTitle: string;
  sprayDelayBannerDesc: string;
  bestCaseLabel: string;
  currentCaseLabel: string;
  worstCaseLabel: string;
  bestCaseTitle: string;
  currentCaseTitle: string;
  worstCaseTitle: string;
  dynamicInputsTitle: string;
  dynamicInputsSub: string;
  resetToLive: string;
  activeFarmLabel: string;
  tempInputLabel: string;
  soilInputLabel: string;
  costInputLabel: string;
  delaySliderLabel: string;
  applyToday: string;
  dayDelay: string;
  expectedYield: string;
  bioYieldGain: string;
  netProfitPerAcre: string;
  robiReturnIndex: string;
  modelConfidence: string;
  attributionBreakdownTitle: string;
  cellularSimTitle: string;
  cellularSimSub: string;
  pauseSim: string;
  playSim: string;
  speedLabel: string;
  cellularRespirationLoss: string;
  yieldRetention: string;
  bioEfficacy: string;

  // Journal
  editorialChronicleBadge: string;
  chroniclesOfSeason: string;
  chroniclesSub: string;
  entriesRecordedCount: string;
  allEntries: string;
  sprayEvents: string;
  heatAlerts: string;
  aiAdvisory: string;
  plantingStage: string;
  journalTitle: string;
  journalSubtitle: string;
  entriesRecorded: string;

  // Plant Intelligence (PS-02 & PS-03)
  plantIntelligenceBadge: string;
  plantIntelligenceTitle: string;
  plantIntelligenceSub: string;
  reRunPipeline: string;
  howPipelineWorks: string;
  agroClimaticZone: string;
  targetRegion: string;
  cropVariety: string;
  conversationalSymptomInput: string;
  conversationalSub: string;
  extractContextBtn: string;
  fieldContextParameters: string;
  growthStage: string;
  observedSymptoms: string;
  soilMoistureLevel: string;
  criticalAlertDetected: string;
  cropfitRecommendedIntervention: string;
  agronomicRationale: string;
  dosageLabel: string;
  applicationMethodLabel: string;
  waterVolumeLabel: string;
  targetProblemLabel: string;
  farmerOutcomeFeedback: string;
  yesImproved: string;
  noLabel: string;
  cropOptimalCondition: string;
  weatherTelemetryLayer: string;
  satelliteBiomassLayer: string;
  rootZoneSoilTelemetry: string;
  shapExplainability: string;
  fourteenDayStressForecast: string;
  stressProb: string;

  // Login & Signup
  portalSignIn: string;
  signInToFarm: string;
  signInDesc: string;
  mobileOtpCode: string;
  emailPassword: string;
  fullNameLabel: string;
  mobileNumberLabel: string;
  sendMobileOtp: string;
  verifyOpenDashboard: string;
  emailLabel: string;
  passwordLabel: string;
  signInWithPassword: string;
  needAccount: string;
  alreadyRegistered: string;
  tellUsAboutYourself: string;
  aboutYouDesc: string;
  preferredLanguage: string;
  continueToStep2: string;
  whereIsFarmLocated: string;
  locationDesc: string;
  usePhoneGps: string;
  stateLabel: string;
  districtLabel: string;
  villageLabel: string;
  backBtn: string;
  continueToStep3: string;
  primaryCropFieldArea: string;
  primaryCropDesc: string;
  primaryCropLabel: string;
  fieldAreaAcresLabel: string;
  sowingDateLabel: string;
  continueToStep4: string;
  reviewSetupFarm: string;
  reviewDesc: string;
  completeSetupLaunch: string;

  // Product page
  platformSpecBadge: string;
  hackathonBuildBadge: string;
  productHeroTitle1: string;
  productHeroTitle2: string;
  productHeroDesc: string;
  integratedSystemsTitle: string;
  integratedSystemsDesc: string;
  launchPlantAiCta: string;
  launchVoiceAiCta: string;

  // Footer
  footerRights: string;
  footerPlatform: string;
  footerFarmers: string;
  footerAccount: string;
  footerDiagnostics: string;
}

const EN_DICT: TranslationDict = {
  brandName: "AASRA",
  tagline: "Your Field's Most Caring AI Companion",
  navDashboard: "My Field",
  navAdvisory: "Ask AI",
  navRobi: "Income & Savings",
  navWeather: "Weather & Map",
  navProfile: "My Profile",
  navWhatIf: "What-If Simulator",
  navJournal: "Intervention Journal",
  navLogin: "Login",
  navGetStarted: "Get Started",
  navPlantAi: "Plant Health AI",
  navFields: "Fields & Map",
  navLogout: "Logout",
  selectLanguage: "Select Language",

  heroBadge: "100% Weather-Verified Yield Protection & Biological Science",
  heroTitle1: "Your crop's most",
  heroTitle2: "caring AI companion",
  heroSubtitle: "Every seed you sow carries your family's hard work. AASRA protects your crop from heat and guarantees extra profit.",
  trustQuote: "Your hard work, our commitment — caring weather and crop guidance at every step.",
  btnStartFarm: "Setup My Farm",
  btnExploreMap: "View Weather & Farms",
  voiceTitle: "Speak directly in your native Indian voice",
  voiceDesc: "Farmers simply speak their questions. AASRA listens carefully and speaks back clear, practical guidance in an authentic Indian voice.",
  btnPlayVoice: "🎙️ Listen to Indian Voice Advisory",
  btnStopVoice: "⏹ Stop Voice Audio",
  robiTitle: "Measure & prove your extra farm profit",
  robiDesc: "Calculate extra crop yield from Syngenta biological protection, subtract costs, and prove exact net savings.",
  extraYieldLabel: "Extra Crop Yield",
  netProfitLabel: "Net Extra Income",
  robiRatioLabel: "Profit Return Ratio",
  mapTitle: "Live Weather & Neighboring Farms Map",
  mapDesc: "Senses your exact location, time, and live weather automatically.",
  welcomePrefix: "Namaste,",
  stressAlertTitle: "Night Heat Warning Detected",
  stressAlertDesc: "High night temperatures increase crop stress. Apply biological spray to protect your yield.",
  recommendationTitle: "Recommended Crop Protection",
  voiceGreeting: "Namaste! Night heat stress has been detected in your soybean field. Applying Syngenta Stress Buster within 48 hours will protect your yield.",

  plantStressEngineBadge: "PS-02 LIVE ENGINE & PS-03 CROPFIT",
  plantStressEngineTitle: "14-Day Plant Stress Forecasting Engine",
  plantStressEngineDesc: "Predict heat, drought, waterlogging, and cold stress up to 14 days ahead using live Meteoblue & CE Hub APIs, Gradient-Boosted ML, and SHAP TreeExplainer.",
  forecastHorizon: "14 Days",
  mlAccuracy: "97% CI",
  stressTypes: "4 Modes",
  launchPlantIntelligence: "Launch Plant Intelligence Engine",
  coreIntelligenceJourney: "CORE INTELLIGENCE JOURNEY",
  askActProve: "ASK → ACT → PROVE",

  fieldCommandCenter: "AASRA FIELD COMMAND CENTER",
  welcomeUser: "Welcome to AASRA",
  activeFieldLabel: "Active Field",
  locationLabel: "Location",
  openAiAssistant: "Open AI Assistant",
  collapseAssistant: "Collapse Assistant",
  exploreEngine: "Explore Engine",
  viewMapLayers: "View Map Layers",
  calculateRobi: "Calculate ROBI",
  runSimulation: "Run Simulation",
  liveTelemetryTitle: "Live Open-Meteo Telemetry",
  nightHeatStressWarning: "NIGHT HEAT STRESS WARNING",
  plantHealthAI: "Plant Health AI",
  voiceAdvisory: "Voice Advisory",
  weatherSensors: "Weather Sensors",
  whatIfSim: "What-If Sim",
  robiProof: "ROBI Proof",

  assistantBadge: "MULTILINGUAL VOICE & VISION ENGINE",
  askAasraTitle: "Ask AASRA Voice AI & Leaf Scanner",
  askAasraDesc: "Speak in any Indian language or upload leaf photos for instant Gemini AI diagnosis.",
  quickLanguageLabel: "Quick Language:",
  tryAskingLabel: "Try asking:",
  sampleQ1: "Soybean heat stress treatment today?",
  sampleQ2: "When to spray Quantis biostimulant?",
  sampleQ3: "Why is my leaf turning yellow?",
  sampleQ4: "Show me waterlogging risk for Punjab",
  sampleQ5: "14-day forecast for my cotton field",
  liveFieldTelemetry: "Live Field Telemetry",
  chatWelcome: "Hello! I am AASRA — your field's intelligent AI companion. Your crop is at R2 flowering stage with elevated night heat. Ask me anything!",
  chatPlaceholder: "Ask about heat stress, spray timing, or yield impact...",
  listenLabel: "Listening (Google STT)...",
  speakingLabel: "Speaking (Google TTS)...",
  processingLabel: "Analyzing field data & weather...",
  explainableAiTitle: "Explainable AI: Why this recommendation?",
  suggestedFollowUps: "Suggested Follow-ups:",
  safeSprayWindowActive: "SAFE SPRAY WINDOW ACTIVE",
  sprayCautionActive: "SPRAY CAUTION ACTIVE",
  quickQ1: "What is my biggest risk?",
  quickQ2: "When should I spray?",
  quickQ3: "Why is heat stress high?",
  quickQ4: "What if I wait 3 more days?",
  quickQ5: "Did my intervention work?",

  farmPortfolioBadge: "FARM PORTFOLIO & MAP OVERWATCH",
  myFieldsTitle: "My Farm Portfolio & Satellite Map",
  myFieldsDesc: "Manage field polygon boundaries, area calculations, satellite heatmaps, and Open-Meteo telemetry.",
  registeredFieldsCount: "Registered Fields",
  registeredFarmFields: "Registered Farm Fields",
  healthScoreLabel: "Health",
  fieldCommandQuickLinks: "Field Command Quick Links",

  atmosphericTelemetryBadge: "ATMOSPHERIC TELEMETRY NETWORK",
  microClimateTitle: "Micro-Climate",
  microClimateSubtitle: "Sensors & Stress Analysis",
  sevenDaySummary: "7-Day Conditions Summary",
  maxTempLabel: "MAX TEMP",
  minTempLabel: "MIN TEMP",
  sevenDayRainLabel: "7D RAINFALL",
  soilMoistureLabel: "SOIL MOISTURE",
  cumulativeGddLabel: "CUMULATIVE GDD (7 DAYS)",
  runForecastCta: "Run 14-Day Plant Stress Forecast",
  runForecastDesc: "Use weather data + Meteoblue & CE Hub APIs to run a GradientBoosted ML forecast for heat, drought, waterlogging, and cold stress.",
  dataSourceArchitecture: "Data Source Architecture",
  refreshLabel: "Refresh",
  retryLabel: "Retry",

  yieldAttributionBadge: "PS-07 YIELD ATTRIBUTION ENGINE",
  robiAttributionTitle: "ROBI Yield Attribution & Proof Card",
  robiAttributionDesc: "Isolates biostimulant protection effect from weather & soil baselines to prove Return on Biological Investment (ROBI).",
  exportVerifiedProofCard: "Export Verified Proof Card",
  verifiedNetRobi: "Verified Net ROBI",
  extraIncomeAcre: "Extra Income / Acre",
  yieldUpliftProven: "Yield Uplift Proven",
  podRecoveryRate: "Pod Recovery Rate",
  returnOnBioInvestment: "Return on Biological Investment",
  vsUntreatedControl: "vs. untreated control fields",
  synBioVsControl: "Syngenta bio vs. untreated control",
  duringR2HeatEvent: "During R2 night heat stress event",
  seasonComparisonRegional: "Season Comparison & Regional Yield Control",
  regionalUntreatedControl: "REGIONAL UNTREATED CONTROL",
  aasraProtectedField: "AASRA PROTECTED FIELD",
  verifiedRobiReturn: "VERIFIED ROBI RETURN",
  robiConfidenceLabel: "Attribution Confidence",
  weatherAdjusted: "Weather-Adjusted Score",
  yieldDecomposition: "Modelled Yield Decomposition Tree",
  biologicalGain: "Biological Spray Gain",
  seasonComparison: "Season Comparison & Yield Control",
  exportProofCard: "Export Proof Card",
  baselineYield: "Baseline Expected Yield",
  actualYield: "Actual Harvest Yield",
  heatStressEffect: "Weather & Thermal Effect",
  soilContribution: "Soil Moisture Contribution",
  fieldManagement: "Field Management",
  biologicalSprayEffect: "Modelled Biological Spray Effect",
  finalYield: "Final Actual Measured Yield",
  fieldContextTitle: "Field Context",
  liveTelemetry: "LIVE TELEMETRY",
  nightTempLabel: "Night Temperature",
  heatRiskLabel: "3-Day Heat Risk",
  recentActionLabel: "Recent Action",
  growthStageLabel: "Growth Stage",

  whatIfBadge: "BIOLOGICAL SCENARIO SIMULATION ENGINE",
  whatIfTitle: "What-If Spray Delay Simulator",
  whatIfSubtitle: "Simulate how biostimulant spray delay (0 to 7 days) impacts heat stress risk, yield loss, and net profit.",
  sprayDelayBannerTitle: "Spray Delay Penalty Simulator",
  sprayDelayBannerDesc: "Every 24h delay in applying a biological intervention during a heat stress event reduces efficacy by ~12–18%. Drag the slider to model the real financial cost of procrastination.",
  bestCaseLabel: "Best Case — Day 0",
  currentCaseLabel: "Current — Day +1",
  worstCaseLabel: "Worst Case — Day +3",
  bestCaseTitle: "Spray Today: Max Protection",
  currentCaseTitle: "1-Day Delay: Moderate Loss",
  worstCaseTitle: "3-Day Delay: Critical Yield Loss",
  dynamicInputsTitle: "Dynamic What-If Scenario Inputs",
  dynamicInputsSub: "Enter custom weather or field values below or use live Open-Meteo telemetry placeholders.",
  resetToLive: "Reset to Live",
  activeFarmLabel: "Select Active Farm:",
  tempInputLabel: "Night / Day Temp (°C):",
  soilInputLabel: "Soil Moisture Index (%):",
  costInputLabel: "Biostimulant Cost (₹/ac):",
  delaySliderLabel: "Application Delay:",
  applyToday: "APPLY TODAY (Day 0)",
  dayDelay: "DAY DELAY",
  expectedYield: "EXPECTED YIELD",
  bioYieldGain: "BIOLOGICAL YIELD GAIN",
  netProfitPerAcre: "NET PROFIT / ACRE",
  robiReturnIndex: "ROBI INDEX RETURN",
  modelConfidence: "MODEL CONFIDENCE",
  attributionBreakdownTitle: "Shapley Biophysical Yield Attribution Breakdown",
  cellularSimTitle: "Abiotic Heat Stress vs Biological Protection Simulation",
  cellularSimSub: "Real-time animation comparing cellular respiration loss in unmanaged crop vs biostimulant protected crop.",
  pauseSim: "Pause Simulation",
  playSim: "Play Simulation",
  speedLabel: "Speed",
  cellularRespirationLoss: "Respiration Loss",
  yieldRetention: "Yield Retention",
  bioEfficacy: "Bio-Efficacy",

  editorialChronicleBadge: "EDITORIAL CHRONICLE",
  chroniclesOfSeason: "Chronicles of the Season",
  chroniclesSub: "A structured timeline recording planting stages, thermal heat stress alerts, biological spray interventions, and yield outcomes.",
  entriesRecordedCount: "ENTRIES RECORDED",
  allEntries: "All Entries",
  sprayEvents: "Spray Events",
  heatAlerts: "Heat Alerts",
  aiAdvisory: "AI Advisory",
  plantingStage: "Planting Stage",
  journalTitle: "Chronicles of the Season.",
  journalSubtitle: "A structured timeline recording planting stages, thermal heat stress alerts, biological spray interventions, and yield outcomes.",
  entriesRecorded: "ENTRIES RECORDED",

  plantIntelligenceBadge: "PS-02 & PS-03 INTELLIGENCE ENGINE",
  plantIntelligenceTitle: "Plant Health Intelligence & CropFit Advisor",
  plantIntelligenceSub: "14-Day multi-dimensional stress forecasting with SHAP feature attribution, coupled with context-aware Syngenta biological interventions.",
  reRunPipeline: "Re-Run Pipeline",
  howPipelineWorks: "How the PS-02 & PS-03 Pipeline Works",
  agroClimaticZone: "Agro-Climatic Zone",
  targetRegion: "Target Region",
  cropVariety: "Crop Variety",
  conversationalSymptomInput: "Conversational Field Symptom Input",
  conversationalSub: "Describe observations in natural words. Gemini extracts growth stage, symptoms, and soil moisture.",
  extractContextBtn: "Extract Context & Auto-Fill",
  fieldContextParameters: "Field Context Parameters",
  growthStage: "Growth Stage",
  observedSymptoms: "Observed Symptoms",
  soilMoistureLevel: "Soil Moisture Level",
  criticalAlertDetected: "CRITICAL STRESS THRESHOLD DETECTED",
  cropfitRecommendedIntervention: "PS-03 CROPFIT RECOMMENDED INTERVENTION",
  agronomicRationale: "Agronomic Rationale:",
  dosageLabel: "Dosage",
  applicationMethodLabel: "Application",
  waterVolumeLabel: "Water Volume",
  targetProblemLabel: "Target Problem",
  farmerOutcomeFeedback: "Farmer Outcome Feedback Loop: Did this biological intervention improve field yield?",
  yesImproved: "Yes, Improved",
  noLabel: "No",
  cropOptimalCondition: "Crop In Optimal Vegetative Condition",
  weatherTelemetryLayer: "Weather Telemetry",
  satelliteBiomassLayer: "Satellite Biomass Layer",
  rootZoneSoilTelemetry: "Root-Zone Soil Telemetry",
  shapExplainability: "SHAP AI Explainability",
  fourteenDayStressForecast: "14-Day Dynamic Plant Stress Forecast",
  stressProb: "Stress Prob",

  portalSignIn: "PORTAL SIGN-IN",
  signInToFarm: "Sign in to your farm",
  signInDesc: "Enter your mobile number to access live weather & crop overwatch.",
  mobileOtpCode: "Mobile OTP Code",
  emailPassword: "Email & Password",
  fullNameLabel: "Full Name",
  mobileNumberLabel: "Mobile Number",
  sendMobileOtp: "Send Mobile OTP",
  verifyOpenDashboard: "Verify & Open Dashboard",
  emailLabel: "Email Address",
  passwordLabel: "Password",
  signInWithPassword: "Sign In with Password",
  needAccount: "Need an account? Sign Up",
  alreadyRegistered: "Already registered? Log In",
  tellUsAboutYourself: "Tell us about yourself",
  aboutYouDesc: "Your information helps AASRA customize farm advice and crop warnings for your region.",
  preferredLanguage: "Preferred Language",
  continueToStep2: "Continue to Step 2",
  whereIsFarmLocated: "Where is your farm located?",
  locationDesc: "AASRA pulls real-time weather telemetry from Open-Meteo for your village coordinates.",
  usePhoneGps: "Use Phone Hardware GPS",
  stateLabel: "State",
  districtLabel: "District",
  villageLabel: "Village",
  backBtn: "Back",
  continueToStep3: "Continue to Step 3",
  primaryCropFieldArea: "Primary Crop & Field Area",
  primaryCropDesc: "AASRA calculates night heat stress degradation specific to your crop variety.",
  primaryCropLabel: "Primary Crop",
  fieldAreaAcresLabel: "Field Area (Acres)",
  sowingDateLabel: "Sowing Date",
  continueToStep4: "Continue to Step 4",
  reviewSetupFarm: "Review & Setup Farm Overwatch",
  reviewDesc: "Confirm details to initialize your personalized AASRA AI Assistant.",
  completeSetupLaunch: "Complete Setup & Launch Dashboard",

  platformSpecBadge: "AASRA PLATFORM SPECIFICATION",
  hackathonBuildBadge: "HACKATHON BUILD — 7 INTEGRATED SYSTEMS",
  productHeroTitle1: "Biological Science",
  productHeroTitle2: "meets Voice Intelligence.",
  productHeroDesc: "AASRA integrates 7 precision farming systems — from satellite weather telemetry to SHAP-explained ML forecasting — to give Indian farmers actionable, proven advice in their own language.",
  integratedSystemsTitle: "7 Integrated Precision Systems",
  integratedSystemsDesc: "Each PS module operates independently and feeds data into the next.",
  launchPlantAiCta: "LAUNCH PLANT AI (PS-02 & PS-03)",
  launchVoiceAiCta: "LAUNCH VOICE AI (PS-04)",

  footerRights: "© 2026 AASRA. All rights reserved.",
  footerPlatform: "PLATFORM",
  footerFarmers: "FARMERS",
  footerAccount: "ACCOUNT",
  footerDiagnostics: "System Diagnostics",
};

const HI_DICT: Partial<TranslationDict> = {
  brandName: "आसरा",
  tagline: "आपकी फसल का सबसे स्नेही AI साथी",
  navDashboard: "मेरा खेत",
  navAdvisory: "AI सलाह",
  navRobi: "कमाई और बचत",
  navWeather: "मौसम व नक्शा",
  navProfile: "मेरी प्रोफाइल",
  navWhatIf: "परिणाम सिमुलेटर",
  navJournal: "हस्तक्षेप डायरी",
  navLogin: "लॉग इन",
  navGetStarted: "शुरू करें",
  navPlantAi: "पौधा स्वास्थ्य AI",
  navFields: "खेत व नक्शा",
  navLogout: "लॉग आउट",
  selectLanguage: "भाषा चुनें",

  heroBadge: "100% मौसम-सत्यापित फसल सुरक्षा व जैविक विज्ञान",
  heroTitle1: "आपकी फसल का सबसे",
  heroTitle2: "स्नेही AI साथी",
  heroSubtitle: "आपके द्वारा बोया गया हर बीज आपके परिवार की मेहनत का प्रतीक है। आसरा मौसम की मार से फसल बचाकर आपकी कमाई बढ़ाता है।",
  trustQuote: "आपकी मेहनत, हमारी जिम्मेदारी — हर कदम पर फसल की सही देखभाल।",
  btnStartFarm: "अपना खेत दर्ज करें",
  btnExploreMap: "लाइव मौसम व नक्शा देखें",
  voiceTitle: "अपनी भारतीय बोली में सीधे बात करें",
  voiceDesc: "बस अपनी बोली में बोलकर सवाल पूछें। आसरा आपकी बात सुनकर स्पष्ट भारतीय आवाज में सटीक सलाह देता है।",
  btnPlayVoice: "🎙️ भारतीय AI आवाज में सलाह सुनें",
  btnStopVoice: "⏹ आवाज रोकें",
  robiTitle: "अपनी अतिरिक्त उपज और कमाई मापें",
  robiDesc: "सिंजेंटा जैविक सुरक्षा से मिली अतिरिक्त पैदावार और शुद्ध बचत का सही हिसाब देखें।",
  extraYieldLabel: "अतिरिक्त पैदावार",
  netProfitLabel: "शुद्ध अतिरिक्त कमाई",
  robiRatioLabel: "मुनाफा अनुपात",
  mapTitle: "जीवंत मौसम नक्शा व आसपास के खेत",
  mapDesc: "आपके क्षेत्र का सटीक मौसम व समय स्वचालित रूप से दिखाता है।",
  welcomePrefix: "नमस्ते,",
  stressAlertTitle: "रात की गर्मी की चेतावनी",
  stressAlertDesc: "रात में तापमान बढ़ने से फसल तनाव में है। जैविक स्प्रे छिड़क कर फसल बचाएं।",
  recommendationTitle: "उपयोगी जैविक सुरक्षा",
  voiceGreeting: "नमस्ते! आपकी सोयाबीन फसल पर रात की गर्मी का तनाव देखा गया है। 48 घंटे के भीतर सिंजेंटा स्ट्रेस बस्टर का छिड़काव करें और अपनी पैदावार सुरक्षित रखें।",

  plantStressEngineBadge: "PS-02 लाइव इंजन और PS-03 क्रॉपफिट",
  plantStressEngineTitle: "14-दिवसीय पौधा तनाव पूर्वानुमान इंजन",
  plantStressEngineDesc: "Meteoblue और CE Hub लाइव APIs, Gradient-Boosted ML और SHAP के माध्यम से 14 दिन पहले गर्मी, सूखा व जलभराव का सटीक पूर्वानुमान।",
  forecastHorizon: "14 दिन",
  mlAccuracy: "97% सटीकता",
  stressTypes: "4 प्रकार",
  launchPlantIntelligence: "प्लांट इंटेलिजेंस इंजन खोलें",
  coreIntelligenceJourney: "इंटेलिजेंस यात्रा",
  askActProve: "पूछें → कार्रवाई → प्रमाण",

  fieldCommandCenter: "आसरा खेत कमांड सेंटर",
  welcomeUser: "आसरा में स्वागत है",
  activeFieldLabel: "सक्रिय खेत",
  locationLabel: "स्थान",
  openAiAssistant: "AI सहायक खोलें",
  collapseAssistant: "सहायक छोटा करें",
  exploreEngine: "इंजन देखें",
  viewMapLayers: "नक्शा परतें देखें",
  calculateRobi: "ROBI गणना करें",
  runSimulation: "सिमुलेशन चलाएं",
  liveTelemetryTitle: "लाइव ओपन-मेटियो टेलीमेट्री",
  nightHeatStressWarning: "रात की गर्मी तनाव चेतावनी",
  plantHealthAI: "पौधा स्वास्थ्य AI",
  voiceAdvisory: "आवाज सलाह",
  weatherSensors: "मौसम सेंसर",
  whatIfSim: "परिणाम सिमुलेटर",
  robiProof: "ROBI प्रमाण",

  assistantBadge: "बहुभाषी आवाज और विज़न इंजन",
  askAasraTitle: "आसरा AI वॉयस और पत्ती स्कैनर",
  askAasraDesc: "अपनी भाषा में बोलें या तुरंत AI निदान के लिए पत्ती की फोटो अपलोड करें।",
  quickLanguageLabel: "त्वरित भाषा:",
  tryAskingLabel: "पूछकर देखें:",
  sampleQ1: "आज सोयाबीन में गर्मी तनाव का उपचार?",
  sampleQ2: "Quantis जैविक उर्वरक कब छिड़कें?",
  sampleQ3: "मेरी फसल में पत्ती पीली क्यों हो रही है?",
  sampleQ4: "पंजाब में जलभराव का खतरा दिखाएं",
  sampleQ5: "मेरे कपास खेत के लिए 14 दिन का पूर्वानुमान",
  liveFieldTelemetry: "लाइव खेत डेटा",
  chatWelcome: "नमस्कार! मैं आसरा हूँ — आपका फसल AI साथी। आपकी सोयाबीन R2 फूल अवस्था में है और रात का तापमान ऊंचा है। पूछें मुझसे!",
  chatPlaceholder: "अपनी फसल, छिड़काव या मौसम के बारे में पूछें...",
  listenLabel: "सुन रहा हूँ (Google STT)...",
  speakingLabel: "बोल रहा हूँ (Google TTS)...",
  processingLabel: "खेत डेटा और मौसम का विश्लेषण हो रहा है...",
  explainableAiTitle: "व्याख्यात्मक AI: यह सिफारिश क्यों दी गई?",
  suggestedFollowUps: "सुझाए गए प्रश्न:",
  safeSprayWindowActive: "सुरक्षित छिड़काव समय सक्रिय",
  sprayCautionActive: "छिड़काव सावधानी सक्रिय",
  quickQ1: "मेरी फसल का सबसे बड़ा जोखिम क्या है?",
  quickQ2: "मुझे छिड़काव कब करना चाहिए?",
  quickQ3: "यह गर्मी तनाव क्यों हो रहा है?",
  quickQ4: "अगर मैं 3 दिन और रुक जाऊं तो क्या होगा?",
  quickQ5: "क्या मेरे छिड़काव का प्रभाव पड़ा?",

  farmPortfolioBadge: "खेत पोर्टफोलियो और नक्शा ओवरवॉच",
  myFieldsTitle: "मेरा खेत पोर्टफोलियो और सैटेलाइट नक्शा",
  myFieldsDesc: "खेत की सीमाएं, क्षेत्रफल, सैटेलाइट हीटमैप और लाइव टेलीमेट्री प्रबंधित करें।",
  registeredFieldsCount: "पंजीकृत खेत",
  registeredFarmFields: "पंजीकृत खेत सूची",
  healthScoreLabel: "स्वास्थ्य",
  fieldCommandQuickLinks: "कमांड त्वरित लिंक",

  atmosphericTelemetryBadge: "वायुमंडलीय टेलीमेट्री नेटवर्क",
  microClimateTitle: "सूक्ष्म जलवायु",
  microClimateSubtitle: "सेंसर और तनाव विश्लेषण",
  sevenDaySummary: "7-दिवसीय स्थिति सारांश",
  maxTempLabel: "अधिकतम तापमान",
  minTempLabel: "न्यूनतम तापमान",
  sevenDayRainLabel: "7 दिन की बारिश",
  soilMoistureLabel: "मिट्टी की नमी",
  cumulativeGddLabel: "संचयी GDD (7 दिन)",
  runForecastCta: "14-दिन का पौधा तनाव पूर्वानुमान चलाएं",
  runForecastDesc: "Meteoblue और CE Hub APIs के साथ 14-दिवसीय ML तनाव पूर्वानुमान चलाएं और सिंजेंटा जैविक सिफारिशें पाएं।",
  dataSourceArchitecture: "डेटा स्रोत संरचना",
  refreshLabel: "रिफ्रेश",
  retryLabel: "पुनः प्रयास",

  yieldAttributionBadge: "PS-07 उपज एट्रिब्यूशन इंजन",
  robiAttributionTitle: "ROBI उपज एट्रिब्यूशन और प्रमाण कार्ड",
  robiAttributionDesc: "जैविक निवेश पर लाभ (ROBI) सिद्ध करने के लिए मौसम और मिट्टी के प्रभाव को अलग करता है।",
  exportVerifiedProofCard: "सत्यापित प्रमाण कार्ड डाउनलोड करें",
  verifiedNetRobi: "सत्यापित शुद्ध ROBI",
  extraIncomeAcre: "अतिरिक्त कमाई / एकड़",
  yieldUpliftProven: "सिद्ध उपज वृद्धि",
  podRecoveryRate: "फली पुनर्प्राप्ति दर",
  returnOnBioInvestment: "जैविक निवेश पर वापसी",
  vsUntreatedControl: "बिना उपचार वाले खेत की तुलना में",
  synBioVsControl: "सिंजेंटा जैविक बनाम अनुपचारित",
  duringR2HeatEvent: "R2 रात की गर्मी तनाव घटना के दौरान",
  seasonComparisonRegional: "सीजन तुलना और क्षेत्रीय उपज नियंत्रण",
  regionalUntreatedControl: "क्षेत्रीय अनुपचारित नियंत्रण",
  aasraProtectedField: "आसरा संरक्षित खेत",
  verifiedRobiReturn: "सत्यापित ROBI वापसी",
  robiConfidenceLabel: "एट्रिब्यूशन विश्वसनीयता",
  weatherAdjusted: "मौसम-समायोजित स्कोर",
  yieldDecomposition: "उपज विश्लेषण वृक्ष",
  biologicalGain: "जैविक छिड़काव लाभ",
  seasonComparison: "सीजन तुलना और उपज नियंत्रण",
  exportProofCard: "प्रमाण कार्ड डाउनलोड करें",
  baselineYield: "अपेक्षित आधार उपज",
  actualYield: "वास्तविक फसल उपज",
  heatStressEffect: "मौसम और ताप प्रभाव",
  soilContribution: "मिट्टी नमी योगदान",
  fieldManagement: "खेत प्रबंधन",
  biologicalSprayEffect: "जैविक छिड़काव प्रभाव",
  finalYield: "अंतिम मापित उपज",
  fieldContextTitle: "खेत का संदर्भ",
  liveTelemetry: "लाइव टेलीमेट्री",
  nightTempLabel: "रात का तापमान",
  heatRiskLabel: "3-दिन गर्मी जोखिम",
  recentActionLabel: "हालिया कार्रवाई",
  growthStageLabel: "विकास अवस्था",

  whatIfBadge: "जैविक परिणाम सिमुलेशन इंजन",
  whatIfTitle: "स्प्रे देरी परिणाम सिमुलेटर",
  whatIfSubtitle: "देखें कि छिड़काव में 0 से 7 दिन की देरी से आपकी फसल और कमाई पर क्या प्रभाव पड़ता है।",
  sprayDelayBannerTitle: "स्प्रे देरी दंड सिमुलेटर",
  sprayDelayBannerDesc: "गर्मी तनाव घटना के दौरान जैविक हस्तक्षेप में हर 24 घंटे की देरी से प्रभावशीलता ~12-18% कम होती है।",
  bestCaseLabel: "सर्वोत्तम — दिन 0",
  currentCaseLabel: "वर्तमान — दिन +1",
  worstCaseLabel: "सबसे खराब — दिन +3",
  bestCaseTitle: "आज छिड़कें: अधिकतम सुरक्षा",
  currentCaseTitle: "1-दिन की देरी: मध्यम नुकसान",
  worstCaseTitle: "3-दिन की देरी: गंभीर उपज हानि",
  dynamicInputsTitle: "डायनामिक परिदृश्य इनपुट",
  dynamicInputsSub: "नीचे अपनी फसल का तापमान या मिट्टी की नमी का मान दर्ज करें।",
  resetToLive: "लाइव मान रिसेट करें",
  activeFarmLabel: "सक्रिय खेत चुनें:",
  tempInputLabel: "रात / दिन तापमान (°C):",
  soilInputLabel: "मिट्टी नमी सूचकांक (%):",
  costInputLabel: "जैविक दवा लागत (₹/एकड़):",
  delaySliderLabel: "छिड़काव में देरी:",
  applyToday: "आज ही छिड़कें (दिन 0)",
  dayDelay: "दिन की देरी",
  expectedYield: "अपेक्षित पैदावार",
  bioYieldGain: "जैविक उपज लाभ",
  netProfitPerAcre: "शुद्ध मुनाफा / एकड़",
  robiReturnIndex: "कमाई अनुपात सूचकांक",
  modelConfidence: "मॉडल विश्वसनीयता",
  attributionBreakdownTitle: "शेपली बायोफिजिकल उपज आवंटन विश्लेषण",
  cellularSimTitle: "गर्मी तनाव बनाम जैविक फसल सुरक्षा सिमुलेशन",
  cellularSimSub: "बिना सुरक्षा वाली फसल और सिंजेंटा सुरक्षा वाली फसल में तुलनात्मक 2D सिमुलेशन।",
  pauseSim: "सिमुलेशन रोकें",
  playSim: "सिमुलेशन चलाएं",
  speedLabel: "गति",
  cellularRespirationLoss: "श्वसन चीनी नुकसान",
  yieldRetention: "उपज सुरक्षा दर",
  bioEfficacy: "जैविक प्रभावशीलता",

  editorialChronicleBadge: "संपादकीय इतिहास",
  chroniclesOfSeason: "इस मौसम की कहानी",
  chroniclesSub: "बुआई, गर्मी तनाव, जैविक छिड़काव और फसल उपज की संरचित समयरेखा।",
  entriesRecordedCount: "प्रविष्टियाँ दर्ज",
  allEntries: "सभी प्रविष्टियाँ",
  sprayEvents: "छिड़काव घटनाएं",
  heatAlerts: "गर्मी अलर्ट",
  aiAdvisory: "AI सलाह",
  plantingStage: "बुआई अवस्था",
  journalTitle: "इस मौसम की कहानी।",
  journalSubtitle: "बुआई, गर्मी तनाव, जैविक छिड़काव और फसल उपज की संरचित समयरेखा।",
  entriesRecorded: "प्रविष्टियाँ दर्ज",

  plantIntelligenceBadge: "PS-02 और PS-03 इंटेलिजेंस इंजन",
  plantIntelligenceTitle: "पौधा स्वास्थ्य इंटेलिजेंस व क्रॉपफिट सलाहकार",
  plantIntelligenceSub: "14-दिवसीय बहुआयामी तनाव पूर्वानुमान और संदर्भ-जागरूक सिंजेंटा जैविक हस्तक्षेप।",
  reRunPipeline: "पाइपलाइन दोबारा चलाएं",
  howPipelineWorks: "PS-02 और PS-03 पाइपलाइन कैसे काम करती है",
  agroClimaticZone: "कृषि-जलवायु क्षेत्र",
  targetRegion: "लक्षित क्षेत्र",
  cropVariety: "फसल की किस्म",
  conversationalSymptomInput: "प्राकृतिक भाषा में खेत के लक्षण दर्ज करें",
  conversationalSub: "अपनी भाषा में बताएं। जेमिनी विकास अवस्था, लक्षण व मिट्टी की नमी निकालेगा।",
  extractContextBtn: "संदर्भ निकालें और स्वतः भरें",
  fieldContextParameters: "खेत संदर्भ पैरामीटर",
  growthStage: "विकास अवस्था",
  observedSymptoms: "देखे गए लक्षण",
  soilMoistureLevel: "मिट्टी की नमी का स्तर",
  criticalAlertDetected: "गंभीर तनाव सीमा पाई गई",
  cropfitRecommendedIntervention: "क्रॉपफिट अनुशंसित जैविक हस्तक्षेप",
  agronomicRationale: "कृषि-वैज्ञानिक कारण:",
  dosageLabel: "खुराक",
  applicationMethodLabel: "उपयोग विधि",
  waterVolumeLabel: "पानी की मात्रा",
  targetProblemLabel: "लक्षित समस्या",
  farmerOutcomeFeedback: "किसान परिणाम फीडबैक: क्या इस जैविक छिड़काव से आपकी पैदावार बढ़ी?",
  yesImproved: "हाँ, वृद्धि हुई",
  noLabel: "नहीं",
  cropOptimalCondition: "फसल इष्टतम वानस्पतिक स्थिति में है",
  weatherTelemetryLayer: "मौसम टेलीमेट्री",
  satelliteBiomassLayer: "उपग्रह बायोमास परत",
  rootZoneSoilTelemetry: "जड़-क्षेत्र मिट्टी टेलीमेट्री",
  shapExplainability: "SHAP AI व्याख्यात्मकता",
  fourteenDayStressForecast: "14-दिवसीय डायनामिक पौधा तनाव पूर्वानुमान",
  stressProb: "तनाव संभावना",

  portalSignIn: "पोर्टल साइन-इन",
  signInToFarm: "अपने खेत में साइन इन करें",
  signInDesc: "लाइव मौसम व फसल ओवरवॉच के लिए अपना मोबाइल नंबर दर्ज करें।",
  mobileOtpCode: "मोबाइल OTP कोड",
  emailPassword: "ईमेल और पासवर्ड",
  fullNameLabel: "पूरा नाम",
  mobileNumberLabel: "मोबाइल नंबर",
  sendMobileOtp: "मोबाइल OTP भेजें",
  verifyOpenDashboard: "सत्यापित करें व डैशबोर्ड खोलें",
  emailLabel: "ईमेल पता",
  passwordLabel: "पासवर्ड",
  signInWithPassword: "पासवर्ड से साइन इन करें",
  needAccount: "खाता चाहिए? रजिस्टर करें",
  alreadyRegistered: "पहले से पंजीकृत हैं? लॉग इन करें",
  tellUsAboutYourself: "अपने बारे में बताएं",
  aboutYouDesc: "आपकी जानकारी आसरा को आपके क्षेत्र के लिए सलाह व फसल चेतावनियां अनुकूलित करने में मदद करती है।",
  preferredLanguage: "पसंदीदा भाषा",
  continueToStep2: "चरण 2 पर जाएं",
  whereIsFarmLocated: "आपका खेत कहाँ स्थित है?",
  locationDesc: "आसरा आपके गांव के निर्देशांकों के लिए ओपन-मेटियो से लाइव मौसम डेटा लाता है।",
  usePhoneGps: "फ़ोन का GPS उपयोग करें",
  stateLabel: "राज्य",
  districtLabel: "जिला",
  villageLabel: "गाँव",
  backBtn: "पीछे",
  continueToStep3: "चरण 3 पर जाएं",
  primaryCropFieldArea: "मुख्य फसल और खेत का क्षेत्रफल",
  primaryCropDesc: "आसरा आपकी फसल की किस्म के अनुसार रात की गर्मी के तनाव का सटीक हिसाब लगाता है।",
  primaryCropLabel: "मुख्य फसल",
  fieldAreaAcresLabel: "खेत क्षेत्रफल (एकड़)",
  sowingDateLabel: "बुआई तिथि",
  continueToStep4: "चरण 4 पर जाएं",
  reviewSetupFarm: "विवरण जांचें व खेत सेटअप पूरा करें",
  reviewDesc: "अपने व्यक्तिगत आसरा AI सहायक को शुरू करने के लिए विवरण की पुष्टि करें।",
  completeSetupLaunch: "सेटअप पूरा करें व डैशबोर्ड शुरू करें",

  platformSpecBadge: "AASRA प्लेटफार्म विनिर्देश",
  hackathonBuildBadge: "हैकाथॉन बिल्ड — 7 एकीकृत प्रणालियाँ",
  productHeroTitle1: "जैविक विज्ञान",
  productHeroTitle2: "आवाज बुद्धिमत्ता से मिलता है।",
  productHeroDesc: "AASRA 7 सटीक खेती प्रणालियों को एकीकृत करता है — उपग्रह मौसम टेलीमेट्री से SHAP-व्याख्यात्मक ML पूर्वानुमान तक — भारतीय किसानों को उनकी अपनी भाषा में सिद्ध सलाह देने के लिए।",
  integratedSystemsTitle: "7 एकीकृत सटीक प्रणालियाँ",
  integratedSystemsDesc: "प्रत्येक PS मॉड्यूल स्वतंत्र रूप से संचालित होता है और अगले को डेटा प्रदान करता है।",
  launchPlantAiCta: "प्लांट AI लॉन्च करें (PS-02 और PS-03)",
  launchVoiceAiCta: "वॉयस AI लॉन्च करें (PS-04)",

  footerRights: "© 2026 आसरा। सर्वाधिकार सुरक्षित।",
  footerPlatform: "प्लेटफ़ॉर्म",
  footerFarmers: "किसान",
  footerAccount: "खाता",
  footerDiagnostics: "सिस्टम डायग्नोस्टिक्स",
};

const MR_DICT: Partial<TranslationDict> = {
  brandName: "आसरा",
  tagline: "तुमच्या पिकाचा विश्वासू सोबती",
  navDashboard: "माझे शेत",
  navAdvisory: "AI सल्ला",
  navRobi: "उत्पन्न व बचत",
  navWeather: "हवामान व नकाशा",
  navProfile: "माझी प्रोफाइल",
  navWhatIf: "सिम्युलेटर",
  navJournal: "हस्तक्षेप डायरी",
  navLogin: "लॉगिन",
  navGetStarted: "सुरू करा",
  navPlantAi: "पीक आरोग्य AI",
  navFields: "शेत व नकाशा",
  navLogout: "लॉगआउट",
  selectLanguage: "भाषा निवडा",

  heroBadge: "100% हवामान-सत्यापित पीक संरक्षण व जैविक विज्ञान",
  heroTitle1: "तुमच्या पिकाचा सर्वात",
  heroTitle2: "विश्वासू सोबती",
  heroSubtitle: "आसरा हवामानाच्या धोक्यापासून पिकाचे रक्षण करतो आणि तुमचे उत्पन्न वाढवतो.",
  trustQuote: "तुमचे कष्ट, आमची जबाबदारी — पिकाची योग्य काळजी.",
  btnStartFarm: "माझे शेत सुरू करा",
  btnExploreMap: "हवामान नकाशा पाहा",
  voiceTitle: "तुमच्या भारतीय भाषेत थेट बोला",
  voiceDesc: "शेतकरी मित्र फक्त बोलून विचारू शकतात. आसरा थेट भारतीय आवाजात उत्तर देतो.",
  btnPlayVoice: "🎙️ भारतीय AI आवाज ऐका",
  btnStopVoice: "⏹ आवाज थांबवा",
  robiTitle: "अतिरिक्त उत्पन्न व नफा मोजा",
  robiDesc: "सिंजेंटा जैविक उत्पादनांमुळे होणारी अतिरिक्त पीक वाढ व निव्वळ बचत पाहा.",
  extraYieldLabel: "अतिरिक्त उत्पन्न",
  netProfitLabel: "निव्वळ अतिरिक्त नफा",
  robiRatioLabel: "नफा प्रमाण",
  mapTitle: "हवामान व शेजारील शेत नकाशा",
  mapDesc: "स्थानिक वेळ व हवामान आपोआप ओळखतो.",
  welcomePrefix: "नमस्कार,",
  stressAlertTitle: "रात्रीच्या उष्णतेचा इशारा",
  stressAlertDesc: "पिकाला ताण संरक्षणाची गरज आहे. जैविक फवारणी करा.",
  recommendationTitle: "शिफारस केलेले औषध",
  voiceGreeting: "नमस्कार शेतकरी दादा! तुमच्या पिकावर रात्रीच्या उष्णतेचा ताण आढळला आहे. सिंजेंटा स्ट्रेस बस्टरचा फवारा द्या.",

  fieldCommandCenter: "आसरा शेत कमांड सेंटर",
  welcomeUser: "आसरा मध्ये आपले स्वागत आहे",
  activeFieldLabel: "सक्रिय शेत",
  locationLabel: "स्थान",
  openAiAssistant: "AI सहाय्यक उघडा",
  collapseAssistant: "सहाय्यक बंद करा",
  exploreEngine: "इंजिन पाहा",
  viewMapLayers: "नकाशा स्तर पाहा",
  calculateRobi: "ROBI मोजा",
  runSimulation: "सिम्युलेशन चालवा",
  liveTelemetryTitle: "थेट हवामान माहिती",
  nightHeatStressWarning: "रात्रीच्या उष्णतेचा ताण इशारा",
  plantHealthAI: "पीक आरोग्य AI",
  voiceAdvisory: "आवाज सल्ला",
  weatherSensors: "हवामान सेन्सर्स",
  whatIfSim: "सिम्युलेटर",
  robiProof: "ROBI पुरावा",

  assistantBadge: "बहुभाषिक आवाज आणि कॅमेरा स्कॅनर",
  askAasraTitle: "आसरा AI आवाज आणि पान स्कॅनर",
  askAasraDesc: "आपल्या भाषेत बोला किंवा पानाचा फोटो पाठवून त्वरित निदान मिळवा.",
  quickLanguageLabel: "त्वरित भाषा:",
  tryAskingLabel: "विचारून पहा:",
  sampleQ1: "सोयाबीन उष्णता ताण उपाय?",
  sampleQ2: "Quantis औषध कधी फवारावे?",
  sampleQ3: "पाने पिवळी का पडत आहेत?",
  sampleQ4: "पावसाचा अंदाज काय आहे?",
  sampleQ5: "पुढील १४ दिवसांचे हवामान",
  liveFieldTelemetry: "थेट शेताची माहिती",
  chatWelcome: "नमस्कार! मी आसरा आहे — तुमचा AI शेतकरी साथी. विचारा मला!",
  chatPlaceholder: "पिकाबद्दल किंवा फवारणीबद्दल विचारा...",
  listenLabel: "ऐकत आहे...",
  speakingLabel: "बोलत आहे...",
  processingLabel: "विश्लेषण चालू आहे...",

  footerRights: "© २०२६ आसरा. सर्व हक्क सुरक्षित.",
  footerPlatform: "प्लॅटफॉर्म",
  footerFarmers: "शेतकरी",
  footerAccount: "खाते",
};

const PA_DICT: Partial<TranslationDict> = {
  brandName: "ਆਸਰਾ",
  tagline: "ਤੁਹਾਡੀ ਫਸਲ ਦਾ ਪਿਆਰਾ AI ਸਾਥੀ",
  navDashboard: "ਮੇਰਾ ਖੇਤ",
  navAdvisory: "AI ਸਲਾਹ",
  navRobi: "ਕਮਾਈ ਅਤੇ ਬਚਤ",
  navWeather: "ਮੌਸਮ ਤੇ ਨਕਸ਼ਾ",
  navProfile: "ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ",
  navWhatIf: "ਸਿਮੂਲੇਟਰ",
  navJournal: "ਕਾਰਵਾਈ ਡਾਇਰੀ",
  navLogin: "ਲੌਗਇਨ",
  navGetStarted: "ਸ਼ੁਰੂ ਕਰੋ",
  navPlantAi: "ਫਸਲ ਸਿਹਤ AI",
  navFields: "ਖੇਤ ਤੇ ਨਕਸ਼ਾ",
  navLogout: "ਲੌਗਆਉਟ",
  selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",

  heroBadge: "100% ਮੌਸਮ-ਪ੍ਰਮਾਣਿਤ ਫਸਲ ਸੁਰੱਖਿਆ ਤੇ ਜੈਵਿਕ ਵਿਗਿਆਨ",
  heroTitle1: "ਤੁਹਾਡੀ ਫਸਲ ਦਾ",
  heroTitle2: "ਭਰੋਸੇਮੰਦ AI ਸਾਥੀ",
  heroSubtitle: "ਆਸਰਾ ਮੌਸਮ ਦੀ ਮਾਰ ਤੋਂ ਤੁਹਾਡੀ ਫਸਲ ਦੀ ਰੱਖਿਆ ਕਰਦਾ ਹੈ ਅਤੇ ਮੁਨਾਫਾ ਵਧਾਉਂਦਾ ਹੈ।",
  trustQuote: "ਤੁਹਾਡੀ ਮਿਹਨਤ, ਸਾਡੀ ਜ਼ਿੰਮੇਵਾਰੀ।",
  btnStartFarm: "ਖੇਤ ਸ਼ੁਰੂ ਕਰੋ",
  btnExploreMap: "ਮੌਸਮ ਨਕਸ਼ਾ ਵੇਖੋ",
  voiceTitle: "ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਆਸਰਾ ਨਾਲ ਗੱਲ ਕਰੋ",
  voiceDesc: "ਕਿਸਾਨ ਆਪਣੀ ਆਵਾਜ਼ ਵਿੱਚ ਸਵਾਲ ਪੁੱਛਦੇ ਹਨ ਅਤੇ ਆਸਰਾ ਬੋਲ ਕੇ ਜਵਾਬ ਦਿੰਦਾ ਹੈ।",
  btnPlayVoice: "🎙️ ਭਾਰਤੀ AI ਆਵਾਜ਼ ਸੁਣੋ",
  btnStopVoice: "⏹ ਆਵਾਜ਼ ਬੰਦ ਕਰੋ",
  robiTitle: "ਆਪਣੀ ਵਾਧੂ ਕਮਾਈ ਮਾਪੋ",
  robiDesc: "ਸਿੰਜੈਂਟਾ ਜੈਵਿਕ ਉਤਪਾਦਾਂ ਨਾਲ ਵਾਧੂ ਝਾੜ ਅਤੇ ਬਚਤ ਵੇਖੋ।",
  extraYieldLabel: "ਵਾਧੂ ਝਾੜ",
  netProfitLabel: "ਸ਼ੁੱਧ ਵਾਧੂ ਕਮਾਈ",
  robiRatioLabel: "ਮੁਨਾਫਾ ਅਨੁਪਾਤ",
  mapTitle: "ਮੌਸਮ ਨਕਸ਼ਾ",
  mapDesc: "ਲਾਈਵ ਮੌਸਮ ਅਤੇ ਖੇਤਾਂ ਦਾ ਨਕਸ਼ਾ।",
  welcomePrefix: "ਜੀ ਆਇਆਂ ਨੂੰ,",
  stressAlertTitle: "ਤਾਪਮਾਨ ਚੇਤਾਵਨੀ",
  stressAlertDesc: "ਫਸਲ ਨੂੰ ਜੈਵਿਕ ਸੁਰੱਖਿਆ ਦੀ ਲੋੜ ਹੈ।",
  recommendationTitle: "ਸਿਫਾਰਸ਼ ਕੀਤਾ ਉਤਪਾਦ",
  voiceGreeting: "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਤੁਹਾਡੀ ਫਸਲ ਲਈ ਮੌਸਮ ਅਨੁਸਾਰ ਜੈਵਿਕ ਸਪ੍ਰੇ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।",

  fieldCommandCenter: "ਆਸਰਾ ਖੇਤ ਕਮਾਂਡ ਸੈਂਟਰ",
  welcomeUser: "ਆਸਰਾ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ",
  activeFieldLabel: "ਸਰਗਰਮ ਖੇਤ",
  locationLabel: "ਸਥਾਨ",
  openAiAssistant: "AI ਸਹਾਇਕ ਖੋਲ੍ਹੋ",
  collapseAssistant: "ਸਹਾਇਕ ਬੰਦ ਕਰੋ",
  exploreEngine: "ਇੰਜਨ ਵੇਖੋ",
  viewMapLayers: "ਨਕਸ਼ੇ ਦੀਆਂ ਪਰਤਾਂ",
  calculateRobi: "ROBI ਗਿਣੋ",
  runSimulation: "ਸਿਮੂਲੇਸ਼ਨ ਚਲਾਓ",
  liveTelemetryTitle: "ਲਾਈਵ ਮੌਸਮ ਡੇਟਾ",
  nightHeatStressWarning: "ਰਾਤ ਦੀ ਗਰਮੀ ਤਣਾਅ ਚੇਤਾਵਨੀ",
  plantHealthAI: "ਫਸਲ ਸਿਹਤ AI",
  voiceAdvisory: "ਆਵਾਜ਼ ਸਲਾਹ",
  weatherSensors: "ਮੌਸਮ ਸੈਂਸਰ",
  whatIfSim: "ਸਿਮੂਲੇਟਰ",
  robiProof: "ROBI ਸਬੂਤ",

  assistantBadge: "ਬਹੁਭਾਸ਼ਾਈ ਆਵਾਜ਼ ਅਤੇ ਕੈਮਰਾ ਸਕੈਨਰ",
  askAasraTitle: "ਆਸਰਾ AI ਆਵਾਜ਼ ਅਤੇ ਪੱਤਾ ਸਕੈਨਰ",
  askAasraDesc: "ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲੋ ਜਾਂ ਪੱਤੇ ਦੀ ਫੋਟੋ ਭੇਜ ਕੇ ਇਲਾਜ ਪੁੱਛੋ।",
  quickLanguageLabel: "ਤੁਰੰਤ ਭਾਸ਼ਾ:",
  tryAskingLabel: "ਪੁੱਛ ਕੇ ਵੇਖੋ:",
  sampleQ1: "ਸੋਇਆਬੀਨ ਗਰਮੀ ਤਣਾਅ ਦਾ ਇਲਾਜ?",
  sampleQ2: "Quantis ਸਪ੍ਰੇ ਕਦੋਂ ਕਰੀਏ?",
  sampleQ3: "ਪੱਤੇ ਪੀਲੇ ਕਿਉਂ ਪੈ ਰਹੇ ਹਨ?",
  sampleQ4: "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਕੀ ਹੈ?",
  sampleQ5: "14 ਦਿਨਾਂ ਦਾ ਮੌਸਮ ਪੂਰਵ-ਅਨੁਮਾਨ",
  liveFieldTelemetry: "ਲਾਈਵ ਖੇਤ ਡੇਟਾ",
  chatWelcome: "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਮੈਂ ਆਸਰਾ ਹਾਂ — ਤੁਹਾਡਾ AI ਖੇਤੀ ਸਾਥੀ। ਪੁੱਛੋ!",
  chatPlaceholder: "ਫਸਲ ਜਾਂ ਸਪ੍ਰੇ ਬਾਰੇ ਪੁੱਛੋ...",
  listenLabel: "ਸੁਣ ਰਿਹਾ ਹਾਂ...",
  speakingLabel: "ਬੋਲ ਰਿਹਾ ਹਾਂ...",
  processingLabel: "ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...",

  footerRights: "© 2026 ਆਸਰਾ। ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ।",
  footerPlatform: "ਪਲੇਟਫਾਰਮ",
  footerFarmers: "ਕਿਸਾਨ",
  footerAccount: "ਖਾਤਾ",
};

const GU_DICT: Partial<TranslationDict> = {
  brandName: "આશરા",
  tagline: "તમારા પાકનો પ્રેમાળ AI સાથી",
  navDashboard: "મારું ખેતર",
  navAdvisory: "AI સલાહ",
  navRobi: "કમણી અને બચત",
  navWeather: "હવામાન અને નકશો",
  navProfile: "મારી પ્રોફાઇલ",
  navWhatIf: "પરિણામ સિમ્યુલેટર",
  navJournal: "ડાયરી",
  navLogin: "લોગિન",
  navGetStarted: "શરૂ કરો",
  navPlantAi: "પાક આરોગ્ય AI",
  navFields: "ખેતર અને નકશો",
  navLogout: "લોગઆઉટ",
  selectLanguage: "ભાષા પસંદ કરો",

  heroBadge: "100% હવામાન-ચકાસાયેલ પાક સુરક્ષા અને જૈવિક વિજ્ઞાન",
  heroTitle1: "તમારા પાકનો",
  heroTitle2: "વિશ્વસનીય AI સાથી",
  heroSubtitle: "આશરા હવામાનના જોખમોથી તમારા પાકનું રક્ષણ કરે છે અને કમાણી વધારે છે.",
  trustQuote: "તમારી મહેનત, અમારી જવાબદારી.",
  btnStartFarm: "મારું ખેતર શરૂ કરો",
  btnExploreMap: "હવામાન નકશો જુઓ",
  voiceTitle: "તમારી ભારતીય ભાષામાં વાત કરો",
  voiceDesc: "ખેડૂતો પોતાની બોલીમાં સવાલ પૂછે છે અને આશરા અવાજમાં જવાબ આપે છે.",
  btnPlayVoice: "🎙️ ભારતીય AI અવાજ સાંભળો",
  btnStopVoice: "⏹ અવાજ બંધ કરો",
  robiTitle: "તમારી વધારાની કમાણી માપો",
  robiDesc: "સિન્જેન્ટા બાયોલોજિકલ પ્રોડક્ટ્સથી વધારાની ઉપજ અને ચોખ્ખી બચત જુઓ.",
  extraYieldLabel: "વધારાની ઉપજ",
  netProfitLabel: "ચોખ્ખી વધારાની કમાણી",
  robiRatioLabel: "નફા નો રેશિયો",
  mapTitle: "હવામાન નકશો",
  mapDesc: "લાઈવ હવામાન અને ખેતરનો નકશો.",
  welcomePrefix: "નમસ્તે,",
  stressAlertTitle: "તાપમાન ચેતવણી",
  stressAlertDesc: "પાકને બાયોલોજિકલ સુરક્ષાની જરૂર છે.",
  recommendationTitle: "ભલામણ કરેલ દવા",
  voiceGreeting: "નમસ્તે ખેડૂત ભાઈ! તમારા પાક માટે હવામાન મુજબ જૈવિક દવાનો છંટકાવ કરવાની ભલામણ કરવામાં આવે છે.",

  fieldCommandCenter: "આશરા ખેતર કમાન્ડ સેન્ટર",
  welcomeUser: "આશરામાં આપનું સ્વાગત છે",
  activeFieldLabel: "સક્રિય ખેતર",
  locationLabel: "સ્થળ",
  openAiAssistant: "AI સહાયક ખોલો",
  collapseAssistant: "સહાયક બંધ કરો",
  exploreEngine: "એન્જિન જુઓ",
  viewMapLayers: "નકશા સ્તરો",
  calculateRobi: "ROBI ગણો",
  runSimulation: "સિમ્યુલેશન ચલાવો",
  liveTelemetryTitle: "લાઈવ હવામાન ડેટા",
  nightHeatStressWarning: "રાત્રી ગરમી તણાવ ચેતવણી",
  plantHealthAI: "પાક આરોગ્ય AI",
  voiceAdvisory: "અવાજ સલાહ",
  weatherSensors: "હવામાન સેન્સર્સ",
  whatIfSim: "સિમ્યુલેટર",
  robiProof: "ROBI પુરાવો",

  assistantBadge: "બહુભાષી અવાજ અને પાન સ્કેનર",
  askAasraTitle: "આશરા AI અવાજ અને પાન સ્કેનર",
  askAasraDesc: "તમારી ભાષામાં બોલો અથવા પાનનો ફોટો મોકલીને તુરંત નિદાન મેળવો.",
  quickLanguageLabel: "ઝડપી ભાષા:",
  tryAskingLabel: "પૂછી જુઓ:",
  sampleQ1: "સોયાબીનમાં ગરમી તણાવ ઉપાય?",
  sampleQ2: "Quantis ક્યારે છાંટવું?",
  sampleQ3: "પાન પીળા કેમ પડે છે?",
  sampleQ4: "વરસાદની શક્યતા શું છે?",
  sampleQ5: "14 દિવસની આગાહી",
  liveFieldTelemetry: "લાઈવ ખેતર માહિતી",
  chatWelcome: "નમસ્તે! હું આશરા છું — તમારો AI ખેડૂત મિત્ર. પૂછો!",
  chatPlaceholder: "પાક અથવા છંટકાવ વિશે પૂછો...",
  listenLabel: "સાંભળું છું...",
  speakingLabel: "બોલી રહ્યો છું...",
  processingLabel: "વિશ્લેષણ ચાલુ છે...",

  footerRights: "© 2026 આશરા. સર્વાધિકાર સુરક્ષિત.",
  footerPlatform: "પ્લેટફોર્મ",
  footerFarmers: "ખેડૂતો",
  footerAccount: "ખાતું",
};

const TE_DICT: Partial<TranslationDict> = {
  brandName: "ఆసరా",
  tagline: "మీ పంటకు అత్యంత ప్రేమాస్పద AI సహాయకుడు",
  navDashboard: "నా పొలం",
  navAdvisory: "AI సలహా",
  navRobi: "ఆదాయం & పొదుపు",
  navWeather: "వాతావరణం & మ్యాప్",
  navProfile: "నా ప్రొఫైల్",
  navWhatIf: "ఫలిత సిమ్యులేటర్",
  navJournal: "చర్యల డైరీ",
  navLogin: "లాగిన్",
  navGetStarted: "ప్రారంభించండి",
  navPlantAi: "పంట ఆరోగ్యం AI",
  navFields: "పొలాలు & మ్యాప్",
  navLogout: "లాగౌట్",
  selectLanguage: "భాషను ఎంచుకోండి",

  heroBadge: "100% వాతావరణ ధృవీకరించబడిన పంట రక్షణ & జీవ విజ్ఞానం",
  heroTitle1: "మీ పంటకు అత్యంత",
  heroTitle2: "నమ్మకమైన AI సహాయకుడు",
  heroSubtitle: "ఆసరా వాతావరణ మార్పుల నుండి మీ పంటను రక్షిస్తుంది మరియు లాభాలను పెంచుతుంది.",
  trustQuote: "మీ కష్టం, మా బాధ్యత.",
  btnStartFarm: "నా పొలాన్ని ప్రారంభించు",
  btnExploreMap: "వాతావరణ మ్యాప్ చూడండి",
  voiceTitle: "మీ భారతీయ భాషలోనే మాట్లాడండి",
  voiceDesc: "రైతులు తమ వాయిస్‌తో ప్రశ్నలు అడగవచ్చు, ఆసరా తిరిగి మాట్లాడి సమాధానం ఇస్తుంది.",
  btnPlayVoice: "🎙️ భారతీయ AI వాయిస్ వినండి",
  btnStopVoice: "⏹ ఆపు",
  robiTitle: "మీ అదనపు లాభాన్ని కొలవండి",
  robiDesc: "సింజెంటా ఉత్పత్తులతో లభించే అదనపు దిగుబడి మరియు నికర పొదుపును చూడండి.",
  extraYieldLabel: "అదనపు దిగుబడి",
  netProfitLabel: "నికర అదనపు ఆదాయం",
  robiRatioLabel: "లాభ నిష్పత్తి",
  mapTitle: "వాతావరణ మ్యాప్",
  mapDesc: "లైవ్ వాతావరణం మరియు పొలం మ్యాప్.",
  welcomePrefix: "నమస్కారం,",
  stressAlertTitle: "ఉష్ణోగ్రత హెచ్చరిక",
  stressAlertDesc: "పంటకు బయోలాజికల్ రక్షణ అవసరం.",
  recommendationTitle: "సిఫార్సు చేయబడిన మందు",
  voiceGreeting: "నమస్కారం రైతు సోదరా! మీ పంట కోసం వాతావరణానికి తగిన జీవ మందు పిచికారీ సిఫార్సు చేయబడింది.",

  fieldCommandCenter: "ఆసరా పొలం కమాండ్ సెంటర్",
  welcomeUser: "ఆసరాకు స్వాగతం",
  activeFieldLabel: "ప్రస్తుత పొలం",
  locationLabel: "ప్రాంతం",
  openAiAssistant: "AI సహాయకుడిని తెరవండి",
  collapseAssistant: "సహాయకుడిని మూసివేయండి",
  exploreEngine: "ఇంజిన్ చూడండి",
  viewMapLayers: "మ్యాప్ లేయర్లు",
  calculateRobi: "ROBI లెక్కించండి",
  runSimulation: "సిమ్యులేషన్ రన్ చేయండి",
  liveTelemetryTitle: "లైవ్ వాతావరణ వివరాలు",
  nightHeatStressWarning: "రాత్రి వేడి ఒత్తిడి హెచ్చరిక",
  plantHealthAI: "పంట ఆరోగ్యం AI",
  voiceAdvisory: "వాయిస్ సలహా",
  weatherSensors: "వాతావరణ సెన్సార్లు",
  whatIfSim: "సిమ్యులేటర్",
  robiProof: "ROBI రుజువు",

  assistantBadge: "బహుభాషా వాయిస్ & ఆకు స్కానర్",
  askAasraTitle: "ఆసరా AI వాయిస్ & ఆకు స్కానర్",
  askAasraDesc: "మీ భాషలో మాట్లాడండి లేదా ఆకు ఫోటో తీసి వెంటనే రోగ నిర్ధారణ పొందండి.",
  quickLanguageLabel: "త్వరిత భాష:",
  tryAskingLabel: "ఇలా అడగండి:",
  sampleQ1: "సోయాబీన్ వేడి ఒత్తిడి నివారణ?",
  sampleQ2: "Quantis ఎప్పుడు పిచికారీ చేయాలి?",
  sampleQ3: "ఆకులు ఎందుకు పసుపు రంగులోకి మారుతున్నాయి?",
  sampleQ4: "వర్షం పడే అవకాశం ఎంత?",
  sampleQ5: "14 రోజుల వాతావరణ సూచన",
  liveFieldTelemetry: "లైవ్ పొలం సమాచారం",
  chatWelcome: "నమస్కారం! నేను ఆసరా — మీ AI రైతు మిత్రుడిని. అడగండి!",
  chatPlaceholder: "పంట లేదా పిచికారీ గురించి అడగండి...",
  listenLabel: "వింటున్నాను...",
  speakingLabel: "మాట్లాడుతున్నాను...",
  processingLabel: "విశ్లేషిస్తున్నాను...",

  footerRights: "© 2026 ఆసరా. సర్వహక్కులు ప్రత్యేకించబడ్డాయి.",
  footerPlatform: "ప్లాట్‌ఫారమ్",
  footerFarmers: "రైతులు",
  footerAccount: "ఖాతా",
};

const TA_DICT: Partial<TranslationDict> = {
  brandName: "ஆஸ்ரா",
  tagline: "உங்கள் பயிரின் பாசமிகு AI தோழன்",
  navDashboard: "என் நிலம்",
  navAdvisory: "AI ஆலோசனை",
  navRobi: "வருமானம் & சேமிப்பு",
  navWeather: "வானிலை & வரைபடம்",
  navProfile: "என் சுயவிவரம்",
  navWhatIf: "சிமுலேட்டர்",
  navJournal: "டைரி",
  navLogin: "உள்நுழை",
  navGetStarted: "தொடங்குங்கள்",
  navPlantAi: "பயிர் நலம் AI",
  navFields: "நிலங்கள் & வரைபடம்",
  navLogout: "வெளியேறு",
  selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",

  heroBadge: "100% வானிலை சரிபார்க்கப்பட்ட பயிர் பாதுகாப்பு & உயிரியல் அறிவியல்",
  heroTitle1: "உங்கள் பயிரின்",
  heroTitle2: "நம்பகமான AI தோழன்",
  heroSubtitle: "ஆஸ்ரா உங்கள் பயிரை வெப்ப பாதிப்பிலிருந்து பாதுகாத்து கூடுதல் லாபத்தை உறுதி செய்கிறது.",
  trustQuote: "உங்கள் உழைப்பு, எங்கள் பொறுப்பு.",
  btnStartFarm: "என் நிலத்தைத் தொடங்கு",
  btnExploreMap: "வானிலை வரைபடத்தைப் பார்",
  voiceTitle: "உங்கள் தாய்மொழியில் பேசுங்கள்",
  voiceDesc: "விவசாயிகள் குரல் மூலம் கேள்வி கேட்கலாம், ஆஸ்ரா குரலில் தெளிவான ஆலோசனையை வழங்கும்.",
  btnPlayVoice: "🎙️ இந்திய AI குரலைக் கேளுங்கள்",
  btnStopVoice: "⏹ குரலை நிறுத்து",
  robiTitle: "உங்கள் கூடுதல் லாபத்தைக் கணக்கிடுங்கள்",
  robiDesc: "சின்ஜென்டா உயிரியல் தயாரிப்புகளால் கிடைக்கும் கூடுதல் மகசூல் மற்றும் நிகர சேமிப்பைக் காண்க.",
  extraYieldLabel: "கூடுதல் மகசூல்",
  netProfitLabel: "நிகர கூடுதல் வருமானம்",
  robiRatioLabel: "லாப விகிதம்",
  mapTitle: "வானிலை வரைபடம்",
  mapDesc: "நேரடி வானிலை மற்றும் நில வரைபடம்.",
  welcomePrefix: "வணக்கம்,",
  stressAlertTitle: "வெப்பநிலை எச்சரிக்கை",
  stressAlertDesc: "பயிருக்கு உயிரியல் பாதுகாப்பு தேவை.",
  recommendationTitle: "பரிந்துரைக்கப்பட்ட மருந்து",
  voiceGreeting: "வணக்கம் விவசாய நண்பரே! உங்கள் பயிருக்கு தகுந்த உயிரியல் மருந்து தெளிக்க பரிந்துரைக்கப்படுகிறது.",

  fieldCommandCenter: "ஆஸ்ரா நில கட்டளை மையம்",
  welcomeUser: "ஆஸ்ராவிற்கு நல்வரவு",
  activeFieldLabel: "செயலில் உள்ள நிலம்",
  locationLabel: "இடம்",
  openAiAssistant: "AI உதவியாளரைத் திற",
  collapseAssistant: "உதவியாளரை மூடு",
  exploreEngine: "இன்ஜினைப் பார்",
  viewMapLayers: "வரைபட அடுக்குகள்",
  calculateRobi: "ROBI கணக்கிடு",
  runSimulation: "சிமுலேஷன் இயக்கு",
  liveTelemetryTitle: "நேரடி வானிலை தகவல்",
  nightHeatStressWarning: "இரவு வெப்ப அழுத்த எச்சரிக்கை",
  plantHealthAI: "பயிர் நலம் AI",
  voiceAdvisory: "குரல் ஆலோசனை",
  weatherSensors: "வானிலை சென்சார்கள்",
  whatIfSim: "சிமுலேட்டர்",
  robiProof: "ROBI ஆதாரம்",

  assistantBadge: "பன்மொழி குரல் மற்றும் இலை ஸ்கேனர்",
  askAasraTitle: "ஆஸ்ரா AI குரல் மற்றும் இலை ஸ்கேனர்",
  askAasraDesc: "உங்கள் மொழியில் பேசுங்கள் அல்லது இலையை படம் பிடித்து உடனடி தீர்வு பெறுங்கள்.",
  quickLanguageLabel: "விரைவு மொழி:",
  tryAskingLabel: "கேட்டுப் பாருங்கள்:",
  sampleQ1: "சோயாபீன் வெப்ப அழுத்த சிகிச்சை?",
  sampleQ2: "Quantis எப்போது தெளிக்க வேண்டும்?",
  sampleQ3: "இலைகள் ஏன் மஞ்சள் நிறமாக மாறுகின்றன?",
  sampleQ4: "மழைக்கான வாய்ப்பு என்ன?",
  sampleQ5: "14 நாள் வானிலை முன்னறிவிப்பு",
  liveFieldTelemetry: "நேரடி நிலத் தகவல்",
  chatWelcome: "வணக்கம்! நான் ஆஸ்ரா — உங்கள் AI விவசாய தோழன். கேளுங்கள்!",
  chatPlaceholder: "பயிர் அல்லது தெளிப்பு பற்றி கேளுங்கள்...",
  listenLabel: "கேட்கிறது...",
  speakingLabel: "பேசுகிறது...",
  processingLabel: "பகுப்பாய்வு செய்கிறது...",

  footerRights: "© 2026 ஆஸ்ரா. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
  footerPlatform: "தளம்",
  footerFarmers: "விவசாயிகள்",
  footerAccount: "கணக்கு",
};

const KN_DICT: Partial<TranslationDict> = {
  brandName: "ಆಸ್ರಾ",
  tagline: "ನಿಮ್ಮ ಬೆಳೆಯ ಅತ್ಯಂತ ಪ್ರೀತಿಯ AI ಒಡನಾಡಿ",
  navDashboard: "ನನ್ನ ಜಮೀನು",
  navAdvisory: "AI ಸಲಹೆ",
  navRobi: "ಆದಾಯ ಮತ್ತು ಉಳಿತಾಯ",
  navWeather: "ಹವಾಮಾನ & ನಕ್ಷೆ",
  navProfile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
  navWhatIf: "ಸಿಮ್ಯುಲೇಟರ್",
  navJournal: "ಡೈರಿ",
  navLogin: "ಲಾಗಿನ್",
  navGetStarted: "ಪ್ರಾರಂಭಿಸಿ",
  navPlantAi: "ಬೆಳೆ ಆರೋಗ್ಯ AI",
  navFields: "ಜಮೀನು & ನಕ್ಷೆ",
  navLogout: "ಲಾಗ್‌ಔಟ್",
  selectLanguage: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",

  heroBadge: "100% ಹವಾಮಾನ-ಪರಿಶೀಲಿಸಿದ ಬೆಳೆ ರಕ್ಷಣೆ & ಜೈವಿಕ ವಿಜ್ಞಾನ",
  heroTitle1: "ನಿಮ್ಮ ಬೆಳೆಯ",
  heroTitle2: "ವಿಶ್ವಾಸಾರ್ಹ AI ಒಡನಾಡಿ",
  heroSubtitle: "ಆಸ್ರಾ ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಹವಾಮಾನ ವೈಪರೀತ್ಯದಿಂದ ರಕ್ಷಿಸಿ ಹೆಚ್ಚಿನ ಲಾಭವನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.",
  trustQuote: "ನಿಮ್ಮ ಶ್ರಮ, ನಮ್ಮ ಜವಾಬ್ದಾರಿ.",
  btnStartFarm: "ಜಮೀನು ಆರಂಭಿಸಿ",
  btnExploreMap: "ಹವಾಮಾನ ನಕ್ಷೆ ನೋಡಿ",
  voiceTitle: "ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲೇ ಮಾತನಾಡಿ",
  voiceDesc: "ರೈತರು ಧ್ವನಿಯಲ್ಲೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು, ಆಸ್ರಾ ಧ್ವನಿಯಲ್ಲೇ ಸ್ಪಷ್ಟ ಉತ್ತರ ನೀಡುತ್ತದೆ.",
  btnPlayVoice: "🎙️ ಧ್ವನಿ ಸಲಹೆ ಕೇಳಿ",
  btnStopVoice: "⏹ ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
  robiTitle: "ಹೆಚ್ಚುವರಿ ಲಾಭವನ್ನು ಲೆಕ್ಕಹಾಕಿ",
  robiDesc: "ಸಿಂಜೆಂಟಾ ಜೈವಿಕ ಉತ್ಪನ್ನಗಳಿಂದ ಬರುವ ಹೆಚ್ಚುವರಿ ಇಳುವರಿ ಮತ್ತು ಉಳಿತಾಯ ನೋಡಿ.",
  extraYieldLabel: "ಹೆಚ್ಚುವರಿ ಇಳುವರಿ",
  netProfitLabel: "ನಿವ್ವಳ ಹೆಚ್ಚುವರಿ ಆದಾಯ",
  robiRatioLabel: "ಲಾಭದ ಅನುಪಾತ",
  mapTitle: "ಹವಾಮಾನ ನಕ್ಷೆ",
  mapDesc: "ಲೈವ್ ಹವಾಮಾನ ಮತ್ತು ಜಮೀನಿನ ನಕ್ಷೆ.",
  welcomePrefix: "ನಮಸ್ಕಾರ,",
  stressAlertTitle: "ತಾಪಮಾನ ಎಚ್ಚರಿಕೆ",
  stressAlertDesc: "ಬೆಳೆಗೆ ಜೈವಿಕ ರಕ್ಷಣೆಯ ಅಗತ್ಯವಿದೆ.",
  recommendationTitle: "ಶಿಫಾರಸು ಮಾಡಿದ ಔಷಧಿ",
  voiceGreeting: "ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ನಿಮ್ಮ ಬೆಳೆಗೆ ಸೂಕ್ತ ಜೈವಿಕ ಸಿಂಪಡಣೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",

  fieldCommandCenter: "ಆಸ್ರಾ ಜಮೀನು ಕಮಾಂಡ್ ಸೆಂಟರ್",
  welcomeUser: "ಆಸ್ರಾಗೆ ಸುಸ್ವಾಗತ",
  activeFieldLabel: "ಸಕ್ರಿಯ ಜಮೀನು",
  locationLabel: "ಸ್ಥಳ",
  openAiAssistant: "AI ಸಹಾಯಕರನ್ನು ತೆರೆಯಿರಿ",
  collapseAssistant: "ಸಹಾಯಕರನ್ನು ಮುಚ್ಚಿ",
  exploreEngine: "ಎಂಜಿನ್ ನೋಡಿ",
  viewMapLayers: "ನಕ್ಷೆಯ ಪದರಗಳು",
  calculateRobi: "ROBI ಲೆಕ್ಕಹಾಕಿ",
  runSimulation: "ಸಿಮ್ಯುಲೇಶನ್ ಚಲಾಯಿಸಿ",
  liveTelemetryTitle: "ಲೈವ್ ಹವಾಮಾನ ಮಾಹಿತಿ",
  nightHeatStressWarning: "ರಾತ್ರಿ ಶಾಖದ ಒತ್ತಡದ ಎಚ್ಚರಿಕೆ",
  plantHealthAI: "ಬೆಳೆ ಆರೋಗ್ಯ AI",
  voiceAdvisory: "ಧ್ವನಿ ಸಲಹೆ",
  weatherSensors: "ಹವಾಮಾನ ಸಂವೇದಕಗಳು",
  whatIfSim: "ಸಿಮ್ಯುಲೇಟರ್",
  robiProof: "ROBI ಪುರಾವೆ",

  assistantBadge: "ಬಹುಭಾಷಾ ಧ್ವನಿ & ಎಲೆ ಸ್ಕ್ಯಾನರ್",
  askAasraTitle: "ಆಸ್ರಾ AI ಧ್ವನಿ & ಎಲೆ ಸ್ಕ್ಯಾನರ್",
  askAasraDesc: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು ತಕ್ಷಣ ರೋಗನಿರ್ಣಯ ಪಡೆಯಿರಿ.",
  quickLanguageLabel: "ತ್ವರಿತ ಭಾಷೆ:",
  tryAskingLabel: "ಕೇಳಿ ನೋಡಿ:",
  sampleQ1: "ಸೋಯಾಬೀನ್ ಶಾಖ ಒತ್ತಡದ ಪರಿಹಾರ?",
  sampleQ2: "Quantis ಯಾವಾಗ ಸಿಂಪಡಿಸಬೇಕು?",
  sampleQ3: "ಎಲೆಗಳು ಏಕೆ ಹಳದಿಯಾಗುತ್ತಿವೆ?",
  sampleQ4: "ಮಳೆಯ ಸಂಭವನೀಯತೆ ಏನು?",
  sampleQ5: "14 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
  liveFieldTelemetry: "ಲೈವ್ ಜಮೀನಿನ ಮಾಹಿತಿ",
  chatWelcome: "ನಮಸ್ಕಾರ! ನಾನು ಆಸ್ರಾ — ನಿಮ್ಮ AI ರೈತ ಮಿತ್ರ. ಕೇಳಿ!",
  chatPlaceholder: "ಬೆಳೆ ಅಥವಾ ಸಿಂಪಡಣೆಯ ಬಗ್ಗೆ ಕೇಳಿ...",
  listenLabel: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...",
  speakingLabel: "ಮಾತನಾಡುತ್ತಿದೆ...",
  processingLabel: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",

  footerRights: "© 2026 ಆಸ್ರಾ. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
  footerPlatform: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್",
  footerFarmers: "ರೈತರು",
  footerAccount: "ಖಾತೆ",
};

const BN_DICT: Partial<TranslationDict> = {
  brandName: "আসরা",
  tagline: "আপনার ফসলের সবচেয়ে বিশ্বস্ত AI সঙ্গী",
  navDashboard: "আমার জমি",
  navAdvisory: "AI পরামর্শ",
  navRobi: "আয় ও সঞ্চয়",
  navWeather: "আবহাওয়া ও মানচিত্র",
  navProfile: "আমার প্রোফাইল",
  navWhatIf: "ফলাফল সিমুলেটর",
  navJournal: "ডায়েরি",
  navLogin: "লগইন",
  navGetStarted: "শুরু করুন",
  navPlantAi: "ফসল স্বাস্থ্য AI",
  navFields: "জমি ও মানচিত্র",
  navLogout: "লগআউট",
  selectLanguage: "ভাষা নির্বাচন করুন",

  heroBadge: "১০০% আবহাওয়া-যাচাইকৃত ফসল সুরক্ষা ও জৈব বিজ্ঞান",
  heroTitle1: "আপনার ফসলের",
  heroTitle2: "সবচেয়ে বিশ্বস্ত AI সঙ্গী",
  heroSubtitle: "আসরা চরম আবহাওয়া থেকে ফসল রক্ষা করে এবং আপনার বাড়তি মুনাফা নিশ্চিত করে।",
  trustQuote: "আপনার পরিশ্রম, আমাদের দায়িত্ব।",
  btnStartFarm: "আমার জমি শুরু করুন",
  btnExploreMap: "আবহাওয়া মানচিত্র দেখুন",
  voiceTitle: "নিজের ভাষায় সরাসরি কথা বলুন",
  voiceDesc: "কৃষকরা কণ্ঠস্বরে প্রশ্ন করতে পারেন এবং আসরা বাংলায় স্পষ্ট পরামর্শ দেয়।",
  btnPlayVoice: "🎙️ বাংলা AI কণ্ঠে পরামর্শ শুনুন",
  btnStopVoice: "⏹ কণ্ঠ থামান",
  robiTitle: "আপনার বাড়তি লাভ হিসাব করুন",
  robiDesc: "সিনজেনটা জৈব সুরক্ষার মাধ্যমে অতিরিক্ত ফলন ও নিট সাশ্রয় দেখুন।",
  extraYieldLabel: "অতিরিক্ত ফলন",
  netProfitLabel: "নিট অতিরিক্ত আয়",
  robiRatioLabel: "মুনাফার অনুপাত",
  mapTitle: "আবহাওয়া মানচিত্র",
  mapDesc: "সরাসরি আবহাওয়া ও জমির মানচিত্র।",
  welcomePrefix: "নমস্কার,",
  stressAlertTitle: "তাপমাত্রার সতর্কতা",
  stressAlertDesc: "ফসলের জৈব সুরক্ষা প্রয়োজন।",
  recommendationTitle: "সুপারিশকৃত ওষুধ",
  voiceGreeting: "নমস্কার কৃষক ভাই! আপনার ফসলের জন্য জৈব স্প্রে ব্যবহারের সুপারিশ করা হচ্ছে।",

  fieldCommandCenter: "আসরা জমি কমান্ড সেন্টার",
  welcomeUser: "আসরায় স্বাগতম",
  activeFieldLabel: "বর্তমান জমি",
  locationLabel: "অবস্থান",
  openAiAssistant: "AI সহকারী খুলুন",
  collapseAssistant: "সহকারী বন্ধ করুন",
  exploreEngine: "ইঞ্জিন দেখুন",
  viewMapLayers: "মানচিত্রের স্তর",
  calculateRobi: "ROBI গণনা করুন",
  runSimulation: "সিমুলেশন চালান",
  liveTelemetryTitle: "লাইভ আবহাওয়া তথ্য",
  nightHeatStressWarning: "রাতের তাপমাত্রার চাপ সতর্কতা",
  plantHealthAI: "ফসল স্বাস্থ্য AI",
  voiceAdvisory: "কণ্ঠ পরামর্শ",
  weatherSensors: "আবহাওয়া সেন্সর",
  whatIfSim: "সিমুলেটর",
  robiProof: "ROBI প্রমাণ",

  assistantBadge: "বহুভাষী কণ্ঠ ও পাতা স্ক্যানার",
  askAasraTitle: "আসরা AI ভয়েস ও পাতা স্ক্যানার",
  askAasraDesc: "নিজের ভাষায় বলুন বা পাতার ছবি আপলোড করে তাৎক্ষণিক সমাধান পান।",
  quickLanguageLabel: "দ্রুত ভাষা:",
  tryAskingLabel: "জিজ্ঞাসা করুন:",
  sampleQ1: "সয়াবিনের তাপ চাপ প্রতিকার?",
  sampleQ2: "Quantis কখন স্প্রে করবেন?",
  sampleQ3: "পাতা হলুদ হচ্ছে কেন?",
  sampleQ4: "বৃষ্টির সম্ভাবনা কেমন?",
  sampleQ5: "১৪ দিনের আবহাওয়া পূর্বাভাস",
  liveFieldTelemetry: "জমির লাইভ তথ্য",
  chatWelcome: "নমস্কার! আমি আসরা — আপনার AI কৃষক বন্ধু। প্রশ্ন করুন!",
  chatPlaceholder: "ফসল বা স্প্রে সম্পর্কে জিজ্ঞাসা করুন...",
  listenLabel: "শুনছি...",
  speakingLabel: "বলছি...",
  processingLabel: "বিশ্লেষণ চলছে...",

  footerRights: "© ২০২৬ আসরা। সর্বস্বত্ব সংরক্ষিত।",
  footerPlatform: "প্ল্যাটফর্ম",
  footerFarmers: "কৃষক",
  footerAccount: "অ্যাকাউন্ট",
};

const ML_DICT: Partial<TranslationDict> = {
  brandName: "ആസ്ര",
  tagline: "നിങ്ങളുടെ വിളയുടെ ഏറ്റവും വിശ്വസ്തനായ AI സഹായി",
  navDashboard: "എന്റെ കൃഷിയിടം",
  navAdvisory: "AI ഉപദേശം",
  navRobi: "വരുമാനവും ലാഭവും",
  navWeather: "കാലാവസ്ഥ & മാപ്പ്",
  navProfile: "എന്റെ പ്രൊഫൈൽ",
  navWhatIf: "സിമുലേറ്റർ",
  navJournal: "ഡയറി",
  navLogin: "ലോഗിൻ",
  navGetStarted: "ആരംഭിക്കുക",
  navPlantAi: "വിള ആരോഗ്യം AI",
  navFields: "കൃഷിയിടം & മാപ്പ്",
  navLogout: "ലോഗൗട്ട്",
  selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക",

  heroBadge: "100% കാലാവസ്ഥ പരിശോധിച്ച വിള സംരക്ഷണം",
  heroTitle1: "നിങ്ങളുടെ വിളയുടെ",
  heroTitle2: "വിശ്വസ്തനായ AI സഹായി",
  heroSubtitle: "ആസ്ര കാലാവസ്ഥാ വ്യതിയാനങ്ങളിൽ നിന്ന് വിളകളെ സംരക്ഷിക്കുകയും ലാഭം ഉറപ്പാക്കുകയും ചെയ്യുന്നു.",
  trustQuote: "നിങ്ങളുടെ അധ്വാനം, ഞങ്ങളുടെ ഉത്തരവാദിത്തം.",
  btnStartFarm: "കൃഷിയിടം ആരംഭിക്കുക",
  btnExploreMap: "കാലാവസ്ഥ മാപ്പ് കാണുക",
  voiceTitle: "മലയാളത്തിൽ സംസാരിക്കുക",
  voiceDesc: "കർഷകർക്ക് ശബ്ദത്തിലൂടെ ചോദ്യങ്ങൾ ചോദിക്കാം, ആസ്ര ശബ്ദത്തിലൂടെ തന്നെ മറുപടി നൽകും.",
  btnPlayVoice: "🎙️ AI ശബ്ദോപദേശം കേൾക്കുക",
  btnStopVoice: "⏹ ശബ്ദം നിർത്തുക",
  robiTitle: "അധിക ലാഭം കണക്കാക്കുക",
  robiDesc: "സിഞ്ചന്റ ഉൽപ്പന്നങ്ങൾ വഴി ലഭിക്കുന്ന അധിക വിളവും ലാഭവും പരിശോധിക്കുക.",
  extraYieldLabel: "അധിക വിളവ്",
  netProfitLabel: "അധിക വരുമാനം",
  robiRatioLabel: "ലാഭ അനുപാതം",
  mapTitle: "കാലാവസ്ഥ മാപ്പ്",
  mapDesc: "തത്സമയ കാലാവസ്ഥയും കൃഷിയിട മാപ്പും.",
  welcomePrefix: "നമസ്കാരം,",
  stressAlertTitle: "താപനില മുന്നറിയിപ്പ്",
  stressAlertDesc: "വിളയ്ക്ക് ജൈവ സംരക്ഷണം ആവശ്യമാണ്.",
  recommendationTitle: "ശുപാർശ ചെയ്യുന്ന മരുന്ന്",
  voiceGreeting: "നമസ്കാരം കർഷക സുഹൃത്തേ! നിങ്ങളുടെ വിളയ്ക്കായി ജൈവ സ്പ്രേ ശുപാർശ ചെയ്യുന്നു.",

  fieldCommandCenter: "ആസ്ര കമാൻഡ് സെന്റർ",
  welcomeUser: "ആസ്രയിലേക്ക് സ്വാഗതം",
  activeFieldLabel: "നിലവിലെ കൃഷിയിടം",
  locationLabel: "സ്ഥലം",
  openAiAssistant: "AI സഹായിയെ തുറക്കുക",
  collapseAssistant: "സഹായിയെ ചെറുതാക്കുക",
  exploreEngine: "എഞ്ചിൻ കാണുക",
  viewMapLayers: "മാപ്പ് ലെയറുകൾ",
  calculateRobi: "ROBI കണക്കുകൂട്ടുക",
  runSimulation: "സിമുലേഷൻ പ്രവർത്തിപ്പിക്കുക",
  liveTelemetryTitle: "തത്സമയ കാലാവസ്ഥാ വിവരങ്ങൾ",
  nightHeatStressWarning: "രാത്രിയിലെ ചൂട് മുന്നറിയിപ്പ്",
  plantHealthAI: "വിള ആരോഗ്യം AI",
  voiceAdvisory: "ശബ്ദോപദേശം",
  weatherSensors: "കാലാവസ്ഥ സെൻസറുകൾ",
  whatIfSim: "സിമുലേറ്റർ",
  robiProof: "ROBI തെളിവ്",

  assistantBadge: "ശബ്ദ & ഇല സ്കാനർ",
  askAasraTitle: "ആസ്ര AI വോയ്സ് & ഇല സ്കാനർ",
  askAasraDesc: "നിങ്ങളുടെ ഭാഷയിൽ സംസാരിക്കുക അല്ലെങ്കിൽ ഇലയുടെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.",
  quickLanguageLabel: "ഭാഷ:",
  tryAskingLabel: "ചോദിച്ചു നോക്കൂ:",
  sampleQ1: "സോയാബീൻ ചൂട് സംരക്ഷണം?",
  sampleQ2: "Quantis എപ്പോൾ തളിക്കണം?",
  sampleQ3: "ഇലകൾ മഞ്ഞളിക്കുന്നത് എന്തുകൊണ്ട്?",
  sampleQ4: "മഴ സാധ്യത എന്താണ്?",
  sampleQ5: "14 ദിവസത്തെ കാലാവസ്ഥ",
  liveFieldTelemetry: "തത്സമയ വിവരങ്ങൾ",
  chatWelcome: "നമസ്കാരം! ഞാൻ ആസ്ര — നിങ്ങളുടെ AI കർഷക സഹായി. ചോദിക്കൂ!",
  chatPlaceholder: "വിളകളെക്കുറിച്ചോ മരുന്നുകളെക്കുറിച്ചോ ചോദിക്കൂ...",
  listenLabel: "കേൾക്കുന്നു...",
  speakingLabel: "സംസാരിക്കുന്നു...",
  processingLabel: "പരിശോധിക്കുന്നു...",

  footerRights: "© 2026 ആസ്ര. സർവ അവകാശങ്ങളും നിക്ഷിപ്തം.",
  footerPlatform: "പ്ലാറ്റ്‌ഫോം",
  footerFarmers: "കർഷകർ",
  footerAccount: "അക്കൗണ്ട്",
};

const OR_DICT: Partial<TranslationDict> = {
  brandName: "ଆସ୍ରା",
  tagline: "ଆପଣଙ୍କ ଫସଲର ବିଶ୍ୱସ୍ତ AI ସାଥୀ",
  navDashboard: "ମୋ ଜମି",
  navAdvisory: "AI ପରାମର୍ଶ",
  navRobi: "ଆୟ ଓ ସଞ୍ଚୟ",
  navWeather: "ପାଣିପାଗ ଓ ମାନଚିତ୍ର",
  navProfile: "ମୋ ପ୍ରୋଫାଇଲ",
  navWhatIf: "ସିମୁଲେଟର",
  navJournal: "ଡାଏରୀ",
  navLogin: "ଲଗଇନ",
  navGetStarted: "ଆରମ୍ଭ କରନ୍ତୁ",
  navPlantAi: "ଫସଲ ସ୍ୱାସ୍ଥ୍ୟ AI",
  navFields: "ଜମି ଓ ମାନଚିତ୍ର",
  navLogout: "ଲଗଆଉଟ",
  selectLanguage: "ଭାଷା ବାଛନ୍ତୁ",

  heroBadge: "100% ପାଣିପାଗ-ପ୍ରମାଣିତ ଫସଲ ସୁରକ୍ଷା ଓ ଜୈବ ବିଜ୍ଞାନ",
  heroTitle1: "ଆପଣଙ୍କ ଫସଲର",
  heroTitle2: "ବିଶ୍ୱସ୍ତ AI ସାଥୀ",
  heroSubtitle: "ଆସ୍ରା ପାଣିପାଗର ପ୍ରଭାବରୁ ଫସଲକୁ ରକ୍ଷା କରେ ଏବଂ ଅଧିକ ଲାଭ ସୁନିଶ୍ଚିତ କରେ।",
  trustQuote: "ଆପଣଙ୍କ ପରିଶ୍ରମ, ଆମ ଦାୟିତ୍ୱ।",
  btnStartFarm: "ମୋ ଜମି ଆରମ୍ଭ କରନ୍ତୁ",
  btnExploreMap: "ପାଣିପାଗ ମାନଚିତ୍ର ଦେଖନ୍ତୁ",
  voiceTitle: "ନିଜ ଭାଷାରେ କଥାବାର୍ତ୍ତା କରନ୍ତୁ",
  voiceDesc: "ଚାଷୀମାନେ ନିଜ ସ୍ୱରରେ ପ୍ରଶ୍ନ ପଚାରିପାରିବେ ଏବଂ ଆସ୍ରା ଓଡ଼ିଆରେ ସଠିକ ଉତ୍ତର ଦେବ।",
  btnPlayVoice: "🎙️ ଓଡ଼ିଆ AI ସ୍ୱର ଶୁଣନ୍ତୁ",
  btnStopVoice: "⏹ ସ୍ୱର ବନ୍ଦ କରନ୍ତୁ",
  robiTitle: "ଅତିରିକ୍ତ ଲାଭ ମାପନ୍ତୁ",
  robiDesc: "ସିନଜେଣ୍ଟା ଜୈବିକ ଉତ୍ପାଦରୁ ଅତିରିକ୍ତ ଅମଳ ଓ ସଞ୍ଚୟ ଦେଖନ୍ତୁ।",
  extraYieldLabel: "ଅତିରିକ୍ତ ଅମଳ",
  netProfitLabel: "ନିଟ ଅତିରିକ୍ତ ଆୟ",
  robiRatioLabel: "ଲାଭ ଅନୁପାତ",
  mapTitle: "ପାଣିପାଗ ମାନଚିତ୍ର",
  mapDesc: "ଲାଇଭ ପାଣିପାଗ ଓ ଜମି ମାନଚିତ୍ର।",
  welcomePrefix: "ନମସ୍କାର,",
  stressAlertTitle: "ତାପମାତ୍ରା ସତର୍କତା",
  stressAlertDesc: "ଫସଲ ପାଇଁ ଜୈବିକ ସୁରକ୍ଷା ଆବଶ୍ୟକ।",
  recommendationTitle: "ସୁପାରିଶ କରାଯାଇଥିବା ଔଷଧ",
  voiceGreeting: "ନମସ୍କାର ଚାଷୀ ଭାଇ! ଆପଣଙ୍କ ଫସଲ ପାଇଁ ଜୈବିକ ସ୍ପ୍ରେ ବ୍ୟବହାର କରିବାକୁ ପରାମର୍ଶ ଦିଆଯାଉଛି।",

  fieldCommandCenter: "ଆସ୍ରା ଜମି କମାଣ୍ଡ ସେଣ୍ଟର",
  welcomeUser: "ଆସ୍ରାରେ ସ୍ୱାଗତ",
  activeFieldLabel: "ବର୍ତ୍ତମାନର ଜମି",
  locationLabel: "ସ୍ଥାନ",
  openAiAssistant: "AI ସହାୟକ ଖୋଲନ୍ତୁ",
  collapseAssistant: "ସହାୟକ ବନ୍ଦ କରନ୍ତୁ",
  exploreEngine: "ଇଞ୍ଜିନ ଦେଖନ୍ତୁ",
  viewMapLayers: "ମାନଚିତ୍ର ସ୍ତର",
  calculateRobi: "ROBI ଗଣନା କରନ୍ତୁ",
  runSimulation: "ସିମୁଲେସନ ଚଲାନ୍ତୁ",
  liveTelemetryTitle: "ଲାଇଭ ପାଣିପାଗ ତଥ୍ୟ",
  nightHeatStressWarning: "ରାତି ତାପମାତ୍ରା ଚାପ ସତର୍କତା",
  plantHealthAI: "ଫସଲ ସ୍ୱାସ୍ଥ୍ୟ AI",
  voiceAdvisory: "ସ୍ୱର ପରାମର୍ଶ",
  weatherSensors: "ପାଣିପାଗ ସେନସର",
  whatIfSim: "ସିମୁଲେଟର",
  robiProof: "ROBI ପ୍ରମାଣ",

  assistantBadge: "ବହୁଭାଷୀ ସ୍ୱର ଓ ପତ୍ର ସ୍କାନର",
  askAasraTitle: "ଆସ୍ରା AI ସ୍ୱର ଓ ପତ୍ର ସ୍କାନର",
  askAasraDesc: "ନିଜ ଭାଷାରେ କୁହନ୍ତୁ କିମ୍ବା ପତ୍ରର ଫଟୋ ଅପଲୋଡ଼ କରି ତୁରନ୍ତ ଉପଚାର ଜାଣନ୍ତୁ।",
  quickLanguageLabel: "ଭାଷା:",
  tryAskingLabel: "ପଚାରି ଦେଖନ୍ତୁ:",
  sampleQ1: "ସୋୟାବିନ ତାପ ଚାପର ଉପଚାର?",
  sampleQ2: "Quantis କେବେ ସ୍ପ୍ରେ କରିବେ?",
  sampleQ3: "ପତ୍ର ହଳଦିଆ କାହିଁକି ହେଉଛି?",
  sampleQ4: "ବର୍ଷାର ସମ୍ଭାବନା କେତେ?",
  sampleQ5: "14 ଦିନର ପାଣିପାଗ ପୂର୍ବାନୁମାନ",
  liveFieldTelemetry: "ଜମିର ଲାଇଭ ତଥ୍ୟ",
  chatWelcome: "ନମସ୍କାର! ମୁଁ ଆସ୍ରା — ଆପଣଙ୍କ AI ଚାଷୀ ସାଥୀ। ପଚାରନ୍ତୁ!",
  chatPlaceholder: "ଫସଲ କିମ୍ବା ସ୍ପ୍ରେ ବିଷୟରେ ପଚାରନ୍ତୁ...",
  listenLabel: "ଶୁଣୁଛି...",
  speakingLabel: "କହୁଛି...",
  processingLabel: "ବିଶ୍ଳେଷଣ ଚାଲିଛି...",

  footerRights: "© 2026 ଆସ୍ରା। ସର୍ବସ୍ୱତ୍ୱ ସଂରକ୍ଷିତ।",
  footerPlatform: "ପ୍ଲାଟଫର୍ମ",
  footerFarmers: "ଚାଷୀ",
  footerAccount: "ଖାତା",
};

const AS_DICT: Partial<TranslationDict> = {
  brandName: "আশ্ৰা",
  tagline: "আপোনাৰ শস্যৰ বিশ্বস্ত AI সংগী",
  navDashboard: "মোৰ পাম",
  navAdvisory: "AI পৰামৰ্শ",
  navRobi: "উপাৰ্জন আৰু সঞ্চয়",
  navWeather: "বতৰ আৰু মানচিত্ৰ",
  navProfile: "মোৰ প্ৰফাইল",
  navWhatIf: "ফলাফল অনুকাৰক",
  navJournal: "ডায়েৰী",
  navLogin: "লগইন",
  navGetStarted: "আৰম্ভ কৰক",
  navPlantAi: "শস্য স্বাস্থ্য AI",
  navFields: "পাম আৰু মানচিত্ৰ",
  navLogout: "লগআউট",
  selectLanguage: "ভাষা বাছক",

  heroBadge: "১০০% বতৰ-প্ৰমাণিত শস্য সুৰক্ষা আৰু জৈৱ বিজ্ঞান",
  heroTitle1: "আপোনাৰ শস্যৰ",
  heroTitle2: "বিশ্বস্ত AI সংগী",
  heroSubtitle: "আশ্ৰাই বতৰৰ প্ৰতিকূলতাৰ পৰা শস্যক ৰক্ষা কৰে আৰু আপোনাৰ উপাৰ্জন বৃদ্ধি কৰে।",
  trustQuote: "আপোনাৰ শ্ৰম, আমাৰ দায়িত্ব।",
  btnStartFarm: "মোৰ পাম আৰম্ভ কৰক",
  btnExploreMap: "বতৰৰ মানচিত্ৰ চাওক",
  voiceTitle: "নিজৰ ভাষাত পোনে পোনে কথা পাতক",
  voiceDesc: "কৃষকসকলে নিজৰ মাতত প্ৰশ্ন সুধিব পাৰে আৰু আশ্ৰাই অসমীয়াত স্পষ্ট পৰামৰ্শ দিয়ে।",
  btnPlayVoice: "🎙️ অসমীয়া AI মাত শুনক",
  btnStopVoice: "⏹ মাত বন্ধ কৰক",
  robiTitle: "অতিৰিক্ত লাভৰ হিচাপ কৰক",
  robiDesc: "চিনজেণ্টা জৈৱিক সুৰক্ষাৰ দ্বাৰা অতিৰিক্ত উৎপাদন আৰু নিগাজ সঞ্চয় চাওক।",
  extraYieldLabel: "অতিৰিক্ত উৎপাদন",
  netProfitLabel: "মুঠ অতিৰিক্ত উপাৰ্জন",
  robiRatioLabel: "লাভৰ অনুপাত",
  mapTitle: "বতৰৰ মানচিত্ৰ",
  mapDesc: "লাইভ বতৰ আৰু পামৰ মানচিত্ৰ।",
  welcomePrefix: "নমস্কাৰ,",
  stressAlertTitle: "উষ্ণতাৰ সকীয়নি",
  stressAlertDesc: "শস্যৰ সুৰক্ষাৰ প্ৰয়োজন।",
  recommendationTitle: "পৰামৰ্শিত ঔষধ",
  voiceGreeting: "নমস্কাৰ কৃষক ভাই! আপোনাৰ শস্যৰ বাবে জৈৱিক ঔষধ স্প্ৰে কৰক।",

  fieldCommandCenter: "আশ্ৰা পাম কমাণ্ড চেণ্টাৰ",
  welcomeUser: "আশ্ৰালৈ স্বাগতম",
  activeFieldLabel: "বৰ্তমানৰ পাম",
  locationLabel: "স্থান",
  openAiAssistant: "AI সহায়ক খোলক",
  collapseAssistant: "সহায়ক বন্ধ কৰক",
  exploreEngine: "ইঞ্জিন চাওক",
  viewMapLayers: "মানচিত্ৰৰ স্তৰ",
  calculateRobi: "ROBI গণনা কৰক",
  runSimulation: "চিমুলেচন চলাওক",
  liveTelemetryTitle: "লাইভ বতৰৰ তথ্য",
  nightHeatStressWarning: "ৰাতিৰ উষ্ণতা চাপৰ সকীয়নি",
  plantHealthAI: "শস্য স্বাস্থ্য AI",
  voiceAdvisory: "মাতৰ পৰামৰ্শ",
  weatherSensors: "বতৰৰ চেন্সৰ",
  whatIfSim: "চিমুলেটৰ",
  robiProof: "ROBI প্ৰমাণ",

  assistantBadge: "বহুভাষী মাত আৰু পাতৰ স্কেনাৰ",
  askAasraTitle: "আশ্ৰা AI মাত আৰু পাতৰ স্কেনাৰ",
  askAasraDesc: "আপোনাৰ ভাষাত কওক বা পাতৰ ফটো আপলোড কৰি তৎকালীন সমাধান পাওক।",
  quickLanguageLabel: "ভাষা:",
  tryAskingLabel: "সুধি চাওক:",
  sampleQ1: "ছয়াবিনৰ উষ্ণতা চাপৰ প্ৰতিকাৰ?",
  sampleQ2: "Quantis কেতিয়া স্প্ৰে কৰিব?",
  sampleQ3: "পাত হালধীয়া কিয় হৈছে?",
  sampleQ4: "বৰষুণৰ সম্ভাৱনা কিমান?",
  sampleQ5: "১৪ দিনৰ বতৰৰ পূৰ্বাভাস",
  liveFieldTelemetry: "পামৰ লাইভ তথ্য",
  chatWelcome: "নমস্কাৰ! মই আশ্ৰা — তোমাৰ AI কৃষি সঙ্গী. সোধক!",
  chatPlaceholder: "তোমাৰ শস্য বা বতৰৰ বিষয়ে সোধক...",
  listenLabel: "শুনিছো...",
  speakingLabel: "কৈছো...",
  processingLabel: "বিশ্লেষণ চলিছে...",

  footerRights: "© ২০২৬ আশ্ৰা। সৰ্বস্বত্ব সংৰক্ষিত।",
  footerPlatform: "প্লেটফৰ্ম",
  footerFarmers: "কৃষক",
  footerAccount: "একাউণ্ট",
};

const TRANSLATIONS_PARTIAL: Record<string, Partial<TranslationDict>> = {
  en: EN_DICT,
  hi: HI_DICT,
  mr: MR_DICT,
  pa: PA_DICT,
  gu: GU_DICT,
  te: TE_DICT,
  ta: TA_DICT,
  kn: KN_DICT,
  ml: ML_DICT,
  bn: BN_DICT,
  or: OR_DICT,
  as: AS_DICT,
};

export const TRANSLATIONS: Record<string, TranslationDict> = new Proxy(
  {},
  {
    get: (_, langCode: string) => {
      const target = TRANSLATIONS_PARTIAL[langCode];
      if (!target) return EN_DICT;
      return { ...EN_DICT, ...target };
    },
  }
);

export function getTranslation(langCode: string): TranslationDict {
  const target = TRANSLATIONS_PARTIAL[langCode];
  if (!target) return EN_DICT;
  return { ...EN_DICT, ...target };
}
