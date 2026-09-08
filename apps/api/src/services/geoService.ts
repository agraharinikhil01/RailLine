import { GeographicPlace } from '@railline/types';
import { geoProvider } from '../providers/geoProvider';
import { cacheService } from '../cache/cacheService';

class GeoService {
  async getNearbyPlaces(trainNumber: string, category?: string): Promise<GeographicPlace[]> {
    const cacheKey = `geo:${trainNumber}:${category || 'all'}`;
    const cached = await cacheService.get<GeographicPlace[]>(cacheKey);
    if (cached) return cached;

    const places = await geoProvider.getNearbyPlaces(trainNumber, category);
    await cacheService.set(cacheKey, places, 60 * 60); // 1 hour cache
    return places;
  }
}

export const geoService = new GeoService();
