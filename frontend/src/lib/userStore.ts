/**
 * AASRA User Store & Profile Storage
 */

export interface FarmerProfile {
  fullName: string;
  mobileNumber: string;
  language: string;
  profilePhoto?: string;
  state: string;
  district: string;
  village: string;
  fieldName?: string;
  fieldAreaHa?: number;
  areaUnit?: string;
  experienceYears?: string;
  communicationMode?: string;
  voiceResponses?: boolean;
  notificationPref?: string;
  isDemoUser?: boolean;
  gpsLocation?: { lat: number; lon: number };
  farmerType: string;
  farmingExperience?: string;
  primaryCrop: string;
  fieldAreaAcres?: number;
  sowingDate: string;
  cropVariety?: string;
  irrigationType: string;
  soilType: string;
  preferredCommunication?: string;
  voiceResponsesEnabled?: boolean;
  helpTopics: string[];
  notificationPreference?: string;
  dataConsent: boolean;
}

export const INDIAN_LANGUAGES = [
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "en", name: "English", native: "English" },
];

export const DEMO_FARMER_PROFILE: FarmerProfile = {
  fullName: "Ramesh Patel",
  mobileNumber: "+91 98260 14890",
  language: "hi",
  state: "Madhya Pradesh",
  district: "Bhopal",
  village: "Fanda Kalan",
  fieldName: "Bhopal North Agro Plot",
  fieldAreaHa: 5.0,
  fieldAreaAcres: 12.5,
  areaUnit: "Acres",
  experienceYears: "14+",
  gpsLocation: { lat: 23.2599, lon: 77.4126 },
  farmerType: "Medium Commercial",
  farmingExperience: "14+",
  primaryCrop: "soybean",
  sowingDate: "2026-06-15",
  cropVariety: "JS-335 (Broadleaf Soybean)",
  irrigationType: "Drip + Monsoon Rainfed",
  soilType: "Black Vertisol Deep Clay (High Retentive)",
  preferredCommunication: "Voice + Text",
  voiceResponsesEnabled: true,
  helpTopics: ["Heat Stress", "Spray Timing", "Yield Attribution", "Cost Reduction"],
  notificationPreference: "High-Priority Weather Alerts",
  dataConsent: true,
  isDemoUser: true,
};

export const EMPTY_FARMER_PROFILE: FarmerProfile = {
  fullName: "",
  mobileNumber: "",
  language: "hi",
  state: "Madhya Pradesh",
  district: "Bhopal",
  village: "",
  fieldName: "Primary Farm Plot",
  fieldAreaHa: 2.5,
  experienceYears: "5+",
  gpsLocation: { lat: 23.2599, lon: 77.4126 },
  farmerType: "Medium",
  farmingExperience: "5+",
  primaryCrop: "soybean",
  fieldAreaAcres: 6.0,
  sowingDate: "2026-06-15",
  cropVariety: "JS-335",
  irrigationType: "Rainfed + Borewell",
  soilType: "Black Cotton Soil",
  preferredCommunication: "Voice + Text",
  voiceResponsesEnabled: true,
  helpTopics: ["Crop health", "Weather", "Yield improvement", "Cost reduction"],
  notificationPreference: "Important alerts",
  dataConsent: true,
};

export function isUserLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("aasra_is_logged_in") === "true";
  } catch (e) {
    return false;
  }
}

export function getStoredProfile(): FarmerProfile {
  if (typeof window === "undefined") return DEMO_FARMER_PROFILE;
  try {
    const raw = localStorage.getItem("aasra_farmer_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.fullName && parsed.fullName.trim().length > 0) {
        return { ...EMPTY_FARMER_PROFILE, ...parsed };
      }
    }
  } catch (e) {
    console.error("Failed to read farmer profile from cache", e);
  }
  return DEMO_FARMER_PROFILE;
}

export function saveProfile(profile: FarmerProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("aasra_farmer_profile", JSON.stringify(profile));
    localStorage.setItem("aasra_is_logged_in", "true");
  } catch (e) {
    console.error("Failed to save farmer profile to cache", e);
  }
}

export function loginUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("aasra_is_logged_in", "true");
  } catch (e) {
    console.error("Failed to set logged in state", e);
  }
}

export function loginAsDemo(): FarmerProfile {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("aasra_farmer_profile", JSON.stringify(DEMO_FARMER_PROFILE));
      localStorage.setItem("aasra_is_logged_in", "true");
    } catch (e) {}
  }
  return DEMO_FARMER_PROFILE;
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("aasra_is_logged_in");
  } catch (e) {
    console.error("Failed to log out user", e);
  }
}
