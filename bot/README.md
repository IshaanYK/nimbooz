# 🤖 AASRA Bot Database Integration Guide

This package provides complete, ready-to-use bot clients in **Python** and **Node.js** to query and update the AASRA Agricultural Database directly from your bot (Telegram, Discord, WhatsApp, Slack, etc.).

---

## ⚡ Quick Start

### 1. Configuration (`config.json`)
The bot client automatically connects to the live production database using the settings in `config.json`:
```json
{
  "api_base_url": "https://frontend-phi-flame-21.vercel.app",
  "database_api_key": "aasra-bot-access-2026",
  "endpoints": {
    "database": "/api/database",
    "farmers": "/api/farmers",
    "mandi": "/api/mandi/rates",
    "weather": "/api/weather/current"
  }
}
```

---

## 🐍 Python Usage

### Run Test Connection:
```bash
python bot/bot_client.py
```

### Use Inside Your Bot Script:
```python
from bot.bot_client import AasraBotDatabase

# Initialize client
bot_db = AasraBotDatabase()

# 1. Get complete database snapshot
data = bot_db.get_database()
print("Farmers count:", len(data["data"]["farmers"]))

# 2. Look up a farmer by ID or mobile number
farmer = bot_db.get_farmer_by_id("farmer-001")
print("Farmer details:", farmer["farmer"])

# 3. Register or update a farmer from bot chat
new_farmer = bot_db.save_farmer(
    full_name="Rajesh Patel",
    mobile_number="9823011223",
    state="Madhya Pradesh",
    district="Indore",
    primaryCrop="Soybean"
)

# 4. Get live APMC Mandi commodity rates
mandi = bot_db.get_mandi_prices()

# 5. Get real-time weather & spray safety
weather = bot_db.get_weather(lat=23.2599, lon=77.4126)
```

---

## 🟢 Node.js / JavaScript Usage

### Run Test Connection:
```bash
node bot/bot_client.js
```

### Use Inside Your Bot Script:
```javascript
const { AasraBotDatabase } = require("./bot/bot_client");

const botDb = new AasraBotDatabase();

async function handleBotMessage(userId, userText) {
  // Query farmer info
  const result = await botDb.getFarmerById("farmer-001");
  console.log("Farmer:", result.farmer);

  // Get live mandi prices
  const mandi = await botDb.getMandiRates();
  return `Live Mandi rate for Soybean: ₹${mandi.prices?.Soybean || "4,850"}/q`;
}
```

---

## 🌐 Direct REST API Endpoints

If you are using another programming language (Go, Rust, cURL, etc.), you can call these endpoints directly:

| HTTP Method | Endpoint | Description |
|---|---|---|
| `GET` | `https://frontend-phi-flame-21.vercel.app/api/database` | Full database snapshot |
| `GET` | `https://frontend-phi-flame-21.vercel.app/api/farmers` | List all farmers |
| `GET` | `https://frontend-phi-flame-21.vercel.app/api/farmers?id=farmer-001` | Query farmer by ID / Phone |
| `POST` | `https://frontend-phi-flame-21.vercel.app/api/farmers` | Save / update farmer profile |
| `GET` | `https://frontend-phi-flame-21.vercel.app/api/mandi/rates` | Live APMC Mandi market rates |
| `GET` | `https://frontend-phi-flame-21.vercel.app/api/weather/current` | Real-time weather telemetry |

**Headers:**
```http
Content-Type: application/json
X-API-KEY: aasra-bot-access-2026
```
*(CORS is enabled: `Access-Control-Allow-Origin: *`)*
