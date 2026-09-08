import {
  Train,
  TrainSearchResult,
  LiveTrainStatus,
  JourneyStation,
} from '@railline/types';
import { apiClient } from './api';

export const trainApi = {
  searchTrains: async (query: string): Promise<TrainSearchResult[]> => {
    return apiClient<TrainSearchResult[]>(`/trains/search?q=${encodeURIComponent(query)}`);
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
};
