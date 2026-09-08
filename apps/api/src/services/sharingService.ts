import { nanoid } from 'nanoid';
import { SharedJourneyData } from '@railline/types';
import { liveStatusService } from './liveStatusService';
import { trainService } from './trainService';
import { NotFoundError } from '../utils/errors';

interface StoredSharedJourney {
  data: SharedJourneyData;
  expiresAt: number;
}

class SharingService {
  private sharedStore = new Map<string, StoredSharedJourney>();

  async createShareLink(trainNumber: string): Promise<{ shareToken: string; shareUrl: string; expiresAt: string }> {
    const live = await liveStatusService.getLiveStatus(trainNumber);
    const train = await trainService.getTrainDetails(trainNumber);

    // Generate random, non-sequential, 10-char token (PRD §3.10)
    const shareToken = nanoid(10);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry

    const sharedData: SharedJourneyData = {
      shareToken,
      trainNumber: live.trainNumber,
      trainName: live.trainName,
      source: train.source.name,
      destination: train.destination.name,
      status: live.status,
      delayMinutes: live.delayMinutes,
      currentStationName: live.currentStation?.name,
      nextStationName: live.nextStation?.name,
      etaDestination: live.etaDestination,
      progressPercentage: live.progressPercentage,
      distanceCoveredKm: live.distanceCoveredKm,
      distanceRemainingKm: live.distanceRemainingKm,
      lastUpdatedAt: live.lastUpdatedAt,
      expiresAt: new Date(expiresAt).toISOString(),
    };

    this.sharedStore.set(shareToken, {
      data: sharedData,
      expiresAt,
    });

    return {
      shareToken,
      shareUrl: `/journey/shared/${shareToken}`,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  async getSharedJourney(shareToken: string): Promise<SharedJourneyData> {
    const item = this.sharedStore.get(shareToken);
    if (!item) {
      throw new NotFoundError('Shared journey link has expired or does not exist.', 'SHARED_JOURNEY_NOT_FOUND');
    }

    if (Date.now() > item.expiresAt) {
      this.sharedStore.delete(shareToken);
      throw new NotFoundError('Shared journey link has expired.', 'SHARED_JOURNEY_EXPIRED');
    }

    // Refresh live progress dynamically so recipient sees live telemetry!
    try {
      const freshLive = await liveStatusService.getLiveStatus(item.data.trainNumber);
      return {
        ...item.data,
        status: freshLive.status,
        delayMinutes: freshLive.delayMinutes,
        currentStationName: freshLive.currentStation?.name,
        nextStationName: freshLive.nextStation?.name,
        progressPercentage: freshLive.progressPercentage,
        distanceCoveredKm: freshLive.distanceCoveredKm,
        distanceRemainingKm: freshLive.distanceRemainingKm,
        lastUpdatedAt: freshLive.lastUpdatedAt,
      };
    } catch {
      return item.data;
    }
  }
}

export const sharingService = new SharingService();
