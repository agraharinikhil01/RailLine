import { TrainSearchResult } from '@railline/types';
import { trainService } from './trainService';

class FavoritesService {
  private favorites = new Set<string>(['12951']); // Default starter favorite

  async getFavorites(): Promise<TrainSearchResult[]> {
    const list: TrainSearchResult[] = [];
    for (const trainNumber of this.favorites) {
      try {
        const train = await trainService.getTrainDetails(trainNumber);
        list.push({
          trainNumber: train.trainNumber,
          name: train.name,
          source: train.source.name,
          sourceCode: train.source.code,
          destination: train.destination.name,
          destinationCode: train.destination.code,
          departureTime: train.route[0]?.scheduledDeparture,
          arrivalTime: train.route[train.route.length - 1]?.scheduledArrival,
          runningDays: train.operatingDays,
          status: 'DELAYED',
          currentDelayMinutes: 12,
        });
      } catch {
        // Skip missing
      }
    }
    return list;
  }

  async addFavorite(trainNumber: string): Promise<{ success: boolean; trainNumber: string }> {
    await trainService.getTrainDetails(trainNumber); // Verify existence
    this.favorites.add(trainNumber);
    return { success: true, trainNumber };
  }

  async removeFavorite(trainNumber: string): Promise<{ success: boolean; trainNumber: string }> {
    this.favorites.delete(trainNumber);
    return { success: true, trainNumber };
  }

  isFavorite(trainNumber: string): boolean {
    return this.favorites.has(trainNumber);
  }
}

export const favoritesService = new FavoritesService();
