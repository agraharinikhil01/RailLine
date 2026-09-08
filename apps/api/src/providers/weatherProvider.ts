import { Weather, RouteWeather, JourneyStation } from '@railline/types';
import { activeTrainProvider } from './index';

export interface WeatherProvider {
  getWeather(lat: number, lng: number, stationName?: string, stationCode?: string): Promise<Weather>;
  getRouteWeather(trainNumber: string): Promise<RouteWeather | null>;
}

// Regional weather presets for Indian geography
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

export class MockWeatherProvider implements WeatherProvider {
  async getWeather(lat: number, lng: number, stationName?: string, stationCode?: string): Promise<Weather> {
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

export const weatherProvider: WeatherProvider = new MockWeatherProvider();
