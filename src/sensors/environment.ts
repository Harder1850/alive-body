/**
 * Environment Sensor — unified terrain snapshot for ALIVE's heartbeat.
 *
 * Aggregates:
 *   Weather  — Open-Meteo (Crescent City, CA — lat 41.7558, lon -124.2026)
 *   Battery  — systeminformation
 *   CPU Temp — systeminformation (cpuTemperature)
 *   Disk     — systeminformation (fsSize, first mount)
 *
 * Override location via ALIVE_WEATHER_LAT / ALIVE_WEATHER_LON env vars.
 */

import si from 'systeminformation';
import axios from 'axios';

// WMO weather interpretation codes → label
const WMO: Record<number, string> = {
  0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',
  45:'Fog',48:'Icing fog',
  51:'Light drizzle',53:'Moderate drizzle',55:'Dense drizzle',
  61:'Slight rain',63:'Moderate rain',65:'Heavy rain',
  71:'Slight snow',73:'Moderate snow',75:'Heavy snow',
  80:'Rain showers',81:'Moderate showers',82:'Violent showers',
  95:'Thunderstorm',96:'Thunderstorm+hail',99:'Thunderstorm+heavy hail',
};
const HEAVY_RAIN_CODES = new Set([65,82,95,96,99]);

export interface EnvironmentSnapshot {
  timestamp: number;

  // Weather
  weather: {
    available: boolean;
    tempC: number;
    windspeedMph: number;
    isHeavyRain: boolean;
    description: string;
    location: string;
  };

  // Hardware
  battery: {
    hasBattery: boolean;
    percent: number;
    isCharging: boolean;
  };

  cpu: {
    tempC: number;          // -1 if unreadable (desktop / no sensor)
  };

  disk: {
    usedGb: number;
    totalGb: number;
    usedPercent: number;
    mount: string;
  };

  // Derived threat flags
  threats: {
    lowBattery: boolean;    // < 20 % and not charging
    highWind: boolean;      // > 25 mph
    heavyRain: boolean;
    highCpuTemp: boolean;   // > 85 °C
    diskNearFull: boolean;  // > 90 %
  };

  survivalMode: boolean;    // any threat is true
}

export async function readEnvironment(): Promise<EnvironmentSnapshot> {
  const lat = process.env['ALIVE_WEATHER_LAT'] ?? '41.7558';   // Crescent City, CA
  const lon = process.env['ALIVE_WEATHER_LON'] ?? '-124.2026';

  // ── Parallel reads ──────────────────────────────────────────────────────
  const [weatherResult, batteryData, cpuTempData, diskData] = await Promise.allSettled([
    axios.get<{ current_weather: { temperature: number; windspeed: number; weathercode: number } }>(
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true&wind_speed_unit=mph&forecast_days=1`,
      { timeout: 8000 }
    ),
    si.battery(),
    si.cpuTemperature(),
    si.fsSize(),
  ]);

  // ── Weather ─────────────────────────────────────────────────────────────
  let weather: EnvironmentSnapshot['weather'] = {
    available: false, tempC: 0, windspeedMph: 0,
    isHeavyRain: false, description: 'unavailable', location: `${lat},${lon}`,
  };
  if (weatherResult.status === 'fulfilled') {
    const cw = weatherResult.value.data.current_weather;
    const code = cw.weathercode ?? 0;
    weather = {
      available: true,
      tempC: Math.round(cw.temperature ?? 0),
      windspeedMph: Math.round(cw.windspeed ?? 0),
      isHeavyRain: HEAVY_RAIN_CODES.has(code),
      description: WMO[code] ?? `code ${code}`,
      location: `${lat},${lon}`,
    };
  }

  // ── Battery ──────────────────────────────────────────────────────────────
  let battery: EnvironmentSnapshot['battery'] = { hasBattery: false, percent: 100, isCharging: true };
  if (batteryData.status === 'fulfilled') {
    const b = batteryData.value;
    battery = { hasBattery: b.hasBattery ?? false, percent: b.percent ?? 100, isCharging: b.isCharging ?? true };
  }

  // ── CPU Temp ─────────────────────────────────────────────────────────────
  let cpuTempC = -1;
  if (cpuTempData.status === 'fulfilled') {
    cpuTempC = cpuTempData.value.main ?? cpuTempData.value.max ?? -1;
  }

  // ── Disk ─────────────────────────────────────────────────────────────────
  let disk: EnvironmentSnapshot['disk'] = { usedGb: 0, totalGb: 0, usedPercent: 0, mount: '/' };
  if (diskData.status === 'fulfilled' && diskData.value.length > 0) {
    // Pick the largest physical drive (skip tmpfs / loop devices)
    const physical = diskData.value.filter(d => d.size > 1e9).sort((a,b) => b.size - a.size)[0];
    if (physical) {
      const totalGb = physical.size / 1e9;
      const usedGb  = physical.used / 1e9;
      disk = {
        usedGb:      parseFloat(usedGb.toFixed(1)),
        totalGb:     parseFloat(totalGb.toFixed(1)),
        usedPercent: Math.round((usedGb / totalGb) * 100),
        mount:       physical.mount,
      };
    }
  }

  // ── Threat evaluation ────────────────────────────────────────────────────
  const threats = {
    lowBattery:  battery.hasBattery && battery.percent < 20 && !battery.isCharging,
    highWind:    weather.windspeedMph > 25,
    heavyRain:   weather.isHeavyRain,
    highCpuTemp: cpuTempC > 85,
    diskNearFull: disk.usedPercent > 90,
  };
  const survivalMode = Object.values(threats).some(Boolean);

  return {
    timestamp: Date.now(),
    weather,
    battery,
    cpu: { tempC: cpuTempC },
    disk,
    threats,
    survivalMode,
  };
}
