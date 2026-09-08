import { ElevationPoint, JourneyStation } from '@railline/types';
import { elevationProvider } from '../providers/elevationProvider';
import { activeTrainProvider } from '../providers/index';
import { cacheService } from '../cache/cacheService';

export interface ElevationSummary {
  profile: ElevationPoint[];
  currentElevationMeters: number;
  highestElevationMeters: number;
  lowestElevationMeters: number;
  elevationGainMeters: number;
}

export interface StationDelayPoint {
  stationCode: string;
  stationName: string;
  scheduledTime: string;
  actualTime: string;
  delayMinutes: number;
  distanceKm: number;
}

class AnalyticsService {
  async getElevationSummary(trainNumber: string): Promise<ElevationSummary> {
    const cacheKey = `elevation:${trainNumber}`;
    const cached = await cacheService.get<ElevationSummary>(cacheKey);
    if (cached) return cached;

    const profile = await elevationProvider.getElevationProfile(trainNumber);
    if (profile.length === 0) {
      return {
        profile: [],
        currentElevationMeters: 0,
        highestElevationMeters: 0,
        lowestElevationMeters: 0,
        elevationGainMeters: 0,
      };
    }

    const currentPoint = profile.find((p) => p.isCurrentPosition) || profile[0];
    const elevations = profile.map((p) => p.elevationMeters);
    const highestElevationMeters = Math.max(...elevations);
    const lowestElevationMeters = Math.min(...elevations);

    // Calculate total elevation gain along route
    let elevationGainMeters = 0;
    for (let i = 1; i < profile.length; i++) {
      const diff = profile[i].elevationMeters - profile[i - 1].elevationMeters;
      if (diff > 0) {
        elevationGainMeters += diff;
      }
    }

    const summary: ElevationSummary = {
      profile,
      currentElevationMeters: currentPoint.elevationMeters,
      highestElevationMeters,
      lowestElevationMeters,
      elevationGainMeters,
    };

    // Cache elevation profile for 24 hours (PRD §18: elevation changes extremely infrequently)
    await cacheService.set(cacheKey, summary, 24 * 60 * 60);

    return summary;
  }

  async getDelayHistory(trainNumber: string): Promise<StationDelayPoint[]> {
    const stations = await activeTrainProvider.getRouteStations(trainNumber);
    if (!stations) return [];

    return stations
      .filter((s: JourneyStation) => s.status === 'COMPLETED' || s.status === 'CURRENT')
      .map((s: JourneyStation) => ({
        stationCode: s.station.code,
        stationName: s.station.name,
        scheduledTime: s.scheduledArrival || s.scheduledDeparture || '',
        actualTime: s.actualArrival || s.actualDeparture || s.expectedArrival || '',
        delayMinutes: s.delayMinutes,
        distanceKm: s.distanceFromSourceKm,
      }));
  }
}

export const analyticsService = new AnalyticsService();
