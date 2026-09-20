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

const BASE_URL = 'https://railradar.in/api/v1';
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
    currentLocation?: {
      stationCode: string;
      stationName: string;
      sequence: number;
      status: string;
      isHalt: boolean;
      distanceFromOriginKm: number;
      segmentProgress?: number;
      delayMinutes?: number;
      platform?: string;
      scheduledArrival?: string;
      scheduledDeparture?: string;
      actualArrival?: string;
      actualDeparture?: string;
      speed?: number;
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
        'x-api-key': apiKey,
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
    return d.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
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
        const [schedResp, liveResp] = await Promise.all([
          this.fetchSchedule(q),
          rrFetch<RRLiveResponse>(`/trains/${q}/live`, this.apiKey).catch(() => null),
        ]);
        const result = this.scheduleToSearchResult(schedResp.data.train, schedResp.data.route);
        if (liveResp?.data) {
          const dMin = Math.round(liveResp.data.delayMinutes ?? 0);
          result.currentDelayMinutes = dMin;
          result.status = dMin > 5 ? 'DELAYED' : 'ON TIME';
        }
        return [result];
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

      // 1. Resolve authentic current location:
      let currentLoc = d.currentLocation;
      let currentSeq = currentLoc?.sequence || 0;

      // Sanity check: if currentLoc is origin or sequence <= 1, find latest departed station in route
      const departedStops = d.route.filter((r) => r.status === 'departed');
      if (departedStops.length > 0) {
        const lastDeparted = departedStops[departedStops.length - 1];
        if (lastDeparted.sequence > currentSeq) {
          currentLoc = {
            stationCode: lastDeparted.stationCode || '',
            stationName: lastDeparted.stationName || '',
            sequence: lastDeparted.sequence,
            status: 'departed',
            isHalt: lastDeparted.isHalt,
            distanceFromOriginKm: lastDeparted.distance || 0,
            segmentProgress: 0,
            delayMinutes: lastDeparted.delayDeparture ?? d.delayMinutes ?? 0,
            platform: lastDeparted.platform,
            actualArrival: lastDeparted.actualArrival,
            actualDeparture: lastDeparted.actualDeparture,
          };
          currentSeq = lastDeparted.sequence;
        }
      }

      // Halts only
      const haltRoutes = d.route.filter((r) => r.isHalt);
      const prevHaltStop =
        haltRoutes.slice().reverse().find((r) => r.sequence <= currentSeq) || haltRoutes[0];
      const nextHaltStop =
        haltRoutes.find((r) => r.sequence > currentSeq) || haltRoutes[haltRoutes.length - 1];
      const lastHaltStop = haltRoutes[haltRoutes.length - 1];

      // Immediate next station on track (halt or intermediate passing station):
      const nextImmediateStop =
        d.route.find((r) => r.sequence > currentSeq) || nextHaltStop;

      // Distance covered and total
      const distanceCovered = currentLoc?.distanceFromOriginKm ?? prevHaltStop?.distance ?? 0;
      const totalDistance = Math.round(d.train.distance);
      const distanceRemaining = Math.max(0, totalDistance - distanceCovered);
      const progressPercentage =
        totalDistance > 0 ? Math.min(100, Math.round((distanceCovered / totalDistance) * 100)) : 0;

      // Coordinates
      let lat = d.train.source.lat;
      let lng = d.train.source.lng;
      let bearing = 0;

      const locSpeed = (currentLoc as any)?.speed;
      const isStopped =
        currentLoc?.status === 'at-station' ||
        d.status === 'at-station' ||
        d.status === 'completed' ||
        d.status === 'arrived' ||
        locSpeed === 0;

      let speedKmph = 0;
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

          if (!isStopped) {
            speedKmph =
              typeof locSpeed === 'number' && locSpeed > 0
                ? Math.round(locSpeed)
                : curStop.speedToNextStationKmph
                ? Math.round(curStop.speedToNextStationKmph)
                : 75;
          }
        } else if (curStop?.station) {
          lat = curStop.station.lat;
          lng = curStop.station.lng;
        }
      }

      // Station clean names and details:
      const isAtStation = currentLoc?.status === 'at-station' || d.status === 'at-station' || isStopped;
      const currentStationCode = currentLoc?.stationCode || prevHaltStop?.stationCode || '';
      const currentStationName = currentLoc?.stationName || prevHaltStop?.stationName || 'In Transit';
      const currentSchedStop = schedByCode.get(currentStationCode);

      const nextStationCode = nextImmediateStop?.stationCode || nextHaltStop?.stationCode || '';
      const nextStationName = nextImmediateStop?.stationName || nextHaltStop?.stationName || 'Next Station';
      const nextSchedStop = schedByCode.get(nextStationCode);

      const nextHaltCode = nextHaltStop?.stationCode || '';
      const nextHaltName = nextHaltStop?.stationName || '';
      const nextHaltSchedStop = schedByCode.get(nextHaltCode);

      const etaNext = isoToHHMM(nextImmediateStop?.actualArrival || nextImmediateStop?.scheduledArrival || nextSchedStop?.arrival);
      const etaHalt = isoToHHMM(nextHaltStop?.actualArrival || nextHaltStop?.scheduledArrival || nextHaltSchedStop?.arrival);
      const etaDest = isoToHHMM(lastHaltStop?.actualArrival || lastHaltStop?.scheduledArrival);

      return {
        trainNumber: d.trainNumber,
        trainName: d.trainName,
        status: runStatus,
        delayMinutes: delay,
        currentStation: {
          code: currentStationCode,
          name: currentStationName,
          platform: currentLoc?.platform || (isAtStation ? haltRoutes.find((r) => r.stationCode === currentStationCode)?.platform : undefined),
          scheduledArrival: isoToHHMM(currentSchedStop?.arrival),
          scheduledDeparture: isoToHHMM(currentSchedStop?.departure),
          actualArrival: isoToHHMM(currentLoc?.actualArrival),
          actualDeparture: isoToHHMM(currentLoc?.actualDeparture),
          stationStatus: isAtStation ? 'at-station' : 'departed',
          distanceKm: currentLoc?.distanceFromOriginKm,
          isHalt: currentLoc?.isHalt ?? false,
        },
        nextStation: {
          code: nextStationCode,
          name: nextStationName,
          platform: nextImmediateStop?.platform,
          scheduledArrival: isoToHHMM(nextImmediateStop?.scheduledArrival || nextSchedStop?.arrival),
          scheduledDeparture: isoToHHMM(nextImmediateStop?.scheduledDeparture || nextSchedStop?.departure),
          actualArrival: isoToHHMM(nextImmediateStop?.actualArrival),
          actualDeparture: isoToHHMM(nextImmediateStop?.actualDeparture),
          stationStatus: 'approaching',
          distanceKm: nextImmediateStop?.distance,
          isHalt: nextImmediateStop?.isHalt ?? false,
        },
        nextHalt: {
          code: nextHaltCode,
          name: nextHaltName,
          platform: nextHaltStop?.platform,
          scheduledArrival: isoToHHMM(nextHaltStop?.scheduledArrival || nextHaltSchedStop?.arrival),
          scheduledDeparture: isoToHHMM(nextHaltStop?.scheduledDeparture || nextHaltSchedStop?.departure),
          actualArrival: isoToHHMM(nextHaltStop?.actualArrival),
          actualDeparture: isoToHHMM(nextHaltStop?.actualDeparture),
          distanceKm: nextHaltStop?.distance,
          isHalt: true,
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
        etaNextStation: etaNext || etaHalt,
        etaDestination: etaDest,
        delayTrend: delay > 15 ? 'INCREASING' : delay > 5 ? 'STABLE' : 'DECREASING',
        lastUpdatedAt: d.lastUpdatedAt || new Date().toISOString(),
        isStale: false,
        operatingDays: mapRunDays(d.train?.runDays || schedResp.data.train?.runDays || []),
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

      let currentLoc = d.currentLocation;
      let currentSeq = currentLoc?.sequence || 0;

      // Sanity check for furthest departed station
      const departedStops = d.route.filter((r) => r.status === 'departed');
      if (departedStops.length > 0) {
        const lastDeparted = departedStops[departedStops.length - 1];
        if (lastDeparted.sequence > currentSeq) {
          currentSeq = lastDeparted.sequence;
          currentLoc = {
            stationCode: lastDeparted.stationCode || '',
            stationName: lastDeparted.stationName || '',
            sequence: lastDeparted.sequence,
            status: 'departed',
            isHalt: lastDeparted.isHalt,
            distanceFromOriginKm: lastDeparted.distance || 0,
            delayMinutes: lastDeparted.delayDeparture ?? d.delayMinutes ?? 0,
            platform: lastDeparted.platform,
            actualArrival: lastDeparted.actualArrival,
            actualDeparture: lastDeparted.actualDeparture,
          };
        }
      }

      const haltRoutes = d.route.filter((r) => r.isHalt);
      const isCurrentInHalts = haltRoutes.some((r) => r.stationCode === currentLoc?.stationCode);

      // Combine halt stops with current live location if it's an intermediate station
      const combinedStops: any[] = [...haltRoutes];
      if (!isCurrentInHalts && currentLoc?.stationCode) {
        combinedStops.push({
          sequence: currentLoc.sequence,
          stationCode: currentLoc.stationCode,
          stationName: currentLoc.stationName,
          isHalt: false,
          status: 'at-station',
          distance: currentLoc.distanceFromOriginKm,
          delayArrival: currentLoc.delayMinutes,
          delayDeparture: currentLoc.delayMinutes,
          scheduledArrival: currentLoc.scheduledArrival,
          scheduledDeparture: currentLoc.scheduledDeparture,
          actualArrival: currentLoc.actualArrival,
          actualDeparture: currentLoc.actualDeparture,
          platform: currentLoc.platform,
        });
      }

      // Sort by sequence along route
      combinedStops.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
      const allSchedRoute = schedResp.data.route || [];

      return combinedStops.map((stop, i) => {
        const sched = schedByCode.get(stop.stationCode || '');
        const stationObj: Station = {
          code: stop.stationCode || '',
          name: stop.stationName || '',
          latitude: sched?.station?.lat || 0,
          longitude: sched?.station?.lng || 0,
        };

        let status: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
        if (stop.stationCode === currentLoc?.stationCode) {
          status = 'CURRENT';
        } else if (stop.status === 'departed' || (stop.sequence && stop.sequence < currentSeq)) {
          status = 'COMPLETED';
        } else {
          status = 'UPCOMING';
        }

        const delay = stop.delayArrival ?? stop.delayDeparture ?? d.delayMinutes ?? 0;

        // Collect smaller intermediate non-stop stations between this halt and next halt
        const nextStop = combinedStops[i + 1];
        const nextSeq = nextStop?.sequence ?? Infinity;
        const curSeq = stop.sequence ?? 0;

        const intermediateStations = allSchedRoute
          .filter((r) => !r.isHalt && r.sequence > curSeq && r.sequence < nextSeq)
          .map((r) => ({
            code: r.station?.code || r.stationCode || '',
            name: r.station?.name || r.stationName || '',
            distanceKm: Math.round(r.distance || 0),
          }))
          .filter((r) => r.code && r.name);

        return {
          station: stationObj,
          distanceFromSourceKm: Math.round(stop.distance || 0),
          scheduledArrival: isoToHHMM(stop.scheduledArrival) || sched?.arrival,
          scheduledDeparture: isoToHHMM(stop.scheduledDeparture) || sched?.departure,
          actualArrival: isoToHHMM(stop.actualArrival),
          actualDeparture: isoToHHMM(stop.actualDeparture),
          expectedArrival: status === 'UPCOMING' ? isoToHHMM(stop.actualArrival) : undefined,
          expectedDeparture: status === 'UPCOMING' ? isoToHHMM(stop.actualDeparture) : undefined,
          delayMinutes: delay,
          platform: stop.platform,
          status,
          isHalt: stop.isHalt ?? true,
          intermediateStations: intermediateStations.length > 0 ? intermediateStations : undefined,
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
            distance: Math.round(stop.distance || 0),
            sequence: stop.sequence,
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

