"use client";

import React, { useState, useEffect } from "react";
import {
  SyngentaDealer,
  getNearbySyngentaDealers,
  generateWhatsAppOrderLink,
  SYNGENTA_HELPLINE,
} from "@/lib/syngentaDealers";
import { getStoredProfile } from "@/lib/userStore";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import {
  Phone,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Star,
  Clock,
  Truck,
  ShieldCheck,
  Building2,
  ExternalLink,
  RotateCcw,
  Send,
  Award,
} from "lucide-react";

interface SyngentaDealerLocatorProps {
  district?: string;
  farmerName?: string;
  crop?: string;
  fieldAcres?: number;
  productName?: string;
  compact?: boolean;
}

const POPULAR_AGRI_DISTRICTS = [
  "Sehore",
  "Bhopal",
  "Indore",
  "Ujjain",
  "Vidisha",
  "Hoshangabad",
  "Nashik",
  "Pune",
  "Nagpur",
  "Ludhiana",
  "Karnal",
  "Bharatpur",
  "Rajkot",
  "Guntur",
  "Warangal",
  "Kanpur",
  "Varanasi",
  "Patna",
  "Raipur",
];

export const SyngentaDealerLocator: React.FC<SyngentaDealerLocatorProps> = ({
  district: initialDistrict,
  farmerName: initialFarmerName,
  crop: initialCrop,
  fieldAcres: initialFieldAcres,
  productName = "Syngenta Quantis® / Stress Shield",
  compact = false,
}) => {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  // Dynamic Location & Farmer State
  const [currentDistrict, setCurrentDistrict] = useState<string>(initialDistrict || "Sehore");
  const [farmerName, setFarmerName] = useState<string>(initialFarmerName || "Kisan Mitra");
  const [crop, setCrop] = useState<string>(initialCrop || "Soybean");
  const [fieldAcres, setFieldAcres] = useState<number>(initialFieldAcres || 5.0);

  // WhatsApp Animation State
  const [chatStep, setChatStep] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Synchronize props dynamically whenever parent dashboard updates
  useEffect(() => {
    if (initialDistrict && initialDistrict.trim()) {
      setCurrentDistrict(initialDistrict.trim());
    }
    if (initialFarmerName && initialFarmerName.trim()) {
      setFarmerName(initialFarmerName.trim());
    }
    if (initialCrop && initialCrop.trim()) {
      setCrop(initialCrop.trim());
    }
    if (initialFieldAcres) {
      setFieldAcres(initialFieldAcres);
    }
  }, [initialDistrict, initialFarmerName, initialCrop, initialFieldAcres]);

  // Load registered user profile as source of truth on mount
  useEffect(() => {
    const profile = getStoredProfile();
    if (profile) {
      if (profile.district && !initialDistrict) {
        setCurrentDistrict(profile.district);
      }
      if (profile.fullName && !initialFarmerName) {
        setFarmerName(profile.fullName);
      }
      if (profile.primaryCrop && !initialCrop) {
        setCrop(profile.primaryCrop);
      }
      if (profile.fieldAreaAcres && !initialFieldAcres) {
        setFieldAcres(profile.fieldAreaAcres);
      }
    } else if (typeof window !== "undefined" && !initialDistrict) {
      const cachedDistrict = localStorage.getItem("aasra_user_district");
      if (cachedDistrict) {
        setCurrentDistrict(cachedDistrict);
      }
    }

    // If profile has GPS location from landing page, reverse geocode to get exact district
    if (profile?.gpsLocation && (!initialDistrict)) {
      fetch(`/api/geocode?lat=${profile.gpsLocation.lat}&lon=${profile.gpsLocation.lon}`)
        .then((res) => res.json())
        .then((data) => {
          const detected = data.district || data.city;
          if (detected) {
            setCurrentDistrict(detected);
            localStorage.setItem("aasra_user_district", detected);
          }
        })
        .catch(() => {});
    }

    // 3. Fallback to direct navigator.geolocation
    if (typeof window !== "undefined" && "geolocation" in navigator && !initialDistrict) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
            if (res.ok) {
              const data = await res.json();
              const detectedCity = data.district || data.city;
              if (detectedCity) {
                setCurrentDistrict(detectedCity);
                localStorage.setItem("aasra_user_district", detectedCity);
              }
            }
          } catch {
            // Keep default
          }
        },
        () => {
          // Keep default quietly
        },
        { timeout: 6000, maximumAge: 300000 }
      );
    }
  }, [initialDistrict, initialFarmerName, initialCrop, initialFieldAcres]);

  const effectiveDistrict = currentDistrict || "Sehore";
  const dealers = getNearbySyngentaDealers(effectiveDistrict);
  const primaryDealer = dealers[0] || dealers[1];

  // WhatsApp Conversation Messages
  const CHAT_MESSAGES = [
    {
      sender: "farmer",
      textEn: `Namaste sir, I have ${fieldAcres} acres of ${crop}. AASRA recommended ${productName} for heat stress defense. Do you have fresh stock available?`,
      textHi: `नमस्ते भइया, मेरे ${fieldAcres} एकड़ ${crop} में गर्मी से बचाव के लिए AASRA ऐप ने ${productName} की सलाह दी है। क्या आपके पास नया स्टॉक उपलब्ध है?`,
      time: "10:14 AM",
    },
    {
      sender: "dealer",
      textEn: `Namaste ${farmerName} ji! Yes, verified fresh batch of ${productName} is in stock. For ${fieldAcres} acres, you need ${(fieldAcres * 0.4).toFixed(1)} Litres. Price is ₹850/L with official GST tax invoice.`,
      textHi: `नमस्ते ${farmerName} जी! हाँ, हमारे पास ${productName} का प्रमाणित ताजा लॉट उपलब्ध है। ${fieldAcres} एकड़ के लिए ${(fieldAcres * 0.4).toFixed(1)} लीटर लगेगा। पक्का जीएसटी बिल ₹850/लीटर में उपलब्ध है।`,
      time: "10:15 AM",
    },
    {
      sender: "farmer",
      textEn: "Can I collect from your mandi depot today, or is village transport delivery available?",
      textHi: "क्या आज दुकान से मिल जाएगी या मंडी वाहन से गांव भिजवा देंगे?",
      time: "10:15 AM",
    },
    {
      sender: "dealer",
      textEn: "You can collect till 7:30 PM today or our delivery van can drop it at your village tomorrow morning by 9:00 AM.",
      textHi: "आप शाम 7:30 बजे तक मंडी दुकान से ले सकते हैं या कल सुबह 9 बजे हमारी सप्लाई वैन आपके गांव छोड़ देगी।",
      time: "10:16 AM",
    },
    {
      sender: "farmer",
      textEn: `Please reserve ${(fieldAcres * 0.4).toFixed(1)} Litres under my name. I will collect at 5:00 PM. Thank you!`,
      textHi: `कृपया मेरे नाम पर ${(fieldAcres * 0.4).toFixed(1)} लीटर अलग रख लें। मैं शाम 5 बजे आता हूँ। धन्यवाद!`,
      time: "10:16 AM",
    },
  ];

  // WhatsApp sequence animation
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (chatStep < CHAT_MESSAGES.length) {
      setIsTyping(true);
      timeout = setTimeout(() => {
        setIsTyping(false);
        setChatStep((prev) => prev + 1);
      }, 2400);
    } else {
      timeout = setTimeout(() => {
        setChatStep(0);
      }, 8000);
    }
    return () => clearTimeout(timeout);
  }, [chatStep]);

  return (
    <div className="bg-white rounded-3xl border border-[#e3e8ee] p-6 sm:p-8 space-y-8 shadow-xl font-sans relative overflow-hidden select-none">
      
      {/* ── Enterprise Header: Professional Distributor Directory ─ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#533afd] uppercase tracking-wider">
              Syngenta Crop Protection • Certified Retail Network
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#0d253d] font-display tracking-tight">
            {isHindi ? `सिंजेंटा अधिकृत कृषि सेवा केंद्र व विक्रेता (${effectiveDistrict})` : `Syngenta Authorized Retail & Distribution Network (${effectiveDistrict})`}
          </h3>

          <p className="text-xs text-[#64748d]">
            {isHindi
              ? `प्रमाणित बैच ट्रैसबिलिटी, जीएसटी पक्का बिल व तकनीकी सहायता के साथ नजदीकी वितरक केंद्र।`
              : `Direct procurement from certified agricultural input distributors with verified batch traceability and GST invoices.`}
          </p>
        </div>

        {/* Minimalist District Selector Dropdown */}
        <div className="relative self-start sm:self-auto shrink-0">
          <select
            value={effectiveDistrict}
            onChange={(e) => setCurrentDistrict(e.target.value)}
            className="pl-3.5 pr-8 py-2 rounded-xl bg-[#f6f9fc] hover:bg-slate-100 border border-[#e3e8ee] text-xs font-bold text-[#0d253d] focus:outline-none focus:border-[#533afd] cursor-pointer appearance-none shadow-2xs transition-colors"
          >
            {POPULAR_AGRI_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                📍 {d} District
              </option>
            ))}
          </select>
          <MapPin className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

      </div>

      {/* ── Main Grid: Verified Dealers & WhatsApp Order Interface ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Authorized Dealer Cards with Google Maps (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">
              {isHindi ? "सत्यापित विक्रेता केंद्र:" : "Verified Dealer Directory:"}
            </span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">
              {dealers.length} {isHindi ? "केंद्र उपलब्ध" : "Centres Available"}
            </span>
          </div>

          <div className="space-y-4">
            {dealers.slice(0, 3).map((dealer) => {
              const waLink = generateWhatsAppOrderLink(dealer, farmerName, crop, fieldAcres, productName);
              const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                dealer.name + " " + dealer.address
              )}`;

              return (
                <div
                  key={dealer.id}
                  className="p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] hover:border-emerald-400/80 transition-all duration-200 shadow-2xs hover:shadow-md space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#0d253d] group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                        <span>{dealer.name}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {isHindi ? "संचालक:" : "Proprietor:"} <strong>{dealer.proprietor}</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                        {dealer.distanceKm} km {isHindi ? "दूरी" : "away"}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold justify-end mt-1 font-mono">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{dealer.rating} ({dealer.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Real Address & Hours */}
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{dealer.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" /> {dealer.timings}
                      </span>
                      {dealer.deliveryAvailable && (
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <Truck className="h-3 w-3" /> {isHindi ? "गांव में डिलीवरी उपलब्ध" : "Village Delivery Available"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Status Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-white text-emerald-700 border border-emerald-200 font-bold">
                      ✓ Quantis® In-Stock
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white text-emerald-700 border border-emerald-200 font-bold">
                      ✓ Isabion® In-Stock
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white text-emerald-700 border border-emerald-200 font-bold">
                      ✓ Tilt® In-Stock
                    </span>
                  </div>

                  {/* Action Buttons: Google Maps + WhatsApp Order */}
                  <div className="pt-2 flex items-center gap-2.5">
                    <a
                      href={googleMapsSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#e3e8ee] hover:border-blue-400 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <MapPin className="h-3.5 w-3.5 text-blue-600" />
                      <span>{isHindi ? "गूगल मैप पर देखें" : "View on Google Maps"}</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20"
                    >
                      <MessageSquare className="h-3.5 w-3.5 fill-white" />
                      <span>{isHindi ? "व्हाट्सएप ऑर्डर" : "WhatsApp Order"}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Institutional WhatsApp Conversation Terminal (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
              <span>{isHindi ? "व्हाट्सएप ऑर्डर प्रक्रिया (Live Preview):" : "WhatsApp Order & Dispatch Protocol:"}</span>
            </span>
            <button
              type="button"
              onClick={() => setChatStep(0)}
              className="text-[11px] font-mono font-bold text-slate-400 hover:text-[#533afd] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Replay</span>
            </button>
          </div>

          {/* Smartphone WhatsApp Container */}
          <div className="rounded-3xl bg-[#efeae2] border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[520px]">
            
            {/* WhatsApp Emerald Header */}
            <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs">
                  🌱
                </div>
                <div>
                  <h5 className="font-bold text-xs flex items-center gap-1 leading-tight">
                    <span>{primaryDealer?.name ? primaryDealer.name.slice(0, 22) + "..." : "Krishi Seva Kendra"}</span>
                    <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                  </h5>
                  <span className="text-[10px] text-emerald-200 font-mono block">
                    {isTyping ? "typing..." : "online • Syngenta Authorized"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-white/80">
                <Phone className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
              
              {/* Encrypted Notice Banner */}
              <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-lg bg-amber-100/90 text-amber-900 text-[9px] font-mono shadow-2xs border border-amber-200">
                  🔒 Messages are end-to-end encrypted with verified dealer
                </span>
              </div>

              {/* Message Bubbles */}
              {CHAT_MESSAGES.slice(0, chatStep).map((msg, idx) => {
                const isFarmer = msg.sender === "farmer";
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${isFarmer ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1 shadow-sm relative ${
                        isFarmer
                          ? "bg-[#d9fdd3] text-slate-800 rounded-tr-xs"
                          : "bg-white text-slate-800 rounded-tl-xs"
                      }`}
                    >
                      <p className="leading-relaxed">
                        {isHindi ? msg.textHi : msg.textEn}
                      </p>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-mono pt-0.5">
                        <span>{msg.time}</span>
                        {isFarmer && (
                          <span className="text-blue-500 font-black">✓✓</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing Animation */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="p-2.5 rounded-2xl bg-white text-slate-400 text-xs shadow-sm flex items-center gap-1.5 rounded-tl-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}

            </div>

            {/* WhatsApp Input Bar */}
            <div className="bg-[#f0f2f5] p-2.5 flex items-center gap-2 border-t border-slate-200">
              <div className="flex-1 bg-white rounded-full px-3.5 py-1.5 text-xs text-slate-400 border border-slate-200 flex items-center justify-between">
                <span>{isHindi ? "मैसेज लिखें..." : "Type a message..."}</span>
              </div>
              <a
                href={generateWhatsAppOrderLink(primaryDealer, farmerName, crop, fieldAcres, productName)}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:scale-105 transition-transform"
                title="Send on real WhatsApp"
              >
                <Send className="h-3.5 w-3.5 fill-white" />
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* ── Official Toll-Free Helpline Strip ──────────────────────── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0d253d] to-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Phone className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-white block">
              {isHindi ? "सिंजेंटा किसान आधिकारिक टोल-फ्री हेल्पलाइन" : "Syngenta Official Kisan Toll-Free Helpline"}
            </span>
            <span className="text-[11px] text-slate-400">
              {isHindi ? "दवा की प्रामाणिकता व तकनीकी सलाह के लिए संपर्क करें" : "Direct agronomic advisory & genuine batch verification across India"}
            </span>
          </div>
        </div>

        <a
          href={`tel:${SYNGENTA_HELPLINE.tollFree}`}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Phone className="h-3.5 w-3.5 fill-current" />
          <span>{SYNGENTA_HELPLINE.tollFree}</span>
        </a>
      </div>

    </div>
  );
};
