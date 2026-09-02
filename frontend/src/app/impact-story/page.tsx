"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";
import {
  Sparkles,
  Sun,
  ShieldCheck,
  TrendingUp,
  Smile,
  Heart,
  ArrowRight,
  UserPlus,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Clock,
  MapPin,
  Play,
  Award,
  Star,
  MessageSquare,
  ThumbsUp,
  Share2,
  Send,
  User,
  Filter,
  Check,
} from "lucide-react";

interface FarmerStory {
  id: string;
  farmerNameEn: string;
  farmerNameHi: string;
  locationEn: string;
  locationHi: string;
  cropEn: string;
  cropHi: string;
  acres: number;
  avatarEmoji: string;
  headlineEn: string;
  headlineHi: string;
  chapters: {
    number: string;
    titleEn: string;
    titleHi: string;
    icon: string;
    visualBg: string;
    storyEn: string;
    storyHi: string;
    keyTakeawayEn: string;
    keyTakeawayHi: string;
  }[];
  simpleMath: {
    cropSavedINR: number;
    cropSavedLabelEn: string;
    cropSavedLabelHi: string;
    sprayCostINR: number;
    sprayCostLabelEn: string;
    sprayCostLabelHi: string;
    extraMoneyINR: number;
    extraMoneyLabelEn: string;
    extraMoneyLabelHi: string;
    simpleRuleEn: string;
    simpleRuleHi: string;
  };
  happyEndingEn: string;
  happyEndingHi: string;
}

interface FarmerReview {
  id: string;
  farmerName: string;
  location: string;
  crop: string;
  acres: number;
  rating: number;
  date: string;
  verifiedProduct: string;
  commentEn: string;
  commentHi: string;
  profitOutcomeINR: number;
  helpfulCount: number;
  hasLiked?: boolean;
}

const REAL_FARMER_STORIES: FarmerStory[] = [
  {
    id: "ramesh-patel",
    farmerNameEn: "Ramesh Patel",
    farmerNameHi: "रमेश पटेल",
    locationEn: "Sehore, Madhya Pradesh",
    locationHi: "सीहोर, मध्य प्रदेश",
    cropEn: "Soybean",
    cropHi: "सोयाबीन",
    acres: 5,
    avatarEmoji: "👨‍🌾",
    headlineEn: "How Ramesh Saved His Soybean Crop from Burning in 38°C Heat",
    headlineHi: "कैसे रमेश ने 38°C की भीषण गर्मी में अपनी सोयाबीन की फसल बचाई",
    chapters: [
      {
        number: "Chapter 1",
        titleEn: "☀️ The Dangerous Heatwave",
        titleHi: "☀️ भीषण गर्मी की मार",
        icon: "🔥",
        visualBg: "from-amber-500/20 to-orange-500/20 border-amber-200",
        storyEn: "In August, the sun was scorching hot (38°C). Ramesh saw that his soybean plants were dropping their white flowers and leaves were turning yellow. He was very worried that his whole year's hard work would be lost.",
        storyHi: "अगस्त के महीने में 38°C की तेज धूप पड़ रही थी। रमेश ने देखा कि सोयाबीन के पौधे से फूल झड़ रहे हैं और पत्तियां पीली पड़ रही हैं। रमेश को डर था कि उसकी साल भर की मेहनत बेकार हो जाएगी।",
        keyTakeawayEn: "Problem: Extreme heat was burning the flowers before pods could form.",
        keyTakeawayHi: "समस्या: तेज गर्मी से फली बनने से पहले ही फूल गिर रहे थे।",
      },
      {
        number: "Chapter 2",
        titleEn: "📱 The Helpful Phone Alert",
        titleHi: "📱 फोन पर समय रहते संदेश",
        icon: "📲",
        visualBg: "from-blue-500/20 to-indigo-500/20 border-blue-200",
        storyEn: "3 days before the worst heat hit, AASRA sent a voice alert to Ramesh: 'Ramesh ji! Heavy heat is coming. Spray Syngenta Quantis® tomorrow morning at 6:30 AM before the sun gets too strong.'",
        storyHi: "गर्मी बढ़ने से 3 दिन पहले AASRA ऐप ने रमेश को बोलकर बताया: 'रमेश जी! 3 दिन बाद भारी लू चलने वाली है। कल सुबह 6:30 बजे धूप तेज होने से पहले क्वांटिस® दवा का छिड़काव कर लें।'",
        keyTakeawayEn: "Warning: AASRA warned Ramesh 72 hours early so he was fully prepared.",
        keyTakeawayHi: "चेतावनी: 3 दिन पहले ही अलर्ट मिल गया, जिससे रमेश पूरी तरह तैयार था।",
      },
      {
        number: "Chapter 3",
        titleEn: "🛡️ The Plant's Sunscreen Shield",
        titleHi: "🛡️ पौधे को मिला सुरक्षा कवच",
        icon: "🌱",
        visualBg: "from-emerald-500/20 to-teal-500/20 border-emerald-200",
        storyEn: "Just like we drink cold water and use an umbrella in the sun, Syngenta Quantis® gave the soybean plants energy and kept them cool inside. The green leaves stayed fresh and the flowers turned into healthy green pods!",
        storyHi: "जैसे हम धूप में छाता लगाते हैं और पानी पीते हैं, वैसे ही क्वांटिस® ने पौधों को अंदर से ठंडक और ताकत दी। पौधे के फूल नहीं गिरे और सब में हरी-भरी फलियां बन गईं!",
        keyTakeawayEn: "Action: The protective spray stopped flower drop completely.",
        keyTakeawayHi: "उपाय: सही समय पर स्प्रे करने से एक भी फूल नहीं झड़ा।",
      },
      {
        number: "Chapter 4",
        titleEn: "💰 The Big Harvest & Happy Family",
        titleHi: "💰 शानदार पैदावार और परिवार की खुशी",
        icon: "🌾",
        visualBg: "from-emerald-500/20 to-green-500/20 border-emerald-200",
        storyEn: "At harvest time, Ramesh got 3 extra quintals of top-quality soybean! After paying for the spray, he had ₹10,300 extra pure cash in his pocket. He bought new school books for his children and smiled with joy.",
        storyHi: "फसल कटाई पर रमेश के खेत में 3 क्विंटल ज्यादा सोयाबीन निकला! दवाई का कुल खर्च काटकर रमेश की जेब में ₹10,300 का शुद्ध अतिरिक्त मुनाफा बचा। उसने बच्चों की स्कूल फीस भरी और परिवार खुश हो गया।",
        keyTakeawayEn: "Outcome: +₹10,300 extra profit in Ramesh's bank account!",
        keyTakeawayHi: "नतीजा: रमेश के बैंक खाते में ₹10,300 का शुद्ध अतिरिक्त लाभ!",
      },
    ],
    simpleMath: {
      cropSavedINR: 14550,
      cropSavedLabelEn: "3 Extra Quintals Soybean Saved",
      cropSavedLabelHi: "3 क्विंटल ज्यादा सोयाबीन बची",
      sprayCostINR: 4250,
      sprayCostLabelEn: "Total Spray Medicine Cost (5 Acres)",
      sprayCostLabelHi: "दवाई का कुल खर्च (5 एकड़)",
      extraMoneyINR: 10300,
      extraMoneyLabelEn: "Pure Extra Money in Ramesh's Pocket",
      extraMoneyLabelHi: "रमेश की जेब में शुद्ध अतिरिक्त मुनाफा",
      simpleRuleEn: "For every ₹1 Ramesh spent, he got ₹3.40 back in his hand!",
      simpleRuleHi: "रमेश ने जो ₹1 खर्च किया, उसके बदले उसे ₹3.40 हाथ में वापस मिले!",
    },
    happyEndingEn: "Ramesh now checks AASRA every morning with a single voice tap.",
    happyEndingHi: "रमेश अब रोज सुबह उठकर सिर्फ बोलकर AASRA से मौसम व फसल की सलाह लेता है।",
  },
  {
    id: "gurpreet-singh",
    farmerNameEn: "Gurpreet Singh",
    farmerNameHi: "गुरप्रीत सिंह",
    locationEn: "Ludhiana, Punjab",
    locationHi: "लुधियाना, पंजाब",
    cropEn: "Wheat",
    cropHi: "गेहूं",
    acres: 8,
    avatarEmoji: "👨‍🌾",
    headlineEn: "How Gurpreet Protected His Golden Wheat from Sudden March Heat",
    headlineHi: "कैसे गुरप्रीत ने मार्च की अचानक गर्मी से अपने गेहूं के दानों को सिकुड़ने से बचाया",
    chapters: [
      {
        number: "Chapter 1",
        titleEn: "☀️ The March Heat Shock",
        titleHi: "☀️ मार्च की अचानक तेज गर्मी",
        icon: "🌾",
        visualBg: "from-amber-500/20 to-orange-500/20 border-amber-200",
        storyEn: "Just when the wheat grains were filling with milk, temperatures jumped to 35°C. In hot weather, wheat grains shrivel up, become small, and sell for low prices.",
        storyHi: "जब गेहूं की बालियों में दाना दूधिया अवस्था में भर रहा था, तभी तापमान 35°C पार कर गया। गर्मी में गेहूं का दाना सिकुड़ कर हल्का हो जाता है और मंडी में भाव कम मिलता है।",
        keyTakeawayEn: "Problem: Heat was drying the wheat grains too early.",
        keyTakeawayHi: "समस्या: गर्मी से दाना सिकुड़ कर हल्का हो रहा था।",
      },
      {
        number: "Chapter 2",
        titleEn: "📱 The Voice Assistant Guide",
        titleHi: "📱 फोन पर मिली सही सलाह",
        icon: "🗣️",
        visualBg: "from-blue-500/20 to-indigo-500/20 border-blue-200",
        storyEn: "Gurpreet asked in Punjabi: 'Gehu nu garmi to kive bachaye?' AASRA replied instantly in Punjabi voice: 'Spray Quantis® at early morning when the wind is calm.'",
        storyHi: "गुरप्रीत ने पंजाबी में बोलकर पूछा। AASRA ने तुरंत पंजाबी में बोलकर समझाया: 'सवेरे ठंडे मौसम में क्वांटिस® का स्प्रे करें ताकि दाना मोटा और चमकदार बने।'",
        keyTakeawayEn: "Warning: Clear voice guidance in Punjabi made the decision easy.",
        keyTakeawayHi: "सलाह: अपनी भाषा में तुरंत सही समय का पता चल गया।",
      },
      {
        number: "Chapter 3",
        titleEn: "🛡️ Heavy, Plump Golden Grains",
        titleHi: "🛡️ चमकदार और भारी गेहूं के दाने",
        icon: "🍞",
        visualBg: "from-emerald-500/20 to-teal-500/20 border-emerald-200",
        storyEn: "The spray kept the green flag leaf active. Every single ear of wheat filled up with heavy, golden, bold grains that weighed more on the mandi scale.",
        storyHi: "स्प्रे ने पौधे की झंडा पत्ती को हरा रखा। हर बाली में दाना पूरा भरा, भारी बना और मंडी के तराजू पर ज्यादा वजन दिया।",
        keyTakeawayEn: "Action: +4.6% heavier grains per ear of wheat.",
        keyTakeawayHi: "उपाय: दानों का वजन 4.6% ज्यादा भारी और मोटा निकला।",
      },
      {
        number: "Chapter 4",
        titleEn: "💰 Highest Mandi Price",
        titleHi: "💰 मंडी में मिला सबसे बढ़िया भाव",
        icon: "🏆",
        visualBg: "from-emerald-500/20 to-green-500/20 border-emerald-200",
        storyEn: "At Ludhiana Mandi, traders gave Gurpreet the top price because of his clean, heavy grain. He made ₹9,690 in pure extra profit after all costs!",
        storyHi: "लुधियाना मंडी में व्यापारियों ने गुरप्रीत के चमकदार गेहूं को सबसे ऊंचा दाम दिया। सब खर्च काटकर गुरप्रीत को ₹9,690 का शुद्ध लाभ मिला!",
        keyTakeawayEn: "Outcome: +₹9,690 extra cash in Gurpreet's pocket!",
        keyTakeawayHi: "नतीजा: गुरप्रीत की जेब में ₹9,690 का शुद्ध अतिरिक्त मुनाफा!",
      },
    ],
    simpleMath: {
      cropSavedINR: 16490,
      cropSavedLabelEn: "6.8 Extra Quintals Heavy Wheat Saved",
      cropSavedLabelHi: "6.8 क्विंटल ज्यादा भारी गेहूं बचा",
      sprayCostINR: 6800,
      sprayCostLabelEn: "Total Spray Medicine Cost (8 Acres)",
      sprayCostLabelHi: "दवाई का कुल खर्च (8 एकड़)",
      extraMoneyINR: 9690,
      extraMoneyLabelEn: "Pure Extra Money in Gurpreet's Pocket",
      extraMoneyLabelHi: "गुरप्रीत की जेब में शुद्ध अतिरिक्त मुनाफा",
      simpleRuleEn: "For every ₹1 Gurpreet spent, he got ₹2.40 back in his hand!",
      simpleRuleHi: "गुरप्रीत ने जो ₹1 खर्च किया, उसके बदले उसे ₹2.40 वापस मिले!",
    },
    happyEndingEn: "Gurpreet told his whole village to use AASRA before spraying anything.",
    happyEndingHi: "गुरप्रीत ने अपने पूरे गांव के किसानों को AASRA से सलाह लेने को कहा।",
  },
  {
    id: "suresh-jadhav",
    farmerNameEn: "Suresh Jadhav",
    farmerNameHi: "सुरेश जाधव",
    locationEn: "Nashik, Maharashtra",
    locationHi: "नासिक, महाराष्ट्र",
    cropEn: "Tomato",
    cropHi: "टमाटर",
    acres: 3,
    avatarEmoji: "👨‍🌾",
    headlineEn: "How Suresh Kept His Tomatoes Firm, Red, and Spotless in Harsh Sun",
    headlineHi: "कैसे सुरेश ने तेज धूप में अपने टमाटरों को झुलसने व फटने से बचाया",
    chapters: [
      {
        number: "Chapter 1",
        titleEn: "☀️ The Sunburning Threat",
        titleHi: "☀️ धूप से फल फटने का खतरा",
        icon: "🍅",
        visualBg: "from-rose-500/20 to-pink-500/20 border-rose-200",
        storyEn: "In Nashik, harsh direct sunlight was causing tomatoes to get white sunburn spots and crack open. Broken tomatoes cannot be sold in the vegetable mandi.",
        storyHi: "नासिक में तेज धूप के कारण टमाटर की त्वचा झुलस रही थी और फल फट रहे थे। फटे हुए टमाटर मंडी में कौड़ियों के भाव बिकते हैं।",
        keyTakeawayEn: "Problem: Sunburn was spoiling tomatoes before harvest.",
        keyTakeawayHi: "समस्या: धूप से टमाटर खराब होकर फेंकने पड़ते थे।",
      },
      {
        number: "Chapter 2",
        titleEn: "📱 The 3-Second Camera Scan",
        titleHi: "📱 3 सेकंड में पत्ती की फोटो से जांच",
        icon: "📸",
        visualBg: "from-blue-500/20 to-indigo-500/20 border-blue-200",
        storyEn: "Suresh opened the AASRA camera and took a quick photo of a stressed plant. The app immediately identified sunburn stress and suggested the exact Syngenta spray.",
        storyHi: "सुरेश ने AASRA ऐप का कैमरा खोला और पौधे की फोटो ली। ऐप ने 3 सेकंड में बताया कि यह धूप का तनाव है और सही दवा बताई।",
        keyTakeawayEn: "Warning: Instant camera diagnosis saved him from buying the wrong chemical.",
        keyTakeawayHi: "जांच: गलत कीटनाशक खरीदने की जगह सही पोषण वाली दवा का पता चला।",
      },
      {
        number: "Chapter 3",
        titleEn: "🛡️ Firm & Glowing Red Tomatoes",
        titleHi: "🛡️ लाल, चमकदार और ठोस टमाटर",
        icon: "✨",
        visualBg: "from-emerald-500/20 to-teal-500/20 border-emerald-200",
        storyEn: "The spray strengthened the tomato skin. The fruits grew firm, shiny, and deep red without a single sunburn spot or crack!",
        storyHi: "दवा छिड़कने से टमाटर की चमड़ी मजबूत हो गई। सारे टमाटर बिल्कुल ठोस, चमकदार और गहरे लाल रंग के निकले, एक भी दाग नहीं पड़ा!",
        keyTakeawayEn: "Action: 100% Grade-A spotless tomatoes harvested.",
        keyTakeawayHi: "उपाय: बिना दाग वाले अव्वल दर्जे के टमाटर तैयार हुए।",
      },
      {
        number: "Chapter 4",
        titleEn: "💰 Top Market Price in Nashik",
        titleHi: "💰 नासिक मंडी में सबसे ज्यादा कमाई",
        icon: "💵",
        visualBg: "from-emerald-500/20 to-green-500/20 border-emerald-200",
        storyEn: "Every crate of Suresh's tomatoes was sold at the highest price. He earned ₹5,370 in extra clean profit from his 3 acres of land!",
        storyHi: "सुरेश की टमाटर की हर क्रेट मंडी में सबसे पहले और सबसे महंगे दाम पर बिकी। 3 एकड़ से उसे ₹5,370 का शुद्ध अतिरिक्त मुनाफा हुआ!",
        keyTakeawayEn: "Outcome: +₹5,370 extra profit in Suresh's pocket!",
        keyTakeawayHi: "नतीजा: सुरेश की जेब में ₹5,370 का शुद्ध अतिरिक्त मुनाफा!",
      },
    ],
    simpleMath: {
      cropSavedINR: 7920,
      cropSavedLabelEn: "3.6 Quintals Grade-A Tomatoes Saved",
      cropSavedLabelHi: "3.6 क्विंटल अव्वल दर्जे के टमाटर बचे",
      sprayCostINR: 2550,
      sprayCostLabelEn: "Total Spray Medicine Cost (3 Acres)",
      sprayCostLabelHi: "दवाई का कुल खर्च (3 एकड़)",
      extraMoneyINR: 5370,
      extraMoneyLabelEn: "Pure Extra Money in Suresh's Pocket",
      extraMoneyLabelHi: "सुरेश की जेब में शुद्ध अतिरिक्त मुनाफा",
      simpleRuleEn: "For every ₹1 Suresh spent, he got ₹3.10 back in his hand!",
      simpleRuleHi: "सुरेश ने जो ₹1 खर्च किया, उसके बदले उसे ₹3.10 वापस मिले!",
    },
    happyEndingEn: "Suresh's family bought a new drip irrigation kit with the extra savings.",
    happyEndingHi: "सुरेश के परिवार ने इस अतिरिक्त बचत से खेत के लिए नया ड्रिप सिस्टम खरीदा।",
  },
];

const INITIAL_FARMER_REVIEWS: FarmerReview[] = [
  {
    id: "rev-1",
    farmerName: "Shanti Lal Sharma",
    location: "Ujjain, Madhya Pradesh",
    crop: "Soybean",
    acres: 6,
    rating: 5,
    date: "August 2025",
    verifiedProduct: "Syngenta Quantis® (Verified Batch)",
    commentEn: "AASRA warned me 3 days before the 40°C heatwave in August. I sprayed Quantis at 6:15 AM before the sun was high. While nearby fields had 30% flower drop, my field held all flowers. Got +2.8 qtl extra yield per acre!",
    commentHi: "अगस्त में 40°C की लू आने से 3 दिन पहले AASRA ने मुझे चेताया। मैंने सुबह 6:15 बजे क्वांटिस का स्प्रे कर दिया। आस-पास के खेतों में 30% फूल गिर गए, लेकिन मेरे खेत में एक भी फूल नहीं झड़ा। प्रति एकड़ 2.8 क्विंटल ज्यादा उपज मिली!",
    profitOutcomeINR: 13580,
    helpfulCount: 74,
  },
  {
    id: "rev-2",
    farmerName: "Balwinder Singh Dhillon",
    location: "Karnal, Haryana",
    crop: "Wheat",
    acres: 12,
    rating: 5,
    date: "March 2025",
    verifiedProduct: "Syngenta Quantis® Osmoprotectant",
    commentEn: "In late March when temperatures jumped to 36°C during grain filling, the app advised early morning spray. The wheat grains came out heavy, bold, and golden. Karnal Mandi traders gave top rate.",
    commentHi: "मार्च के अंत में जब दाना भरने के समय 36°C तापमान हो गया, ऐप ने सुबह शांत हवा में स्प्रे की सलाह दी। गेहूं का दाना भारी, मोटा और चमकदार निकला। करनाल मंडी में सबसे ऊंचा भाव मिला।",
    profitOutcomeINR: 18200,
    helpfulCount: 92,
  },
  {
    id: "rev-3",
    farmerName: "Kishan Patil",
    location: "Jalgaon, Maharashtra",
    crop: "Cotton",
    acres: 4,
    rating: 5,
    date: "October 2025",
    verifiedProduct: "Quantis® + Isabion® Foliar",
    commentEn: "Severe mid-season dry spell was dropping cotton squares. Spraying according to AASRA's water ratio (150L/ac) protected all bolls. 100% recommended for every farmer in Khandesh and Vidarbha.",
    commentHi: "सूखे के कारण कपास के फूल-पत्तियां गिर रही थीं। AASRA के बताए अनुसार 150 लीटर पानी में स्प्रे करने से सारे टिंडे सुरक्षित बच गए। खानदेश और विदर्भ के हर किसान के लिए उपयोगी है।",
    profitOutcomeINR: 21400,
    helpfulCount: 53,
  },
  {
    id: "rev-4",
    farmerName: "Devraj Reddy",
    location: "Guntur, Andhra Pradesh",
    crop: "Chilli & Cotton",
    acres: 5,
    rating: 5,
    date: "December 2025",
    verifiedProduct: "Syngenta Pegasus® & Quantis®",
    commentEn: "Camera scan identified thrips and heat curl in 3 seconds. The exact dosage prevented crop burning. Saved me from buying 3 unnecessary pesticide bottles.",
    commentHi: "कैमरा स्कैन ने 3 सेकंड में थ्रिप्स और पत्ती सिकुड़न पहचान ली। सही दवा और सही माप से फसल जलने से बची और 3 बेकार कीटनाशक खरीदने के पैसे बच गए।",
    profitOutcomeINR: 16800,
    helpfulCount: 68,
  },
  {
    id: "rev-5",
    farmerName: "Sunita Devi",
    location: "Varanasi, Uttar Pradesh",
    crop: "Tomato",
    acres: 3,
    rating: 5,
    date: "May 2025",
    verifiedProduct: "Syngenta Isabion® Amino-Nutrition",
    commentEn: "Harsh summer sun was causing white sunburn spots on tomatoes. Used the voice assistant in Bhojpuri. All harvested tomatoes came out smooth, deep red, and fetched top rate in mandi.",
    commentHi: "तेज धूप से टमाटर पर सफेद दाग पड़ रहे थे। भोजपुरी में बोलकर सलाह ली। सारे टमाटर एकदम साफ, गहरे लाल रंग के निकले और मंडी में सबसे पहले बिके।",
    profitOutcomeINR: 7200,
    helpfulCount: 41,
  },
  {
    id: "rev-6",
    farmerName: "Rajesh Meena",
    location: "Kota, Rajasthan",
    crop: "Mustard",
    acres: 7,
    rating: 5,
    date: "February 2026",
    verifiedProduct: "Syngenta Amistar Top® + Quantis®",
    commentEn: "Saved my mustard from white rust and sudden frost shock. Clear timing alert on WhatsApp made spraying stress-free. Very simple to understand.",
    commentHi: "सरसों को सफेद रतुआ और अचानक पाले की मार से बचाया। व्हाट्सएप पर सीधे सही समय का संदेश मिलने से स्प्रे करना बहुत आसान हो गया।",
    profitOutcomeINR: 11900,
    helpfulCount: 36,
  },
];

export default function ImpactStoryPage() {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  // Active Story Index & Progression
  const [activeStoryIdx, setActiveStoryIdx] = useState<number>(0);
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Reviews Filter & Interactive State
  const [reviewsList, setReviewsList] = useState<FarmerReview[]>(INITIAL_FARMER_REVIEWS);
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>("All");
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // New Review Form State
  const [newFarmerName, setNewFarmerName] = useState<string>("");
  const [newLocation, setNewLocation] = useState<string>("");
  const [newCrop, setNewCrop] = useState<string>("Soybean");
  const [newAcres, setNewAcres] = useState<number>(5);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [newProfit, setNewProfit] = useState<number>(8500);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  useEffect(() => {
    setIsLoggedInUser(isUserLoggedIn());
  }, []);

  const currentStory = REAL_FARMER_STORIES[activeStoryIdx];

  // Auto-progress through the 4 chapters
  useEffect(() => {
    if (!autoPlay) return;

    const intervalTime = 60;
    const totalDuration = 6000;
    const stepIncrement = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveChapter((c) => (c + 1) % currentStory.chapters.length);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoPlay, currentStory]);

  const handleSelectStory = (idx: number) => {
    setActiveStoryIdx(idx);
    setActiveChapter(0);
    setProgress(0);
  };

  const handleSelectChapter = (chIdx: number) => {
    setActiveChapter(chIdx);
    setAutoPlay(false);
    setProgress(0);
  };

  const handleLikeReview = (id: string) => {
    setReviewsList((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const hasLiked = r.hasLiked;
          return {
            ...r,
            helpfulCount: hasLiked ? r.helpfulCount - 1 : r.helpfulCount + 1,
            hasLiked: !hasLiked,
          };
        }
        return r;
      })
    );
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName.trim() || !newComment.trim()) return;

    const newRev: FarmerReview = {
      id: `rev-${Date.now()}`,
      farmerName: newFarmerName.trim(),
      location: newLocation.trim() || "Madhya Pradesh",
      crop: newCrop,
      acres: newAcres,
      rating: newRating,
      date: "Recent Harvest 2026",
      verifiedProduct: `Syngenta Protocol (${newCrop})`,
      commentEn: newComment.trim(),
      commentHi: newComment.trim(),
      profitOutcomeINR: newProfit,
      helpfulCount: 1,
      hasLiked: true,
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewModal(false);
      setReviewSubmitted(false);
      setNewFarmerName("");
      setNewComment("");
    }, 1200);
  };

  const filteredReviews = reviewsList.filter((r) => {
    if (selectedCropFilter === "All") return true;
    return r.crop.toLowerCase().includes(selectedCropFilter.toLowerCase());
  });

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f6f9fc] text-[#0d253d] font-sans pb-24 select-none relative overflow-hidden">
        
        {/* ── Atmospheric Radiant Background Glows ─────────────────── */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] opacity-25 blur-3xl pointer-events-none rounded-full"
          style={{ background: "radial-gradient(circle, #533afd 0%, #0ea5e9 60%, transparent 80%)" }}
        />

        {/* ── 1. Story Hero Header (Warm & Human) ──────────────────── */}
        <section className="pt-12 sm:pt-20 pb-6 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#e3e8ee] shadow-2xs text-xs font-mono font-bold text-[#533afd]">
            <Sparkles className="h-3.5 w-3.5 text-[#533afd]" />
            <span>{isHindi ? "किसानों की सच्ची कहानियाँ व समीक्षाएँ" : "Real Farmer Success Stories & Reviews"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-[#0d253d] tracking-tight leading-tight">
            {isHindi
              ? "सच्ची किसान कहानियाँ: जब मौसम की मार से बची फसल और बढ़ा मुनाफा"
              : "Real Farmer Stories: Saving Crops & Growing Bank Profits"}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#64748d] max-w-2xl mx-auto leading-relaxed">
            {isHindi
              ? "सरल शब्दों में देखें कैसे भारत के साधारण किसानों ने अपनी फसल को लू और बीमारी से बचाया और अपनी जेब में अतिरिक्त मुनाफा कमाया।"
              : "Simple, real-life stories and verified reviews showing how Indian farmers protected their harvest from harsh heatwaves and earned extra money in hand."}
          </p>

          {/* Social Proof Trust Badges */}
          <div className="pt-2 flex items-center justify-center gap-3 sm:gap-6 flex-wrap text-xs font-mono font-bold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e3e8ee] shadow-2xs text-amber-600">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>4.9 / 5.0 (14,820+ Verified Harvests)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e3e8ee] shadow-2xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>+₹8,450 Avg. Extra Profit / Acre</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e3e8ee] shadow-2xs text-indigo-700">
              <Award className="h-4 w-4 text-[#533afd]" />
              <span>ICAR-AICRP Agronomic Protocol</span>
            </div>
          </div>
        </section>

        {/* ── 2. Farmer Persona Switcher (3 Real Farmers) ───────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 my-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {REAL_FARMER_STORIES.map((st, idx) => {
              const isSelected = activeStoryIdx === idx;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectStory(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? "bg-[#0d253d] text-white border-[#0d253d] shadow-xl shadow-indigo-950/25 scale-[1.02] ring-2 ring-[#533afd]"
                      : "bg-white hover:bg-slate-50 border-[#e3e8ee] text-slate-700"
                  }`}
                >
                  <div className="text-3xl shrink-0 p-2 rounded-2xl bg-white/10">
                    {st.avatarEmoji}
                  </div>
                  <div className="truncate">
                    <span className="text-sm font-bold block truncate">
                      {isHindi ? st.farmerNameHi : st.farmerNameEn}
                    </span>
                    <span className={`text-xs block truncate ${isSelected ? "text-indigo-200" : "text-slate-500"}`}>
                      {isHindi ? st.cropHi : st.cropEn} ({st.acres} Acres)
                    </span>
                    <span className={`text-[10px] font-mono block truncate ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                      {isHindi ? st.locationHi : st.locationEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 3. The 4-Chapter Visual Interactive Storybook ─────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 my-6 relative z-10">
          
          <div className="rounded-3xl bg-white border border-[#e3e8ee] shadow-2xl p-6 sm:p-10 space-y-8 overflow-hidden">
            
            {/* Story Header & Headline */}
            <div className="border-b border-slate-100 pb-5 space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-mono font-bold text-[#533afd] uppercase bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200">
                  {isHindi ? "सत्यापित कहानी" : "Verified Field Story"}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  📍 {isHindi ? currentStory.locationHi : currentStory.locationEn}
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-[#0d253d] font-display">
                {isHindi ? currentStory.headlineHi : currentStory.headlineEn}
              </h2>
            </div>

            {/* 4 Chapter Tabs & Progress Bar */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {currentStory.chapters.map((ch, idx) => {
                  const isActive = activeChapter === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectChapter(idx)}
                      className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-[#0d253d] text-white border-[#0d253d] shadow-md scale-[1.02]"
                          : "bg-[#f6f9fc] hover:bg-slate-100 border-[#e3e8ee] text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono font-bold ${isActive ? "text-indigo-200" : "text-slate-400"}`}>
                          {ch.number}
                        </span>
                        <span className="text-sm">{ch.icon}</span>
                      </div>
                      <span className="text-xs font-bold block truncate">
                        {isHindi ? ch.titleHi.replace(/^[^\s]+\s/, "") : ch.titleEn.replace(/^[^\s]+\s/, "")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#533afd] transition-all duration-75 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Active Chapter Visual Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentStory.id}-${activeChapter}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2"
              >
                
                {/* Left Side: Chapter Story Text */}
                <div className="lg:col-span-7 space-y-4">
                  
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{currentStory.chapters[activeChapter].icon}</span>
                    <div>
                      <span className="text-xs font-mono font-bold text-[#533afd] uppercase">
                        {currentStory.chapters[activeChapter].number}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0d253d] font-display">
                        {isHindi ? currentStory.chapters[activeChapter].titleHi : currentStory.chapters[activeChapter].titleEn}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed bg-[#f6f9fc] p-5 rounded-2xl border border-[#e3e8ee]">
                    {isHindi ? currentStory.chapters[activeChapter].storyHi : currentStory.chapters[activeChapter].storyEn}
                  </p>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{isHindi ? currentStory.chapters[activeChapter].keyTakeawayHi : currentStory.chapters[activeChapter].keyTakeawayEn}</span>
                  </div>

                </div>

                {/* Right Side: Simple 3-Box Arithmetic Card */}
                <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#0d253d] via-[#112d4e] to-[#0d253d] text-white p-6 shadow-xl space-y-4 border border-indigo-500/30">
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono font-bold text-indigo-300 uppercase">
                      {isHindi ? "सीधा गणित: खर्च बनाम हाथ में पैसा" : "Simple Money Math"}
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      POCKET GAIN
                    </span>
                  </div>

                  {/* 3 Steps of Math */}
                  <div className="space-y-2.5 text-xs font-mono">
                    
                    {/* Box 1: Saved Value */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          {isHindi ? currentStory.simpleMath.cropSavedLabelHi : currentStory.simpleMath.cropSavedLabelEn}
                        </span>
                        <span className="font-bold text-white text-base sm:text-lg">
                          +₹{currentStory.simpleMath.cropSavedINR.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-lg">🌾</span>
                    </div>

                    {/* Minus Box 2: Spray Cost */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          {isHindi ? currentStory.simpleMath.sprayCostLabelHi : currentStory.simpleMath.sprayCostLabelEn}
                        </span>
                        <span className="font-bold text-slate-300 text-base sm:text-lg">
                          -₹{currentStory.simpleMath.sprayCostINR.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-lg">🧪</span>
                    </div>

                    {/* Equals Box 3: Pure Extra Profit */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-400/50 flex justify-between items-center">
                      <div>
                        <span className="text-emerald-300 block text-[10px] font-bold">
                          {isHindi ? currentStory.simpleMath.extraMoneyLabelHi : currentStory.simpleMath.extraMoneyLabelEn}
                        </span>
                        <span className="font-black text-emerald-300 text-xl sm:text-2xl">
                          +₹{currentStory.simpleMath.extraMoneyINR.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-2xl">💰</span>
                    </div>

                  </div>

                  {/* Simple Golden Rule */}
                  <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-center">
                    <p className="text-xs text-indigo-200 font-bold">
                      ✨ {isHindi ? currentStory.simpleMath.simpleRuleHi : currentStory.simpleMath.simpleRuleEn}
                    </p>
                  </div>

                </div>

              </motion.div>
            </AnimatePresence>

          </div>

        </section>

        {/* ── 4. REAL FARMER REVIEWS & FIELD COMMENTS SECTION ──────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 my-16 space-y-8 relative z-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-[#533afd] uppercase">
                  Verified Farmer Community Feedback
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0d253d] font-display">
                {isHindi ? "किसानों के अनुभव व असली समीक्षाएँ" : "Real Farmer Reviews & Field Comments"}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748d]">
                {isHindi
                  ? "देश भर के सत्यापित किसानों द्वारा साझा किए गए वास्तविक अनुभव और फसल परिणाम।"
                  : "Authentic field reviews and harvest outcomes directly from smallholder farmers across India."}
              </p>
            </div>

            {/* Leave a Review CTA Button */}
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="px-5 py-3 rounded-2xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 hover:scale-105 cursor-pointer shrink-0 self-start sm:self-auto"
              style={{ background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)" }}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{isHindi ? "अपनी समीक्षा व अनुभव लिखें" : "Write Your Harvest Review"}</span>
            </button>
          </div>

          {/* Crop Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {["All", "Soybean", "Wheat", "Cotton", "Tomato", "Mustard"].map((cropName) => {
              const isSelected = selectedCropFilter === cropName;
              return (
                <button
                  key={cropName}
                  type="button"
                  onClick={() => setSelectedCropFilter(cropName)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-[#0d253d] text-white shadow-sm"
                      : "bg-white hover:bg-slate-50 border border-[#e3e8ee] text-slate-700"
                  }`}
                >
                  {cropName === "All" ? (isHindi ? "सभी फसलें (All)" : "All Crops (14.8k)") : cropName}
                </button>
              );
            })}
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-white border border-[#e3e8ee] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Top Row: Farmer Name & Star Rating */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-200 text-[#533afd] font-bold text-xs flex items-center justify-center font-display">
                        {rev.farmerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0d253d] leading-tight">
                          {rev.farmerName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          📍 {rev.location} • {rev.acres} Acres
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </div>

                  {/* Verified Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-bold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span>{rev.verifiedProduct}</span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs text-slate-700 leading-relaxed">
                    &ldquo;{isHindi ? rev.commentHi : rev.commentEn}&rdquo;
                  </p>

                </div>

                {/* Bottom Row: Rupee Profit & Helpful Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-mono text-xs">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Extra Income</span>
                    <span className="font-black text-emerald-600">+₹{rev.profitOutcomeINR.toLocaleString("en-IN")}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLikeReview(rev.id)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      rev.hasLiked
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-slate-50 hover:bg-slate-100 border-[#e3e8ee] text-slate-600"
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{rev.helpfulCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* ── Interactive Modal: Submit a Harvest Review ───────────── */}
        <AnimatePresence>
          {showReviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#e3e8ee] space-y-5 relative"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-[#533afd] uppercase">
                      Share Your Story
                    </span>
                    <h3 className="text-xl font-bold text-[#0d253d] font-display">
                      {isHindi ? "अपनी किसान समीक्षा साझा करें" : "Submit Your Field Review"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>

                {reviewSubmitted ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <Check className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-bold text-[#0d253d]">
                      {isHindi ? "समीक्षा सफलतापूर्वक जुड़ गई!" : "Review Submitted Successfully!"}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isHindi ? "आपकी समीक्षा अब साथी किसानों को दिखेगी।" : "Your field review is now visible to other farmers."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAddReview} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Farmer Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Patel"
                          value={newFarmerName}
                          onChange={(e) => setNewFarmerName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">District & State *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sehore, MP"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Crop</label>
                        <select
                          value={newCrop}
                          onChange={(e) => setNewCrop(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                        >
                          <option value="Soybean">Soybean</option>
                          <option value="Wheat">Wheat</option>
                          <option value="Cotton">Cotton</option>
                          <option value="Tomato">Tomato</option>
                          <option value="Mustard">Mustard</option>
                          <option value="Gram">Gram / Chana</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Acres</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={newAcres}
                          onChange={(e) => setNewAcres(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Extra Income (₹)</label>
                        <input
                          type="number"
                          value={newProfit}
                          onChange={(e) => setNewProfit(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-1 cursor-pointer"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= newRating ? "fill-amber-500 text-amber-500" : "text-slate-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Your Experience & Feedback *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Tell other farmers how AASRA weather alert and Syngenta spray helped your harvest..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-medium text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)" }}
                    >
                      <Send className="h-4 w-4" />
                      <span>{isHindi ? "समीक्षा प्रकाशित करें" : "Publish Review"}</span>
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── 5. Bottom Connected Action Bar ────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-white via-indigo-50/40 to-white border border-[#e3e8ee] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0d253d] font-display">
                {isHindi ? "रमेश व अन्य 14,000+ किसानों की तरह अपनी फसल बचाएं" : "Join 14,000+ Farmers Protecting Their Harvest"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {isHindi
                  ? "सार्वजनिक डिजिटल कृषि सेवा · 30 सेकंड में जुड़ें और अपनी फसल की सुरक्षा करें।"
                  : "Public Good Agricultural Platform · Start monitoring your land in 30 seconds."}
              </p>
            </div>

            <Link
              href={isLoggedInUser ? "/dashboard" : "/signup"}
              className="px-6 py-3.5 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:scale-105 shrink-0"
              style={{ background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)" }}
            >
              <UserPlus className="h-4 w-4" />
              <span>{isLoggedInUser ? (isHindi ? "मेरा डैशबोर्ड खोलें" : "Open Dashboard") : (isHindi ? "मुफ्त में शुरू करें" : "Start Free")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
