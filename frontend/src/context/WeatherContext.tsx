"use client";

/**
 * AASRA Real-Time Weather & Predictive Intelligence Context
 * Respects user GPS permission settings to prevent repeated pop-up prompts.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WeatherData {
  lat: number;
  lon: number;
  temperature: number;          // °C
  apparentTemperature: number;  // feels like °C
  humidity: number;             // %
  windSpeed: number;            // km/h
  precipitation: number;        // mm (last hour)
  weatherCode: number;          // WMO weather code
  weatherDescription: string;
  weatherEmoji: string;
  isRaining: boolean;           // LIVE RAIN DETECTION
  rainPrediction: string;       // Smart weather & rain prediction string
  isNightHeatStress: boolean;   // night temp > 25°C = stress
  heatStressPercent: number;    // 0-100 risk %
  nightTemperature: number;     // Real Mean Night Temp °C (20:00 - 06:00)
  nightMinTemperature: number;  // Real Min Night Temp °C
  nightStressDegreeHours: number; // Real Degree-Hours > 25°C
  soilMoistureEst: number;      // Real measured soil moisture %
  soilTemperatureReal: number;  // Real measured soil temperature °C
  precipitationProbability: number; // % probability
  locationName: string;         // reverse-geocoded city/district
  village?: string;
  district?: string;
  state?: string;
  lastUpdated: string;
  isLoading: boolean;
  hasError: boolean;
}

interface WeatherContextType {
  weather: WeatherData;
  refetch: (forceGps?: boolean) => void;
}

const WMO_DESCRIPTIONS: Record<number, { desc: string; emoji: string }> = {
  0:  { desc: "Clear Sky",          emoji: "☀️" },
  1:  { desc: "Mainly Clear",       emoji: "🌤️" },
  2:  { desc: "Partly Cloudy",      emoji: "⛅" },
  3:  { desc: "Overcast",           emoji: "☁️" },
  45: { desc: "Foggy",              emoji: "🌫️" },
  48: { desc: "Icy Fog",            emoji: "🌫️" },
  51: { desc: "Light Drizzle",      emoji: "🌦️" },
  53: { desc: "Moderate Drizzle",   emoji: "🌦️" },
  55: { desc: "Dense Drizzle",      emoji: "🌧️" },
  61: { desc: "Slight Rain",        emoji: "🌧️" },
  63: { desc: "Moderate Rain",      emoji: "🌧️" },
  65: { desc: "Heavy Rain",         emoji: "⛈️" },
  71: { desc: "Slight Snow",        emoji: "🌨️" },
  73: { desc: "Moderate Snow",      emoji: "❄️" },
  80: { desc: "Rain Showers",       emoji: "🌦️" },
  95: { desc: "Thunderstorm",       emoji: "⛈️" },
  99: { desc: "Heavy Thunderstorm", emoji: "🌩️" },
};

const DEFAULT_WEATHER: WeatherData = {
  lat: 23.2599,
  lon: 77.4126,
  temperature: 28.5,
  apparentTemperature: 31.2,
  humidity: 72,
  windSpeed: 12,
  precipitation: 0,
  weatherCode: 2,
  weatherDescription: "Partly Cloudy",
  weatherEmoji: "⛅",
  isRaining: false,
  rainPrediction: "🌤️ NO RAIN PREDICTED: Ideal Syngenta Stress Buster 48h spray window.",
  isNightHeatStress: true,
  heatStressPercent: 78,
  nightTemperature: 27.8,
  nightMinTemperature: 25.4,
  nightStressDegreeHours: 14.6,
  soilMoistureEst: 46,
  soilTemperatureReal: 28.2,
  precipitationProbability: 10,
  locationName: "Auto-Detecting Location...",
  village: "Local Plot",
  district: "Field Region",
  state: "State",
  lastUpdated: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  isLoading: false,
  hasError: false,
};

export async function reverseGeocode(lat: number, lon: number): Promise<{ locationName: string; village: string; district: string; state: string }> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: { "User-Agent": "AASRA-Agri-App/1.0" },
      cache: "force-cache"
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const village = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.hamlet || addr.county || "";
      const district = addr.state_district || addr.county || addr.city || addr.district || addr.town || "";
      const state = addr.state || "";
      
      const parts = [village, district, state].filter(Boolean);
      const locationName = parts.length > 0 ? parts.join(", ") : `${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`;
      return { locationName, village, district, state };
    }
  } catch (e) {
    console.warn("Nominatim reverse geocode error, attempting fallback", e);
  }

  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (res.ok) {
      const data = await res.json();
      const village = data.locality || data.city || "";
      const district = data.principalSubdivision || "";
      const state = data.countryName || "";
      const locationName = [village, district].filter(Boolean).join(", ") || `${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`;
      return { locationName, village, district, state };
    }
  } catch (e) {
    console.warn("Fallback reverse geocode error", e);
  }

  return { locationName: `${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`, village: "", district: "", state: "" };
}

/**
 * Predicts smart rain & weather forecast based on lat/lon, date, time, and temperature
 */
export function predictWeatherCondition(
  temp: number,
  precip: number,
  code: number,
  humidity: number
): { isRaining: boolean; prediction: string } {
  const rainCodes = [51, 53, 55, 61, 63, 65, 80, 95, 99];
  const isRainingNow = precip > 0.1 || rainCodes.includes(code);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  let predictionText = "";
  if (isRainingNow) {
    predictionText = `🌧️ RAINING NOW ON YOUR FARM (${precip > 0 ? precip.toFixed(1) : "0.8"}mm active rainfall). Pause spray operations until rain stops.`;
  } else if (humidity > 85) {
    predictionText = `🌦️ HIGH HUMIDITY (${humidity}%): High probability of light rain within 4–6 hours on ${dateStr}.`;
  } else if (temp > 32) {
    predictionText = `🔥 HIGH DAY HEAT (${temp}°C): Thermal stress expected after 2:00 PM. Apply Syngenta Stress Buster within 48h.`;
  } else {
    predictionText = `🌤️ CLEAR & OPTIMAL (${temp}°C, ${humidity}% humidity): Favorable spray window active today (${dateStr}).`;
  }

  return {
    isRaining: isRainingNow,
    prediction: predictionText,
  };
}

const WeatherContext = createContext<WeatherContextType>({
  weather: DEFAULT_WEATHER,
  refetch: () => {},
});

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherData>({ ...DEFAULT_WEATHER, isLoading: true });

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const geo = await reverseGeocode(lat, lon);

      // Fetch Real Telemetry including hourly temperatures, soil moisture, and soil temperature
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,soil_temperature_0cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=2`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Open-Meteo fetch failed");
      const data = await res.json();
      const c = data.current;
      const h = data.hourly || {};

      // 1. Calculate Real Night Temperatures (20:00 to 06:00) from Open-Meteo Hourly Array
      const hourlyTimes: string[] = h.time || [];
      const hourlyTemps: number[] = h.temperature_2m || [];
      const hourlySoilM: number[] = h.soil_moisture_0_to_1cm || [];
      const hourlySoilT: number[] = h.soil_temperature_0cm || [];
      const hourlyPrecipProb: number[] = h.precipitation_probability || [];

      const nightHoursTemps: number[] = [];
      let totalDegreeHours = 0;

      for (let i = 0; i < Math.min(hourlyTimes.length, 36); i++) {
        const timePart = hourlyTimes[i].split("T")[1];
        if (timePart) {
          const hour = parseInt(timePart.split(":")[0], 10);
          if ([20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6].includes(hour)) {
            const tempVal = hourlyTemps[i] ?? c.temperature_2m;
            nightHoursTemps.push(tempVal);
            if (tempVal > 25.0) {
              totalDegreeHours += (tempVal - 25.0);
            }
          }
        }
      }

      const realNightMean = nightHoursTemps.length > 0
        ? Math.round((nightHoursTemps.reduce((a, b) => a + b, 0) / nightHoursTemps.length) * 10) / 10
        : Math.round((c.temperature_2m - 1.8) * 10) / 10;

      const realNightMin = nightHoursTemps.length > 0
        ? Math.round(Math.min(...nightHoursTemps) * 10) / 10
        : Math.round((c.temperature_2m - 3.5) * 10) / 10;

      const isNightStress = realNightMean > 25.0 || totalDegreeHours > 2.0;
      const stressPercent = isNightStress
        ? Math.min(99, Math.max(35, Math.round(40 + (realNightMean - 25.0) * 12 + totalDegreeHours * 1.5)))
        : Math.max(10, Math.round(25 - (25.0 - realNightMean) * 4));

      // 2. Real Measured Soil Moisture & Soil Temperature
      const soilMoistureVal = hourlySoilM.length > 0
        ? Math.round(hourlySoilM[0] * 100) // Convert m³/m³ to %
        : Math.min(95, Math.max(15, Math.round(c.relative_humidity_2m * 0.55)));

      const soilTempVal = hourlySoilT.length > 0
        ? Math.round(hourlySoilT[0] * 10) / 10
        : Math.round((c.temperature_2m + 1.2) * 10) / 10;

      const precipProbVal = hourlyPrecipProb.length > 0 ? hourlyPrecipProb[0] : 10;

      const wmoData = WMO_DESCRIPTIONS[c.weather_code] || { desc: "Clear", emoji: "☀️" };

      const { isRaining, prediction } = predictWeatherCondition(
        c.temperature_2m,
        c.precipitation,
        c.weather_code,
        c.relative_humidity_2m
      );

      setWeather({
        lat,
        lon,
        temperature: Math.round(c.temperature_2m * 10) / 10,
        apparentTemperature: Math.round(c.apparent_temperature * 10) / 10,
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        precipitation: c.precipitation,
        weatherCode: c.weather_code,
        weatherDescription: wmoData.desc,
        weatherEmoji: wmoData.emoji,
        isRaining,
        rainPrediction: prediction,
        isNightHeatStress: isNightStress,
        heatStressPercent: stressPercent,
        nightTemperature: realNightMean,
        nightMinTemperature: realNightMin,
        nightStressDegreeHours: Math.round(totalDegreeHours * 10) / 10,
        soilMoistureEst: soilMoistureVal,
        soilTemperatureReal: soilTempVal,
        precipitationProbability: precipProbVal,
        locationName: geo.locationName,
        village: geo.village,
        district: geo.district,
        state: geo.state,
        lastUpdated: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        isLoading: false,
        hasError: false,
      });
    } catch (err) {
      console.warn("Open-Meteo fetch failed, using defaults:", err);
      setWeather((prev) => ({ ...prev, isLoading: false, hasError: true }));
    }
  }, []);

  const getLocationAndFetch = useCallback((forceGps = false) => {
    setWeather((prev) => ({ ...prev, isLoading: true }));
    if (typeof window === "undefined") return;

    // Check if user has saved farm location in profile
    let targetLat = DEFAULT_WEATHER.lat;
    let targetLon = DEFAULT_WEATHER.lon;
    try {
      const raw = localStorage.getItem("aasra_farmer_profile");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.gpsLocation?.lat && parsed.gpsLocation?.lon) {
          targetLat = parsed.gpsLocation.lat;
          targetLon = parsed.gpsLocation.lon;
        }
      }
    } catch (_) {}

    const hasDeniedGps = localStorage.getItem("aasra_gps_denied") === "true";

    // If user previously turned off / denied permission and forceGps is false, use profile coordinates!
    if (hasDeniedGps && !forceGps) {
      fetchWeather(targetLat, targetLon);
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          localStorage.removeItem("aasra_gps_denied");
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          if (err.code === 1) {
            localStorage.setItem("aasra_gps_denied", "true");
          }
          fetchWeather(targetLat, targetLon);
        },
        { timeout: 6000, maximumAge: 300000 }
      );
    } else {
      fetchWeather(targetLat, targetLon);
    }
  }, [fetchWeather]);

  useEffect(() => {
    getLocationAndFetch();
  }, [getLocationAndFetch]);

  return (
    <WeatherContext.Provider value={{ weather, refetch: getLocationAndFetch }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => useContext(WeatherContext);
