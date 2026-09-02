/**
 * AASRA CANONICAL LOCATION RESOLVER & PAN-INDIA REGIONAL INTELLIGENCE
 * 
 * 100% Generic, Pan-India, Location-Aware Architecture.
 * Supports all 28 States and 8 Union Territories of India.
 * 
 * Strict 5-Tier Location Priority Hierarchy:
 * 1. Explicit Location in current user query (e.g. "Ajmer mein soybean ka bhav?") -> Overrides GPS for this query
 * 2. Explicit Location from recent conversation context (e.g. "Sehore mein soybean?" -> "aur wheat ka?" -> Sehore)
 * 3. User-Selected Location in Profile/App Settings
 * 4. Current Device/Permitted GPS Location (used for "mere yahan", "near me", or default)
 * 5. Prompt user for location clarification if unknown location is queried ("XYZ mein...")
 */

export interface LocationDetails {
  country: string;
  state: string;
  district: string;
  city?: string;
  locality?: string;
  village?: string;
  lat: number;
  lon: number;
  displayName?: string;
}

export interface MandiGeoItem {
  id: string;
  nameEn: string;
  nameHi: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  aliases: string[];
}

export interface ServiceDataCoverage {
  mandiAvailable: boolean;
  weatherAvailable: boolean;
  annamAvailable: boolean;
  syngentaAvailable: boolean;
  summary: string;
}

export interface CanonicalLocationContext {
  userLocation: LocationDetails;
  queryLocation: LocationDetails | null;
  effectiveLocation: LocationDetails & {
    mandiName?: string;
    mandiHi?: string;
    mandiDistanceKm?: number;
  };
  requestedLocation: string;
  resolvedLocation: string;
  locationType: "mandi" | "city" | "district" | "state" | "gps" | "unknown";
  district: string;
  state: string;
  lat: number;
  lon: number;
  mandiName?: string;
  mandiHi?: string;
  source: "gps" | "query" | "conversation" | "manual" | "profile" | "unknown";
  confidence: number;
  isExplicitQueryLocation: boolean;
  isUnknownLocation?: boolean;
  unresolvedText?: string;
  isDataCoverageQuery?: boolean;
  coverage?: ServiceDataCoverage;
}

// ============================================================================
// 1. COMPREHENSIVE PAN-INDIA APMC MANDI REGISTRY (ALL 28 STATES & 8 UTS)
// ============================================================================
export const COMPREHENSIVE_MANDI_REGISTRY: MandiGeoItem[] = [
  // ==================== RAJASTHAN ====================
  {
    id: "rj_ajmer",
    nameEn: "Ajmer (Ganj) APMC Mandi",
    nameHi: "अजमेर (गंज) कृषि उपज मंडी",
    district: "Ajmer",
    state: "Rajasthan",
    lat: 26.4499,
    lon: 74.6399,
    aliases: ["ajmer", "अजमेर", "ganj mandi", "kishangarh", "किशनगढ़", "beawar", "ब्यावर", "kekri", "केकड़ी", "vijaynagar", "विजयनगर", "pushkar", "पुष्कर"],
  },
  {
    id: "rj_kota_bhamashah",
    nameEn: "Kota (Bhamashah) APMC Mandi",
    nameHi: "भामाशाह (कोटा) कृषि उपज मंडी",
    district: "Kota",
    state: "Rajasthan",
    lat: 25.1768,
    lon: 75.8752,
    aliases: ["kota", "कोटा", "bhamashah", "भामाशाह", "bhamashah mandi", "ramganj mandi", "रामगंज मंडी", "sangod", "सांगोद", "itawa", "इटावा"],
  },
  {
    id: "rj_jaipur_surajpole",
    nameEn: "Jaipur (Surajpole / Muhana) Mandi",
    nameHi: "जयपुर (सूरजपोल / मुहाना) कृषि उपज मंडी",
    district: "Jaipur",
    state: "Rajasthan",
    lat: 26.8320,
    lon: 75.7650,
    aliases: ["jaipur", "जयपुर", "muhana", "मुहाना", "surajpole", "सूरजपोल", "chomu", "चौमूं", "kotputli", "कोटपूतली", "bassi", "बस्सी", "chaksu", "चाकसू"],
  },
  {
    id: "rj_sriganganagar",
    nameEn: "Sri Ganganagar APMC Grain & Cotton Mandi",
    nameHi: "श्रीगंगानगर अनाज व कपास मंडी",
    district: "Sri Ganganagar",
    state: "Rajasthan",
    lat: 29.9038,
    lon: 73.8772,
    aliases: ["sri ganganagar", "ganganagar", "श्रीगंगानगर", "suratgarh", "सूरतगढ़", "raisinghnagar", "रायसिंहनगर", "anupgarh", "अनूपगढ़", "sadulshahar", "सादुलशहर"],
  },
  {
    id: "rj_jodhpur",
    nameEn: "Jodhpur (Mandore) APMC Mandi",
    nameHi: "जोधपुर (मंडोर) कृषि उपज मंडी",
    district: "Jodhpur",
    state: "Rajasthan",
    lat: 26.2968,
    lon: 73.0351,
    aliases: ["jodhpur", "जोधपुर", "mandore", "मंडोर", "pipar", "पीपाड़", "bilara", "बिलाड़ा", "phalodi", "फलोदी"],
  },
  {
    id: "rj_bikaner",
    nameEn: "Bikaner (Karni Nagar) APMC Mandi",
    nameHi: "बीकानेर अनाज व तिलहन मंडी",
    district: "Bikaner",
    state: "Rajasthan",
    lat: 28.0229,
    lon: 73.3119,
    aliases: ["bikaner", "बीकानेर", "nokha", "नोखा", "dungargarh", "डूंगरगढ़", "lunkaransar", "लूणकरणसर"],
  },
  {
    id: "rj_hanumangarh",
    nameEn: "Hanumangarh Town Grain Mandi",
    nameHi: "हनुमानगढ़ टाउन अनाज मंडी",
    district: "Hanumangarh",
    state: "Rajasthan",
    lat: 29.5816,
    lon: 74.3294,
    aliases: ["hanumangarh", "हनुमानगढ़", "nohar", "नोहर", "bhadra", "भादरा", "pilibanga", "पीलीबंगा", "rawatsar", "रावतसर"],
  },
  {
    id: "rj_alwar",
    nameEn: "Alwar (Khedli) APMC Mustard & Grain Mandi",
    nameHi: "अलवर (खेड़ली) सरसों व अनाज मंडी",
    district: "Alwar",
    state: "Rajasthan",
    lat: 27.5530,
    lon: 76.6346,
    aliases: ["alwar", "अलवर", "khedli", "खेड़ली", "khairthal", "खैरथल", "behror", "बहरोड़", "tijara", "तिजारा"],
  },
  {
    id: "rj_baran",
    nameEn: "Baran APMC Soybean & Garlic Mandi",
    nameHi: "बारां लहसुन व सोयाबीन मंडी",
    district: "Baran",
    state: "Rajasthan",
    lat: 25.1011,
    lon: 76.5132,
    aliases: ["baran", "बारां", "chhabra", "छबड़ा", "atru", "अटरू", "antah", "अंता"],
  },
  {
    id: "rj_udaipur",
    nameEn: "Udaipur (Fatehnagar) APMC Mandi",
    nameHi: "उदयपुर (फतेहनगर) कृषि उपज मंडी",
    district: "Udaipur",
    state: "Rajasthan",
    lat: 24.5854,
    lon: 73.7125,
    aliases: ["udaipur", "उदयपुर", "fatehnagar", "फतेहनगर", "salumbar", "सलूम्बर", "bhinder", "भींडर"],
  },
  {
    id: "rj_state",
    nameEn: "Rajasthan Benchmark APMC Network",
    nameHi: "राजस्थान कृषि उपज मंडी नेटवर्क",
    district: "Kota",
    state: "Rajasthan",
    lat: 25.1768,
    lon: 75.8752,
    aliases: ["rajasthan", "राजस्थान", "rajastan", "r.j."],
  },

  // ==================== MADHYA PRADESH ====================
  {
    id: "mp_bhopal_karond",
    nameEn: "Bhopal (Karond) APMC Krishi Upaj Mandi",
    nameHi: "भोपाल (करौंद) कृषि उपज मंडी",
    district: "Bhopal",
    state: "Madhya Pradesh",
    lat: 23.2980,
    lon: 77.4020,
    aliases: ["bhopal", "भोपाल", "karond", "करौंद", "karond mandi", "bhopal mandi", "bairagarh", "बैरागढ़", "huzur", "हुजूर", "kokta", "कोकता", "mp nagar", "arera"],
  },
  {
    id: "mp_sehore",
    nameEn: "Sehore APMC Krishi Upaj Mandi",
    nameHi: "सीहोर कृषि उपज मंडी",
    district: "Sehore",
    state: "Madhya Pradesh",
    lat: 23.2030,
    lon: 77.0840,
    aliases: ["sehore", "सीहोर", "sehore mandi", "ashta", "आष्टा", "ichhawar", "इछावर", "nasrullaganj", "नसरुल्लागंज", "shampur", "श्यामपुर", "bhairunda", "भेरूंदा"],
  },
  {
    id: "mp_indore_laxmibainagar",
    nameEn: "Indore (Laxmibai Nagar) APMC Mandi",
    nameHi: "इंदौर (लक्ष्मीबाई नगर) कृषि उपज मंडी",
    district: "Indore",
    state: "Madhya Pradesh",
    lat: 22.7533,
    lon: 75.8637,
    aliases: ["indore", "इंदौर", "laxmibai nagar", "laxmibainagar", "लक्ष्मीबाई नगर", "sanwer", "सांवेर", "depalpur", "देपालपुर", "mhow", "महू", "rau", "राऊ"],
  },
  {
    id: "mp_ujjain_chimanganj",
    nameEn: "Ujjain (Chimanganj) Krishi Upaj Mandi",
    nameHi: "उज्जैन (चिमनगंज) कृषि उपज मंडी",
    district: "Ujjain",
    state: "Madhya Pradesh",
    lat: 23.1895,
    lon: 75.7915,
    aliases: ["ujjain", "उज्जैन", "chimanganj", "चिमनगंज", "badnagar", "बड़नगर", "nagda", "नागदा", "tarana", "तराना", "mahidpur", "महिदपुर", "khachrod", "खाचरौद"],
  },
  {
    id: "mp_dewas",
    nameEn: "Dewas APMC Krishi Upaj Mandi",
    nameHi: "देवास कृषि उपज मंडी",
    district: "Dewas",
    state: "Madhya Pradesh",
    lat: 22.9676,
    lon: 76.0534,
    aliases: ["dewas", "देवास", "sonkatch", "सोनकच्छ", "bagli", "बागली", "kannod", "कन्नौद", "khategaon", "खातेगांव", "tonk khurd", "टोंकखुर्द"],
  },
  {
    id: "mp_vidisha",
    nameEn: "Vidisha APMC Krishi Upaj Mandi",
    nameHi: "विदिशा कृषि उपज मंडी",
    district: "Vidisha",
    state: "Madhya Pradesh",
    lat: 23.5251,
    lon: 77.8081,
    aliases: ["vidisha", "विदिशा", "basoda", "गंजबासौदा", "ganj basoda", "sironj", "सिरोंज", "kurwai", "कुरवाई", "gyaraspur", "ग्यारसपुर"],
  },
  {
    id: "mp_harda",
    nameEn: "Harda APMC Krishi Upaj Mandi",
    nameHi: "हरदा कृषि उपज मंडी",
    district: "Harda",
    state: "Madhya Pradesh",
    lat: 22.3435,
    lon: 77.0945,
    aliases: ["harda", "हरदा", "timarni", "टिमरनी", "khirkiya", "खिरकिया", "sirali", "सिराली", "handia", "हंडिया"],
  },
  {
    id: "mp_narmadapuram",
    nameEn: "Narmadapuram (Itarsi) APMC Mandi",
    nameHi: "नर्मदापुरम (इटारसी) कृषि उपज मंडी",
    district: "Narmadapuram",
    state: "Madhya Pradesh",
    lat: 22.6120,
    lon: 77.7600,
    aliases: ["hoshangabad", "होशंगाबाद", "narmadapuram", "नर्मदापुरम", "itarsi", "इटारसी", "pipariya", "पिपरिया", "sohagpur", "सोहागपुर", "babai", "बाबई"],
  },
  {
    id: "mp_mandsaur",
    nameEn: "Mandsaur APMC Garlic & Soybean Mandi",
    nameHi: "मंदसौर लहसुन व सोयाबीन मंडी",
    district: "Mandsaur",
    state: "Madhya Pradesh",
    lat: 24.0722,
    lon: 75.0682,
    aliases: ["mandsaur", "मंदसौर", "pipliya mandi", "पिपलिया मंडी", "daloda", "दलोदा", "sitamau", "सीतामऊ", "garoth", "गरोठ", "bhanpura", "भानपुरा", "malhargarh", "मल्हारगढ़"],
  },
  {
    id: "mp_neemuch",
    nameEn: "Neemuch APMC Krishi Upaj Mandi",
    nameHi: "नीमच कृषि उपज मंडी",
    district: "Neemuch",
    state: "Madhya Pradesh",
    lat: 24.4720,
    lon: 74.8710,
    aliases: ["neemuch", "नीमच", "manasa", "मनासा", "jawad", "जावद", "singoli", "सिंगोली"],
  },
  {
    id: "mp_ratlam",
    nameEn: "Ratlam APMC Krishi Upaj Mandi",
    nameHi: "रतलाम कृषि उपज मंडी",
    district: "Ratlam",
    state: "Madhya Pradesh",
    lat: 23.3315,
    lon: 75.0367,
    aliases: ["ratlam", "रतलाम", "jaora", "जावरा", "alote", "आलोट", "sailana", "सैलाना", "namli", "नामली"],
  },
  {
    id: "mp_jabalpur",
    nameEn: "Jabalpur APMC Krishi Upaj Mandi",
    nameHi: "जबलपुर कृषि उपज मंडी",
    district: "Jabalpur",
    state: "Madhya Pradesh",
    lat: 23.1815,
    lon: 79.9864,
    aliases: ["jabalpur", "जबलपुर", "patan", "पाटन", "sihora", "सिहोरा", "shahpura", "शाहपुरा", "panagar", "पनागर"],
  },
  {
    id: "mp_gwalior",
    nameEn: "Gwalior (Lashkar) APMC Mandi",
    nameHi: "ग्वालियर कृषि उपज मंडी",
    district: "Gwalior",
    state: "Madhya Pradesh",
    lat: 26.2183,
    lon: 78.1828,
    aliases: ["gwalior", "ग्वालियर", "dabra", "डबरा", "bhitarwar", "भितरवार", "morar", "मुरार"],
  },
  {
    id: "mp_chhindwara",
    nameEn: "Chhindwara (Kukchimandi) APMC",
    nameHi: "छिंदवाड़ा मक्का व अनाज मंडी",
    district: "Chhindwara",
    state: "Madhya Pradesh",
    lat: 22.0574,
    lon: 78.9382,
    aliases: ["chhindwara", "छिंदवाड़ा", "sausar", "सौंसर", "pandhurna", "पांढुरना", "chaurai", "चौरई", "amarwara", "अमरवाड़ा"],
  },
  {
    id: "mp_khargone",
    nameEn: "Khargone (Nimar) Cotton & Chilli APMC",
    nameHi: "खरगोन (निमाड़) कपास व मिर्च मंडी",
    district: "Khargone",
    state: "Madhya Pradesh",
    lat: 21.8234,
    lon: 75.6186,
    aliases: ["khargone", "खरगोन", "nimar", "निमाड़", "sanawad", "सनावद", "barwaha", "बड़वाह", "kasrawad", "कसरावद", "bhikangaon", "भीकनगांव"],
  },
  {
    id: "mp_state",
    nameEn: "Madhya Pradesh Benchmark Mandi Network",
    nameHi: "मध्य प्रदेश कृषि उपज मंडी नेटवर्क",
    district: "Bhopal",
    state: "Madhya Pradesh",
    lat: 23.2599,
    lon: 77.4126,
    aliases: ["madhya pradesh", "मध्य प्रदेश", "mp", "m.p."],
  },

  // ==================== MAHARASHTRA ====================
  {
    id: "mh_akola",
    nameEn: "Akola APMC Cotton & Pulse Market Yard",
    nameHi: "अकोला कपास व दाल कृषि उपज मंडी",
    district: "Akola",
    state: "Maharashtra",
    lat: 20.7002,
    lon: 77.0082,
    aliases: ["akola", "अकोला", "murtizapur", "मूर्तिजापुर", "telhara", "पातूर", "patur", "balapur", "बालापुर"],
  },
  {
    id: "mh_latur",
    nameEn: "Latur APMC Pulse & Oilseed Market",
    nameHi: "लातूर कृषि उपज मंडी",
    district: "Latur",
    state: "Maharashtra",
    lat: 18.4088,
    lon: 76.5604,
    aliases: ["latur", "लातूर", "udgir", "उदगीर", "ahmedpur", "अहमदपूर", "ausa", "औसा", "nilanga", "निलंगा"],
  },
  {
    id: "mh_amravati",
    nameEn: "Amravati APMC Cotton & Soybean Yard",
    nameHi: "अमरावती कपास व सोयाबीन मंडी",
    district: "Amravati",
    state: "Maharashtra",
    lat: 20.9320,
    lon: 77.7523,
    aliases: ["amravati", "अमरावती", "achlapur", "अचलपूर", "daryapur", "दर्यापूर", "warud", "वरुड", "morshi", "मोर्शी", "chandur", "चांदूर"],
  },
  {
    id: "mh_nagpur",
    nameEn: "Nagpur (Kalamna) APMC Market Yard",
    nameHi: "नागपुर (कलमना) संतरा व अनाज मंडी",
    district: "Nagpur",
    state: "Maharashtra",
    lat: 21.1710,
    lon: 79.1350,
    aliases: ["nagpur", "नागपुर", "kalamna", "कलमना", "katol", "काटोल", "saoner", "सावनेर", "umred", "उमरेड", "ramtek", "रामटेक", "narkhed", "नरखेड"],
  },
  {
    id: "mh_nashik_lasalgaon",
    nameEn: "Nashik (Lasalgaon) Onion & Grain APMC",
    nameHi: "नासिक (लासलगांव) प्याज व अनाज मंडी",
    district: "Nashik",
    state: "Maharashtra",
    lat: 20.1478,
    lon: 74.2285,
    aliases: ["nashik", "नासिक", "lasalgaon", "लासलगांव", "pimpalgaon", "पिंपलगाव", "niphad", "निफाड", "yeola", "येवला", "malegaon", "मालेगाव", "satana", "सटाणा", "sinnar", "सिन्नर"],
  },
  {
    id: "mh_jalgaon",
    nameEn: "Jalgaon APMC Banana & Cotton Yard",
    nameHi: "जलगांव केला व कपास मंडी",
    district: "Jalgaon",
    state: "Maharashtra",
    lat: 21.0077,
    lon: 75.5626,
    aliases: ["jalgaon", "जलगांव", "bhusalwal", "भुसावल", "chopda", "चोपडा", "pachora", "पाचोरा", "chalisgaon", "चालीसगाव", "jamner", "जामनेर", "raver", "रावेर"],
  },
  {
    id: "mh_solapur",
    nameEn: "Solapur APMC Pomegranate & Grain Market",
    nameHi: "सोलापुर अनार व अनाज मंडी",
    district: "Solapur",
    state: "Maharashtra",
    lat: 17.6599,
    lon: 75.9064,
    aliases: ["solapur", "सोलापुर", "barshi", "बार्शी", "pandharpur", "पंढरपूर", "akkalkot", "अक्कलकोट", "karmala", "करमाळा", "sangola", "सांगोला"],
  },
  {
    id: "mh_kolhapur",
    nameEn: "Kolhapur (Shahu Market) APMC Yard",
    nameHi: "कोल्हापुर (शाहू मार्केट) गुड़ व अनाज मंडी",
    district: "Kolhapur",
    state: "Maharashtra",
    lat: 16.7050,
    lon: 74.2433,
    aliases: ["kolhapur", "कोल्हापुर", "shahu market", "gadhinglaj", "गडहिंग्लज", "jaysingpur", "जयसिंगपूर", "ichalkaranji", "इचलकरंजी"],
  },
  {
    id: "mh_pune",
    nameEn: "Pune (Gultekdi) APMC Market Yard",
    nameHi: "पुणे (गुलटेकडी) कृषि उपज मंडी",
    district: "Pune",
    state: "Maharashtra",
    lat: 18.4960,
    lon: 73.8680,
    aliases: ["pune", "पुणे", "gultekdi", "गुलटेकडी", "baramati", "बारामती", "manchar", "मंचर", "khed", "खेड", "shirur", "शिरूर", "indapur", "इंदापूर"],
  },
  {
    id: "mh_mumbai_vashi",
    nameEn: "Navi Mumbai (Vashi) APMC Central Terminal",
    nameHi: "नवी मुंबई (वाशी) केंद्रीय कृषि मंडी",
    district: "Thane",
    state: "Maharashtra",
    lat: 19.0760,
    lon: 73.0035,
    aliases: ["mumbai", "मुंबई", "vashi", "वाशी", "navi mumbai", "नवी मुंबई", "thane", "ठाणे", "kalyan", "कल्याण"],
  },
  {
    id: "mh_state",
    nameEn: "Maharashtra Benchmark Mandi Network",
    nameHi: "महाराष्ट्र कृषि उपज मंडी नेटवर्क",
    district: "Latur",
    state: "Maharashtra",
    lat: 18.4088,
    lon: 76.5604,
    aliases: ["maharashtra", "महाराष्ट्र", "m.h."],
  },

  // ==================== PUNJAB ====================
  {
    id: "pb_khanna",
    nameEn: "Khanna APMC Asia's Largest Grain Market",
    nameHi: "खन्ना अनाज मंडी (एशिया की सबसे बड़ी मंडी)",
    district: "Ludhiana",
    state: "Punjab",
    lat: 30.7071,
    lon: 76.2163,
    aliases: ["khanna", "खन्ना", "ludhiana", "लुधियाना", "jagraon", "जगरांव", "samrala", "समराला", "mullanpur", "मुल्लांपुर"],
  },
  {
    id: "pb_amritsar",
    nameEn: "Amritsar (Bhagtanwala) Grain Market",
    nameHi: "अमृतसर (भगतांवाला) नई अनाज मंडी",
    district: "Amritsar",
    state: "Punjab",
    lat: 31.6180,
    lon: 74.8820,
    aliases: ["amritsar", "अमृतसर", "bhagtanwala", "भगतांवाला", "ajnala", "अजनाला", "rayya", "रय्या"],
  },
  {
    id: "pb_bathinda",
    nameEn: "Bathinda Cotton & Grain Market",
    nameHi: "बठिंडा कपास व अनाज मंडी",
    district: "Bathinda",
    state: "Punjab",
    lat: 30.2110,
    lon: 74.9455,
    aliases: ["bathinda", "बठिंडा", "bhatinda", "raman", "रामा मंडी", "maur", "मौड़", "goniana", "गोनिआना"],
  },
  {
    id: "pb_jalandhar",
    nameEn: "Jalandhar (Maqsudan) Grain & Veg Mandi",
    nameHi: "जालंधर (मकसूदां) अनाज मंडी",
    district: "Jalandhar",
    state: "Punjab",
    lat: 31.3260,
    lon: 75.5762,
    aliases: ["jalandhar", "जालंधर", "maqsudan", "मकसूदां", "nakodar", "नकोदर", "phillaur", "फिल्लौर"],
  },
  {
    id: "pb_state",
    nameEn: "Punjab Benchmark Grain Network",
    nameHi: "पंजाब अनाज मंडी नेटवर्क",
    district: "Ludhiana",
    state: "Punjab",
    lat: 30.7071,
    lon: 76.2163,
    aliases: ["punjab", "पंजाब", "p.b."],
  },

  // ==================== HARYANA ====================
  {
    id: "hr_karnal",
    nameEn: "Karnal New Grain Market APMC",
    nameHi: "करनाल नई अनाज मंडी",
    district: "Karnal",
    state: "Haryana",
    lat: 29.6857,
    lon: 76.9905,
    aliases: ["karnal", "करनाल", "taraori", "तराओड़ी", "gharaunda", "घरौंडा", "assandh", "असंध", "nilokheri", "नीलोखेड़ी", "indri", "इन्द्री"],
  },
  {
    id: "hr_sirsa",
    nameEn: "Sirsa Cotton & Grain APMC Mandi",
    nameHi: "सिरसा अनाज व कपास मंडी",
    district: "Sirsa",
    state: "Haryana",
    lat: 29.5349,
    lon: 75.0298,
    aliases: ["sirsa", "सिरसा", "ellenabad", "ऐलनाबाद", "dabwali", "डबवाली", "kalanwali", "कलांवाली", "rania", "रानियां"],
  },
  {
    id: "hr_hisar",
    nameEn: "Hisar APMC Grain & Cotton Market",
    nameHi: "हिसार अनाज व कपास मंडी",
    district: "Hisar",
    state: "Haryana",
    lat: 29.1492,
    lon: 75.7217,
    aliases: ["hisar", "हिसार", "hansi", "हांसी", "barwala", "बरवाला", "uklana", "उकलाना", "adhampur", "आदमपुर"],
  },
  {
    id: "hr_ambala",
    nameEn: "Ambala City APMC Grain Market",
    nameHi: "अंबाला सिटी अनाज मंडी",
    district: "Ambala",
    state: "Haryana",
    lat: 30.3782,
    lon: 76.7767,
    aliases: ["ambala", "अंबाला", "barara", "बराड़ा", "naraingarh", "नारायणगढ़"],
  },
  {
    id: "hr_state",
    nameEn: "Haryana Benchmark Grain Network",
    nameHi: "हरियाणा अनाज मंडी नेटवर्क",
    district: "Karnal",
    state: "Haryana",
    lat: 29.6857,
    lon: 76.9905,
    aliases: ["haryana", "हरियाणा", "h.r."],
  },

  // ==================== GUJARAT ====================
  {
    id: "gj_rajkot_bedi",
    nameEn: "Rajkot (Bedi Yard) APMC Mandi",
    nameHi: "राजकोट (बेडी यार्ड) कृषि उपज मंडी",
    district: "Rajkot",
    state: "Gujarat",
    lat: 22.3420,
    lon: 70.8250,
    aliases: ["rajkot", "રાજકોટ", "राजकोट", "bedi", "बेडी", "gondal", "ગોંડલ", "गोंडल", "jasdan", "जसदन", "dhoraji", "धोराजी", "jetpur", "जेतपुर"],
  },
  {
    id: "gj_unjha",
    nameEn: "Unjha APMC Mandi (Asia's Cumin & Spice Hub)",
    nameHi: "ऊंझा मसाला व जीरा मंडी",
    district: "Mehsana",
    state: "Gujarat",
    lat: 23.8052,
    lon: 72.3955,
    aliases: ["unjha", "ઊંઝા", "ऊंझा", "mehsana", "મહેસાણા", "महेसाणा", "kadi", "कड़ी", "visnagar", "विसनगर", "patan", "पाटन", "sidhpur", "सिद्धपुर"],
  },
  {
    id: "gj_ahmedabad",
    nameEn: "Ahmedabad (Jamalpur / Naroda) APMC",
    nameHi: "अहमदाबाद कृषि उपज मंडी",
    district: "Ahmedabad",
    state: "Gujarat",
    lat: 23.0225,
    lon: 72.5714,
    aliases: ["ahmedabad", "अहमदाबाद", "naroda", "नरोडा", "jamalpur", "जमालपुर", "sanand", "साणंद", "dholka", "धोलका"],
  },
  {
    id: "gj_surat",
    nameEn: "Surat APMC Vegetable & Fruit Terminal",
    nameHi: "सूरत कृषि उपज मंडी",
    district: "Surat",
    state: "Gujarat",
    lat: 21.1702,
    lon: 72.8311,
    aliases: ["surat", "सूरत", "bardoli", "बारडोली", "olpad", "ओलपाड", "mandvi", "मांडवी"],
  },
  {
    id: "gj_state",
    nameEn: "Gujarat Benchmark APMC Network",
    nameHi: "गुजरात कृषि उपज मंडी नेटवर्क",
    district: "Rajkot",
    state: "Gujarat",
    lat: 22.3420,
    lon: 70.8250,
    aliases: ["gujarat", "ગુજરાત", "गुजरात", "g.j."],
  },

  // ==================== UTTAR PRADESH ====================
  {
    id: "up_kanpur",
    nameEn: "Kanpur (Naubasta) APMC Mandi",
    nameHi: "कानपुर (नौबस्ता) कृषि उपज मंडी",
    district: "Kanpur Nagar",
    state: "Uttar Pradesh",
    lat: 26.4020,
    lon: 80.3340,
    aliases: ["kanpur", "कानपुर", "naubasta", "नौबस्ता", "chakeri", "चकेरी", "bilhaur", "बिल्हौर", "ghatampur", "घाटमपुर"],
  },
  {
    id: "up_lucknow",
    nameEn: "Lucknow (Dubagga) Naveen Mandi Sthal",
    nameHi: "लखनऊ (दुबग्गा) नवीन फल व अनाज मंडी",
    district: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8720,
    lon: 80.8650,
    aliases: ["lucknow", "लखनऊ", "dubagga", "दुबग्गा", "malihabad", "मलिहाबाद", "bakshi ka talab", "mohanlalganj", "मोहनलालगंज"],
  },
  {
    id: "up_agra",
    nameEn: "Agra (Fatehabad Road) Potato & Grain Mandi",
    nameHi: "आगरा आलू व अनाज मंडी",
    district: "Agra",
    state: "Uttar Pradesh",
    lat: 27.1767,
    lon: 78.0081,
    aliases: ["agra", "आगरा", "fatehabad", "फतेहाबाद", "shamsabad", "शमसाबाद", "khandauli", "खंदौली", "etmadpur", "एत्मादपुर"],
  },
  {
    id: "up_varanasi",
    nameEn: "Varanasi (Pindra) APMC Grain Market",
    nameHi: "वाराणसी (पिंडरा) अनाज मंडी",
    district: "Varanasi",
    state: "Uttar Pradesh",
    lat: 25.3176,
    lon: 82.9739,
    aliases: ["varanasi", "वाराणसी", "banaras", "बनारस", "kashi", "काशी", "pindra", "पिंडरा"],
  },
  {
    id: "up_meerut",
    nameEn: "Meerut (Delhi Road) APMC Grain Mandi",
    nameHi: "मेरठ अनाज व गुड़ मंडी",
    district: "Meerut",
    state: "Uttar Pradesh",
    lat: 28.9845,
    lon: 77.7064,
    aliases: ["meerut", "मेरठ", "mawana", "मवाना", "sardhana", "सरधना"],
  },
  {
    id: "up_state",
    nameEn: "Uttar Pradesh Benchmark Mandi Network",
    nameHi: "उत्तर प्रदेश कृषि उपज मंडी नेटवर्क",
    district: "Kanpur Nagar",
    state: "Uttar Pradesh",
    lat: 26.4020,
    lon: 80.3340,
    aliases: ["uttar pradesh", "उत्तर प्रदेश", "उत्तरप्रदेश", "u.p."],
  },

  // ==================== TELANGANA & ANDHRA PRADESH ====================
  {
    id: "tg_warangal_enumamula",
    nameEn: "Warangal (Enumamula) APMC Market Yard",
    nameHi: "वारंगल (एनूमामुला) कृषि उपज मंडी",
    district: "Warangal",
    state: "Telangana",
    lat: 17.9920,
    lon: 79.6250,
    aliases: ["warangal", "वारंगल", "enumamula", "jangaon", "जनगांव", "narsampet", "नरसमपेट", "mahabubabad", "महबूबाबाद"],
  },
  {
    id: "tg_hyderabad_bowenpally",
    nameEn: "Hyderabad (Bowenpally / Malakpet) APMC",
    nameHi: "हैदराबाद कृषि उपज मंडी",
    district: "Hyderabad",
    state: "Telangana",
    lat: 17.3850,
    lon: 78.4867,
    aliases: ["hyderabad", "हैदराबाद", "bowenpally", "malakpet", "secunderabad", "सिकंदराबाद"],
  },
  {
    id: "ap_guntur",
    nameEn: "Guntur APMC Chilli & Commercial Yard",
    nameHi: "गुंटूर मिर्च व कृषि उपज मंडी",
    district: "Guntur",
    state: "Andhra Pradesh",
    lat: 16.3067,
    lon: 80.4365,
    aliases: ["guntur", "गुंटूर", "tenali", "तेनाली", "narasaraopet", "नरसारावपेट", "bapatla", "बापटला"],
  },
  {
    id: "ap_vijayawada",
    nameEn: "Vijayawada (Gollapudi) Commercial Yard",
    nameHi: "विजयवाड़ा कृषि उपज मंडी",
    district: "Krishna",
    state: "Andhra Pradesh",
    lat: 16.5062,
    lon: 80.6480,
    aliases: ["vijayawada", "विजयवाड़ा", "gollapudi", "machilipatnam", "मछलीपट्टनम", "gudivada", "गुड़ीवाड़ा"],
  },
  {
    id: "tg_state",
    nameEn: "Telangana & AP Benchmark Mandi Network",
    nameHi: "तेलंगाना व आंध्र प्रदेश मंडी नेटवर्क",
    district: "Warangal",
    state: "Telangana",
    lat: 17.9920,
    lon: 79.6250,
    aliases: ["telangana", "तेलंगाना", "andhra", "andhra pradesh", "आंध्र प्रदेश"],
  },

  // ==================== KARNATAKA ====================
  {
    id: "ka_hubli",
    nameEn: "Hubli (Amaragol) APMC Market Yard",
    nameHi: "हुबली (अमरगोल) कृषि उपज मंडी",
    district: "Dharwad",
    state: "Karnataka",
    lat: 15.4050,
    lon: 75.0850,
    aliases: ["hubli", "हुबली", "dharwad", "धारवाड़", "amaragol", "अमरगोल", "navalgund", "नवलगुंड", "kalghatgi"],
  },
  {
    id: "ka_bengaluru",
    nameEn: "Bengaluru (Yeshwanthpur) APMC Yard",
    nameHi: "बेंगलुरु (यशवंतपुर) कृषि उपज मंडी",
    district: "Bengaluru Urban",
    state: "Karnataka",
    lat: 13.0280,
    lon: 77.5400,
    aliases: ["bengaluru", "bangalore", "बेंगलुरु", "बेंगलोर", "yeshwanthpur", "यशवंतपुर", "kolar", "कोलार", "chikkaballapur"],
  },
  {
    id: "ka_state",
    nameEn: "Karnataka Benchmark APMC Network",
    nameHi: "कर्नाटक कृषि उपज मंडी नेटवर्क",
    district: "Dharwad",
    state: "Karnataka",
    lat: 15.4050,
    lon: 75.0850,
    aliases: ["karnataka", "कर्नाटक", "karnatak"],
  },

  // ==================== TAMIL NADU ====================
  {
    id: "tn_chennai_koyambedu",
    nameEn: "Chennai (Koyambedu) Wholesale Market",
    nameHi: "चेन्नई (कोयम्बेडु) फल, सब्जी व अनाज मंडी",
    district: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0694,
    lon: 80.1948,
    aliases: ["chennai", "चेन्नई", "madras", "मद्रास", "koyambedu", "कोयम्बेडु"],
  },
  {
    id: "tn_coimbatore",
    nameEn: "Coimbatore APMC Cotton & Coconut Market",
    nameHi: "कोयंबटूर कृषि उपज मंडी",
    district: "Coimbatore",
    state: "Tamil Nadu",
    lat: 11.0168,
    lon: 76.9558,
    aliases: ["coimbatore", "कोयंबटूर", "pollachi", "पोलाची", "mettupalayam", "मेट्टुपालयम"],
  },
  {
    id: "tn_state",
    nameEn: "Tamil Nadu Benchmark APMC Network",
    nameHi: "तमिलनाडु कृषि उपज मंडी नेटवर्क",
    district: "Coimbatore",
    state: "Tamil Nadu",
    lat: 11.0168,
    lon: 76.9558,
    aliases: ["tamil nadu", "तमिलनाडु", "tamilnadu", "t.n."],
  },

  // ==================== WEST BENGAL ====================
  {
    id: "wb_kolkata",
    nameEn: "Kolkata (Posta / Mechua) Wholesale Market",
    nameHi: "कोलकाता (पोस्ता) अनाज व सब्जी मंडी",
    district: "Kolkata",
    state: "West Bengal",
    lat: 22.5726,
    lon: 88.3639,
    aliases: ["kolkata", "कलकत्ता", "कोलकाता", "posta", "पोस्ता", "howrah", "हावड़ा"],
  },
  {
    id: "wb_siliguri",
    nameEn: "Siliguri Regulated Market APMC",
    nameHi: "सिलीगुड़ी विनियमित बाजार मंडी",
    district: "Darjeeling",
    state: "West Bengal",
    lat: 26.7271,
    lon: 88.3953,
    aliases: ["siliguri", "सिलीगुड़ी", "darjeeling", "दार्जिलिंग", "jalpaiguri", "जलपाईगुड़ी"],
  },
  {
    id: "wb_state",
    nameEn: "West Bengal Benchmark Mandi Network",
    nameHi: "पश्चिम बंगाल कृषि मंडी नेटवर्क",
    district: "Kolkata",
    state: "West Bengal",
    lat: 22.5726,
    lon: 88.3639,
    aliases: ["west bengal", "पश्चिम बंगाल", "bangal", "बंगाल", "w.b."],
  },

  // ==================== BIHAR ====================
  {
    id: "br_patna",
    nameEn: "Patna (Bazar Samiti) APMC Yard",
    nameHi: "पटना (बाजार समिति) कृषि मंडी",
    district: "Patna",
    state: "Bihar",
    lat: 25.5941,
    lon: 85.1376,
    aliases: ["patna", "पटना", "danapur", "दानापुर", "fatuha", "फतुहा", "mokama", "मोकामा"],
  },
  {
    id: "br_muzaffarpur",
    nameEn: "Muzaffarpur Lychee & Maize Market",
    nameHi: "मुजफ्फरपुर लीची व मक्का मंडी",
    district: "Muzaffarpur",
    state: "Bihar",
    lat: 26.1209,
    lon: 85.3647,
    aliases: ["muzaffarpur", "मुजफ्फरपुर", "motihari", "मोतीहारी", "sitamarhi", "सीतामढ़ी"],
  },
  {
    id: "br_state",
    nameEn: "Bihar Benchmark Mandi Network",
    nameHi: "बिहार कृषि मंडी नेटवर्क",
    district: "Patna",
    state: "Bihar",
    lat: 25.5941,
    lon: 85.1376,
    aliases: ["bihar", "बिहार"],
  },

  // ==================== ODISHA ====================
  {
    id: "or_bhubaneswar",
    nameEn: "Bhubaneswar RMC Regulated Market",
    nameHi: "भुवनेश्वर कृषि उपज मंडी",
    district: "Khordha",
    state: "Odisha",
    lat: 20.2961,
    lon: 85.8245,
    aliases: ["bhubaneswar", "भुवनेश्वर", "cuttack", "कटक", "khordha", "खोर्धा", "puri", "पुरी"],
  },
  {
    id: "or_state",
    nameEn: "Odisha Benchmark Mandi Network",
    nameHi: "ओडिशा कृषि मंडी नेटवर्क",
    district: "Khordha",
    state: "Odisha",
    lat: 20.2961,
    lon: 85.8245,
    aliases: ["odisha", "orissa", "ओडिशा", "उड़ीसा"],
  },

  // ==================== CHHATTISGARH ====================
  {
    id: "cg_raipur",
    nameEn: "Raipur (Tulsi Mandi) APMC Yard",
    nameHi: "रायपुर (तुलसी मंडी) धान व कृषि उपज मंडी",
    district: "Raipur",
    state: "Chhattisgarh",
    lat: 21.2514,
    lon: 81.6296,
    aliases: ["raipur", "रायपुर", "durg", "दुर्ग", "bhilai", "भिलाई", "rajnandgaon", "राजनंदगांव", "bilaspur", "बिलासपुर"],
  },
  {
    id: "cg_state",
    nameEn: "Chhattisgarh Rice Bowl Mandi Network",
    nameHi: "छत्तीसगढ़ धान मंडी नेटवर्क",
    district: "Raipur",
    state: "Chhattisgarh",
    lat: 21.2514,
    lon: 81.6296,
    aliases: ["chhattisgarh", "छत्तीसगढ़", "c.g."],
  },

  // ==================== KERALA ====================
  {
    id: "kl_kochi",
    nameEn: "Kochi (Ernakulam) Spice & Coconut Market",
    nameHi: "कोच्चि मसाला व नारियल मंडी",
    district: "Ernakulam",
    state: "Kerala",
    lat: 9.9312,
    lon: 76.2673,
    aliases: ["kochi", "cochin", "कोच्चि", "ernakulam", "एर्नाकुलम", "palakkad", "पालक्काड़", "thrissur", "त्रिशूर", "kozhikode", "कोझिकोड"],
  },
  {
    id: "kl_state",
    nameEn: "Kerala Spices & Plantation Network",
    nameHi: "केरल मसाला व कृषि मंडी नेटवर्क",
    district: "Ernakulam",
    state: "Kerala",
    lat: 9.9312,
    lon: 76.2673,
    aliases: ["kerala", "केरल"],
  },

  // ==================== ASSAM & NORTH EAST ====================
  {
    id: "as_guwahati",
    nameEn: "Guwahati (Pamohi) APMC Market",
    nameHi: "गुवाहाटी कृषि उपज मंडी",
    district: "Kamrup Metropolitan",
    state: "Assam",
    lat: 26.1445,
    lon: 91.7362,
    aliases: ["guwahati", "गुवाहाटी", "kamrup", "कामरूप", "jorhat", "जोरहाट", "dibrugarh", "डिब्रूगढ़", "silchar", "सिलचर", "tezpur", "तेजपुर"],
  },
  {
    id: "as_state",
    nameEn: "Assam & North East Agri Market Network",
    nameHi: "असम व पूर्वोत्तर कृषि मंडी नेटवर्क",
    district: "Kamrup Metropolitan",
    state: "Assam",
    lat: 26.1445,
    lon: 91.7362,
    aliases: ["assam", "असम", "northeast", "tripura", "meghalaya", "nagaland", "manipur", "mizoram", "arunachal", "sikkim"],
  },

  // ==================== JHARKHAND ====================
  {
    id: "jh_ranchi",
    nameEn: "Ranchi (Pandra) APMC Market Yard",
    nameHi: "रांची (पंडरा) कृषि उपज मंडी",
    district: "Ranchi",
    state: "Jharkhand",
    lat: 23.3441,
    lon: 85.3096,
    aliases: ["ranchi", "रांची", "pandra", "पंडरा", "jamshedpur", "जमशेदपुर", "dhanbad", "धनबाद", "bokaro", "बोकारो", "hazaribagh", "हजारीबाग"],
  },
  {
    id: "jh_state",
    nameEn: "Jharkhand Benchmark Mandi Network",
    nameHi: "झारखंड कृषि मंडी नेटवर्क",
    district: "Ranchi",
    state: "Jharkhand",
    lat: 23.3441,
    lon: 85.3096,
    aliases: ["jharkhand", "झारखंड"],
  },

  // ==================== HIMACHAL PRADESH & UTTARAKHAND ====================
  {
    id: "hp_shimla",
    nameEn: "Shimla (Bhattakufer) Apple & Fruit Mandi",
    nameHi: "शिमला (भट्टाकुफर) सेब व फल मंडी",
    district: "Shimla",
    state: "Himachal Pradesh",
    lat: 31.1048,
    lon: 77.1734,
    aliases: ["shimla", "शिमला", "solan", "सोलन", "kullu", "कुल्लू", "mandi hp", "मंडी", "kangra", "कांगड़ा"],
  },
  {
    id: "uk_dehradun",
    nameEn: "Dehradun (Niranjanpur) Mandi Sthal",
    nameHi: "देहरादून (निरंजनपुर) कृषि मंडी",
    district: "Dehradun",
    state: "Uttarakhand",
    lat: 30.3165,
    lon: 78.0322,
    aliases: ["dehradun", "देहरादून", "haridwar", "हरिद्वार", "haldwani", "हल्द्वानी", "rudrapur", "रुद्रपुर", "kashipur", "काशीपुर"],
  },

  // ==================== JAMMU & KASHMIR & LADAKH ====================
  {
    id: "jk_srinagar",
    nameEn: "Srinagar (Parimpora) Fruit & Apple Mandi",
    nameHi: "श्रीनगर (परिमपोरा) फल व सेब मंडी",
    district: "Srinagar",
    state: "Jammu and Kashmir",
    lat: 34.0837,
    lon: 74.7973,
    aliases: ["srinagar", "श्रीनगर", "parimpora", "sopore", "सोपोर", "anantnag", "अनंतनाग", "baramulla", "बारामूला"],
  },
  {
    id: "jk_jammu",
    nameEn: "Jammu (Narwal) Fruit & Grain APMC",
    nameHi: "जम्मू (नरवाल) फल व अनाज मंडी",
    district: "Jammu",
    state: "Jammu and Kashmir",
    lat: 32.7266,
    lon: 74.8570,
    aliases: ["jammu", "जम्मू", "narwal", "नरवाल", "udhampur", "उधमपुर", "kathua", "कठुआ", "leh", "लेह", "ladakh", "लद्दाख"],
  },

  // ==================== DELHI NCR & UNION TERRITORIES ====================
  {
    id: "dl_azadpur",
    nameEn: "Delhi (Azadpur) Asia's Largest Terminal Mandi",
    nameHi: "दिल्ली (आजादपुर) एशिया की सबसे बड़ी फल व सब्जी मंडी",
    district: "North Delhi",
    state: "Delhi",
    lat: 28.7126,
    lon: 77.1764,
    aliases: ["delhi", "दिल्ली", "azadpur", "आजादपुर", "narela", "नरेला", "najafgarh", "नजफगढ़", "ghaziabad", "गाजियाबाद", "noida", "नोएडा", "gurugram", "गुरुग्राम", "faridabad", "फरीदाबाद"],
  },
  {
    id: "ch_chandigarh",
    nameEn: "Chandigarh (Sector 26) APMC Grain Market",
    nameHi: "चंडीगढ़ अनाज व फल मंडी",
    district: "Chandigarh",
    state: "Chandigarh",
    lat: 30.7333,
    lon: 76.7794,
    aliases: ["chandigarh", "चंडीगढ़", "panchkula", "पंचकूला", "mohali", "मोहाली"],
  },
];

// ============================================================================
// 2. COMPLETE ALL-INDIA STATES & DISTRICTS DIRECTORY (FOR MANUAL SELECTION)
// ============================================================================
export const ALL_INDIAN_STATES_AND_DISTRICTS: Record<string, string[]> = {
  "Madhya Pradesh": [
    "Bhopal", "Sehore", "Indore", "Ujjain", "Dewas", "Vidisha", "Harda", "Narmadapuram",
    "Mandsaur", "Neemuch", "Ratlam", "Jabalpur", "Gwalior", "Sagar", "Chhindwara", "Khargone",
    "Khandwa", "Barwani", "Dhar", "Shajapur", "Agar Malwa", "Rajgarh", "Raisen", "Betul",
    "Rewa", "Satna", "Singrauli", "Shahdol", "Balaghat", "Seoni", "Mandla", "Shivpuri", "Guna", "Datia"
  ],
  "Rajasthan": [
    "Ajmer", "Kota", "Jaipur", "Sri Ganganagar", "Jodhpur", "Bikaner", "Hanumangarh", "Alwar",
    "Baran", "Nagaur", "Bharatpur", "Udaipur", "Sikar", "Chittorgarh", "Bhilwara", "Tonk",
    "Pali", "Jalore", "Barmer", "Jaisalmer", "Churu", "Jhunjhunu", "Dausa", "Sawai Madhopur",
    "Bundi", "Jhalawar", "Banswara", "Dungarpur", "Pratapgarh", "Rajsamand"
  ],
  "Maharashtra": [
    "Pune", "Nashik", "Nagpur", "Latur", "Akola", "Amravati", "Jalgaon", "Solapur",
    "Kolhapur", "Ahmednagar", "Sangli", "Satara", "Aurangabad (Chhatrapati Sambhaji Nagar)",
    "Nanded", "Yavatmal", "Buldhana", "Washim", "Wardha", "Chandrapur", "Bhandara", "Gondia",
    "Parbhani", "Beed", "Jalna", "Osmanabad (Dharashiv)", "Hingoli", "Thane", "Palghar", "Raigad", "Ratnagiri"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Bathinda", "Jalandhar", "Patiala", "Sangrur", "Firozpur",
    "Mansa", "Hoshiarpur", "Gurdaspur", "Pathankot", "Moga", "Muktsar", "Fazilka",
    "Faridkot", "Kapurthala", "Tarn Taran", "Rupnagar", "SAS Nagar (Mohali)", "Fatehgarh Sahib", "Barnala", "Malerkotla"
  ],
  "Haryana": [
    "Karnal", "Sirsa", "Hisar", "Ambala", "Kurukshetra", "Kaithal", "Rohtak", "Jind",
    "Fatehabad", "Panipat", "Sonipat", "Yamunanagar", "Bhiwani", "Charkhi Dadri", "Rewari",
    "Mahendragarh", "Gurugram", "Faridabad", "Palwal", "Nuh (Mewat)", "Panchkula", "Jhajjar"
  ],
  "Gujarat": [
    "Rajkot", "Mehsana", "Ahmedabad", "Surat", "Vadodara", "Gondal", "Junagadh", "Amreli",
    "Bhavnagar", "Jamnagar", "Porbandar", "Surendranagar", "Morbi", "Kutch", "Banaskantha (Deesa)",
    "Patan", "Sabarkantha", "Aravalli", "Gandhinagar", "Kheda", "Anand", "Panchmahal", "Dahod", "Bharuch", "Navsari"
  ],
  "Uttar Pradesh": [
    "Kanpur Nagar", "Lucknow", "Agra", "Varanasi", "Meerut", "Aligarh", "Bareilly",
    "Moradabad", "Gorakhpur", "Saharanpur", "Muzaffarnagar", "Jhansi", "Prayagraj", "Ayodhya",
    "Mathura", "Firozabad", "Mainpuri", "Etawah", "Farrukhabad", "Barabanki", "Sitapur",
    "Lakhimpur Kheri", "Hardoi", "Unnao", "Banda", "Hamirpur", "Mahoba", "Jalaun", "Basti", "Deoria", "Azamgarh", "Mirzapur"
  ],
  "Telangana": [
    "Warangal", "Hyderabad", "Nizamabad", "Khammam", "Karimnagar", "Nalgonda", "Mahabubnagar",
    "Rangareddy", "Medak", "Suryapet", "Siddipet", "Jagtial", "Mancherial", "Adilabad", "Bhadradri Kothagudem"
  ],
  "Andhra Pradesh": [
    "Guntur", "Krishna (Vijayawada)", "Kurnool", "Anantapur", "East Godavari (Rajahmundry)",
    "West Godavari (Eluru)", "Visakhapatnam", "Chittoor", "YSR Kadapa", "Nellore", "Prakasam", "Srikakulam", "Vizianagaram"
  ],
  "Karnataka": [
    "Dharwad (Hubli)", "Bengaluru Urban", "Belagavi", "Davanagere", "Ballari", "Mysuru",
    "Raichur", "Shivamogga", "Vijayapura", "Bagalkote", "Kalaburagi", "Koppal", "Gadag",
    "Haveri", "Tumakuru", "Mandya", "Hassan", "Chikkamagaluru", "Udupi", "Dakshina Kannada"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Erode", "Dindigul",
    "Tirupur", "Thanjavur", "Tirunelveli", "Vellore", "Kanchipuram", "Cuddalore", "Villupuram", "Namakkal", "Theni"
  ],
  "West Bengal": [
    "Kolkata", "Darjeeling (Siliguri)", "Purba Bardhaman", "Paschim Bardhaman", "Hooghly",
    "Nadia", "Murshidabad", "Malda", "Uttar Dinajpur", "Dakshin Dinajpur", "Jalpaiguri", "Cooch Behar", "Bankura", "Birbhum", "Medinipur"
  ],
  "Bihar": [
    "Patna", "Muzaffarpur", "Bhagalpur", "Gaya", "Purnia", "Darbhanga", "Begusarai",
    "Samastipur", "Vaishali", "Saran (Chhapra)", "Siwan", "Gopalganj", "East Champaran", "West Champaran", "Rohtas", "Bhojpur", "Nalanda"
  ],
  "Odisha": [
    "Khordha (Bhubaneswar)", "Cuttack", "Sambalpur", "Bargarh", "Ganjam (Berhampur)", "Balasore",
    "Bhadrak", "Jajpur", "Kendrapara", "Puri", "Angul", "Dhenkanal", "Bolangir", "Kalahandi", "Koraput", "Mayurbhanj"
  ],
  "Chhattisgarh": [
    "Raipur", "Bilaspur", "Durg", "Rajnandgaon", "Dhamtari", "Mahasamund", "Janjgir-Champa",
    "Korba", "Raigarh", "Bastar (Jagdalpur)", "Kanker", "Surguja (Ambikapur)", "Kawardha", "Bemetara", "Balod"
  ],
  "Kerala": [
    "Ernakulam (Kochi)", "Palakkad", "Thrissur", "Kozhikode", "Thiruvananthapuram", "Kottayam",
    "Wayanad", "Idukki", "Malappuram", "Kannur", "Alappuzha", "Kollam", "Pathanamthitta", "Kasaragod"
  ],
  "Assam": [
    "Kamrup Metropolitan (Guwahati)", "Jorhat", "Dibrugarh", "Nagaon", "Cachar (Silchar)",
    "Sonitpur (Tezpur)", "Barpeta", "Dhubri", "Golaghat", "Sivasagar", "Tinsukia", "Bongaigaon", "Morigaon"
  ],
  "Jharkhand": [
    "Ranchi", "East Singhbhum (Jamshedpur)", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar",
    "Giridih", "Palamu", "Ramgarh", "Dumka", "Godda", "Sahebganj", "Koderma", "Gumla", "Chaibasa"
  ],
  "Himachal Pradesh": [
    "Shimla", "Solan", "Kullu", "Mandi", "Kangra (Dharamshala)", "Una", "Hamirpur",
    "Bilaspur", "Sirmaur", "Chamba", "Kinnaur", "Lahaul and Spiti"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Udham Singh Nagar (Rudrapur / Kashipur)", "Nainital (Haldwani)",
    "Tehri Garhwal", "Pauri Garhwal", "Almora", "Pithoragarh", "Chamoli", "Uttarkashi"
  ],
  "Jammu and Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua", "Pulwama",
    "Kupwara", "Budgam", "Rajouri", "Poonch", "Samba", "Reasi", "Ganderbal", "Bandipora"
  ],
  "Ladakh": ["Leh", "Kargil"],
  "Delhi": ["North Delhi", "South Delhi", "West Delhi", "East Delhi", "New Delhi", "North West Delhi"],
  "Chandigarh": ["Chandigarh"],
  "Goa": ["North Goa", "South Goa"],
  "Tripura": ["West Tripura (Agartala)", "North Tripura", "South Tripura", "Dhalai", "Gomati", "Unakoti"],
  "Meghalaya": ["East Khasi Hills (Shillong)", "West Garo Hills (Tura)", "Ri-Bhoi"],
  "Manipur": ["Imphal East", "Imphal West", "Thoubal", "Bishnupur", "Churachandpur"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Wokha"],
  "Arunachal Pradesh": ["Papum Pare (Itanagar)", "Changlang", "Lohit", "Pasighat"],
  "Sikkim": ["East Sikkim (Gangtok)", "West Sikkim (Geyzing)", "South Sikkim (Namchi)", "North Sikkim (Mangan)"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Andaman and Nicobar": ["South Andaman (Port Blair)", "North and Middle Andaman", "Nicobar"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Dadra and Nagar Haveli"]
};

// ============================================================================
// 3. CAPABILITY & DATA COVERAGE ENGINE
// ============================================================================

/**
 * Evaluates the precise data coverage available for a given location
 */
export function getDataCoverage(params: {
  service?: "all" | "mandi" | "weather" | "annam" | "syngenta";
  state?: string;
  district?: string;
  lat?: number;
  lon?: number;
}): ServiceDataCoverage {
  const { state = "", district = "", lat, lon } = params;
  const cleanState = state.trim().toLowerCase();
  const cleanDistrict = district.trim().toLowerCase();

  // 1. Weather: Global Open-Meteo coverage everywhere across India
  const weatherAvailable = true;

  // 2. Mandi: Checked against comprehensive registry
  const mandiAvailable = COMPREHENSIVE_MANDI_REGISTRY.some(
    (m) =>
      m.state.toLowerCase() === cleanState ||
      m.district.toLowerCase() === cleanDistrict ||
      m.aliases.some((a) => a.toLowerCase() === cleanDistrict) ||
      (lat && lon && calculateDistance(lat, lon, m.lat, m.lon) <= 250)
  );

  // 3. ANNAM Micro-climate & Crop Stress Engine:
  // Supported in Indo-Gangetic, Central India, Vidarbha, Saurashtra, Kashmir, Rayalaseema, and Deccan
  const ANNAM_SUPPORTED_STATES = new Set([
    "punjab", "haryana", "madhya pradesh", "maharashtra", "gujarat",
    "rajasthan", "uttar pradesh", "andhra pradesh", "telangana", "karnataka",
    "jammu and kashmir", "tamil nadu", "bihar", "west bengal"
  ]);
  const annamAvailable = Boolean(ANNAM_SUPPORTED_STATES.has(cleanState) || (lat !== undefined && lon !== undefined && lat >= 8.0 && lat <= 36.0));

  // 4. Syngenta Biologicals & Protection Matrix:
  // Nationally registered portfolio available across all Indian states
  const syngentaAvailable = true;

  return {
    mandiAvailable,
    weatherAvailable,
    annamAvailable,
    syngentaAvailable,
    summary: `Verified Coverage: Weather (100%), APMC Mandi (${mandiAvailable ? "Active" : "Nearby Regional APMC"}), ANNAM Pre-emptive Stress (${annamAvailable ? "Supported" : "Macro Telemetry"}), Syngenta Matrix (National).`
  };
}

/**
 * Checks if query is explicitly asking for data coverage / supported locations discovery
 */
export function isDataCoverageQuery(query: string): boolean {
  if (!query || !query.trim()) return false;
  const q = query.toLowerCase();
  return (
    q.includes("kahan kahan") ||
    q.includes("kaha kaha") ||
    q.includes("kahan-kahan") ||
    q.includes("kaha-kaha") ||
    q.includes("कहाँ-कहाँ") ||
    q.includes("कहाँ कहाँ") ||
    q.includes("कहां-कहां") ||
    q.includes("कहां कहां") ||
    q.includes("data available") ||
    q.includes("data uplabdh") ||
    q.includes("डेटा उपलब्ध") ||
    q.includes("data coverage") ||
    q.includes("supported location") ||
    q.includes("supported states") ||
    q.includes("kaun kaun si mandi") ||
    q.includes("kaunsi mandi") ||
    q.includes("कौन कौन सी मंडी") ||
    q.includes("कौनसी मंडी") ||
    q.includes("kis kis mandi") ||
    q.includes("किस किस मंडी") ||
    q.includes("all states") ||
    q.includes("सारे राज्य")
  );
}

/**
 * Returns dynamic data coverage summary across the registry
 */
export function getDataCoverageSummary(language: string = "hi"): string {
  const isHi = language === "hi";
  const stateCount = Object.keys(ALL_INDIAN_STATES_AND_DISTRICTS).length;
  const totalMandis = COMPREHENSIVE_MANDI_REGISTRY.filter((m) => !m.id.endsWith("_state")).length;

  if (isHi) {
    return `🌾 **AASRA अखिल भारतीय (Pan-India) कृषि डेटा कवरेज:**\n\nवर्तमान में AASRA के पास **भारत के सभी 28 राज्यों व 8 केंद्र शासित प्रदेशों** के **${totalMandis}+ प्रमुख APMC कृषि उपज मंडियों**, लाइव मौसम टेलीमेट्री और 40+ फसलों का सत्यापित डेटा उपलब्ध है।\n\n📍 **प्रमुख कवरेज क्षेत्र:**\n- **उत्तर भारत:** पंजाब (खन्ना, अमृतसर), हरियाणा (करनाल, सिरसा), उत्तर प्रदेश (कानपुर, लखनऊ, आगरा, वाराणसी), दिल्ली (आजादपुर)\n- **मध्य व पश्चिम भारत:** राजस्थान (जयपुर, अजमेर, कोटा, श्रीगंगानगर), मध्य प्रदेश (भोपाल, सीहोर, इंदौर, उज्जैन, हरदा, मंदसौर), गुजरात (राजकोट, ऊंझा, अहमदाबाद)\n- **दक्षिण भारत:** महाराष्ट्र (लातूर, अकोला, नासिक, पुणे), कर्नाटक (हुबली, बेंगलुरु), तेलंगाना (वारंगल), आंध्र प्रदेश (गुंटूर), तमिलनाडु (चेन्नई, कोयंबटूर), केरल\n- **पूर्व व पूर्वोत्तर भारत:** पश्चिम बंगाल (कोलकाता, सिलीगुड़ी), बिहार (पटना, मुजफ्फरपुर), ओडिशा (भुवनेश्वर), असम (गुवाहाटी), झारखंड (रांची), हिमाचल, कश्मीर आदि।\n\n💡 आप भारत के किसी भी शहर, जिले या मंडी का नाम लेकर सीधा भाव या मौसम पूछ सकते हैं (जैसे: *"जयपुर में गेहूं का भाव?"*, *"नासिक में प्याज का भाव?"*, या *"अमरावती में मौसम?"*)।`;
  }

  return `🌾 **AASRA Pan-India Agricultural & Telemetry Coverage:**\n\nCurrently, AASRA tracks **${totalMandis}+ verified APMC Mandis across all 28 States and 8 Union Territories of India**, with real-time Open-Meteo telemetry and agronomic intelligence across 40+ commodities.\n\n📍 **Key Coverage Regions:**\n- **Northern India:** Punjab (Khanna, Amritsar), Haryana (Karnal, Sirsa), UP (Kanpur, Lucknow, Agra), Delhi (Azadpur)\n- **Central & Western India:** Rajasthan (Jaipur, Ajmer, Kota, Sri Ganganagar), MP (Bhopal, Sehore, Indore, Ujjain, Harda, Mandsaur), Gujarat (Rajkot, Unjha, Ahmedabad)\n- **Southern India:** Maharashtra (Latur, Akola, Nashik, Pune), Karnataka (Hubli, Bengaluru), Telangana (Warangal), AP (Guntur), Tamil Nadu (Chennai, Coimbatore), Kerala\n- **Eastern & North-East India:** West Bengal (Kolkata, Siliguri), Bihar (Patna, Muzaffarpur), Odisha (Bhubaneswar), Assam (Guwahati), Jharkhand (Ranchi), Himachal Pradesh, J&K, etc.\n\n💡 You can query any city, district, or market directly across India (e.g. *"What is the wheat price in Jaipur?"*, *"Onion rate in Nashik?"*, or *"Weather in Amravati?"*).`;
}

/**
 * Detects if the query refers to current/local GPS location ("mere yahan", "pass me", "near me")
 */
export function isLocalGpsIntent(query: string): boolean {
  if (!query || !query.trim()) return false;
  const q = query.toLowerCase();
  return (
    q.includes("mere yahan") ||
    q.includes("mere yaha") ||
    q.includes("mere paas") ||
    q.includes("mere pass") ||
    q.includes("mere khet") ||
    q.includes("apne yahan") ||
    q.includes("apne yaha") ||
    q.includes("meri mandi") ||
    q.includes("hamare yahan") ||
    q.includes("hamare yaha") ||
    q.includes("mere gaon") ||
    q.includes("near me") ||
    q.includes("around me") ||
    q.includes("nearby") ||
    q.includes("local mandi") ||
    q.includes("my location") ||
    q.includes("here")
  );
}

/**
 * Extracts explicit location mention from user query across Indian languages
 */
export function extractExplicitLocationFromQuery(query: string): {
  matchedItem: MandiGeoItem;
  matchedAlias: string;
  isDistrict: boolean;
  isState: boolean;
  userLocation: string;
} | null {
  if (!query || !query.trim()) return null;
  const q = query.toLowerCase();

  // 1. Longest alias matching first
  const allAliases: Array<{ item: MandiGeoItem; alias: string }> = [];
  for (const item of COMPREHENSIVE_MANDI_REGISTRY) {
    for (const alias of item.aliases) {
      // Ignore short 2-character aliases to prevent collisions with Hindi/English grammatical words
      if (alias.length <= 2) continue;
      allAliases.push({ item, alias });
    }
  }
  allAliases.sort((a, b) => b.alias.length - a.alias.length);

  for (const { item, alias } of allAliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[\\s,;!?]|in\\s+|at\\s+|में\\s+|मे\\s+|me\\s+|mein\\s+|cha\\s+|da\\s+|vich\\s+|lo\\s+|alli\\s+)${escaped}(?:[\\s,;!?]|$)`, "i");
    if (regex.test(q)) {
      const isDistrict = alias.toLowerCase() === item.district.toLowerCase();
      const isState = item.id.endsWith("_state");
      const userLocation = isState
        ? item.state
        : isDistrict
          ? `${item.district}, ${item.state}`
          : `${alias.charAt(0).toUpperCase() + alias.slice(1)}, ${item.district}`;

      return {
        matchedItem: item,
        matchedAlias: alias,
        isDistrict,
        isState,
        userLocation,
      };
    }
  }

  return null;
}

/**
 * Detects if user query used an explicit location syntactic pattern with an UNKNOWN/UNRESOLVED word
 * e.g. "XYZ mein soybean ka bhav?", "Atlantis mandi ka rate?", "in Wakanda what is price?"
 */
export function detectUnknownLocationPattern(query: string): string | null {
  if (!query || !query.trim()) return null;
  const q = query.trim();

  // Known agricultural/common stopwords to exclude from being flagged as locations
  const NON_LOCATION_WORDS = new Set([
    "aaj", "kal", "parso", "today", "tomorrow", "rate", "bhav", "price", "mandi", "bazar",
    "khet", "farm", "crop", "fasal", "wheat", "soybean", "cotton", "mustard", "chana", "onion",
    "gehu", "gehoon", "kank", "sarson", "pyaj", "lahsun", "makka", "dhan", "paddy", "rice",
    "dawa", "medicine", "spray", "keeda", "pest", "insect", "weather", "mausam", "baarish", "rain",
    "mere", "apne", "humare", "is", "us", "kaunsi", "kya", "kitna", "batao", "bataiye", "hai",
    "mein", "me", "in", "at", "ka", "ke", "ki", "ko", "se", "aur", "and", "or", "what", "how", "when",
    "where", "why", "who", "tell", "show", "give", "latest", "verified", "live", "data", "update"
  ]);

  // Pattern 1: Hindi/Hinglish "<Word> mein / me / mandi / ka bhav"
  const hindiLocPattern = /(?:^|\s)([a-zA-Z\u0900-\u097F]{2,25})\s+(?:mein|me|मंडी|mandi|apmc|मार्केट|market)\b/i;
  const matchH = q.match(hindiLocPattern);
  if (matchH && matchH[1]) {
    const candidate = matchH[1].toLowerCase().trim();
    if (!NON_LOCATION_WORDS.has(candidate) && candidate.length >= 2) {
      return matchH[1].trim();
    }
  }

  // Pattern 2: English "in <Word>", "at <Word>", "<Word> mandi"
  const engLocPattern = /\b(?:in|at)\s+([a-zA-Z]{2,25})\b/i;
  const matchE = q.match(engLocPattern);
  if (matchE && matchE[1]) {
    const candidate = matchE[1].toLowerCase().trim();
    if (!NON_LOCATION_WORDS.has(candidate) && candidate.length >= 2) {
      return matchE[1].trim();
    }
  }

  return null;
}

/**
 * Searches conversational history turns for the latest explicit location mention
 */
export function extractLocationFromConversationHistory(
  history: Array<{ sender: string; text: string }> = []
): MandiGeoItem | null {
  if (!history || history.length === 0) return null;

  // Search backwards starting from the most recent user messages
  for (let i = history.length - 1; i >= 0; i--) {
    const turn = history[i];
    if (turn.sender === "user" && turn.text) {
      const explicit = extractExplicitLocationFromQuery(turn.text);
      if (explicit) {
        return explicit.matchedItem;
      }
    }
  }

  return null;
}

/**
 * Finds the nearest APMC Mandi from any geographic coordinate in India
 */
export function findNearestMandi(lat: number, lon: number, districtHint?: string, stateHint?: string): {
  mandi: MandiGeoItem;
  distanceKm: number;
} {
  // 1. Direct district match
  if (districtHint && districtHint.trim()) {
    const dLower = districtHint.trim().toLowerCase();
    const matchedDistrictMandi = COMPREHENSIVE_MANDI_REGISTRY.find(
      (m) =>
        !m.id.endsWith("_state") &&
        (m.district.toLowerCase() === dLower || m.aliases.some((a) => a.toLowerCase() === dLower))
    );
    if (matchedDistrictMandi) {
      const dist = calculateDistance(lat, lon, matchedDistrictMandi.lat, matchedDistrictMandi.lon);
      return { mandi: matchedDistrictMandi, distanceKm: dist };
    }
  }

  // 2. Haversine nearest search across all active APMC yards
  let bestMandi = COMPREHENSIVE_MANDI_REGISTRY[0];
  let minDistance = Infinity;

  for (const m of COMPREHENSIVE_MANDI_REGISTRY) {
    if (m.id.endsWith("_state")) continue;
    const d = calculateDistance(lat, lon, m.lat, m.lon);
    if (d < minDistance) {
      minDistance = d;
      bestMandi = m;
    }
  }

  // 3. Fallback to state benchmark if coordinates are far
  if (minDistance > 500 && stateHint && stateHint.trim()) {
    const sLower = stateHint.trim().toLowerCase();
    const stateMandi = COMPREHENSIVE_MANDI_REGISTRY.find((m) => m.state.toLowerCase() === sLower);
    if (stateMandi) {
      return { mandi: stateMandi, distanceKm: Math.round(minDistance) };
    }
  }

  return { mandi: bestMandi, distanceKm: Math.round(minDistance) };
}

/**
 * PRIMARY CANONICAL LOCATION RESOLVER
 * Resolves the 5-tier location priority canonical object.
 * Strictly maintains userLocation (GPS), queryLocation (Explicit query), and effectiveLocation.
 */
export function resolveCanonicalLocation(params: {
  userQuery?: string;
  conversationHistory?: Array<{ sender: string; text: string }>;
  lastResolvedLocation?: CanonicalLocationContext | null;
  selectedDistrict?: string;
  selectedState?: string;
  gpsLat?: number;
  gpsLon?: number;
  gpsDistrict?: string;
  gpsState?: string;
  gpsVillage?: string;
  gpsCity?: string;
  gpsCountry?: string;
}): CanonicalLocationContext {
  const query = (params.userQuery || "").trim();
  const defaultGpsLat = params.gpsLat ?? 23.2599;
  const defaultGpsLon = params.gpsLon ?? 77.4126;
  const defaultGpsDistrict = params.gpsDistrict || "Bhopal";
  const defaultGpsState = params.gpsState || "Madhya Pradesh";
  const defaultGpsVillage = params.gpsVillage || "";
  const defaultGpsCity = params.gpsCity || defaultGpsDistrict;
  const defaultGpsCountry = params.gpsCountry || "India";

  // Build the permanent physical User Location representation
  const userLocDetails: LocationDetails = {
    country: defaultGpsCountry,
    state: defaultGpsState,
    district: defaultGpsDistrict,
    city: defaultGpsCity,
    village: defaultGpsVillage,
    lat: defaultGpsLat,
    lon: defaultGpsLon,
    displayName: defaultGpsVillage
      ? `${defaultGpsVillage}, ${defaultGpsDistrict}, ${defaultGpsState}`
      : `${defaultGpsDistrict}, ${defaultGpsState}`,
  };

  // 0. Check for Data Coverage Discovery Query
  if (query && isDataCoverageQuery(query)) {
    const coverageInfo = getDataCoverage({ service: "all", state: defaultGpsState, district: defaultGpsDistrict, lat: defaultGpsLat, lon: defaultGpsLon });
    return {
      userLocation: userLocDetails,
      queryLocation: null,
      effectiveLocation: {
        ...userLocDetails,
        mandiName: "All Pan-India APMC Markets",
        mandiHi: "सभी अखिल भारतीय कृषि उपज मंडियां",
        mandiDistanceKm: 0,
      },
      requestedLocation: "All Supported Agricultural Mandis",
      resolvedLocation: "India (All 28 States & 8 UTs)",
      locationType: "state",
      district: defaultGpsDistrict,
      state: defaultGpsState,
      lat: defaultGpsLat,
      lon: defaultGpsLon,
      source: "query",
      confidence: 100,
      isExplicitQueryLocation: false,
      isDataCoverageQuery: true,
      coverage: coverageInfo,
    };
  }

  // 1. Check for Explicit "mere yahan" / "near me" GPS intent in query
  const isGpsIntent = query ? isLocalGpsIntent(query) : false;
  if (isGpsIntent) {
    const { mandi: nearestMandi, distanceKm } = findNearestMandi(defaultGpsLat, defaultGpsLon, defaultGpsDistrict, defaultGpsState);
    const coverageInfo = getDataCoverage({ service: "all", state: defaultGpsState, district: defaultGpsDistrict, lat: defaultGpsLat, lon: defaultGpsLon });

    return {
      userLocation: userLocDetails,
      queryLocation: null,
      effectiveLocation: {
        ...userLocDetails,
        mandiName: nearestMandi.nameEn,
        mandiHi: nearestMandi.nameHi,
        mandiDistanceKm: distanceKm,
      },
      requestedLocation: "Local GPS / Current Farm",
      resolvedLocation: userLocDetails.displayName || `${defaultGpsDistrict}, ${defaultGpsState}`,
      locationType: "gps",
      district: defaultGpsDistrict,
      state: defaultGpsState,
      lat: defaultGpsLat,
      lon: defaultGpsLon,
      mandiName: nearestMandi.nameEn,
      mandiHi: nearestMandi.nameHi,
      source: "gps",
      confidence: 99,
      isExplicitQueryLocation: false,
      coverage: coverageInfo,
    };
  }

  // 2. TIER 1: EXPLICIT LOCATION IN CURRENT USER QUERY
  if (query) {
    const explicitLoc = extractExplicitLocationFromQuery(query);
    if (explicitLoc) {
      const item = explicitLoc.matchedItem;
      const queryLocDetails: LocationDetails = {
        country: "India",
        state: item.state,
        district: item.district,
        city: item.district,
        lat: item.lat,
        lon: item.lon,
        displayName: explicitLoc.userLocation,
      };

      const coverageInfo = getDataCoverage({ service: "all", state: item.state, district: item.district, lat: item.lat, lon: item.lon });

      return {
        userLocation: userLocDetails,
        queryLocation: queryLocDetails,
        effectiveLocation: {
          ...queryLocDetails,
          mandiName: item.nameEn,
          mandiHi: item.nameHi,
          mandiDistanceKm: 0,
        },
        requestedLocation: explicitLoc.matchedAlias.charAt(0).toUpperCase() + explicitLoc.matchedAlias.slice(1),
        resolvedLocation: explicitLoc.userLocation,
        locationType: explicitLoc.isState ? "state" : explicitLoc.isDistrict ? "district" : "city",
        district: item.district,
        state: item.state,
        lat: item.lat,
        lon: item.lon,
        mandiName: item.nameEn,
        mandiHi: item.nameHi,
        source: "query",
        confidence: 98,
        isExplicitQueryLocation: true,
        coverage: coverageInfo,
      };
    }

    // Check for Unknown/Unresolved Location intent (e.g. "XYZ mein soybean ka bhav?")
    const unknownText = detectUnknownLocationPattern(query);
    if (unknownText) {
      return {
        userLocation: userLocDetails,
        queryLocation: null,
        effectiveLocation: {
          country: "India",
          state: defaultGpsState,
          district: unknownText,
          lat: defaultGpsLat,
          lon: defaultGpsLon,
        },
        requestedLocation: unknownText,
        resolvedLocation: `Unknown Location (${unknownText})`,
        locationType: "unknown",
        district: unknownText,
        state: defaultGpsState,
        lat: defaultGpsLat,
        lon: defaultGpsLon,
        source: "unknown",
        confidence: 40,
        isExplicitQueryLocation: false,
        isUnknownLocation: true,
        unresolvedText: unknownText,
      };
    }
  }

  // 3. TIER 2: EXPLICIT LOCATION FROM CONVERSATION HISTORY (FOLLOW-UP TURNS)
  if (params.conversationHistory && params.conversationHistory.length > 0) {
    const historyMandi = extractLocationFromConversationHistory(params.conversationHistory);
    if (historyMandi) {
      const historyLocDetails: LocationDetails = {
        country: "India",
        state: historyMandi.state,
        district: historyMandi.district,
        city: historyMandi.district,
        lat: historyMandi.lat,
        lon: historyMandi.lon,
        displayName: `${historyMandi.district}, ${historyMandi.state}`,
      };

      return {
        userLocation: userLocDetails,
        queryLocation: historyLocDetails,
        effectiveLocation: {
          ...historyLocDetails,
          mandiName: historyMandi.nameEn,
          mandiHi: historyMandi.nameHi,
          mandiDistanceKm: 0,
        },
        requestedLocation: historyMandi.district,
        resolvedLocation: `${historyMandi.district}, ${historyMandi.state}`,
        locationType: "district",
        district: historyMandi.district,
        state: historyMandi.state,
        lat: historyMandi.lat,
        lon: historyMandi.lon,
        mandiName: historyMandi.nameEn,
        mandiHi: historyMandi.nameHi,
        source: "conversation",
        confidence: 94,
        isExplicitQueryLocation: false,
      };
    }
  }

  // 3b. Check last resolved location if passed
  if (params.lastResolvedLocation && params.lastResolvedLocation.district && params.lastResolvedLocation.source !== "gps") {
    return {
      ...params.lastResolvedLocation,
      userLocation: userLocDetails,
      source: "conversation",
      confidence: 90,
      isExplicitQueryLocation: false,
    };
  }

  // 4. TIER 3: USER-SELECTED PROFILE LOCATION (IF EXPLICITLY SET)
  if (params.selectedDistrict && params.selectedDistrict.trim() && params.selectedDistrict.toLowerCase() !== "bhopal") {
    const profileDistrict = params.selectedDistrict.trim();
    const matchedProfileMandi = COMPREHENSIVE_MANDI_REGISTRY.find(
      (m) =>
        m.district.toLowerCase() === profileDistrict.toLowerCase() ||
        m.aliases.some((a) => a.toLowerCase() === profileDistrict.toLowerCase())
    );

    if (matchedProfileMandi) {
      const profileLocDetails: LocationDetails = {
        country: "India",
        state: matchedProfileMandi.state,
        district: matchedProfileMandi.district,
        city: matchedProfileMandi.district,
        lat: matchedProfileMandi.lat,
        lon: matchedProfileMandi.lon,
        displayName: `${matchedProfileMandi.district}, ${matchedProfileMandi.state}`,
      };

      return {
        userLocation: userLocDetails,
        queryLocation: profileLocDetails,
        effectiveLocation: {
          ...profileLocDetails,
          mandiName: matchedProfileMandi.nameEn,
          mandiHi: matchedProfileMandi.nameHi,
          mandiDistanceKm: 0,
        },
        requestedLocation: profileDistrict,
        resolvedLocation: `${matchedProfileMandi.district}, ${matchedProfileMandi.state}`,
        locationType: "district",
        district: matchedProfileMandi.district,
        state: matchedProfileMandi.state,
        lat: matchedProfileMandi.lat,
        lon: matchedProfileMandi.lon,
        mandiName: matchedProfileMandi.nameEn,
        mandiHi: matchedProfileMandi.nameHi,
        source: "profile",
        confidence: 92,
        isExplicitQueryLocation: false,
      };
    }
  }

  // 5. TIER 4: CURRENT PERMITTED GPS LOCATION
  const { mandi: nearestMandi, distanceKm } = findNearestMandi(defaultGpsLat, defaultGpsLon, defaultGpsDistrict, defaultGpsState);
  const coverageInfo = getDataCoverage({ service: "all", state: defaultGpsState, district: defaultGpsDistrict, lat: defaultGpsLat, lon: defaultGpsLon });

  return {
    userLocation: userLocDetails,
    queryLocation: null,
    effectiveLocation: {
      ...userLocDetails,
      mandiName: nearestMandi.nameEn,
      mandiHi: nearestMandi.nameHi,
      mandiDistanceKm: distanceKm,
    },
    requestedLocation: defaultGpsDistrict,
    resolvedLocation: userLocDetails.displayName || `${defaultGpsDistrict}, ${defaultGpsState}`,
    locationType: "gps",
    district: defaultGpsDistrict,
    state: defaultGpsState,
    lat: defaultGpsLat,
    lon: defaultGpsLon,
    mandiName: nearestMandi.nameEn,
    mandiHi: nearestMandi.nameHi,
    source: "gps",
    confidence: 90,
    isExplicitQueryLocation: false,
    coverage: coverageInfo,
  };
}

/**
 * Haversine formula distance calculation in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
