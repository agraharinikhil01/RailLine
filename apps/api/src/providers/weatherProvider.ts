import { Weather, RouteWeather, JourneyStation } from '@railline/types';
import { activeTrainProvider } from './index';
import { env } from '../config/env';

export interface WeatherProvider {
  getWeather(lat: number, lng: number, stationName?: string, stationCode?: string): Promise<Weather>;
  getRouteWeather(trainNumber: string): Promise<RouteWeather | null>;
}

// Regional weather presets for Indian geography (fallback when offline or rate-limited)
const REGION_WEATHER_DEFAULTS: Record<string, { temp: number; condition: string; humidity: number; wind: number; rainProb: number; icon: string }> = {
  NDLS: { temp: 31, condition: 'Haze', humidity: 55, wind: 12, rainProb: 10, icon: 'haze' },
  CNB: { temp: 33, condition: 'Partly Cloudy', humidity: 62, wind: 14, rainProb: 20, icon: 'cloud-sun' },
  LKO: { temp: 32, condition: 'Partly Cloudy', humidity: 64, wind: 11, rainProb: 25, icon: 'cloud-sun' },
  LJN: { temp: 32, condition: 'Partly Cloudy', humidity: 64, wind: 11, rainProb: 25, icon: 'cloud-sun' },
  PRYJ: { temp: 34, condition: 'Sunny', humidity: 58, wind: 10, rainProb: 15, icon: 'sun' },
  BSB: { temp: 34, condition: 'Sunny', humidity: 60, wind: 9, rainProb: 10, icon: 'sun' },
  MMCT: { temp: 29, condition: 'Humid', humidity: 82, wind: 18, rainProb: 40, icon: 'cloud-rain' },
  ST: { temp: 30, condition: 'Warm', humidity: 75, wind: 16, rainProb: 30, icon: 'cloud-sun' },
  BRC: { temp: 32, condition: 'Clear', humidity: 60, wind: 12, rainProb: 10, icon: 'sun' },
  RTM: { temp: 31, condition: 'Clear', humidity: 52, wind: 13, rainProb: 5, icon: 'sun' },
  KOTA: { temp: 35, condition: 'Hot', humidity: 45, wind: 15, rainProb: 5, icon: 'sun' },
};

export class LiveOpenWeatherProvider implements WeatherProvider {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.OPENWEATHER_API_KEY;
  }

  async getWeather(lat: number, lng: number, stationName?: string, stationCode?: string): Promise<Weather> {
    // If API key is configured, attempt real OpenWeather query
    if (this.apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${this.apiKey}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          return {
            stationCode,
            stationName: stationName || data.name || 'Route Point',
            latitude: lat,
            longitude: lng,
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            windSpeed: Math.round((data.wind?.speed || 0) * 3.6), // Convert m/s to km/h
            rainProbability: data.clouds?.all ? Math.min(95, Math.round(data.clouds.all * 0.7)) : 10,
            condition: data.weather?.[0]?.main || 'Clear',
            icon: data.weather?.[0]?.icon || 'sun',
            updatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn(`[OpenWeather] API query failed, using regional meteorological fallback for (${lat}, ${lng})`, err);
      }
    }

    // Graceful fallback to regional meteorological data (PRD Rule 5: Optional enrichment never blocks)
    const preset = (stationCode && REGION_WEATHER_DEFAULTS[stationCode]) || {
      temp: 30,
      condition: 'Partly Cloudy',
      humidity: 60,
      wind: 12,
      rainProb: 20,
      icon: 'cloud-sun',
    };

    return {
      stationCode,
      stationName: stationName || 'Route Checkpoint',
      latitude: lat,
      longitude: lng,
      temperature: preset.temp,
      feelsLike: preset.temp + 2,
      humidity: preset.humidity,
      windSpeed: preset.wind,
      rainProbability: preset.rainProb,
      condition: preset.condition,
      icon: preset.icon,
      updatedAt: new Date().toISOString(),
    };
  }

  async getRouteWeather(trainNumber: string): Promise<RouteWeather | null> {
    const stations = await activeTrainProvider.getRouteStations(trainNumber);
    if (!stations || stations.length === 0) return null;

    const currentStationObj = stations.find((s: JourneyStation) => s.status === 'CURRENT') || stations[0];
    const currentIndex = stations.indexOf(currentStationObj);
    const nextStationObj = stations[currentIndex + 1] || currentStationObj;
    const destStationObj = stations[stations.length - 1];

    const currentStationWeather = await this.getWeather(
      currentStationObj.station.latitude,
      currentStationObj.station.longitude,
      currentStationObj.station.name,
      currentStationObj.station.code
    );

    const nextStationWeather = await this.getWeather(
      nextStationObj.station.latitude,
      nextStationObj.station.longitude,
      nextStationObj.station.name,
      nextStationObj.station.code
    );

    const destinationWeather = await this.getWeather(
      destStationObj.station.latitude,
      destStationObj.station.longitude,
      destStationObj.station.name,
      destStationObj.station.code
    );

    // Build checkpoints for all route stations
    const checkpoints = await Promise.all(
      stations.map((st: JourneyStation) =>
        this.getWeather(
          st.station.latitude,
          st.station.longitude,
          st.station.name,
          st.station.code
        )
      )
    );

    return {
      currentStationWeather,
      nextStationWeather,
      destinationWeather,
      checkpoints,
    };
  }
}

export const weatherProvider: WeatherProvider = new LiveOpenWeatherProvider();
