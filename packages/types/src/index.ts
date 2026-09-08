/**
 * RailLine Shared Domain Types & Contracts
 */

export type RunningStatus =
  | 'ON TIME'
  | 'DELAYED'
  | 'ARRIVED'
  | 'NOT STARTED'
  | 'COMPLETED'
  | 'DATA UNAVAILABLE';

export type StationStatus =
  | 'COMPLETED'
  | 'CURRENT'
  | 'UPCOMING'
  | 'SKIPPED';

export type DelayTrend =
  | 'INCREASING'
  | 'DECREASING'
  | 'STABLE'
  | 'UNAVAILABLE';

export interface StationReference {
  code: string;
  name: string;
  platform?: string;
  scheduledArrival?: string;
  scheduledDeparture?: string;
}

export interface Station {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  zone?: string;
  elevationMeters?: number;
}

export interface Train {
  id: string;
  trainNumber: string;
  name: string;
  type?: string;
  source: StationReference;
  destination: StationReference;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  operatingDays?: string[];
  route: StationReference[];
}

export interface TrainSearchResult {
  trainNumber: string;
  name: string;
  source: string;
  sourceCode: string;
  destination: string;
  destinationCode: string;
  departureTime?: string;
  arrivalTime?: string;
  runningDays?: string[];
  status?: RunningStatus;
  currentDelayMinutes?: number;
}

export interface LiveLocation {
  lat: number;
  lng: number;
  bearing?: number;
  speedKmph?: number;
  isInterpolated?: boolean;
}

export interface LiveTrainStatus {
  trainNumber: string;
  trainName: string;
  status: RunningStatus;
  delayMinutes: number;
  currentStation?: StationReference;
  nextStation?: StationReference;
  location: LiveLocation;
  progressPercentage: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  etaNextStation?: string;
  etaDestination?: string;
  delayTrend?: DelayTrend;
  lastUpdatedAt: string;
  isStale?: boolean;
}

export interface JourneyStation {
  station: Station;
  distanceFromSourceKm: number;
  scheduledArrival?: string;
  scheduledDeparture?: string;
  expectedArrival?: string;
  expectedDeparture?: string;
  actualArrival?: string;
  actualDeparture?: string;
  delayMinutes: number;
  platform?: string;
  status: StationStatus;
  isHalt?: boolean;
}

export interface Journey {
  id: string;
  trainNumber: string;
  trainName: string;
  journeyDate: string;
  source: Station;
  destination: Station;
  stations: JourneyStation[];
  routeGeometry: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  currentStatus: LiveTrainStatus;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  stationCode?: string;
  stationName?: string;
  isCurrentPosition?: boolean;
}

export interface Weather {
  stationCode?: string;
  stationName?: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  rainProbability?: number;
  condition: string;
  icon: string;
  updatedAt: string;
}

export interface RouteWeather {
  currentStationWeather?: Weather;
  nextStationWeather?: Weather;
  destinationWeather?: Weather;
  checkpoints: Weather[];
}

export interface GeographicPlace {
  id: string;
  name: string;
  type: 'RIVER' | 'MOUNTAIN' | 'BRIDGE' | 'TUNNEL' | 'MONUMENT' | 'CITY' | 'GHAT';
  latitude: number;
  longitude: number;
  distanceFromRouteKm: number;
  description?: string;
  elevationMeters?: number;
}

export interface SharedJourneyData {
  shareToken: string;
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  status: RunningStatus;
  delayMinutes: number;
  currentStationName?: string;
  nextStationName?: string;
  etaDestination?: string;
  progressPercentage: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  lastUpdatedAt: string;
  expiresAt?: string;
}

export interface ApiError {
  code: string;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
