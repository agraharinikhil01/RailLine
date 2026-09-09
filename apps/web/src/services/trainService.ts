import {
  Train,
  TrainSearchResult,
  LiveTrainStatus,
  JourneyStation,
  ElevationPoint,
  RouteWeather,
  GeographicPlace,
  SharedJourneyData,
} from '@railline/types';
import { apiClient } from './api';

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

export interface HistoricalTripStop {
  sequence: number;
  stationCode: string;
  stationName: string;
  platform?: string;
  distanceKm: number;
  scheduledArrival?: string;
  actualArrival?: string;
  delayArrivalMinutes?: number;
  scheduledDeparture?: string;
  actualDeparture?: string;
  delayDepartureMinutes?: number;
  isHalt: boolean;
  isOrigin: boolean;
  isDestination: boolean;
}

export interface HistoricalTripData {
  trainNumber: string;
  trainName: string;
  date: string;
  dayOfWeek: string;
  destinationDelayMinutes: number;
  destinationScheduledArrival?: string;
  destinationActualArrival?: string;
  status: 'ON TIME' | 'SLIGHT DELAY' | 'DELAYED' | 'NOT SCHEDULED';
  isRunDay: boolean;
  stops: HistoricalTripStop[];
}

export const trainApi = {
  // --- Phase 1 ---
  searchTrains: async (query: string): Promise<TrainSearchResult[]> => {
    return apiClient<TrainSearchResult[]>(`/trains/search?q=${encodeURIComponent(query)}`);
  },

  getHistoricalTrip: async (trainNumber: string, date: string): Promise<HistoricalTripData> => {
    return apiClient<HistoricalTripData>(`/trains/${encodeURIComponent(trainNumber)}/historical?date=${encodeURIComponent(date)}`);
  },

  getTrainDetails: async (trainNumber: string): Promise<Train> => {
    return apiClient<Train>(`/trains/${encodeURIComponent(trainNumber)}`);
  },

  getLiveStatus: async (trainNumber: string): Promise<LiveTrainStatus> => {
    return apiClient<LiveTrainStatus>(`/trains/${encodeURIComponent(trainNumber)}/live`);
  },

  getRouteGeometry: async (trainNumber: string): Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry>> => {
    return apiClient<GeoJSON.FeatureCollection<GeoJSON.Geometry>>(`/trains/${encodeURIComponent(trainNumber)}/route`);
  },

  getTimeline: async (trainNumber: string): Promise<JourneyStation[]> => {
    return apiClient<JourneyStation[]>(`/trains/${encodeURIComponent(trainNumber)}/timeline`);
  },

  // --- Phase 2 Analytics & Elevation ---
  getElevationSummary: async (trainNumber: string): Promise<ElevationSummary> => {
    return apiClient<ElevationSummary>(`/trains/${encodeURIComponent(trainNumber)}/elevation`);
  },

  getDelayHistory: async (trainNumber: string): Promise<StationDelayPoint[]> => {
    return apiClient<StationDelayPoint[]>(`/trains/${encodeURIComponent(trainNumber)}/delays`);
  },

  // --- Phase 2 Travel Companion ---
  getRouteWeather: async (trainNumber: string): Promise<RouteWeather> => {
    return apiClient<RouteWeather>(`/trains/${encodeURIComponent(trainNumber)}/weather`);
  },

  getNearbyPlaces: async (trainNumber: string, category?: string): Promise<GeographicPlace[]> => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiClient<GeographicPlace[]>(`/trains/${encodeURIComponent(trainNumber)}/places${query}`);
  },

  // --- Phase 2 Sharing ---
  createShareLink: async (trainNumber: string): Promise<{ shareToken: string; shareUrl: string; expiresAt: string }> => {
    return apiClient<{ shareToken: string; shareUrl: string; expiresAt: string }>('/journeys/share', {
      method: 'POST',
      body: JSON.stringify({ trainNumber }),
    });
  },

  getSharedJourney: async (shareToken: string): Promise<SharedJourneyData> => {
    return apiClient<SharedJourneyData>(`/journeys/shared/${encodeURIComponent(shareToken)}`);
  },

  // --- Phase 2 Favorites ---
  getFavorites: async (): Promise<TrainSearchResult[]> => {
    return apiClient<TrainSearchResult[]>('/favorites');
  },

  addFavorite: async (trainNumber: string): Promise<{ success: boolean; trainNumber: string }> => {
    return apiClient<{ success: boolean; trainNumber: string }>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ trainNumber }),
    });
  },

  removeFavorite: async (trainNumber: string): Promise<{ success: boolean; trainNumber: string }> => {
    return apiClient<{ success: boolean; trainNumber: string }>(`/favorites/${encodeURIComponent(trainNumber)}`, {
      method: 'DELETE',
    });
  },
};
