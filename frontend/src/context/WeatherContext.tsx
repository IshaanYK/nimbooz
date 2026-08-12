"use client";

/**
 * AASRA Real-Time Weather Context
 * Uses browser Geolocation API + Open-Meteo (free, no API key) for live weather.
 * Provides temperature, humidity, wind, rain, weather code to all PS-04 & PS-07 components.
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
  isNightHeatStress: boolean;   // night temp > 25°C = stress
  heatStressPercent: number;    // 0-100 risk %
  soilMoistureEst: number;      // estimated 0-100%
  locationName: string;         // reverse-geocoded city
  lastUpdated: string;
  isLoading: boolean;
  hasError: boolean;
}

interface WeatherContextType {
  weather: WeatherData;
  refetch: () => void;
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
  isNightHeatStress: true,
  heatStressPercent: 78,
  soilMoistureEst: 42,
  locationName: "Bhopal, MP",
  lastUpdated: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  isLoading: false,
  hasError: false,
};

const WeatherContext = createContext<WeatherContextType>({
  weather: DEFAULT_WEATHER,
  refetch: () => {},
});

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherData>({ ...DEFAULT_WEATHER, isLoading: true });

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      // Open-Meteo free API — no key needed, globally available
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m&timezone=Asia%2FKolkata&forecast_days=1`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Open-Meteo fetch failed");
      const data = await res.json();
      const c = data.current;

      // Calculate night heat stress (night temp proxy = current temp − 2°C offset)
      const nightTemp = c.temperature_2m - 1.5;
      const isNightStress = nightTemp > 25.0;
      // Stress % based on how far above 25°C threshold
      const stressPercent = isNightStress
        ? Math.min(99, Math.round(50 + (nightTemp - 25.0) * 14))
        : Math.max(10, Math.round(30 - (25.0 - nightTemp) * 5));

      // Soil moisture estimate from precipitation + humidity
      const soilEst = Math.min(95, Math.max(15, Math.round(c.relative_humidity_2m * 0.55 + c.precipitation * 2)));

      // Reverse geocode using Open-Meteo's timezone as city hint
      const tz = data.timezone || "Asia/Kolkata";
      const cityHint = tz.replace("Asia/", "").replace("_", " ");

      const wmoData = WMO_DESCRIPTIONS[c.weather_code] || { desc: "Unknown", emoji: "🌡️" };

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
        isNightHeatStress: isNightStress,
        heatStressPercent: stressPercent,
        soilMoistureEst: soilEst,
        locationName: cityHint,
        lastUpdated: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        isLoading: false,
        hasError: false,
      });
    } catch (err) {
      console.warn("Open-Meteo fetch failed, using defaults:", err);
      setWeather((prev) => ({ ...prev, isLoading: false, hasError: true }));
    }
  }, []);

  const getLocationAndFetch = useCallback(() => {
    setWeather((prev) => ({ ...prev, isLoading: true }));
    if (typeof window === "undefined") return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Permission denied or unavailable — use Bhopal default
          fetchWeather(DEFAULT_WEATHER.lat, DEFAULT_WEATHER.lon);
        },
        { timeout: 8000, maximumAge: 300000 }
      );
    } else {
      fetchWeather(DEFAULT_WEATHER.lat, DEFAULT_WEATHER.lon);
    }
  }, [fetchWeather]);

  useEffect(() => {
    getLocationAndFetch();
    // Refresh every 10 minutes
    const interval = setInterval(getLocationAndFetch, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getLocationAndFetch]);

  return (
    <WeatherContext.Provider value={{ weather, refetch: getLocationAndFetch }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => useContext(WeatherContext);
