/**
 * AASRA Agricultural Database Bot Client (Node.js)
 * ------------------------------------------------
 * Connects to the AASRA production database for bot automations.
 *
 * Usage:
 *   node bot_client.js
 */

const fs = require("fs");
const path = require("path");

let config = {
  api_base_url: "https://frontend-phi-flame-21.vercel.app",
  database_api_key: "aasra-bot-access-2026",
  endpoints: {
    database: "/api/database",
    farmers: "/api/farmers",
    mandi: "/api/mandi/rates",
    weather: "/api/weather/current"
  }
};

try {
  const cfgPath = path.join(__dirname, "config.json");
  if (fs.existsSync(cfgPath)) {
    config = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
  }
} catch (e) {}

const BASE_URL = config.api_base_url || "https://frontend-phi-flame-21.vercel.app";
const API_KEY = config.database_api_key || "aasra-bot-access-2026";

class AasraBotDatabase {
  constructor(baseUrl = BASE_URL, apiKey = API_KEY) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.headers = {
      "Content-Type": "application/json",
      "X-API-KEY": this.apiKey,
      "User-Agent": "AasraBotClient-Node/1.0"
    };
  }

  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...(options.headers || {}) }
    });
    return await res.json();
  }

  async getDatabase() {
    return this._fetch(config.endpoints?.database || "/api/database");
  }

  async getAllFarmers() {
    const res = await this._fetch(config.endpoints?.farmers || "/api/farmers");
    return res.farmers || [];
  }

  async getFarmerById(id) {
    return this._fetch(`${config.endpoints?.farmers || "/api/farmers"}?id=${encodeURIComponent(id)}`);
  }

  async saveFarmer(farmerData) {
    return this._fetch(config.endpoints?.farmers || "/api/farmers", {
      method: "POST",
      body: JSON.stringify(farmerData)
    });
  }

  async getMandiRates() {
    return this._fetch(config.endpoints?.mandi || "/api/mandi/rates");
  }

  async getWeather(lat = 23.2599, lon = 77.4126) {
    return this._fetch(`${config.endpoints?.weather || "/api/weather/current"}?lat=${lat}&lon=${lon}`);
  }
}

// Runnable demonstration
if (require.main === module) {
  (async () => {
    console.log("[*] AASRA Node.js Database Bot Client -- Testing Connection...");
    const client = new AasraBotDatabase();
    console.log(`Connecting to: ${client.baseUrl}`);
    console.log(`API Key: ${client.apiKey}`);
    console.log("-".repeat(50));

    try {
      const db = await client.getDatabase();
      console.log("[+] Connected successfully!");
      console.log(`    - Database Version: ${db?.stats ? "Live" : "Connected"}`);

      const farmerData = await client.getFarmerById("farmer-001");
      if (farmerData?.farmer) {
        const f = farmerData.farmer;
        console.log(`[*] Sample Farmer: ${f.fullName} (${f.mobileNumber}) - ${f.village}, ${f.district}`);
      }
      console.log("-".repeat(50));
      console.log("[+] Ready! You can require('./bot_client') inside your bot script.");
    } catch (err) {
      console.error("[-] Connection failed:", err.message);
    }
  })();
}

module.exports = { AasraBotDatabase };
