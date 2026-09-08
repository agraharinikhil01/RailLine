import {
  LiveTrainStatus,
  JourneyStation,
} from '@railline/types';
import { activeTrainProvider } from '../providers';
import { TrainNotFoundError, LiveDataUnavailableError, InvalidRequestError } from '../utils/errors';

interface LiveCacheEntry {
  status: LiveTrainStatus;
  fetchedAt: number;
  expiresAt: number;
}

class LiveStatusService {
  // In Phase 1 we use an in-memory cache; Phase 2 introduces Redis as planned
  private liveCache = new Map<string, LiveCacheEntry>();

  async getLiveStatus(trainNumber: string): Promise<LiveTrainStatus> {
    const normalized = trainNumber.trim();
    if (!normalized) {
      throw new InvalidRequestError('Train number is required.');
    }

    const cached = this.liveCache.get(normalized);
    const now = Date.now();

    // If cache is fresh (30 seconds TTL per PRD §3.9 & §18)
    if (cached && cached.expiresAt > now) {
      return cached.status;
    }

    try {
      const live = await activeTrainProvider.getLiveStatus(normalized);
      if (!live) {
        // If we have previously cached status, return it with isStale flag (PRD §19)
        if (cached) {
          return {
            ...cached.status,
            isStale: true,
          };
        }
        throw new TrainNotFoundError(normalized);
      }

      this.liveCache.set(normalized, {
        status: live,
        fetchedAt: now,
        expiresAt: now + 30 * 1000, // 30 sec TTL
      });

      return live;
    } catch (err) {
      if (cached) {
        return {
          ...cached.status,
          isStale: true,
        };
      }
      if (err instanceof TrainNotFoundError) throw err;
      throw new LiveDataUnavailableError();
    }
  }

  async getRouteGeometry(trainNumber: string): Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry>> {
    const normalized = trainNumber.trim();
    const geo = await activeTrainProvider.getRouteGeometry(normalized);
    if (!geo) {
      throw new TrainNotFoundError(normalized);
    }
    return geo;
  }

  async getTimeline(trainNumber: string): Promise<JourneyStation[]> {
    const normalized = trainNumber.trim();
    const stations = await activeTrainProvider.getRouteStations(normalized);
    if (!stations || stations.length === 0) {
      throw new TrainNotFoundError(normalized);
    }
    return stations;
  }
}

export const liveStatusService = new LiveStatusService();
