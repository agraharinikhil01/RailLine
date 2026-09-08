import {
  Train,
  TrainSearchResult,
  LiveTrainStatus,
  JourneyStation,
} from '@railline/types';

export interface TrainProvider {
  searchTrains(query: string): Promise<TrainSearchResult[]>;
  getTrainDetails(trainNumber: string): Promise<Train | null>;
  getLiveStatus(trainNumber: string): Promise<LiveTrainStatus | null>;
  getRouteStations(trainNumber: string): Promise<JourneyStation[]>;
  getRouteGeometry(trainNumber: string): Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>;
}
