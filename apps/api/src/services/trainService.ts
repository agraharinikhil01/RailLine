import { Train, TrainSearchResult } from '@railline/types';
import { activeTrainProvider } from '../providers';
import { TrainNotFoundError, InvalidRequestError } from '../utils/errors';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class TrainService {
  private searchCache = new Map<string, CacheEntry<TrainSearchResult[]>>();
  private trainDetailsCache = new Map<string, CacheEntry<Train>>();

  async searchTrains(query: string): Promise<TrainSearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      throw new InvalidRequestError('Search query must be at least 2 characters long.');
    }

    const cacheKey = trimmed.toLowerCase();
    const cached = this.searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const results = await activeTrainProvider.searchTrains(trimmed);

    // Cache for 5 minutes (PRD §14.1: "5-30 minutes")
    this.searchCache.set(cacheKey, {
      data: results,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return results;
  }

  async getTrainDetails(trainNumber: string): Promise<Train> {
    const normalized = trainNumber.trim();
    if (!normalized) {
      throw new InvalidRequestError('Train number is required.');
    }

    const cached = this.trainDetailsCache.get(normalized);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const train = await activeTrainProvider.getTrainDetails(normalized);
    if (!train) {
      throw new TrainNotFoundError(normalized);
    }

    this.trainDetailsCache.set(normalized, {
      data: train,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return train;
  }
}

export const trainService = new TrainService();
