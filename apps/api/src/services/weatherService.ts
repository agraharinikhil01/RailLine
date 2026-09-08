import { Weather, RouteWeather } from '@railline/types';
import { weatherProvider } from '../providers/weatherProvider';
import { cacheService } from '../cache/cacheService';

class WeatherService {
  async getWeather(lat: number, lng: number): Promise<Weather> {
    const latRounded = Number(lat.toFixed(2));
    const lngRounded = Number(lng.toFixed(2));
    const cacheKey = `weather:${latRounded}:${lngRounded}`;

    const cached = await cacheService.get<Weather>(cacheKey);
    if (cached) return cached;

    const weather = await weatherProvider.getWeather(lat, lng);
    await cacheService.set(cacheKey, weather, 10 * 60); // 10 min cache (PRD §18)
    return weather;
  }

  async getRouteWeather(trainNumber: string): Promise<RouteWeather | null> {
    const cacheKey = `route-weather:${trainNumber}`;
    const cached = await cacheService.get<RouteWeather>(cacheKey);
    if (cached) return cached;

    const routeWeather = await weatherProvider.getRouteWeather(trainNumber);
    if (routeWeather) {
      await cacheService.set(cacheKey, routeWeather, 10 * 60);
    }
    return routeWeather;
  }
}

export const weatherService = new WeatherService();
