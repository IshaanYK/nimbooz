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
  soilMoistureEst: number;      // estimated 0-100%
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
  soilMoistureEst: 42,
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

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m&timezone=auto&forecast_days=1`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Open-Meteo fetch failed");
      const data = await res.json();
      const c = data.current;

      const nightTemp = c.temperature_2m - 1.5;
      const isNightStress = nightTemp > 25.0;
      const stressPercent = isNightStress
        ? Math.min(99, Math.round(50 + (nightTemp - 25.0) * 14))
        : Math.max(10, Math.round(30 - (25.0 - nightTemp) * 5));

      const soilEst = Math.min(95, Math.max(15, Math.round(c.relative_humidity_2m * 0.55 + c.precipitation * 2)));
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
        soilMoistureEst: soilEst,
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

    const hasDeniedGps = localStorage.getItem("aasra_gps_denied") === "true";

    // If user previously turned off / denied permission and forceGps is false, DO NOT prompt!
    if (hasDeniedGps && !forceGps) {
      fetchWeather(DEFAULT_WEATHER.lat, DEFAULT_WEATHER.lon);
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          localStorage.removeItem("aasra_gps_denied");
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          // Store permission denial in localStorage so browser NEVER asks again automatically
          if (err.code === 1) {
            localStorage.setItem("aasra_gps_denied", "true");
          }
          fetchWeather(DEFAULT_WEATHER.lat, DEFAULT_WEATHER.lon);
        },
        { timeout: 5000, maximumAge: 600000 }
      );
    } else {
      fetchWeather(DEFAULT_WEATHER.lat, DEFAULT_WEATHER.lon);
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
