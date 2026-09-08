/**
 * RailRadarProvider — Real-time Indian Railways data via RailRadar API
 * Base URL: https://api.railradar.in/v1
 * Auth:     Authorization: Bearer <RAILRADAR_API_KEY>
 *
 * Key endpoints:
 *   GET /v1/trains/:number          → schedule + all stations with coordinates
 *   GET /v1/trains/:number/live     → live status, current location, actual times
 */

import {
  Train,
  TrainSearchResult,
  LiveTrainStatus,
  JourneyStation,
  Station,
  RunningStatus,
} from '@railline/types';
import { TrainProvider } from './trainProvider';
import { env } from '../config/env';

const BASE_URL = 'https://api.railradar.in/v1';
const REQUEST_TIMEOUT_MS = 8000;

// ─── Raw API types ────────────────────────────────────────────────────────────

interface RRStation {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

interface RRRouteStop {
  sequence: number;
  station?: RRStation;
  stationCode?: string;
  stationName?: string;
  isHalt: boolean;
  platform?: string;
  arrival?: string;
  departure?: string;
  arrivalDay?: number;
  departureDay?: number;
  scheduledArrival?: string;
  scheduledDeparture?: string;
  actualArrival?: string;
  actualDeparture?: string;
  delayArrival?: number;
  delayDeparture?: number;
  status?: string;
  distance?: number;
  speedToNextStationKmph?: number;
}

interface RRTrainInfo {
  number: string;
  name: string;
  type: string;
  category?: string;
  source: { code: string; name: string; lat: number; lng: number };
  destination: { code: string; name: string; lat: number; lng: number };
  runDays: string[];
  distance: number;
  duration: number;
  totalHalts?: number;
}

interface RRScheduleResponse {
  success: boolean;
  data: {
    train: RRTrainInfo;
    route: RRRouteStop[];
  };
}

interface RRLiveResponse {
  success: boolean;
  data: {
    trainNumber: string;
    trainName: string;
    status: string;
    isLive: boolean;
    lastUpdatedAt: string;
    delayMinutes: number;
    currentLocation: {
      stationCode: string;
      stationName: string;
      sequence: number;
      status: string;
      isHalt: boolean;
      distanceFromOriginKm: number;
      segmentProgress: number;
      delayMinutes: number;
    };
    previousHalt: {
      stationCode: string;
      stationName: string;
      sequence: number;
      distance: number;
    };
    nextHalt: {
      stationCode: string;
      stationName: string;
      sequence: number;
      distance: number;
    };
    train: RRTrainInfo;
    route: RRRouteStop[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function rrFetch<T>(path: string, apiKey: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    const json = await res.json() as { success: boolean; data: unknown; error?: { message: string } };
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || `RailRadar HTTP ${res.status}`);
    }
    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

function isoToHHMM(iso?: string): string | undefined {
  if (!iso) return undefined;
  if (/^\d{1,2}:\d{2}$/.test(iso)) return iso;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return undefined;
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return undefined;
  }
}

function mapRunDays(runDays: string[]): string[] {
  const MAP: Record<string, string> = {
    mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu',
    fri: 'Fri', sat: 'Sat', sun: 'Sun',
  };
  return runDays.map(d => MAP[d] || d);
}

import { MockTrainProvider } from './mockTrainProvider';

// Popular trains for text-based fallback search
const POPULAR_TRAIN_NUMBERS = [
  '12951', '12952', '12002', '12001', '22436', '22435',
  '12004', '12003', '12626', '12625', '12301', '12302',
  '12259', '12260', '11019', '11020', '12027', '12028',
];

// ─── Provider ─────────────────────────────────────────────────────────────────

export class RailRadarProvider implements TrainProvider {
  private apiKey: string;
  private mockFallback = new MockTrainProvider();
  private scheduleCache = new Map<string, { data: RRScheduleResponse; expiresAt: number }>();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.RAILRADAR_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('RAILRADAR_API_KEY is not configured.');
    }
  }

  private async fetchSchedule(number: string): Promise<RRScheduleResponse> {
    const cached = this.scheduleCache.get(number);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const data = await rrFetch<RRScheduleResponse>(`/trains/${number}`, this.apiKey);
    // Cache schedule for 1 hour (timetables change rarely)
    this.scheduleCache.set(number, { data, expiresAt: Date.now() + 60 * 60 * 1000 });
    return data;
  }

  private scheduleToSearchResult(train: RRTrainInfo, route: RRRouteStop[]): TrainSearchResult {
    const haltStops = route.filter(r => r.isHalt);
    const firstStop = haltStops[0];
    const lastStop = haltStops[haltStops.length - 1];
    return {
      trainNumber: train.number,
      name: train.name,
      source: train.source.name,
      sourceCode: train.source.code,
      destination: train.destination.name,
      destinationCode: train.destination.code,
      departureTime: firstStop?.departure,
      arrivalTime: lastStop?.arrival,
      runningDays: mapRunDays(train.runDays),
      status: 'ON TIME',
      currentDelayMinutes: 0,
    };
  }

  async searchTrains(query: string): Promise<TrainSearchResult[]> {
    const q = query.trim();

    // Exact 5-digit number lookup — query live API first
    if (/^\d{5}$/.test(q)) {
      try {
        const resp = await this.fetchSchedule(q);
        return [this.scheduleToSearchResult(resp.data.train, resp.data.route)];
      } catch {
        // Fall back to mock if RailRadar lookup fails
        return this.mockFallback.searchTrains(q);
      }
    }

    // Text or partial query — combine mock search with popular cached trains
    const mockResults = await this.mockFallback.searchTrains(q);
    const foundNumbers = new Set(mockResults.map(r => r.trainNumber));

    // Also check if any candidate matches prefix
    if (/^\d{1,4}$/.test(q)) {
      const candidates = POPULAR_TRAIN_NUMBERS.filter(n => n.startsWith(q) && !foundNumbers.has(n));
      for (const num of candidates.slice(0, 3)) {
        try {
          const resp = await this.fetchSchedule(num);
          mockResults.push(this.scheduleToSearchResult(resp.data.train, resp.data.route));
          foundNumbers.add(num);
        } catch {
          // skip
        }
      }
    }

    return mockResults;
  }

  async getTrainDetails(trainNumber: string): Promise<Train | null> {
    try {
      const resp = await this.fetchSchedule(trainNumber);
      const { train, route } = resp.data;
      const haltStops = route.filter(r => r.isHalt);

      return {
        id: `train_${train.number}`,
        trainNumber: train.number,
        name: train.name,
        type: train.type,
        source: { code: train.source.code, name: train.source.name },
        destination: { code: train.destination.code, name: train.destination.name },
        totalDistanceKm: Math.round(train.distance),
        totalDurationMinutes: train.duration,
        operatingDays: mapRunDays(train.runDays),
        route: haltStops.map(stop => ({
          code: stop.station?.code || '',
          name: stop.station?.name || '',
          scheduledArrival: stop.arrival,
          scheduledDeparture: stop.departure,
        })),
      };
    } catch {
      return this.mockFallback.getTrainDetails(trainNumber);
    }
  }

  async getLiveStatus(trainNumber: string): Promise<LiveTrainStatus | null> {
    try {
      const [liveResp, schedResp] = await Promise.all([
        rrFetch<RRLiveResponse>(`/trains/${trainNumber}/live`, this.apiKey),
        this.fetchSchedule(trainNumber),
      ]);

      const d = liveResp.data;
      const delay = d.delayMinutes ?? 0;
      const runStatus: RunningStatus = delay > 5 ? 'DELAYED' : 'ON TIME';

      // Build schedule lookup by station code and sequence for coordinates
      const schedRoute = schedResp.data.route;
      const schedByCode = new Map<string, RRRouteStop>();
      const schedBySeq = new Map<number, RRRouteStop>();
      for (const stop of schedRoute) {
        if (stop.station) {
          schedByCode.set(stop.station.code, stop);
          schedBySeq.set(stop.sequence, stop);
        }
      }

      // Live halt stops
      const haltRoutes = d.route.filter((r) => r.isHalt);
      const nextHaltStop =
        haltRoutes.find((r) => r.stationCode === d.nextHalt?.stationCode) ||
        haltRoutes.find((r) => r.status === 'upcoming') ||
        haltRoutes[haltRoutes.length - 1];
      const prevHaltStop =
        haltRoutes.find((r) => r.stationCode === d.previousHalt?.stationCode) || haltRoutes[0];
      const lastHaltStop = haltRoutes[haltRoutes.length - 1];

      // Exact current location from RailRadar
      const currentLoc = d.currentLocation;
      const distanceCovered = currentLoc?.distanceFromOriginKm ?? d.previousHalt?.distance ?? 0;
      const totalDistance = Math.round(d.train.distance);
      const distanceRemaining = Math.max(0, totalDistance - distanceCovered);
      const progressPercentage =
        totalDistance > 0 ? Math.min(100, Math.round((distanceCovered / totalDistance) * 100)) : 0;

      // High-precision coordinates along the exact route track:
      let lat = d.train.source.lat;
      let lng = d.train.source.lng;
      let bearing = 0;
      let speedKmph = 85;

      if (currentLoc?.sequence) {
        const curStop = schedBySeq.get(currentLoc.sequence);
        const nextSeqStop = schedBySeq.get(currentLoc.sequence + 1) || curStop;

        if (curStop?.station && nextSeqStop?.station) {
          const segProgress = Math.max(0, Math.min(1, currentLoc.segmentProgress ?? 0));
          lat = curStop.station.lat + (nextSeqStop.station.lat - curStop.station.lat) * segProgress;
          lng = curStop.station.lng + (nextSeqStop.station.lng - curStop.station.lng) * segProgress;

          const dLat = nextSeqStop.station.lat - curStop.station.lat;
          const dLng = nextSeqStop.station.lng - curStop.station.lng;
          bearing = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;
          speedKmph = curStop.speedToNextStationKmph ? Math.round(curStop.speedToNextStationKmph) : 85;
        } else if (curStop?.station) {
          lat = curStop.station.lat;
          lng = curStop.station.lng;
        }
      }

      // Real-time current station description
      const isStoppedAtHalt = currentLoc?.status === 'at-station' && currentLoc.isHalt;
      const currentStationName = currentLoc?.stationName
        ? isStoppedAtHalt
          ? currentLoc.stationName
          : `${currentLoc.stationName} (Passed)`
        : prevHaltStop?.stationName || 'In Transit';

      const currentStationPlatform = isStoppedAtHalt
        ? haltRoutes.find((r) => r.stationCode === currentLoc?.stationCode)?.platform
        : undefined;

      const currentStationCode = currentLoc?.stationCode || prevHaltStop?.stationCode || '';
      const currentSchedStop = schedByCode.get(currentStationCode);

      return {
        trainNumber: d.trainNumber,
        trainName: d.trainName,
        status: runStatus,
        delayMinutes: delay,
        currentStation: {
          code: currentStationCode,
          name: currentStationName,
          platform: currentStationPlatform,
          scheduledArrival: isoToHHMM(currentSchedStop?.arrival),
          scheduledDeparture: isoToHHMM(currentSchedStop?.departure),
        },
        nextStation: {
          code: nextHaltStop?.stationCode || d.nextHalt?.stationCode || '',
          name: nextHaltStop?.stationName || d.nextHalt?.stationName || '',
          platform: nextHaltStop?.platform,
          scheduledArrival: isoToHHMM(nextHaltStop?.scheduledArrival),
          scheduledDeparture: isoToHHMM(nextHaltStop?.scheduledDeparture),
        },
        location: {
          lat: Number(lat.toFixed(5)),
          lng: Number(lng.toFixed(5)),
          bearing,
          speedKmph,
          isInterpolated: true,
        },
        progressPercentage,
        distanceCoveredKm: Math.round(distanceCovered),
        distanceRemainingKm: Math.round(distanceRemaining),
        etaNextStation: isoToHHMM(nextHaltStop?.actualArrival || nextHaltStop?.scheduledArrival),
        etaDestination: isoToHHMM(lastHaltStop?.actualArrival || lastHaltStop?.scheduledArrival),
        delayTrend: delay > 15 ? 'INCREASING' : delay > 5 ? 'STABLE' : 'DECREASING',
        lastUpdatedAt: d.lastUpdatedAt || new Date().toISOString(),
        isStale: false,
      };
    } catch (err) {
      console.error(`[RailRadar] getLiveStatus failed for ${trainNumber}:`, err);
      return this.mockFallback.getLiveStatus(trainNumber);
    }
  }

  async getRouteStations(trainNumber: string): Promise<JourneyStation[]> {
    try {
      const [liveResp, schedResp] = await Promise.all([
        rrFetch<RRLiveResponse>(`/trains/${trainNumber}/live`, this.apiKey),
        this.fetchSchedule(trainNumber),
      ]);

      const d = liveResp.data;
      const schedByCode = new Map<string, RRRouteStop>();
      for (const stop of schedResp.data.route) {
        if (stop.station) schedByCode.set(stop.station.code, stop);
      }

      const haltRoutes = d.route.filter((r) => r.isHalt);
      const currentSeq = d.currentLocation?.sequence || 0;

      return haltRoutes.map((stop) => {
        const sched = schedByCode.get(stop.stationCode || '');
        const stationObj: Station = {
          code: stop.stationCode || '',
          name: stop.stationName || '',
          latitude: sched?.station?.lat || 0,
          longitude: sched?.station?.lng || 0,
        };

        // Proper station status:
        // Completed if sequence is strictly before current train position
        // Current if it is the target next halt or train is stopped here
        // Upcoming for subsequent stations
        let status: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
        if (stop.status === 'departed' || (stop.sequence && stop.sequence < currentSeq)) {
          status = 'COMPLETED';
        } else if (stop.stationCode === d.nextHalt?.stationCode || stop.status === 'at-station') {
          status = 'CURRENT';
        } else {
          status = 'UPCOMING';
        }

        const delay = stop.delayArrival ?? stop.delayDeparture ?? d.delayMinutes ?? 0;

        return {
          station: stationObj,
          distanceFromSourceKm: Math.round(stop.distance || 0),
          scheduledArrival: isoToHHMM(stop.scheduledArrival) || sched?.arrival,
          scheduledDeparture: isoToHHMM(stop.scheduledDeparture) || sched?.departure,
          actualArrival: isoToHHMM(stop.actualArrival),
          actualDeparture: isoToHHMM(stop.actualDeparture),
          expectedArrival: stop.status === 'upcoming' ? isoToHHMM(stop.actualArrival) : undefined,
          expectedDeparture: stop.status === 'upcoming' ? isoToHHMM(stop.actualDeparture) : undefined,
          delayMinutes: delay,
          platform: stop.platform,
          status,
          isHalt: true,
        };
      });
    } catch (err) {
      console.error(`[RailRadar] getRouteStations failed for ${trainNumber}:`, err);
      return this.mockFallback.getRouteStations(trainNumber);
    }
  }

  async getRouteGeometry(trainNumber: string): Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null> {
    try {
      const [schedResp, liveResp] = await Promise.all([
        this.fetchSchedule(trainNumber),
        rrFetch<RRLiveResponse>(`/trains/${trainNumber}/live`, this.apiKey).catch(() => null),
      ]);

      const allStops = schedResp.data.route.filter((s) => s.station && s.station.lat && s.station.lng);
      const coords: [number, number][] = allStops.map((s) => [s.station!.lng, s.station!.lat]);

      // Split index according to exact train sequence
      let splitIdx = 0;
      const currentSeq = liveResp?.data?.currentLocation?.sequence;
      if (currentSeq) {
        const foundIdx = allStops.findIndex((s) => s.sequence >= currentSeq);
        if (foundIdx !== -1) {
          splitIdx = foundIdx;
        }
      }

      const completedCoords = coords.slice(0, Math.min(splitIdx + 2, coords.length));
      const remainingCoords = coords.slice(Math.max(0, splitIdx));

      const features: GeoJSON.Feature<GeoJSON.Geometry>[] = [
        {
          type: 'Feature',
          properties: { segment: 'completed', trainNumber },
          geometry: {
            type: 'LineString',
            coordinates: completedCoords.length >= 2 ? completedCoords : coords.slice(0, 2),
          },
        },
        {
          type: 'Feature',
          properties: { segment: 'remaining', trainNumber },
          geometry: {
            type: 'LineString',
            coordinates: remainingCoords.length >= 2 ? remainingCoords : coords,
          },
        },
      ];

      // Add halt station point features
      const liveHaltByCode = new Map<string, string>();
      if (liveResp?.data?.route) {
        for (const stop of liveResp.data.route) {
          if (stop.stationCode) liveHaltByCode.set(stop.stationCode, stop.status || 'upcoming');
        }
      }

      // Add station point features: both major halts and intermediate passing stations
      for (const stop of allStops) {
        const isHalt = Boolean(stop.isHalt);
        const ls = liveHaltByCode.get(stop.station!.code);
        const isNextHalt = stop.station!.code === liveResp?.data?.nextHalt?.stationCode;
        const isPast = stop.sequence && currentSeq ? stop.sequence < currentSeq : ls === 'departed';
        const mappedStatus = isPast ? 'COMPLETED' : isNextHalt ? 'CURRENT' : 'UPCOMING';

        features.push({
          type: 'Feature',
          properties: {
            code: stop.station!.code,
            name: stop.station!.name,
            isHalt,
            stationType: isHalt ? 'halt' : 'intermediate',
            status: mappedStatus,
            platform: stop.platform,
            isNextHalt,
          },
          geometry: { type: 'Point', coordinates: [stop.station!.lng, stop.station!.lat] },
        });
      }

      return { type: 'FeatureCollection', features };
    } catch (err) {
      console.error(`[RailRadar] getRouteGeometry failed for ${trainNumber}:`, err);
      return this.mockFallback.getRouteGeometry(trainNumber);
    }
  }
}

