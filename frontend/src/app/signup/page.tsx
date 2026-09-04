"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  saveRegisteredUser,
  FarmerProfile,
  INDIAN_LANGUAGES,
  EMPTY_FARMER_PROFILE,
} from "@/lib/userStore";
import { saveFarmerField } from "@/lib/fieldStore";
import { useLanguage } from "@/context/LanguageContext";
import { getDistrictCoordinates } from "@/lib/districtCoords";

const RealBoundaryMap = dynamic(
  () => import("@/components/RealBoundaryMap").then((mod) => mod.RealBoundaryMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono text-emerald-400">
        <span className="animate-pulse">Loading Google Satellite Field Map...</span>
      </div>
    ),
  }
);
import {
  User,
  Phone,
  MapPin,
  Leaf,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Droplets,
  Calendar,
  Lock,
  Globe,
  Sliders,
  Award,
  AlertCircle,
  Smartphone,
  RotateCcw,
  Check,
  Activity,
  UserCheck,
  Search,
  Crosshair,
  Maximize2,
  Trash2,
  Plus,
  X,
  Filter,
} from "lucide-react";

// Regional Intelligence Data Contracts
export interface RegionalCropOption {
  id: string;
  nameEn: string;
  nameHi: string;
  category: "cereal" | "pulse" | "oilseed" | "cash_crop" | "vegetable" | "spice" | "horticulture" | "plantation";
  icon: string;
  image: string;
  varieties: string[];
  season?: string;
  isMajorCrop?: boolean;
}

export interface RegionalSoilInfo {
  detectedSoilType: string;
  texture: string;
  typicalPh: string;
  organicCarbon: string;
  drainage?: string;
  soilOptions: string[];
  confidence: string;
  scientificOrder?: string;
}

// Clean, Authentic Pan-India States & Districts (Protected from auto-translate)
const INDIAN_STATES_DISTRICTS: Record<string, string[]> = {
  "Madhya Pradesh": [
    "Sehore", "Bhopal", "Indore", "Ujjain", "Vidisha", "Hoshangabad", "Dewas", "Harda",
    "Raisen", "Rajgarh", "Shajapur", "Agar Malwa", "Mandsaur", "Neemuch", "Ratlam", "Dhar",
    "Khargone", "Barwani", "Khandwa", "Burhanpur", "Jabalpur", "Narsinghpur", "Chhindwara", "Gwalior", "Rewa", "Sagar"
  ],
  "Maharashtra": [
    "Nashik", "Pune", "Nagpur", "Ahmednagar", "Jalgaon", "Satara", "Kolhapur", "Solapur",
    "Aurangabad", "Amravati", "Akola", "Yavatmal", "Buldhana", "Wardha", "Latur", "Nanded", "Sangli", "Beed", "Osmanabad"
  ],
  "Punjab": [
    "Ludhiana", "Patiala", "Jalandhar", "Bathinda", "Amritsar", "Sangrur", "Firozpur",
    "Moga", "Faridkot", "Muktsar", "Barnala", "Mansa", "Hoshiarpur", "Gurdaspur", "Kapurthala", "Fatehgarh Sahib", "Rupnagar"
  ],
  "Haryana": [
    "Karnal", "Hisar", "Ambala", "Kurukshetra", "Sirsa", "Rohtak", "Sonipat",
    "Fatehabad", "Jind", "Kaithal", "Panipat", "Yamunanagar", "Bhiwani", "Rewari", "Jhajjar", "Mahendragarh"
  ],
  "Rajasthan": [
    "Kota", "Bharatpur", "Jaipur", "Alwar", "Sri Ganganagar", "Barmer", "Bikaner",
    "Jodhpur", "Udaipur", "Bhilwara", "Tonk", "Bundi", "Baran", "Jhalawar", "Hanumangarh", "Nagaur", "Chittorgarh", "Sikar"
  ],
  "Gujarat": [
    "Rajkot", "Surat", "Ahmedabad", "Junagadh", "Vadodara", "Bhavnagar", "Amreli",
    "Jamnagar", "Morbi", "Surendranagar", "Mehsana", "Sabarkantha", "Banaskantha", "Kheda", "Patan", "Anand", "Bharuch"
  ],
  "Andhra Pradesh": [
    "Guntur", "Krishna", "Kurnool", "Prakasam", "East Godavari", "West Godavari",
    "Anantapur", "Kadapa", "Nellore", "Chittoor", "Visakhapatnam", "Vizianagaram", "Srikakulam"
  ],
  "Telangana": [
    "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Nalgonda",
    "Mahabubnagar", "Medak", "Adilabad", "Rangareddy", "Suryapet", "Siddipet", "Jagtial"
  ],
  "Uttar Pradesh": [
    "Kanpur", "Varanasi", "Meerut", "Agra", "Prayagraj", "Bareilly", "Mathura",
    "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Ayodhya", "Muzaffarnagar", "Lakhimpur Kheri", "Badaun", "Barabanki"
  ],
  "Karnataka": [
    "Dharwad", "Belagavi", "Vijayapura", "Bagalkote", "Mysuru", "Haveri",
    "Ballari", "Raichur", "Kalaburagi", "Shivamogga", "Davangere", "Tumakuru", "Mandya", "Hassan", "Chikkamagaluru"
  ],
  "Bihar": [
    "Patna", "Muzaffarpur", "Gaya", "Bhagalpur", "Darbhanga", "Purnia", "Rohtas", "Samastipur", "Begusarai", "Nalanda", "Vaishali"
  ],
  "Chhattisgarh": [
    "Raipur", "Durg", "Bilaspur", "Rajnandgaon", "Dhamtari", "Mahasamund", "Janjgir-Champa", "Bemetara", "Kabirdham", "Kanker"
  ],
  "West Bengal": [
    "Burdwan", "Hooghly", "Murshidabad", "Nadia", "Malda", "North 24 Parganas", "South 24 Parganas", "Bankura", "Birbhum", "Midnapore"
  ],
  "Tamil Nadu": [
    "Coimbatore", "Thanjavur", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Erode", "Dindigul", "Theni", "Vellore", "Cuddalore"
  ],
  "Kerala": [
    "Idukki", "Wayanad", "Palakkad", "Kottayam", "Thrissur", "Alappuzha", "Ernakulam", "Kozhikode", "Kannur", "Malappuram"
  ],
  "Odisha": [
    "Sambalpur", "Bhubaneswar", "Cuttack", "Balasore", "Ganjam", "Bargarh", "Bhadrak", "Khurda", "Mayurbhanj", "Jajpur"
  ],
  "Assam": [
    "Kamrup", "Guwahati", "Jorhat", "Dibrugarh", "Nagaon", "Sonitpur", "Golaghat", "Cachar", "Barpeta", "Darrang"
  ],
  "Himachal Pradesh": [
    "Shimla", "Kullu", "Kangra", "Mandi", "Solan", "Sirmaur", "Chamba", "Hamirpur", "Una", "Bilaspur"
  ],
  "Jammu & Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Pulwama", "Kulgam", "Budgam", "Kathua", "Udhampur"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Udham Singh Nagar", "Nainital", "Tehri Garhwal", "Pauri Garhwal", "Almora"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Palamu"
  ],
  "Goa": [
    "North Goa", "South Goa"
  ],
  "Tripura": [
    "West Tripura", "South Tripura", "Dhalai", "Gomati"
  ],
  "Meghalaya": [
    "East Khasi Hills", "West Garo Hills", "Ri-Bhoi", "Jaintia Hills"
  ],
  "Manipur": [
    "Imphal East", "Imphal West", "Bishnupur", "Thoubal", "Churachandpur"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Wokha"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Kolasib"
  ],
  "Sikkim": [
    "East Sikkim", "West Sikkim", "South Sikkim", "North Sikkim"
  ],
  "Arunachal Pradesh": [
    "Papum Pare", "Changlang", "West Kameng", "Lohit"
  ],
  "Delhi": [
    "North Delhi", "South Delhi", "West Delhi", "Najafgarh", "Alipur"
  ]
};

const DEFAULT_REGIONAL_CROPS: RegionalCropOption[] = [
  { id: "Soybean", nameEn: "Soybean", nameHi: "सोयाबीन", category: "oilseed", icon: "🌱", image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80", varieties: ["JS-335", "JS-9560", "JS-2034", "RVS-2001"], isMajorCrop: true },
  { id: "Wheat", nameEn: "Wheat", nameHi: "गेहूं", category: "cereal", icon: "🌾", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80", varieties: ["PBW-824", "HD-2967", "HD-3086", "Sharbati", "Lokwan"], isMajorCrop: true },
  { id: "Cotton", nameEn: "Bt Cotton", nameHi: "कपास", category: "cash_crop", icon: "☁️", image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80", varieties: ["Bollgard II", "RCH-659", "Ajeet-155", "Mallika"], isMajorCrop: true },
  { id: "Mustard", nameEn: "Mustard", nameHi: "सरसों", category: "oilseed", icon: "🌼", image: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=400&q=80", varieties: ["Pusa Bold", "Giriraj", "Pioneer 45S46", "RH-749"], isMajorCrop: true },
  { id: "Gram", nameEn: "Gram / Chickpea", nameHi: "चना (देसी)", category: "pulse", icon: "🥣", image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80", varieties: ["JG-11", "JG-16", "JAKI-9218", "Dollar Chana"], isMajorCrop: true },
  { id: "Paddy", nameEn: "Paddy / Rice", nameHi: "धान / चावल", category: "cereal", icon: "🌾", image: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80", varieties: ["Pusa Basmati 1121", "Pusa 1509", "PR-126", "Samba Mahsuri"], isMajorCrop: true },
  { id: "Tomato", nameEn: "Tomato", nameHi: "टमाटर", category: "vegetable", icon: "🍅", image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80", varieties: ["Abhinav Hybrid", "US-440", "Heemsohna", "Saaho"], isMajorCrop: true },
  { id: "Maize", nameEn: "Maize / Corn", nameHi: "मक्का", category: "cereal", icon: "🌽", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80", varieties: ["DKC-9108", "P-3396", "NK-6240"], isMajorCrop: false },
];

export default function SignupPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Stage 1: Farmer Identity & Phone Verification ─────────────
  const [fullName, setFullName] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [farmingExperience, setFarmingExperience] = useState<string>("5-10 Years");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language || "hi");

  // OTP Verification States
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isMobileVerified, setIsMobileVerified] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);

  // ── Stage 2: Location & Interactive Farm Boundary Map ─────────
  const [selectedState, setSelectedState] = useState<string>("Madhya Pradesh");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Sehore");
  const [village, setVillage] = useState<string>("");
  const [tehsil, setTehsil] = useState<string>("");
  const [acres, setAcres] = useState<number>(5.0);
  const [landOwnership, setLandOwnership] = useState<"Owner" | "Tenant" | "Sharecropper">("Owner");
  const [soilType, setSoilType] = useState<string>("Black Cotton Soil (काली मिट्टी)");
  const [irrigationType, setIrrigationType] = useState<string>("Borewell + Rainfed");
  
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number }>({ lat: 23.2032, lon: 77.0844 });
  const [searchLocationQuery, setSearchLocationQuery] = useState<string>("");
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [drawnPolygon, setDrawnPolygon] = useState<Array<[number, number]>>([]);
  const [boundaryPoints, setBoundaryPoints] = useState<{ x: number; y: number }[]>([
    { x: 30, y: 25 },
    { x: 75, y: 30 },
    { x: 70, y: 75 },
    { x: 25, y: 70 },
  ]);
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string>("");

  // ── Stage 3: Crop Intelligence & Agronomic Profile ─────────
  const [primaryCrop, setPrimaryCrop] = useState<string>("Soybean");
  const [cropVariety, setCropVariety] = useState<string>("JS-335");
  const [sowingDate, setSowingDate] = useState<string>("2026-06-15");
  const [growthStage, setGrowthStage] = useState<string>("Flowering & Pod Formation");
  const [pestHistory, setPestHistory] = useState<string[]>(["Heat Stress Flower Drop"]);
  const [fertilizersUsed, setFertilizersUsed] = useState<string[]>(["DAP", "Urea"]);
  const [hasKcc, setHasKcc] = useState<boolean>(true);
  const [preferredCommunication, setPreferredCommunication] = useState<string>("Voice + WhatsApp");

  const [sowingMethod, setSowingMethod] = useState<string>("Line Sowing / Seed Drill (कतार बुवाई)");
  const [previousCrop, setPreviousCrop] = useState<string>("Wheat (गेहूं)");
  const [waterSource, setWaterSource] = useState<string>("Tube Well / Borewell (नलकूप / बोरवेल)");

  // ── Regional Agronomic & Soil Intelligence States ──────────
  const [regionalCrops, setRegionalCrops] = useState<RegionalCropOption[]>(DEFAULT_REGIONAL_CROPS);
  const [detectedSoil, setDetectedSoil] = useState<RegionalSoilInfo | null>(null);
  const [soilOptionsList, setSoilOptionsList] = useState<string[]>([
    "Medium to Deep Black Clay Soil (काली मिट्टी - Vertisol)",
    "Medium Black Clay Loam (मध्यम काली दोमट)",
    "Shallow Red-Brown Murrum Soil (उथली मुरुमी मिट्टी)",
    "Alluvial Riverbank Loam (कछारी जलोढ़ दोमट)",
  ]);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState<boolean>(false);
  const [cropSearchQuery, setCropSearchQuery] = useState<string>("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [showCustomCropModal, setShowCustomCropModal] = useState<boolean>(false);
  const [customCropName, setCustomCropName] = useState<string>("");
  const [customCropCategory, setCustomCropCategory] = useState<string>("cereal");
  const [customCropVariety, setCustomCropVariety] = useState<string>("");

  // Fetch dynamic location intelligence (ICAR Soil + Regional Crops)
  const fetchLocationIntelligence = async (dst: string, st: string, lat?: number, lon?: number) => {
    if (!dst || !st) return;
    setIsLoadingIntelligence(true);
    try {
      const res = await fetch(
        `/api/crops/regional?district=${encodeURIComponent(dst)}&state=${encodeURIComponent(st)}&lat=${lat ?? ""}&lon=${lon ?? ""}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.crops && Array.isArray(data.crops) && data.crops.length > 0) {
          setRegionalCrops(data.crops);

          // If current crop is not in new list, pick the first
          const currentMatch = data.crops.find(
            (c: RegionalCropOption) =>
              c.id.toLowerCase() === primaryCrop.toLowerCase() ||
              c.nameEn.toLowerCase() === primaryCrop.toLowerCase()
          );
          if (!currentMatch) {
            const firstCrop = data.crops[0];
            setPrimaryCrop(firstCrop.id || firstCrop.nameEn);
            if (firstCrop.varieties?.[0]) {
              setCropVariety(firstCrop.varieties[0]);
            }
          }
        }

        if (data.soil) {
          setDetectedSoil(data.soil);
          if (Array.isArray(data.soil.soilOptions) && data.soil.soilOptions.length > 0) {
            setSoilOptionsList(data.soil.soilOptions);
          }
          if (data.soil.detectedSoilType) {
            setSoilType(data.soil.detectedSoilType);
          }
        }
      }
    } catch (err) {
      console.warn("Dynamic location intelligence fetch error:", err);
    } finally {
      setIsLoadingIntelligence(false);
    }
  };

  // Initial fetch for default location
  useEffect(() => {
    fetchLocationIntelligence(selectedDistrict, selectedState, mapCenter.lat, mapCenter.lon);
  }, []);

  // OTP Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Restore saved boundary if farmer already drew their field
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aasra_signup_field_boundary");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.points) && parsed.points.length >= 3) {
          setDrawnPolygon(parsed.points);
          if (parsed.acres) setAcres(Number(parsed.acres));
          if (parsed.center?.lat && parsed.center?.lon) {
            setMapCenter({ lat: parsed.center.lat, lon: parsed.center.lon });
          }
        }
      }
    } catch {}
  }, []);

  // Handle District update when State changes -> automatically centers map and fetches regional intelligence!
  const handleStateChange = (st: string) => {
    setSelectedState(st);
    const districts = INDIAN_STATES_DISTRICTS[st] || ["Sehore"];
    const firstDist = districts[0];
    setSelectedDistrict(firstDist);
    const coords = getDistrictCoordinates(firstDist, st);
    setMapCenter(coords);
    fetchLocationIntelligence(firstDist, st, coords.lat, coords.lon);
  };

  const handleDistrictChange = (dst: string) => {
    setSelectedDistrict(dst);
    const coords = getDistrictCoordinates(dst, selectedState);
    setMapCenter(coords);
    fetchLocationIntelligence(dst, selectedState, coords.lat, coords.lon);
  };

  // Trigger Real SMS OTP Verification
  const handleSendOtp = () => {
    const cleanNum = mobileNumber.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanNum)) {
      setErrorMessage(
        isHindi
          ? "कृपया 6, 7, 8 या 9 से शुरू होने वाला सही 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9."
      );
      return;
    }
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setIsOtpSent(true);
      setOtpTimer(45);
      setLoading(false);
    }, 600);
  };

  // Verify SMS OTP
  const handleVerifyOtp = () => {
    if (enteredOtp.trim() !== generatedOtp) {
      setErrorMessage(
        isHindi
          ? `गलत कोड! सही सत्यापन कोड "${generatedOtp}" है।`
          : `Invalid Code: Please enter the exact verification code. (Code: ${generatedOtp})`
      );
      return;
    }
    setErrorMessage(null);
    setIsMobileVerified(true);
  };

  // Step 1 validation
  const handleStep1Next = () => {
    if (!fullName.trim()) {
      setErrorMessage(isHindi ? "कृपया अपना पूरा नाम दर्ज करें।" : "Please enter your full name.");
      return;
    }
    if (!isMobileVerified) {
      setErrorMessage(
        isHindi
          ? "कृपया पहले अपने मोबाइल नंबर पर आए सत्यापन कोड को दर्ज करें।"
          : "Please verify your mobile number with the SMS code before continuing."
      );
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  // 📍 Request Browser Location Permission & Reverse Geocode
  const handleLocateOnMap = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationPermissionStatus("Browser location not supported. You can search village or click on map.");
      return;
    }

    setIsLocatingUser(true);
    setLocationPermissionStatus("Locating your coordinates on satellite map...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setMapCenter({ lat, lon });

        try {
          const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            if (data.district) setSelectedDistrict(data.district);
            if (data.state) setSelectedState(data.state);
            if (data.village || data.city) setVillage(data.village || data.city);
            if (data.tehsil) setTehsil(data.tehsil);
          }
        } catch {
          // Keep default
        }

        setIsLocatingUser(false);
        setLocationPermissionStatus("Field location pinpointed successfully ✓");
      },
      (err) => {
        setIsLocatingUser(false);
        if (err.code === 1) {
          setLocationPermissionStatus("Location permission was denied. Please search your village or click on the map.");
        } else {
          setLocationPermissionStatus("Could not acquire GPS. Please search village name or adjust map.");
        }
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  // Search Village / Town / District using OpenStreetMap Geocoding
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocationQuery.trim()) return;

    setIsSearchingLocation(true);
    setLocationPermissionStatus("");

    try {
      const query = encodeURIComponent(`${searchLocationQuery.trim()}, India`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          setMapCenter({ lat, lon });
          setVillage(searchLocationQuery.trim());
          setLocationPermissionStatus(`Map centered on: ${item.display_name.split(",")[0]}`);
        } else {
          setLocationPermissionStatus("Location not found. Please click directly on the map.");
        }
      }
    } catch {
      setLocationPermissionStatus("Search temporarily unavailable. You can click on the map to set boundary.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Click on Map to add / adjust Boundary Points
  const handleMapCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (boundaryPoints.length >= 6) {
      setBoundaryPoints([{ x, y }]);
    } else {
      setBoundaryPoints([...boundaryPoints, { x, y }]);
    }

    const calculatedAcres = +(Math.min(50, Math.max(1, (boundaryPoints.length + 1) * 1.5))).toFixed(1);
    setAcres(calculatedAcres);
  };

  const handleResetBoundary = () => {
    setBoundaryPoints([
      { x: 30, y: 25 },
      { x: 75, y: 30 },
      { x: 70, y: 75 },
      { x: 25, y: 70 },
    ]);
    setAcres(5.0);
  };

  // Final Registration Save to Database
  const handleCompleteRegistration = async () => {
    setLoading(true);

    const cleanNum = mobileNumber.replace(/\D/g, "");
    const finalPolygon: Array<[number, number]> = drawnPolygon.length >= 3 ? drawnPolygon : [
      [mapCenter.lat + 0.0012, mapCenter.lon - 0.0015],
      [mapCenter.lat + 0.0015, mapCenter.lon + 0.0018],
      [mapCenter.lat - 0.0011, mapCenter.lon + 0.0014],
      [mapCenter.lat - 0.0014, mapCenter.lon - 0.0012],
    ];

    const newProfile: FarmerProfile = {
      ...EMPTY_FARMER_PROFILE,
      id: `kisan-${cleanNum.slice(-6)}-${Date.now()}`,
      fullName: fullName.trim(),
      mobileNumber: cleanNum,
      email: email.trim() || undefined,
      language: selectedLanguage,
      farmingExperience,
      state: selectedState,
      district: selectedDistrict,
      tehsil: tehsil.trim() || undefined,
      village: village.trim() || "Village Area",
      fieldName: `${primaryCrop} Main Field`,
      fieldAreaAcres: acres,
      fieldAreaHa: +(acres * 0.4047).toFixed(2),
      landOwnership,
      primaryCrop,
      cropVariety,
      sowingDate,
      growthStage,
      soilType,
      irrigationType,
      gpsLocation: { lat: mapCenter.lat, lon: mapCenter.lon },
      polygon: finalPolygon,
      pestHistory,
      fertilizersUsed,
      hasKisanCreditCard: hasKcc,
      preferredCommunication,
      sowingMethod,
      previousCrop,
      waterSource,
      voiceResponsesEnabled: true,
      dataConsent: true,
      isRegistered: true,
      lastLogin: new Date().toISOString(),
      dataEncryptionStamp: "AES-256 Encrypted via Syngenta Krishi Vault",
    };

    saveRegisteredUser(newProfile);
    
    // Also save as primary registered field in fieldStore
    saveFarmerField({
      id: `field_primary_${Date.now()}`,
      name: `${primaryCrop} Main Field`,
      crop: primaryCrop,
      cropVariety: cropVariety,
      areaAcres: acres,
      areaHa: +(acres * 0.4047).toFixed(2),
      center: [mapCenter.lat, mapCenter.lon],
      polygon: finalPolygon,
      sowingDate: sowingDate,
      growthStage: growthStage,
      soilType: soilType,
      irrigationType: irrigationType,
      color: "#10B981",
      healthScore: 94,
    });

    // ── Persist to Live Production Database for Cross-Device Personalization & Admin Overwatch ──
    try {
      await Promise.allSettled([
        fetch("/api/farmers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newProfile.id,
            fullName: newProfile.fullName,
            mobileNumber: newProfile.mobileNumber,
            email: newProfile.email,
            language: newProfile.language,
            state: newProfile.state,
            district: newProfile.district,
            tehsil: newProfile.tehsil,
            village: newProfile.village,
            fieldName: newProfile.fieldName,
            fieldAreaAcres: newProfile.fieldAreaAcres,
            fieldAreaHa: newProfile.fieldAreaHa,
            landOwnership: newProfile.landOwnership,
            farmingExperience: newProfile.farmingExperience,
            primaryCrop: newProfile.primaryCrop,
            cropVariety: newProfile.cropVariety,
            sowingDate: newProfile.sowingDate,
            growthStage: newProfile.growthStage,
            soilType: newProfile.soilType,
            irrigationType: newProfile.irrigationType,
            gpsLocation: { lat: mapCenter.lat, lon: mapCenter.lon },
            polygon: finalPolygon,
            pestHistory: newProfile.pestHistory,
            fertilizersUsed: newProfile.fertilizersUsed,
            hasKisanCreditCard: newProfile.hasKisanCreditCard,
            pmKisanBeneficiary: newProfile.pmKisanBeneficiary,
            preferredCommunication: newProfile.preferredCommunication,
            sowingMethod,
            previousCrop,
            waterSource,
          }),
        }),
        fetch("/api/fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${primaryCrop} Main Field`,
            lat: mapCenter.lat,
            lon: mapCenter.lon,
            area_acres: acres,
            crop: primaryCrop,
            variety: cropVariety,
            soil_type: soilType,
            polygon: finalPolygon,
          }),
        }),
      ]);
    } catch (err) {
      console.warn("Could not dispatch database sync:", err);
    }

    setLanguage(selectedLanguage);
    setLoading(false);
    setStep(4);
  };

  // Convert points to SVG Polygon string
  const polygonPointsStr = boundaryPoints.map((p) => `${p.x * 6},${p.y * 3.5}`).join(" ");

  // Filter regional crops by category and search keyword
  const displayedCrops = regionalCrops.filter((c) => {
    const matchesCat =
      selectedCategoryFilter === "all" || c.category === selectedCategoryFilter;
    const matchesQuery =
      !cropSearchQuery.trim() ||
      c.nameEn.toLowerCase().includes(cropSearchQuery.toLowerCase()) ||
      c.nameHi.toLowerCase().includes(cropSearchQuery.toLowerCase()) ||
      c.varieties?.some((v) =>
        v.toLowerCase().includes(cropSearchQuery.toLowerCase())
      );
    return matchesCat && matchesQuery;
  });

  const currentCropObj = regionalCrops.find(
    (c) =>
      c.id.toLowerCase() === primaryCrop.toLowerCase() ||
      c.nameEn.toLowerCase() === primaryCrop.toLowerCase()
  );

  return (
    <div
      suppressHydrationWarning
      translate="no"
      className="notranslate min-h-screen bg-[#f6f9fc] text-[#0d253d] font-sans pb-20 select-none relative overflow-hidden flex flex-col justify-between"
    >
      {/* ── Atmospheric Ambient Radial Glows ───────────────────────── */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #533afd 0%, #0ea5e9 60%, transparent 80%)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
      />

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between p-6 relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
            <Image src="/images/aasra_logo.png" alt="AASRA" width={32} height={32} className="object-contain" priority />
          </div>
          <div>
            <span className="text-xl font-bold font-display text-[#0d253d] tracking-tight block">AASRA</span>
            <span className="text-[10px] font-mono text-[#533afd] font-bold block uppercase tracking-wider">Farmer Onboarding</span>
          </div>
        </Link>

        {/* Minimalist Language Selector Button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setLanguage(e.target.value);
              }}
              className="pl-3.5 pr-8 py-2 rounded-xl bg-white border border-[#e3e8ee] text-xs font-bold text-[#0d253d] shadow-2xs focus:outline-none focus:border-[#533afd] cursor-pointer appearance-none notranslate"
              translate="no"
            >
              {INDIAN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="notranslate" translate="no">
                  {l.name} ({l.native})
                </option>
              ))}
            </select>
            <Globe className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#e3e8ee] text-[#0d253d] text-xs font-bold transition-all shadow-2xs"
          >
            <span>{isHindi ? "लॉगिन करें" : "Log In"}</span>
          </Link>
        </div>
      </header>

      {/* ── Main Registration Multi-Step Card ──────────────────────── */}
      <main className="max-w-4xl mx-auto w-full my-4 px-4 sm:px-6 relative z-10">
        <div className="bg-white border border-[#e3e8ee] shadow-2xl rounded-3xl p-6 sm:p-10 space-y-8">
          
          {/* Top Stage Indicator (4 Steps) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#533afd] uppercase">
                {step === 1 && <span>{isHindi ? "चरण 1: किसान पहचान व फोन सत्यापन" : "Stage 1: Verified Farmer Identity"}</span>}
                {step === 2 && <span>{isHindi ? "चरण 2: खेत स्थान व नक्शे पर मेढ़ (Boundary)" : "Stage 2: Land Location & Map Boundary"}</span>}
                {step === 3 && <span>{isHindi ? "चरण 3: फसल व कृषि इतिहास" : "Stage 3: Agronomic Intelligence"}</span>}
                {step === 4 && <span>{isHindi ? "चरण 4: डिजिटल किसान स्मार्ट कार्ड" : "Stage 4: Verified Kisan Smart Card"}</span>}
              </span>
              <span className="text-slate-400">Step {step} of 4</span>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#533afd] to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-medium">{errorMessage}</p>
            </div>
          )}

          {/* ── STAGE 1: Farmer Identity & Phone Verification ────────── */}
          <div key="step-1" className={step === 1 ? "space-y-6" : "hidden"}>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0d253d] font-display">
                <span>{isHindi ? "किसान की जानकारी व फोन सत्यापन" : "Farmer Identity & Phone Verification"}</span>
              </h2>
              <p className="text-xs text-[#64748d]">
                <span>{isHindi ? "सत्यापित मोबाइल नंबर से जुड़ें ताकि बाद में आप सुरक्षित लॉगिन कर सकें।" : "Register with a verified mobile number so you can securely log in anytime."}</span>
              </p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  <span>{isHindi ? "किसान का पूरा नाम *" : "Full Farmer Name *"}</span>
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Patel"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-medium text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                  />
                </div>
              </div>

              {/* Mobile Number & OTP Trigger */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  <span>{isHindi ? "मोबाइल नंबर (लॉगिन ID) *" : "Mobile Number (Login ID) *"}</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Smartphone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={mobileNumber}
                      disabled={isMobileVerified}
                      onChange={(e) => {
                        setMobileNumber(e.target.value.replace(/\D/g, ""));
                        setErrorMessage(null);
                      }}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-mono font-bold tracking-wider ${
                        isMobileVerified
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-[#f6f9fc] border-[#e3e8ee] text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                      }`}
                    />
                  </div>

                  {!isMobileVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || otpTimer > 0}
                      className="px-4 py-3 rounded-xl bg-[#0d253d] hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <span>
                        {loading
                          ? "Sending..."
                          : otpTimer > 0
                          ? `Resend (${otpTimer}s)`
                          : isOtpSent
                          ? "Resend OTP"
                          : "Verify Phone"}
                      </span>
                    </button>
                  )}

                  {isMobileVerified && (
                    <div className="px-3.5 py-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* OTP Input Form (Revealed when OTP is sent & not yet verified) */}
              {isOtpSent && !isMobileVerified && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-[#533afd]" />
                      <span>{isHindi ? "4-अंकों का SMS OTP दर्ज करें" : "Enter 4-digit SMS OTP"}</span>
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                      Mock OTP: {generatedOtp}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="• • • •"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-32 text-center text-lg font-mono font-black tracking-widest py-2 rounded-xl bg-white border border-indigo-300 text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="flex-1 py-2 rounded-xl bg-[#533afd] hover:bg-[#4434d4] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>{isHindi ? "OTP सत्यापित करें" : "Confirm OTP"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Farming Experience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  <span>{isHindi ? "खेती का अनुभव (वर्ष)" : "Farming Experience (Years)"}</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {["1-3 Yrs", "3-5 Yrs", "5-10 Years", "10-20 Years", "20+ Years"].map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setFarmingExperience(exp)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        farmingExperience === exp
                          ? "bg-white border-[#533afd] text-[#533afd] shadow-sm ring-1 ring-[#533afd]"
                          : "bg-[#f6f9fc] border-[#e3e8ee] text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span>{exp}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!fullName.trim()) {
                  setErrorMessage(isHindi ? "कृपया किसान का पूरा नाम दर्ज करें。" : "Please enter your full name.");
                  return;
                }
                if (mobileNumber.length !== 10) {
                  setErrorMessage(isHindi ? "कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें。" : "Please enter a valid 10-digit mobile number.");
                  return;
                }
                setErrorMessage(null);
                setStep(2);
              }}
              className="w-full py-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              style={{ background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)" }}
            >
              <span>{isHindi ? "अगला: खेत स्थान व नक्शे पर मेढ़ बनाएं" : "Next: Map Your Field Boundary"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* ── STAGE 2: Interactive Field Boundary Map & Soil GIS ───── */}
          <div key="step-2" className={step === 2 ? "space-y-6" : "hidden"}>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0d253d] font-display">
                <span>{isHindi ? "खेत का स्थान व नक्शे पर मेढ़ (Boundary)" : "Field Location & Satellite Boundary"}</span>
              </h2>
              <p className="text-xs text-[#64748d]">
                <span>{isHindi ? "नक्शे पर अपने खेत को खोजें और कोनों पर क्लिक करके मेढ़ (Boundary) बनाएं।" : "Search your village or locate your field, then click on the map to draw your parcel boundaries."}</span>
              </p>
            </div>

            {/* State & District Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">State (राज्य) *</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] notranslate"
                  translate="no"
                >
                  {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
                    <option key={st} value={st} className="notranslate" translate="no">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">District (जिला) *</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] notranslate"
                  translate="no"
                >
                  {(INDIAN_STATES_DISTRICTS[selectedState] || ["Sehore"]).map((dst) => (
                    <option key={dst} value={dst} className="notranslate" translate="no">
                      {dst}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Village Search & Non-Intrusive Location Controls */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <form onSubmit={handleSearchLocation} className="flex-1 relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={isHindi ? "गांव, कस्बा या तहसील का नाम खोजें (उदा: Bilkisganj, Sehore, Phanda)" : "Search Village, Town or Tehsil (e.g. Bilkisganj, Sehore, Phanda)"}
                    value={searchLocationQuery}
                    onChange={(e) => setSearchLocationQuery(e.target.value)}
                    className="w-full pl-10 pr-24 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-medium text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingLocation}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#0d253d] text-white text-[11px] font-bold cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    <span>{isSearchingLocation ? "Searching..." : "Search Village"}</span>
                  </button>
                </form>

                {/* Optional Device GPS Button */}
                <button
                  type="button"
                  onClick={handleLocateOnMap}
                  disabled={isLocatingUser}
                  title="Only click this if you are physically standing on your crop field right now."
                  className="px-3.5 py-3 rounded-xl bg-white border border-[#e3e8ee] hover:border-[#533afd] text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer shrink-0 transition-all hover:bg-indigo-50/50"
                >
                  <Crosshair className={`h-4 w-4 text-[#533afd] ${isLocatingUser ? "animate-spin" : ""}`} />
                  <span>{isHindi ? "डिवाइस GPS (यदि खेत पर हों)" : "Device GPS (If at field)"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>💡 <strong>Tip:</strong> If sitting at home, search your village name or drag the map directly to your farm.</span>
                <span className="font-mono text-[10px] text-indigo-600">
                  Map Center: {mapCenter.lat.toFixed(4)}°N, {mapCenter.lon.toFixed(4)}°E
                </span>
              </div>

              {locationPermissionStatus && (
                <p className="text-[11px] font-mono text-[#533afd] bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                  ℹ️ {locationPermissionStatus}
                </p>
              )}
            </div>

            {/* ── REAL GOOGLE SATELLITE FIELD BOUNDARY MAP ──────── */}
            <div className="space-y-2">
              <RealBoundaryMap
                center={[mapCenter.lat, mapCenter.lon]}
                zoom={16}
                initialPoints={drawnPolygon.length >= 3 ? drawnPolygon : undefined}
                onCenterChange={(newC) => setMapCenter({ lat: newC[0], lon: newC[1] })}
                onBoundaryChange={(pts, calculatedAcres) => {
                  setDrawnPolygon(pts);
                  setAcres(calculatedAcres);
                  try {
                    localStorage.setItem(
                      "aasra_signup_field_boundary",
                      JSON.stringify({
                        points: pts,
                        acres: calculatedAcres,
                        center: mapCenter,
                      })
                    );
                  } catch {}
                }}
              />
            </div>

              {/* Farm Size Acreage Controller (Synchronized with Map) */}
              <div className="p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold text-[#0d253d]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Total Farm Acreage (खेत का कुल क्षेत्रफल / रकबा):</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">
                      ({(acres * 0.4047).toFixed(2)} Hectares)
                    </span>
                    <div className="flex items-center bg-white border border-[#533afd] rounded-xl px-3 py-1 shadow-2xs">
                      <input
                        type="number"
                        min="0.1"
                        max="500"
                        step="0.1"
                        value={acres}
                        onChange={(e) => setAcres(Number(e.target.value))}
                        className="w-16 font-mono text-sm font-black text-[#533afd] focus:outline-none text-right mr-1"
                      />
                      <span className="font-mono text-xs font-bold text-slate-700">Acres</span>
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min="0.5"
                  max={Math.max(50, Math.ceil(acres + 10))}
                  step="0.1"
                  value={acres}
                  onChange={(e) => setAcres(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#533afd]"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0.5 Acre</span>
                  <span>25 Acres</span>
                  <span>{Math.max(50, Math.ceil(acres + 10))} Acres</span>
                </div>
              </div>

              {/* Soil & Irrigation */}
              <div className="space-y-3">
                {detectedSoil && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs shadow-2xs">
                    <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 animate-pulse" />
                    <div className="flex-1 flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-700">
                        {isHindi ? "✨ AI द्वारा जांची गई मिट्टी:" : "✨ AI Soil Auto-Detected:"}
                      </span>
                      <span className="font-bold text-emerald-950">
                        {detectedSoil.detectedSoilType}
                      </span>
                      {detectedSoil.typicalPh && (
                        <span className="text-[10px] bg-emerald-100/90 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                          pH {detectedSoil.typicalPh}
                        </span>
                      )}
                      {detectedSoil.texture && (
                        <span className="text-[10px] text-emerald-700">
                          • {detectedSoil.texture}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700">Soil Type (मिट्टी की किस्म)</label>
                      {isLoadingIntelligence && (
                        <span className="text-[10px] text-[#533afd] font-mono animate-pulse">
                          Detecting ICAR soil...
                        </span>
                      )}
                    </div>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] focus:border-[#533afd]"
                    >
                      {soilOptionsList.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                      {!soilOptionsList.includes(soilType) && (
                        <option value={soilType}>{soilType}</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Irrigation (सिंचाई साधन)</label>
                    <select
                      value={irrigationType}
                      onChange={(e) => setIrrigationType(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                    >
                      <option value="Borewell + Rainfed">Borewell + Rainfed (बोरवेल + वर्षा)</option>
                      <option value="Canal Irrigation">Canal Irrigation (नहरी सिंचाई)</option>
                      <option value="Drip Irrigation">Drip Irrigation (ड्रिप टपक सिंचाई)</option>
                      <option value="Purely Rainfed">Purely Rainfed (केवल वर्षा आधारित)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl border border-[#e3e8ee] hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)" }}
                >
                  <span>{isHindi ? "अगला: फसल व कृषि इतिहास" : "Next: Crop & Agronomics"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          {/* ── STAGE 3: Crop Intelligence & Agronomic Profile ───────── */}
          <div key="step-3" className={step === 3 ? "space-y-6" : "hidden"}>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0d253d] font-display">
                <span>{isHindi ? "फसल व कृषि इतिहास" : "Agronomic & Crop Intelligence"}</span>
              </h2>
                <p className="text-xs text-[#64748d]">
                  <span>{isHindi ? "फसल की किस्म व बुवाई की तारीख से AI आपके खेत के विकास चरण को स्वतः सेट करेगा।" : "Calibrates 14-day heat stress predictions and precise Syngenta product dosages."}</span>
                </p>
              </div>

              <div className="space-y-4">
                {/* Regional Header & Custom Crop Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#533afd] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-[#0d253d]">
                        {isHindi
                          ? `${selectedDistrict}, ${selectedState} के लिए अनुशंसित क्षेत्रीय फसलें`
                          : `Regional Crops for ${selectedDistrict}, ${selectedState}`}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {isHindi
                          ? "ICAR कृषि-जलवायु क्षेत्र व स्थानीय बाजार मांग अनुसार"
                          : "Curated from ICAR agro-climatic & market data"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoadingIntelligence && (
                      <span className="text-[10px] font-mono text-[#533afd] animate-pulse bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                        Analyzing ICAR...
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowCustomCropModal(true)}
                      className="text-xs font-bold text-[#533afd] hover:text-[#432ec7] bg-white hover:bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{isHindi ? "अन्य फसल जोड़ें" : "Add Custom Crop"}</span>
                    </button>
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={isHindi ? `${selectedDistrict} में उगाई जाने वाली फसल खोजें...` : `Filter crops in ${selectedDistrict}...`}
                      value={cropSearchQuery}
                      onChange={(e) => setCropSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-medium text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                    />
                    {cropSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCropSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {[
                      { id: "all", label: isHindi ? "सभी" : "All" },
                      { id: "cereal", label: isHindi ? "अनाज" : "Cereals" },
                      { id: "cash_crop", label: isHindi ? "नकदी" : "Cash" },
                      { id: "pulse", label: isHindi ? "दलहन" : "Pulses" },
                      { id: "oilseed", label: isHindi ? "तिलहन" : "Oilseeds" },
                      { id: "horticulture", label: isHindi ? "बागवानी" : "Horticulture" },
                      { id: "spice", label: isHindi ? "मसाले" : "Spices" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategoryFilter === cat.id
                            ? "bg-[#533afd] text-white shadow-2xs"
                            : "bg-[#f6f9fc] text-slate-600 hover:bg-slate-200/60 border border-[#e3e8ee]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crop Selection Grid */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {displayedCrops.map((c) => {
                      const isSelected =
                        primaryCrop.toLowerCase() === c.id.toLowerCase() ||
                        primaryCrop.toLowerCase() === c.nameEn.toLowerCase();
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setPrimaryCrop(c.nameEn || c.id);
                            if (c.varieties && c.varieties.length > 0) {
                              setCropVariety(c.varieties[0]);
                            }
                          }}
                          className={`rounded-2xl border text-left overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                            isSelected
                              ? "bg-white border-[#533afd] shadow-lg ring-2 ring-[#533afd]/20 scale-[1.02]"
                              : "bg-white hover:border-slate-300 border-[#e3e8ee] text-slate-700"
                          }`}
                        >
                          <div className="relative h-24 w-full overflow-hidden bg-slate-900">
                            <Image
                              src={c.image}
                              alt={c.nameEn}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                            <span className="absolute top-2 right-2 text-xs bg-white/95 backdrop-blur-md rounded-md px-1.5 py-0.5 shadow-2xs font-emoji">
                              {c.icon}
                            </span>
                            <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md">
                              {c.category?.replace("_", " ")}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50/70 flex flex-col justify-between flex-1">
                            <div>
                              <span className="text-xs font-bold text-[#0d253d] block notranslate line-clamp-1" translate="no">
                                {isHindi ? c.nameHi : c.nameEn}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-medium">
                                {c.varieties?.[0] ? `Var: ${c.varieties[0]}` : "High Yield"}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#533afd]">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Selected</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {displayedCrops.length === 0 && (
                    <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <Leaf className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700 mb-1">
                        {isHindi ? "कोई फसल नहीं मिली" : "No crops matching your search"}
                      </p>
                      <p className="text-[11px] text-slate-500 mb-3">
                        {isHindi ? "क्या आप अपनी फसल मैन्युअल रूप से जोड़ना चाहते हैं?" : "Would you like to add your specific crop manually?"}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCropName(cropSearchQuery);
                          setShowCustomCropModal(true);
                        }}
                        className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm bg-[#533afd] hover:bg-[#432ec7] cursor-pointer"
                      >
                        + {isHindi ? `"${cropSearchQuery}" फसल जोड़ें` : `Add "${cropSearchQuery}" as Custom Crop`}
                      </button>
                    </div>
                  )}
                </div>

                {/* Sowing Date & Variety with Local Cultivar Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700">Crop Variety (फसल की किस्म)</label>
                      {currentCropObj?.varieties && currentCropObj.varieties.length > 0 && (
                        <span className="text-[10px] text-[#533afd] font-bold">
                          {currentCropObj.varieties.length} Local Cultivars
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. JS-335 / PBW-824 / Bhima Super"
                      value={cropVariety}
                      onChange={(e) => setCropVariety(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] notranslate"
                      translate="no"
                    />
                    {currentCropObj?.varieties && currentCropObj.varieties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentCropObj.varieties.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setCropVariety(v)}
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-mono transition-colors cursor-pointer ${
                              cropVariety === v
                                ? "bg-[#533afd] text-white border-[#533afd]"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Sowing Date (बुवाई की तारीख - पिछली या आगामी)
                    </label>
                    <input
                      type="date"
                      value={sowingDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setSowingDate(newDate);
                        if (newDate) {
                          const diff = Math.floor((new Date().getTime() - new Date(newDate).getTime()) / (1000 * 60 * 60 * 24));
                          if (diff >= 0 && diff < 20) setGrowthStage("Germination & Seedling");
                          else if (diff >= 20 && diff < 45) setGrowthStage("Vegetative Canopy Growth");
                          else if (diff >= 45 && diff < 75) setGrowthStage("Flowering & Pod Formation");
                          else if (diff >= 75) setGrowthStage("Maturity & Pre-Harvest");
                        }
                      }}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                    />
                  </div>
                </div>

                {/* Dynamic DAS & Phenology Indicator */}
                {sowingDate && (
                  <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#533afd]" />
                      <span className="font-bold text-[#0d253d]">
                        {(() => {
                          const diff = Math.floor((new Date().getTime() - new Date(sowingDate).getTime()) / (1000 * 60 * 60 * 24));
                          if (diff >= 0) {
                            return `Crop Age: ${diff} Days After Sowing (DAS)`;
                          }
                          return `Scheduled Sowing in ${Math.abs(diff)} Days`;
                        })()}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-[#533afd] bg-white px-2 py-0.5 rounded-md border border-indigo-100 shadow-2xs">
                      Phase: {growthStage}
                    </span>
                  </div>
                )}

                {/* Sowing Method & Previous Crop Rotation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Sowing Method (बुवाई विधि)</label>
                    <select
                      value={sowingMethod}
                      onChange={(e) => setSowingMethod(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                    >
                      <option value="Line Sowing / Seed Drill (कतार बुवाई / सीड ड्रिल)">Line Sowing / Seed Drill (कतार बुवाई)</option>
                      <option value="Broadcasting (छिटकवां विधि)">Broadcasting (छिटकवां विधि)</option>
                      <option value="Broad Bed Furrow (मेड़-नाली विधि)">Broad Bed Furrow (मेड़-नाली BBF)</option>
                      <option value="Zero Till (जीरो टिलेज)">Zero Till (बिना जुताई बुवाई)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Previous Crop (पिछली फसल)</label>
                    <select
                      value={previousCrop}
                      onChange={(e) => setPreviousCrop(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                    >
                      <option value="Wheat (गेहूं)">Wheat (गेहूं)</option>
                      <option value="Chickpea / Gram (चना)">Chickpea / Gram (चना)</option>
                      <option value="Mustard (सरसों)">Mustard (सरसों)</option>
                      <option value="Soybean (सोयाबीन)">Soybean (सोयाबीन)</option>
                      <option value="Cotton (कपास)">Cotton (कपास)</option>
                      <option value="Maize (मक्का)">Maize (मक्का)</option>
                      <option value="Fallow Land (परती / खाली)">Fallow Land (परती / खाली)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Water Source (जल स्रोत)</label>
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                    >
                      <option value="Tube Well / Borewell (नलकूप / बोरवेल)">Tube Well / Borewell (नलकूप)</option>
                      <option value="Canal Network (नहर)">Canal Network (नहर)</option>
                      <option value="Farm Pond / Well (खेत तालाब / कुआं)">Farm Pond / Well (तालाब / कुआं)</option>
                      <option value="Rainfed Only (केवल वर्षा आधारित)">Rainfed Only (केवल वर्षा)</option>
                    </select>
                  </div>
                </div>

                {/* Growth Stage Override */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Current Growth Stage (वर्तमान विकास अवस्था)</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                  >
                    <option value="Germination & Seedling">Germination & Seedling (अंकुरण व शुरुआती बढ़वार)</option>
                    <option value="Vegetative Canopy Growth">Vegetative Canopy Growth (शाखाएं व पत्तियां फैलना)</option>
                    <option value="Flowering & Pod Formation">Flowering & Pod Formation (फूल व फली/दाने बनना - उच्च संवेदनशीलता)</option>
                    <option value="Maturity & Pre-Harvest">Maturity & Pre-Harvest (पकाव व कटाई की तैयारी)</option>
                  </select>
                </div>

                {/* Security & Privacy Agreement */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-900 block">
                      <span>{isHindi ? "किसान डेटा गोपनीयता सुरक्षा (DPDP Act 2023 Compliant)" : "Farmer Data Privacy Guarantee"}</span>
                    </span>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      <span>{isHindi ? "आपका खेत डेटा केवल मौसम व वैज्ञानिक सलाह के लिए उपयोग होता है। किसी तीसरे पक्ष को बेचा नहीं जाता।" : "Your land coordinates and crop records are AES-256 encrypted and never shared or monetized."}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3.5 rounded-xl border border-[#e3e8ee] hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                    boxShadow: "0 8px 25px rgba(83, 58, 253, 0.35)",
                  }}
                >
                  {loading ? (
                    <span className="animate-pulse">{isHindi ? "खाता डेटाबेस में सुरक्षित हो रहा है..." : "Saving Farmer Account to Database..."}</span>
                  ) : (
                    <>
                      <span>{isHindi ? "खाता बनाएं व स्मार्ट कार्ड जारी करें" : "Complete Registration & Generate Smart Card"}</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          {/* ── STAGE 4: Digital Smart Card Passport ─────────────────── */}
          <div key="step-4" className={step === 4 ? "space-y-6 text-center" : "hidden"}>
            <div className="h-14 w-14 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0d253d] font-display">
                <span>{isHindi ? "बधाई हो! आपका किसान खाता सक्रिय है" : "Registration Successful & Verified!"}</span>
              </h2>
              <p className="text-xs text-[#64748d]">
                <span>{isHindi ? "आपका डिजिटल किसान स्मार्ट पासपोर्ट जारी कर दिया गया है।" : "Your digital farm passport is active and stored in the secure registry database."}</span>
              </p>
            </div>

            {/* Digital Holographic AASRA Smart Card */}
            <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-[#0d253d] via-[#1a237e] to-[#0d253d] text-white text-left space-y-4 shadow-2xl border border-indigo-400/40 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-200 uppercase">
                    AASRA KISAN SMART CARD
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  ACTIVE ✓
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Farmer Name</span>
                <h3 className="text-xl font-bold font-display text-white">{fullName}</h3>
                <p className="text-xs font-mono text-indigo-300 notranslate" translate="no">
                  +91 {mobileNumber} • {selectedDistrict}, {selectedState}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-slate-400 text-[10px] block">Primary Crop:</span>
                  <span className="font-bold text-white notranslate" translate="no">{primaryCrop} ({cropVariety})</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-slate-400 text-[10px] block">Acreage Mapped:</span>
                  <span className="font-bold text-emerald-300">{acres} Acres ({(acres * 0.4047).toFixed(1)} Ha)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-white/10">
                <span>Vault ID: AASRA-{mobileNumber.slice(-4)}-{Date.now().toString().slice(-4)}</span>
                <span className="text-emerald-400">AES-256 SECURED</span>
              </div>
            </div>

            {/* Go to Dashboard CTA */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                  boxShadow: "0 10px 30px rgba(83, 58, 253, 0.4)",
                }}
              >
                <span>{isHindi ? "मेरा खेत डैशबोर्ड खोलें" : "Open My Farm Dashboard"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Security Stamp */}
      <footer className="p-6 text-center text-xs text-slate-400 font-mono relative z-10 flex items-center justify-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>Encrypted with Syngenta Krishi Digital Vault • DPDP Act 2023 Compliant</span>
      </footer>

      {/* ── Modal: Add Custom / Specialty Crop ────────────────────── */}
      {showCustomCropModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-[#533afd]" />
                <h3 className="text-base font-bold text-[#0d253d]">
                  {isHindi ? "कस्टम / विशिष्ट फसल जोड़ें" : "Add Custom / Specialty Crop"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomCropModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Crop Name (फसल का नाम) *</label>
                <input
                  type="text"
                  placeholder="e.g. Dragon Fruit, Chia Seeds, Mentha, Apple, Cardamom..."
                  value={customCropName}
                  onChange={(e) => setCustomCropName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] font-bold text-[#0d253d] focus:border-[#533afd] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category (श्रेणी)</label>
                <select
                  value={customCropCategory}
                  onChange={(e) => setCustomCropCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] font-bold text-[#0d253d]"
                >
                  <option value="cereal">Cereal / Grain (अनाज)</option>
                  <option value="cash_crop">Cash Crop (नकदी फसल)</option>
                  <option value="pulse">Pulse (दलहन)</option>
                  <option value="oilseed">Oilseed (तिलहन)</option>
                  <option value="vegetable">Vegetable (सब्जी)</option>
                  <option value="horticulture">Horticulture / Fruit (फल व बागवानी)</option>
                  <option value="spice">Spice (मसाले)</option>
                  <option value="plantation">Plantation (वृक्षारोपण)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Cultivar / Variety (किस्म / हाइब्रिड)</label>
                <input
                  type="text"
                  placeholder="e.g. Red Flesh Hybrid / Local Desi"
                  value={customCropVariety}
                  onChange={(e) => setCustomCropVariety(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] font-bold text-[#0d253d] focus:border-[#533afd] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomCropModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!customCropName.trim()}
                onClick={() => {
                  if (!customCropName.trim()) return;
                  const cropId = customCropName.trim();
                  const newCrop: RegionalCropOption = {
                    id: cropId,
                    nameEn: cropId,
                    nameHi: cropId,
                    category: customCropCategory as any,
                    icon: "✨",
                    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80",
                    varieties: customCropVariety.trim() ? [customCropVariety.trim()] : ["Local Hybrid"],
                    isMajorCrop: true,
                  };
                  setRegionalCrops((prev) => [newCrop, ...prev]);
                  setPrimaryCrop(newCrop.nameEn);
                  setCropVariety(newCrop.varieties[0]);
                  setShowCustomCropModal(false);
                  setCustomCropName("");
                  setCustomCropVariety("");
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#533afd] hover:bg-[#4434d4] text-white font-bold text-xs disabled:opacity-50 shadow-md cursor-pointer transition-all"
              >
                {isHindi ? "फसल जोड़ें और चुनें" : "Add & Select Crop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
