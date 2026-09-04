/**
 * Indian District Centroids & Coordinates Database
 * Used to immediately center satellite field maps without forcing user's device geolocation.
 */

export interface DistrictCoord {
  lat: number;
  lon: number;
  state: string;
}

export const DISTRICT_COORDINATES: Record<string, DistrictCoord> = {
  // Madhya Pradesh
  sehore: { lat: 23.2030, lon: 77.0840, state: "Madhya Pradesh" },
  bhopal: { lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh" },
  indore: { lat: 22.7196, lon: 75.8577, state: "Madhya Pradesh" },
  ujjain: { lat: 23.1765, lon: 75.7885, state: "Madhya Pradesh" },
  vidisha: { lat: 23.5251, lon: 77.8081, state: "Madhya Pradesh" },
  hoshangabad: { lat: 22.7519, lon: 77.7289, state: "Madhya Pradesh" },
  narmadapuram: { lat: 22.7519, lon: 77.7289, state: "Madhya Pradesh" },
  dewas: { lat: 22.9676, lon: 76.0534, state: "Madhya Pradesh" },
  harda: { lat: 22.3444, lon: 77.0945, state: "Madhya Pradesh" },
  raisen: { lat: 23.3315, lon: 77.7818, state: "Madhya Pradesh" },
  rajgarh: { lat: 24.0064, lon: 76.7299, state: "Madhya Pradesh" },
  shajapur: { lat: 23.4285, lon: 76.2778, state: "Madhya Pradesh" },
  "agar malwa": { lat: 23.7144, lon: 76.0175, state: "Madhya Pradesh" },
  mandsaur: { lat: 24.0725, lon: 75.0683, state: "Madhya Pradesh" },
  neemuch: { lat: 24.4756, lon: 74.8722, state: "Madhya Pradesh" },
  ratlam: { lat: 23.3315, lon: 75.0367, state: "Madhya Pradesh" },
  dhar: { lat: 22.5978, lon: 75.3039, state: "Madhya Pradesh" },
  khargone: { lat: 21.8234, lon: 75.6186, state: "Madhya Pradesh" },
  barwani: { lat: 22.0366, lon: 74.9030, state: "Madhya Pradesh" },
  khandwa: { lat: 21.8314, lon: 76.3498, state: "Madhya Pradesh" },
  burhanpur: { lat: 21.3106, lon: 76.2298, state: "Madhya Pradesh" },
  jabalpur: { lat: 23.1815, lon: 79.9864, state: "Madhya Pradesh" },
  narsinghpur: { lat: 22.9463, lon: 79.1939, state: "Madhya Pradesh" },
  chhindwara: { lat: 22.0574, lon: 78.9382, state: "Madhya Pradesh" },

  // Maharashtra
  nashik: { lat: 19.9975, lon: 73.7898, state: "Maharashtra" },
  pune: { lat: 18.5204, lon: 73.8567, state: "Maharashtra" },
  nagpur: { lat: 21.1458, lon: 79.0882, state: "Maharashtra" },
  ahmednagar: { lat: 19.0952, lon: 74.7496, state: "Maharashtra" },
  jalgaon: { lat: 21.0077, lon: 75.5626, state: "Maharashtra" },
  satara: { lat: 17.6805, lon: 74.0183, state: "Maharashtra" },
  kolhapur: { lat: 16.7050, lon: 74.2433, state: "Maharashtra" },
  solapur: { lat: 17.6599, lon: 75.9064, state: "Maharashtra" },
  aurangabad: { lat: 19.8762, lon: 75.3433, state: "Maharashtra" },
  chhatrapati_sambhajinagar: { lat: 19.8762, lon: 75.3433, state: "Maharashtra" },
  amravati: { lat: 20.9320, lon: 77.7523, state: "Maharashtra" },
  akola: { lat: 20.7002, lon: 77.0082, state: "Maharashtra" },
  yavatmal: { lat: 20.3888, lon: 78.1204, state: "Maharashtra" },
  buldhana: { lat: 20.5293, lon: 76.1843, state: "Maharashtra" },
  wardha: { lat: 20.7453, lon: 78.6022, state: "Maharashtra" },
  latur: { lat: 18.4088, lon: 76.5604, state: "Maharashtra" },
  nanded: { lat: 19.1383, lon: 77.3210, state: "Maharashtra" },

  // Punjab
  ludhiana: { lat: 30.9010, lon: 75.8573, state: "Punjab" },
  patiala: { lat: 30.3398, lon: 76.3869, state: "Punjab" },
  jalandhar: { lat: 31.3260, lon: 75.5762, state: "Punjab" },
  bathinda: { lat: 30.2110, lon: 74.9455, state: "Punjab" },
  amritsar: { lat: 31.6340, lon: 74.8723, state: "Punjab" },
  sangrur: { lat: 30.2458, lon: 75.8421, state: "Punjab" },
  firozpur: { lat: 30.9237, lon: 74.6138, state: "Punjab" },
  moga: { lat: 30.8165, lon: 75.1717, state: "Punjab" },
  faridkot: { lat: 30.6769, lon: 74.7583, state: "Punjab" },
  muktsar: { lat: 30.4762, lon: 74.5168, state: "Punjab" },
  barnala: { lat: 30.3819, lon: 75.5468, state: "Punjab" },
  mansa: { lat: 29.9884, lon: 75.3934, state: "Punjab" },

  // Haryana
  karnal: { lat: 29.6857, lon: 76.9905, state: "Haryana" },
  hisar: { lat: 29.1492, lon: 75.7217, state: "Haryana" },
  ambala: { lat: 30.3782, lon: 76.7767, state: "Haryana" },
  kurukshetra: { lat: 29.9695, lon: 76.8783, state: "Haryana" },
  sirsa: { lat: 29.5349, lon: 75.0289, state: "Haryana" },
  rohtak: { lat: 28.8955, lon: 76.6066, state: "Haryana" },
  sonipat: { lat: 28.9931, lon: 77.0151, state: "Haryana" },
  fatehabad: { lat: 29.5147, lon: 75.4547, state: "Haryana" },
  panipat: { lat: 29.3909, lon: 76.9635, state: "Haryana" },

  // Rajasthan
  kota: { lat: 25.2138, lon: 75.8648, state: "Rajasthan" },
  jaipur: { lat: 26.9124, lon: 75.7873, state: "Rajasthan" },
  bharatpur: { lat: 27.2152, lon: 77.5030, state: "Rajasthan" },
  alwar: { lat: 27.5530, lon: 76.6346, state: "Rajasthan" },
  "sri ganganagar": { lat: 29.9038, lon: 73.8772, state: "Rajasthan" },
  barmer: { lat: 25.7532, lon: 71.4181, state: "Rajasthan" },
  bikaner: { lat: 28.0229, lon: 73.3119, state: "Rajasthan" },
  jodhpur: { lat: 26.2389, lon: 73.0243, state: "Rajasthan" },
  udaipur: { lat: 24.5854, lon: 73.7125, state: "Rajasthan" },
  bhilwara: { lat: 25.3407, lon: 74.6313, state: "Rajasthan" },
  bundi: { lat: 25.4414, lon: 75.6429, state: "Rajasthan" },
  baran: { lat: 25.1011, lon: 76.5132, state: "Rajasthan" },
  jhalawar: { lat: 24.5973, lon: 76.1610, state: "Rajasthan" },
  hanumangarh: { lat: 29.5819, lon: 74.3294, state: "Rajasthan" },

  // Gujarat
  rajkot: { lat: 22.3039, lon: 70.8022, state: "Gujarat" },
  surat: { lat: 21.1702, lon: 72.8311, state: "Gujarat" },
  ahmedabad: { lat: 23.0225, lon: 72.5714, state: "Gujarat" },
  junagadh: { lat: 21.5222, lon: 70.4579, state: "Gujarat" },
  vadodara: { lat: 22.3072, lon: 73.1812, state: "Gujarat" },
  bhavnagar: { lat: 21.7645, lon: 72.1519, state: "Gujarat" },
  amreli: { lat: 21.6032, lon: 71.2221, state: "Gujarat" },
  jamnagar: { lat: 22.4707, lon: 70.0577, state: "Gujarat" },
  morbi: { lat: 22.8173, lon: 70.8370, state: "Gujarat" },
  mehsana: { lat: 23.5880, lon: 72.3693, state: "Gujarat" },

  // Uttar Pradesh
  kanpur: { lat: 26.4499, lon: 80.3319, state: "Uttar Pradesh" },
  varanasi: { lat: 25.3176, lon: 82.9739, state: "Uttar Pradesh" },
  meerut: { lat: 28.9845, lon: 77.7064, state: "Uttar Pradesh" },
  agra: { lat: 27.1767, lon: 78.0081, state: "Uttar Pradesh" },
  prayagraj: { lat: 25.4358, lon: 81.8463, state: "Uttar Pradesh" },
  bareilly: { lat: 28.3670, lon: 79.4304, state: "Uttar Pradesh" },
  mathura: { lat: 27.4924, lon: 77.6737, state: "Uttar Pradesh" },
  aligarh: { lat: 27.8974, lon: 78.0880, state: "Uttar Pradesh" },
  gorakhpur: { lat: 26.7606, lon: 83.3732, state: "Uttar Pradesh" },
  jhansi: { lat: 25.4484, lon: 78.5685, state: "Uttar Pradesh" },
  ayodhya: { lat: 26.7922, lon: 82.1998, state: "Uttar Pradesh" },

  // Karnataka
  dharwad: { lat: 15.4589, lon: 75.0078, state: "Karnataka" },
  belagavi: { lat: 15.8497, lon: 74.4977, state: "Karnataka" },
  vijayapura: { lat: 16.8302, lon: 75.7100, state: "Karnataka" },
  mysuru: { lat: 12.2958, lon: 76.6394, state: "Karnataka" },
  haveri: { lat: 14.7954, lon: 75.3991, state: "Karnataka" },
  ballari: { lat: 15.1394, lon: 76.9214, state: "Karnataka" },
  shivamogga: { lat: 13.9299, lon: 75.5681, state: "Karnataka" },
  davangere: { lat: 14.4644, lon: 75.9218, state: "Karnataka" },

  // Andhra Pradesh & Telangana
  guntur: { lat: 16.3067, lon: 80.4365, state: "Andhra Pradesh" },
  kurnool: { lat: 15.8281, lon: 78.0373, state: "Andhra Pradesh" },
  anantapur: { lat: 14.6819, lon: 77.6006, state: "Andhra Pradesh" },
  krishna: { lat: 16.1875, lon: 81.1389, state: "Andhra Pradesh" },
  prakasam: { lat: 15.5057, lon: 80.0499, state: "Andhra Pradesh" },
  east_godavari: { lat: 16.9891, lon: 82.2475, state: "Andhra Pradesh" },
  west_godavari: { lat: 16.7107, lon: 81.0952, state: "Andhra Pradesh" },
  visakhapatnam: { lat: 17.6868, lon: 83.2185, state: "Andhra Pradesh" },
  warangal: { lat: 17.9689, lon: 79.5941, state: "Telangana" },
  nizamabad: { lat: 18.6725, lon: 78.0941, state: "Telangana" },
  karimnagar: { lat: 18.4386, lon: 79.1288, state: "Telangana" },
  khammam: { lat: 17.2473, lon: 80.1514, state: "Telangana" },
  nalgonda: { lat: 17.0577, lon: 79.2684, state: "Telangana" },
  mahabubnagar: { lat: 16.7488, lon: 77.9942, state: "Telangana" },

  // Kerala
  idukki: { lat: 9.9189, lon: 77.1025, state: "Kerala" },
  wayanad: { lat: 11.6854, lon: 76.1320, state: "Kerala" },
  palakkad: { lat: 10.7867, lon: 76.6548, state: "Kerala" },
  thiruvananthapuram: { lat: 8.5241, lon: 76.9366, state: "Kerala" },
  ernakulam: { lat: 9.9816, lon: 76.2999, state: "Kerala" },
  kottayam: { lat: 9.5916, lon: 76.5222, state: "Kerala" },
  alappuzha: { lat: 9.4981, lon: 76.3388, state: "Kerala" },
  thrissur: { lat: 10.5276, lon: 76.2144, state: "Kerala" },

  // Tamil Nadu
  coimbatore: { lat: 11.0168, lon: 76.9558, state: "Tamil Nadu" },
  thanjavur: { lat: 10.7870, lon: 79.1378, state: "Tamil Nadu" },
  madurai: { lat: 9.9252, lon: 78.1198, state: "Tamil Nadu" },
  salem: { lat: 11.6643, lon: 78.1460, state: "Tamil Nadu" },
  tiruchirappalli: { lat: 10.7905, lon: 78.7047, state: "Tamil Nadu" },
  tirunelveli: { lat: 8.7139, lon: 77.7567, state: "Tamil Nadu" },
  erode: { lat: 11.3410, lon: 77.7172, state: "Tamil Nadu" },

  // West Bengal & Bihar
  burdwan: { lat: 23.2324, lon: 87.8615, state: "West Bengal" },
  purba_bardhaman: { lat: 23.2324, lon: 87.8615, state: "West Bengal" },
  hooghly: { lat: 22.9030, lon: 88.3968, state: "West Bengal" },
  murshidabad: { lat: 24.1759, lon: 88.2802, state: "West Bengal" },
  darjeeling: { lat: 27.0410, lon: 88.2663, state: "West Bengal" },
  malda: { lat: 25.0108, lon: 88.1411, state: "West Bengal" },
  patna: { lat: 25.5941, lon: 85.1376, state: "Bihar" },
  muzaffarpur: { lat: 26.1209, lon: 85.3647, state: "Bihar" },
  gaya: { lat: 24.7914, lon: 85.0002, state: "Bihar" },
  bhagalpur: { lat: 25.2425, lon: 86.9842, state: "Bihar" },
  purnia: { lat: 25.7771, lon: 87.4753, state: "Bihar" },

  // Odisha & Assam
  sambalpur: { lat: 21.4669, lon: 83.9812, state: "Odisha" },
  bhubaneswar: { lat: 20.2961, lon: 85.8245, state: "Odisha" },
  cuttack: { lat: 20.4625, lon: 85.8828, state: "Odisha" },
  balasore: { lat: 21.4934, lon: 86.9135, state: "Odisha" },
  ganjam: { lat: 19.3820, lon: 85.0600, state: "Odisha" },
  kamrup: { lat: 26.1158, lon: 91.7086, state: "Assam" },
  guwahati: { lat: 26.1445, lon: 91.7362, state: "Assam" },
  jorhat: { lat: 26.7509, lon: 94.2037, state: "Assam" },
  dibrugarh: { lat: 27.4728, lon: 94.9120, state: "Assam" },

  // Hill States: Himachal Pradesh, Jammu & Kashmir, Uttarakhand
  shimla: { lat: 31.1048, lon: 77.1734, state: "Himachal Pradesh" },
  kullu: { lat: 31.9579, lon: 77.1095, state: "Himachal Pradesh" },
  kangra: { lat: 32.0998, lon: 76.2691, state: "Himachal Pradesh" },
  mandi: { lat: 31.7087, lon: 76.9320, state: "Himachal Pradesh" },
  solan: { lat: 30.9045, lon: 77.0967, state: "Himachal Pradesh" },
  srinagar: { lat: 34.0837, lon: 74.7973, state: "Jammu & Kashmir" },
  jammu: { lat: 32.7266, lon: 74.8570, state: "Jammu & Kashmir" },
  anantnag: { lat: 33.7311, lon: 75.1487, state: "Jammu & Kashmir" },
  baramulla: { lat: 34.2064, lon: 74.3436, state: "Jammu & Kashmir" },
  dehradun: { lat: 30.3165, lon: 78.0322, state: "Uttarakhand" },
  haridwar: { lat: 29.9457, lon: 78.1642, state: "Uttarakhand" },
  nainital: { lat: 29.3919, lon: 79.4542, state: "Uttarakhand" },
  udham_singh_nagar: { lat: 28.9800, lon: 79.4000, state: "Uttarakhand" },

  // Jharkhand & Chhattisgarh
  ranchi: { lat: 23.3441, lon: 85.3096, state: "Jharkhand" },
  jamshedpur: { lat: 22.8046, lon: 86.2029, state: "Jharkhand" },
  dhanbad: { lat: 23.7957, lon: 86.4304, state: "Jharkhand" },
  raipur: { lat: 21.2514, lon: 81.6296, state: "Chhattisgarh" },
  durg: { lat: 21.1904, lon: 81.2849, state: "Chhattisgarh" },
  bilaspur: { lat: 22.0797, lon: 82.1391, state: "Chhattisgarh" },
  rajnandgaon: { lat: 21.0974, lon: 81.0354, state: "Chhattisgarh" },
};

/**
 * Resolve center coordinates for a given district name
 */
export function getDistrictCoordinates(districtName: string, stateName?: string): { lat: number; lon: number } {
  if (!districtName) return { lat: 23.2030, lon: 77.0840 }; // Sehore default
  const clean = districtName.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "_");
  
  if (DISTRICT_COORDINATES[clean]) {
    return { lat: DISTRICT_COORDINATES[clean].lat, lon: DISTRICT_COORDINATES[clean].lon };
  }

  // Substring match
  for (const [key, val] of Object.entries(DISTRICT_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { lat: val.lat, lon: val.lon };
    }
  }

  // Fallbacks by state across India
  if (stateName) {
    const s = stateName.toLowerCase();
    if (s.includes("maharashtra")) return { lat: 19.9975, lon: 73.7898 };
    if (s.includes("punjab")) return { lat: 30.9010, lon: 75.8573 };
    if (s.includes("haryana")) return { lat: 29.6857, lon: 76.9905 };
    if (s.includes("rajasthan")) return { lat: 25.2138, lon: 75.8648 };
    if (s.includes("gujarat")) return { lat: 22.3039, lon: 70.8022 };
    if (s.includes("uttar pradesh")) return { lat: 26.4499, lon: 80.3319 };
    if (s.includes("karnataka")) return { lat: 15.4589, lon: 75.0078 };
    if (s.includes("andhra")) return { lat: 16.3067, lon: 80.4365 };
    if (s.includes("telangana")) return { lat: 17.9689, lon: 79.5941 };
    if (s.includes("kerala")) return { lat: 9.9189, lon: 76.9558 };
    if (s.includes("tamil nadu")) return { lat: 11.0168, lon: 76.9558 };
    if (s.includes("west bengal")) return { lat: 23.2324, lon: 87.8615 };
    if (s.includes("bihar")) return { lat: 25.5941, lon: 85.1376 };
    if (s.includes("odisha")) return { lat: 20.2961, lon: 85.8245 };
    if (s.includes("assam")) return { lat: 26.1445, lon: 91.7362 };
    if (s.includes("himachal")) return { lat: 31.1048, lon: 77.1734 };
    if (s.includes("jammu") || s.includes("kashmir")) return { lat: 34.0837, lon: 74.7973 };
    if (s.includes("uttarakhand")) return { lat: 30.3165, lon: 78.0322 };
    if (s.includes("jharkhand")) return { lat: 23.3441, lon: 85.3096 };
    if (s.includes("chhattisgarh")) return { lat: 21.2514, lon: 81.6296 };
    if (s.includes("goa")) return { lat: 15.2993, lon: 74.1240 };
    if (s.includes("sikkim")) return { lat: 27.3389, lon: 88.6065 };
    if (s.includes("tripura")) return { lat: 23.8315, lon: 91.2868 };
    if (s.includes("meghalaya")) return { lat: 25.5788, lon: 91.8933 };
    if (s.includes("manipur")) return { lat: 24.8170, lon: 93.9368 };
    if (s.includes("nagaland")) return { lat: 25.6751, lon: 94.1086 };
    if (s.includes("mizoram")) return { lat: 23.7271, lon: 92.7176 };
    if (s.includes("arunachal")) return { lat: 27.0844, lon: 93.6053 };
    if (s.includes("delhi")) return { lat: 28.7041, lon: 77.1025 };
  }

  return { lat: 23.2030, lon: 77.0840 }; // MP default
}
