/**
 * ASSARA Weather Service
 * Real-time Open-Meteo telemetry engine keyed strictly to farm coordinates.
 * Features persistent caching, provenance timestamps, and honest empty/failure states.
 */

export interface WeatherTelemetry {
  temperature: number;
  apparentTemperature?: number;
  nightTemperature?: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
  weatherDescription: string;
  weatherEmoji: string;
  isRaining: boolean;
  soilMoistureEst: number;
  heatStressPercent: number;
  isNightHeatStress: boolean;
  hourlyForecast: Array<{
    time: string;
    temp: number;
    rainProb: number;
    soilMoisture?: number;
  }>;
  dailyForecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    precipitationProbability: number;
  }>;
  status: "FRESH" | "CACHED" | "UNAVAILABLE";
  updatedAt: string;
  provenance: string;
}

const CACHE_PREFIX = "assara_weather_cache_";
const MAX_CACHE_AGE_MS = 60 * 60 * 1000; // 1 hour

function getWeatherDescription(code: number): { desc: string; emoji: string } {
  if (code === 0) return { desc: "Clear Sky", emoji: "☀️" };
  if (code >= 1 && code <= 3) return { desc: "Partly Cloudy", emoji: "⛅" };
  if (code >= 45 && code <= 48) return { desc: "Fog / Mist", emoji: "🌫️" };
  if (code >= 51 && code <= 67) return { desc: "Rain / Drizzle", emoji: "🌧️" };
  if (code >= 71 && code <= 77) return { desc: "Snow Flurries", emoji: "❄️" };
  if (code >= 80 && code <= 82) return { desc: "Rain Showers", emoji: "🌦️" };
  if (code >= 95 && code <= 99) return { desc: "Thunderstorm", emoji: "⛈️" };
  return { desc: "Cloudy", emoji: "☁️" };
}

/**
 * Fetch verified weather telemetry for farm coordinates
 */
export async function getFarmWeather(
  lat: number,
  lon: number,
  farmName: string = "Farm"
): Promise<WeatherTelemetry | null> {
  if (!lat || !lon || isNaN(lat) || isNaN(lon)) return null;

  const cacheKey = `${CACHE_PREFIX}${lat.toFixed(3)}_${lon.toFixed(3)}`;

  // Check cache first in case of offline/network issues
  let cachedEntry: WeatherTelemetry | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        cachedEntry = JSON.parse(raw);
      }
    } catch (_) {}
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,soil_moisture_0_to_1cm&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      throw new Error(`Open-Meteo responded with status ${res.status}`);
    }

    const data = await res.json();
    const curr = data?.current || {};
    const hourly = data?.hourly || {};
    const daily = data?.daily || {};

    const temp = Math.round((curr.temperature_2m ?? 0) * 10) / 10;
    const humidity = Math.round(curr.relative_humidity_2m ?? 0);
    const windSpeed = Math.round((curr.wind_speed_10m ?? 0) * 10) / 10;
    const precip = Math.round((curr.precipitation ?? 0) * 10) / 10;
    const weatherCode = curr.weather_code ?? 0;
    const { desc, emoji } = getWeatherDescription(weatherCode);

    // Compute nocturnal temperature average (8 PM to 6 AM)
    const hourlyTimes: string[] = hourly.time || [];
    const hourlyTemps: number[] = hourly.temperature_2m || [];
    const hourlyRainProb: number[] = hourly.precipitation_probability || [];
    const hourlySoil: number[] = hourly.soil_moisture_0_to_1cm || [];

    const nightTemps: number[] = [];
    for (let i = 0; i < Math.min(hourlyTimes.length, 36); i++) {
      const timeStr = hourlyTimes[i]?.split("T")?.[1];
      if (timeStr) {
        const hour = parseInt(timeStr.split(":")[0], 10);
        if ([20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6].includes(hour) && typeof hourlyTemps[i] === "number") {
          nightTemps.push(hourlyTemps[i]);
        }
      }
    }

    const nightAvg = nightTemps.length > 0
      ? Math.round((nightTemps.reduce((a, b) => a + b, 0) / nightTemps.length) * 10) / 10
      : temp;

    // Soil moisture estimation from top layer (0-1cm)
    const soilMoistureEst = hourlySoil.length > 0 && typeof hourlySoil[0] === "number"
      ? Math.round(hourlySoil[0] * 100)
      : Math.max(20, Math.min(85, Math.round(humidity * 0.6)));

    // Heat stress calculation: thermal excess over 25°C baseline
    const heatStressVal = Math.min(100, Math.max(0, Math.round(((temp - 22) / 18) * 100)));
    const isNightHeatStress = nightAvg > 25.0;

    const hourlyForecast = hourlyTimes.slice(0, 12).map((time, idx) => ({
      time,
      temp: hourlyTemps[idx] ?? temp,
      rainProb: hourlyRainProb[idx] ?? 0,
      soilMoisture: hourlySoil[idx] ? Math.round(hourlySoil[idx] * 100) : undefined,
    }));

    const dailyForecast = (daily.time || []).map((date: string, idx: number) => ({
      date,
      maxTemp: Math.round((daily.temperature_2m_max?.[idx] ?? temp) * 10) / 10,
      minTemp: Math.round((daily.temperature_2m_min?.[idx] ?? nightAvg) * 10) / 10,
      precipitationProbability: daily.precipitation_probability_max?.[idx] ?? 0,
    }));

    const currentPrecipProb = hourlyRainProb.length > 0 ? hourlyRainProb[0] : 0;

    const telemetry: WeatherTelemetry = {
      temperature: temp,
      apparentTemperature: curr.apparent_temperature ? Math.round(curr.apparent_temperature * 10) / 10 : undefined,
      nightTemperature: nightAvg,
      humidity,
      windSpeed,
      windDirection: curr.wind_direction_10m,
      precipitation: precip,
      precipitationProbability: currentPrecipProb,
      weatherCode,
      weatherDescription: desc,
      weatherEmoji: emoji,
      isRaining: precip > 0.1 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weatherCode),
      soilMoistureEst,
      heatStressPercent: heatStressVal,
      isNightHeatStress,
      hourlyForecast,
      dailyForecast,
      status: "FRESH",
      updatedAt: new Date().toISOString(),
      provenance: `Open-Meteo High-Resolution Telemetry (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`,
    };

    // Save to cache
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(telemetry));
      } catch (_) {}
    }

    return telemetry;
  } catch (err) {
    console.warn(`[WeatherService] Fetch failed for ${farmName} (${lat}, ${lon}):`, err);

    // Fall back to cached entry if available
    if (cachedEntry) {
      return {
        ...cachedEntry,
        status: "CACHED",
        provenance: `Cached (${cachedEntry.updatedAt ? new Date(cachedEntry.updatedAt).toLocaleTimeString() : "Recent"})`,
      };
    }

    return null;
  }
}
