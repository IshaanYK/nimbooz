/**
 * AASRA User Store & Profile Storage
 * Strictly real farmer profiles and authenticated sessions.
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
  id?: string;
  isRegistered?: boolean;
  lastLogin?: string;
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
  { code: "as", name: "Assamese", native: "অसमীয়া" },
  { code: "en", name: "English", native: "English" },
];

export const EMPTY_FARMER_PROFILE: FarmerProfile = {
  fullName: "",
  mobileNumber: "",
  language: "hi",
  state: "",
  district: "",
  village: "",
  fieldName: "",
  fieldAreaHa: 2.0,
  experienceYears: "5+",
  gpsLocation: undefined,
  farmerType: "Individual Farmer",
  farmingExperience: "5+",
  primaryCrop: "Soybean",
  fieldAreaAcres: 5.0,
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
    const isLoggedIn = localStorage.getItem("aasra_is_logged_in") === "true";
    const raw = localStorage.getItem("aasra_farmer_profile");
    if (isLoggedIn && raw) {
      const parsed = JSON.parse(raw);
      return !!(parsed && parsed.fullName && parsed.fullName.trim().length > 0);
    }
    return false;
  } catch (e) {
    return false;
  }
}

export function getStoredProfile(): FarmerProfile {
  if (typeof window === "undefined") return EMPTY_FARMER_PROFILE;
  try {
    const raw = localStorage.getItem("aasra_farmer_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...EMPTY_FARMER_PROFILE, ...parsed };
      }
    }
  } catch (e) {
    console.error("Failed to read farmer profile from storage", e);
  }
  return EMPTY_FARMER_PROFILE;
}

export function saveProfile(profile: FarmerProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("aasra_farmer_profile", JSON.stringify(profile));
    localStorage.setItem("aasra_is_logged_in", "true");
  } catch (e) {
    console.error("Failed to save farmer profile", e);
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



export function logoutUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("aasra_is_logged_in");
    localStorage.removeItem("aasra_farmer_profile");
    localStorage.removeItem("aasra_farmer_fields_v3");
    localStorage.removeItem("aasra_active_field_id_v3");
  } catch (e) {
    console.error("Failed to log out user", e);
  }
}
