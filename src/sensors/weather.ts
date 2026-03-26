/**
 * Weather Sensor — fetches current conditions from Open-Meteo (free, no API key).
 *
 * Defaults to Seattle, WA (lat 47.6, lon -122.3). Override via env vars:
 *   ALIVE_WEATHER_LAT / ALIVE_WEATHER_LON
 */

import axios from 'axios';

export interface WeatherReading {
  available: boolean;
  windspeedMph: number;
  isHeavyRain: boolean;
  description: string;
}

// WMO weather code → human description (condensed subset)
const WMO_CODES: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Freezing fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
};

const HEAVY_RAIN_CODES = new Set([65, 82, 95, 96, 99]);

export async function readWeather(): Promise<WeatherReading> {
  const lat = process.env['ALIVE_WEATHER_LAT'] ?? '47.6062';
  const lon = process.env['ALIVE_WEATHER_LON'] ?? '-122.3321';

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true` +
      `&wind_speed_unit=mph` +
      `&forecast_days=1`;

    const res = await axios.get<{
      current_weather: { windspeed: number; weathercode: number };
    }>(url, { timeout: 8000 });

    const cw = res.data.current_weather;
    const code = cw.weathercode ?? 0;

    return {
      available: true,
      windspeedMph: Math.round(cw.windspeed ?? 0),
      isHeavyRain: HEAVY_RAIN_CODES.has(code),
      description: WMO_CODES[code] ?? `Unknown (code ${code})`,
    };
  } catch (err) {
    console.warn('[weather] Fetch failed:', err instanceof Error ? err.message : err);
    return { available: false, windspeedMph: 0, isHeavyRain: false, description: 'unavailable' };
  }
}
