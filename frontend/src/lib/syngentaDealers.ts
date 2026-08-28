/**
 * Syngenta Authorized Dealers & Agro-Retailers Directory
 * Connects farmers directly with nearby authorized Syngenta input dealers.
 */

export interface SyngentaDealer {
  id: string;
  name: string;
  proprietor: string;
  phone: string;
  whatsapp: string;
  district: string;
  state: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  isVerifiedSyngentaPartner: boolean;
  stockStatus: {
    quantis: boolean;
    isabion: boolean;
    stressBuster: boolean;
    score: boolean;
    ampligo: boolean;
  };
  deliveryAvailable: boolean;
  timings: string;
}

export const SYNGENTA_DISTRICT_DEALERS: Record<string, SyngentaDealer[]> = {
  Bhopal: [
    {
      id: "bpl-01",
      name: "Kisan Agro Seva Kendra",
      proprietor: "Mukesh Sharma",
      phone: "+919826012345",
      whatsapp: "919826012345",
      district: "Bhopal",
      state: "Madhya Pradesh",
      address: "Shop No. 14, Krishi Upaj Mandi, Karond, Bhopal, MP 462038",
      distanceKm: 3.2,
      rating: 4.8,
      reviewCount: 142,
      isVerifiedSyngentaPartner: true,
      stockStatus: {
        quantis: true,
        isabion: true,
        stressBuster: true,
        score: true,
        ampligo: true,
      },
      deliveryAvailable: true,
      timings: "8:00 AM - 8:00 PM",
    },
    {
      id: "bpl-02",
      name: "Patel Krishi Kendra & Pesticides",
      proprietor: "Rameshwar Patel",
      phone: "+919893045678",
      whatsapp: "919893045678",
      district: "Bhopal",
      state: "Madhya Pradesh",
      address: "Main Road, Fanda Kalan, Near Gram Panchayat, Bhopal, MP 462030",
      distanceKm: 1.8,
      rating: 4.9,
      reviewCount: 98,
      isVerifiedSyngentaPartner: true,
      stockStatus: {
        quantis: true,
        isabion: true,
        stressBuster: true,
        score: false,
        ampligo: true,
      },
      deliveryAvailable: true,
      timings: "7:30 AM - 8:30 PM",
    },
    {
      id: "bpl-03",
      name: "Jai Kisan Agro Inputs & Chemicals",
      proprietor: "Sunil Verma",
      phone: "+919755098765",
      whatsapp: "919755098765",
      district: "Bhopal",
      state: "Madhya Pradesh",
      address: "Opposite Cooperative Bank, Berasia Road, Bhopal, MP 462018",
      distanceKm: 5.4,
      rating: 4.7,
      reviewCount: 86,
      isVerifiedSyngentaPartner: true,
      stockStatus: {
        quantis: true,
        isabion: true,
        stressBuster: true,
        score: true,
        ampligo: false,
      },
      deliveryAvailable: false,
      timings: "9:00 AM - 7:30 PM",
    },
  ],
  Indore: [
    {
      id: "ind-01",
      name: "Malwa Krishi Seva Sadan",
      proprietor: "Rajesh Choudhary",
      phone: "+919827011223",
      whatsapp: "919827011223",
      district: "Indore",
      state: "Madhya Pradesh",
      address: "Laxmi Bai Nagar Mandi, Gate No. 2, Indore, MP 452006",
      distanceKm: 4.1,
      rating: 4.9,
      reviewCount: 210,
      isVerifiedSyngentaPartner: true,
      stockStatus: {
        quantis: true,
        isabion: true,
        stressBuster: true,
        score: true,
        ampligo: true,
      },
      deliveryAvailable: true,
      timings: "8:00 AM - 8:00 PM",
    },
    {
      id: "ind-02",
      name: "Shri Ram Agro Agency",
      proprietor: "Anand Patidar",
      phone: "+919425088776",
      whatsapp: "919425088776",
      district: "Indore",
      state: "Madhya Pradesh",
      address: "Sanwer Main Road, Near Bus Stand, Indore, MP 453551",
      distanceKm: 6.8,
      rating: 4.6,
      reviewCount: 74,
      isVerifiedSyngentaPartner: true,
      stockStatus: {
        quantis: true,
        isabion: true,
        stressBuster: true,
        score: true,
        ampligo: true,
      },
      deliveryAvailable: true,
      timings: "8:30 AM - 7:30 PM",
    },
  ],
  Sehore: [
    {
      id: "seh-01",
      name: "Chambal Kisan Kendra",
      proprietor: "Devendra Singh Rajput",
      phone: "+919826543210",
      whatsapp: "919826543210",
      district: "Sehore",
      state: "Madhya Pradesh",
      address: "Mandi Yard, Ashta Road, Sehore, MP 466001",
      distanceKm: 2.9,
      rating: 4.8,
      reviewCount: 115,
      isVerifiedSyngentaPartner: true,
      stockStatus: {
        quantis: true,
        isabion: true,
        stressBuster: true,
        score: true,
        ampligo: true,
      },
      deliveryAvailable: true,
      timings: "8:00 AM - 8:00 PM",
    },
  ],
  Ujjain: [
    {
      id: "ujj-01",
      name: "Mahakal Agro Center",
      proprietor: "Gopal Sharma",
      phone: "+919826077889",
      whatsapp: "919826077889",
      district: "Ujjain",
      state: "Madhya Pradesh",
      address: "Chimanganj Mandi, Ujjain, MP 456006",
      distanceKm: 3.5,
      rating: 4.8,
      reviewCount: 130,
      isVerifiedSyngentaPartner: true,
      stockStatus: {
        quantis: true,
        isabion: true,
        stressBuster: true,
        score: true,
        ampligo: true,
      },
      deliveryAvailable: true,
      timings: "8:00 AM - 8:00 PM",
    },
  ],
};

export const SYNGENTA_HELPLINE = {
  tollFree: "1800-102-7964",
  timing: "Monday to Saturday, 9:00 AM - 6:00 PM",
  whatsappBot: "919826012345",
  website: "https://www.syngenta.co.in",
};

/**
 * Get nearby Syngenta dealers for a given district or fallback to default
 */
export function getNearbySyngentaDealers(district: string = "Bhopal"): SyngentaDealer[] {
  const match = Object.keys(SYNGENTA_DISTRICT_DEALERS).find(
    (k) => k.toLowerCase() === district.trim().toLowerCase()
  );
  if (match && SYNGENTA_DISTRICT_DEALERS[match]) {
    return SYNGENTA_DISTRICT_DEALERS[match];
  }
  return SYNGENTA_DISTRICT_DEALERS["Bhopal"];
}

/**
 * Generate a prefilled WhatsApp inquiry link for a farmer
 */
export function generateWhatsAppOrderLink(
  dealer: SyngentaDealer,
  farmerName: string = "Ramesh Patel",
  crop: string = "Soybean",
  acres: number = 12.5,
  productName: string = "Syngenta Quantis / Stress Buster"
): string {
  const liters = Math.round((250 * acres) / 100) / 10;
  const message = `नमस्ते ${dealer.proprietor} जी,\nमेरा नाम ${farmerName} है। मुझे मेरी ${acres} एकड़ ${crop} फसल के लिए ${productName} (${liters} लीटर) की आवश्यकता है।\nकृपया उपलब्धता और आज का भाव बताएं।\nधन्यवाद!`;
  return `https://wa.me/${dealer.whatsapp}?text=${encodeURIComponent(message)}`;
}
