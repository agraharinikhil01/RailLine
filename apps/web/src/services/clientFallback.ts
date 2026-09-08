import {
  Train,
  TrainSearchResult,
  JourneyStation,
  Station,
  RouteWeather,
  GeographicPlace,
} from '@railline/types';

interface TrainRouteData {
  train: Train;
  stations: JourneyStation[];
  routeCoordinates: [number, number][];
}

const STATIONS_MAP: Record<string, Station> = {
  MMCT: { code: 'MMCT', name: 'Mumbai Central', latitude: 18.9696, longitude: 72.8193, state: 'Maharashtra' },
  BVI: { code: 'BVI', name: 'Borivali', latitude: 19.2294, longitude: 72.8573, state: 'Maharashtra' },
  ST: { code: 'ST', name: 'Surat', latitude: 21.2049, longitude: 72.8407, state: 'Gujarat' },
  BRC: { code: 'BRC', name: 'Vadodara Junction', latitude: 22.3107, longitude: 73.1812, state: 'Gujarat' },
  RTM: { code: 'RTM', name: 'Ratlam Junction', latitude: 23.3441, longitude: 75.0371, state: 'Madhya Pradesh' },
  KOTA: { code: 'KOTA', name: 'Kota Junction', latitude: 25.2138, longitude: 75.8648, state: 'Rajasthan' },
  SWM: { code: 'SWM', name: 'Sawai Madhopur Junction', latitude: 25.9928, longitude: 76.3686, state: 'Rajasthan' },
  BTE: { code: 'BTE', name: 'Bharatpur Junction', latitude: 27.2343, longitude: 77.4988, state: 'Rajasthan' },
  MTJ: { code: 'MTJ', name: 'Mathura Junction', latitude: 27.4924, longitude: 77.6737, state: 'Uttar Pradesh' },
  NDLS: { code: 'NDLS', name: 'New Delhi', latitude: 28.6429, longitude: 77.2195, state: 'Delhi' },
  GZB: { code: 'GZB', name: 'Ghaziabad Junction', latitude: 28.6678, longitude: 77.4338, state: 'Uttar Pradesh' },
  ALJN: { code: 'ALJN', name: 'Aligarh Junction', latitude: 27.8974, longitude: 78.0880, state: 'Uttar Pradesh' },
  TDL: { code: 'TDL', name: 'Tundla Junction', latitude: 27.2069, longitude: 78.2435, state: 'Uttar Pradesh' },
  ETW: { code: 'ETW', name: 'Etawah Junction', latitude: 26.7768, longitude: 79.0232, state: 'Uttar Pradesh' },
  CNB: { code: 'CNB', name: 'Kanpur Central', latitude: 26.4547, longitude: 80.3507, state: 'Uttar Pradesh' },
  LJN: { code: 'LJN', name: 'Lucknow Junction', latitude: 26.8322, longitude: 80.9218, state: 'Uttar Pradesh' },
  PRYJ: { code: 'PRYJ', name: 'Prayagraj Junction', latitude: 25.4358, longitude: 81.8463, state: 'Uttar Pradesh' },
  BSB: { code: 'BSB', name: 'Varanasi Junction', latitude: 25.3283, longitude: 82.9868, state: 'Uttar Pradesh' },
  AGC: { code: 'AGC', name: 'Agra Cantt', latitude: 27.1593, longitude: 78.0062, state: 'Uttar Pradesh' },
  GWL: { code: 'GWL', name: 'Gwalior Junction', latitude: 26.2163, longitude: 78.1882, state: 'Madhya Pradesh' },
  VGLJ: { code: 'VGLJ', name: 'VGL Jhansi Junction', latitude: 25.4484, longitude: 78.5685, state: 'Uttar Pradesh' },
  BPL: { code: 'BPL', name: 'Bhopal Junction', latitude: 23.2662, longitude: 77.4143, state: 'Madhya Pradesh' },
  RKMP: { code: 'RKMP', name: 'Rani Kamlapati', latitude: 23.2167, longitude: 77.4419, state: 'Madhya Pradesh' },
  NGP: { code: 'NGP', name: 'Nagpur Junction', latitude: 21.1524, longitude: 79.0888, state: 'Maharashtra' },
  BZA: { code: 'BZA', name: 'Vijayawada Junction', latitude: 16.5173, longitude: 80.6200, state: 'Andhra Pradesh' },
  TVC: { code: 'TVC', name: 'Thiruvananthapuram Central', latitude: 8.4875, longitude: 76.9525, state: 'Kerala' },
};

const TRAINS_DATABASE: Record<string, TrainRouteData> = {
  '12951': {
    train: {
      id: 'train_12951',
      trainNumber: '12951',
      name: 'Mumbai Rajdhani Express',
      type: 'Rajdhani Express',
      source: { code: 'MMCT', name: 'Mumbai Central' },
      destination: { code: 'NDLS', name: 'New Delhi' },
      totalDistanceKm: 1386,
      totalDurationMinutes: 935,
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      route: [
        { code: 'MMCT', name: 'Mumbai Central', scheduledDeparture: '17:00' },
        { code: 'BVI', name: 'Borivali', scheduledArrival: '17:22', scheduledDeparture: '17:24' },
        { code: 'ST', name: 'Surat', scheduledArrival: '19:43', scheduledDeparture: '19:48' },
        { code: 'BRC', name: 'Vadodara Junction', scheduledArrival: '21:06', scheduledDeparture: '21:16' },
        { code: 'RTM', name: 'Ratlam Junction', scheduledArrival: '00:25', scheduledDeparture: '00:28' },
        { code: 'KOTA', name: 'Kota Junction', scheduledArrival: '03:15', scheduledDeparture: '03:20' },
        { code: 'NDLS', name: 'New Delhi', scheduledArrival: '08:32' },
      ],
    },
    stations: [
      {
        station: STATIONS_MAP.MMCT,
        distanceFromSourceKm: 0,
        scheduledDeparture: '17:00',
        actualDeparture: '17:02',
        delayMinutes: 2,
        platform: '1',
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.BVI,
        distanceFromSourceKm: 30,
        scheduledArrival: '17:22',
        scheduledDeparture: '17:24',
        actualArrival: '17:25',
        actualDeparture: '17:27',
        delayMinutes: 3,
        platform: '6',
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.ST,
        distanceFromSourceKm: 263,
        scheduledArrival: '19:43',
        scheduledDeparture: '19:48',
        actualArrival: '19:50',
        actualDeparture: '19:55',
        delayMinutes: 7,
        platform: '1',
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.BRC,
        distanceFromSourceKm: 392,
        scheduledArrival: '21:06',
        scheduledDeparture: '21:16',
        actualArrival: '21:15',
        actualDeparture: '21:26',
        delayMinutes: 10,
        platform: '2',
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.RTM,
        distanceFromSourceKm: 653,
        scheduledArrival: '00:25',
        scheduledDeparture: '00:28',
        expectedArrival: '00:43',
        expectedDeparture: '00:46',
        delayMinutes: 18,
        platform: '5',
        status: 'CURRENT',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.KOTA,
        distanceFromSourceKm: 920,
        scheduledArrival: '03:15',
        scheduledDeparture: '03:20',
        expectedArrival: '03:31',
        expectedDeparture: '03:36',
        delayMinutes: 16,
        platform: '1',
        status: 'UPCOMING',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.NDLS,
        distanceFromSourceKm: 1386,
        scheduledArrival: '08:32',
        expectedArrival: '08:45',
        delayMinutes: 13,
        platform: '3',
        status: 'UPCOMING',
        isHalt: true,
      },
    ],
    routeCoordinates: [
      [72.8193, 18.9696],
      [72.8573, 19.2294],
      [72.8407, 21.2049],
      [73.1812, 22.3107],
      [74.2000, 22.8000],
      [75.0371, 23.3441],
      [75.4000, 24.3000],
      [75.8648, 25.2138],
      [76.3686, 25.9928],
      [77.4988, 27.2343],
      [77.6737, 27.4924],
      [77.2195, 28.6429],
    ],
  },
  '12004': {
    train: {
      id: 'train_12004',
      trainNumber: '12004',
      name: 'Lucknow Shatabdi Express',
      type: 'Shatabdi Express',
      source: { code: 'NDLS', name: 'New Delhi' },
      destination: { code: 'LJN', name: 'Lucknow Junction' },
      totalDistanceKm: 512,
      totalDurationMinutes: 395,
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      route: [
        { code: 'NDLS', name: 'New Delhi', scheduledDeparture: '06:10' },
        { code: 'GZB', name: 'Ghaziabad Junction', scheduledArrival: '06:48', scheduledDeparture: '06:50' },
        { code: 'ALJN', name: 'Aligarh Junction', scheduledArrival: '07:47', scheduledDeparture: '07:49' },
        { code: 'TDL', name: 'Tundla Junction', scheduledArrival: '08:45', scheduledDeparture: '08:47' },
        { code: 'ETW', name: 'Etawah Junction', scheduledArrival: '09:40', scheduledDeparture: '09:42' },
        { code: 'CNB', name: 'Kanpur Central', scheduledArrival: '11:20', scheduledDeparture: '11:25' },
        { code: 'LJN', name: 'Lucknow Junction', scheduledArrival: '12:45' },
      ],
    },
    stations: [
      {
        station: STATIONS_MAP.NDLS,
        distanceFromSourceKm: 0,
        scheduledDeparture: '06:10',
        actualDeparture: '06:12',
        delayMinutes: 2,
        platform: '1',
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.GZB,
        distanceFromSourceKm: 26,
        scheduledArrival: '06:48',
        scheduledDeparture: '06:50',
        actualArrival: '06:51',
        actualDeparture: '06:53',
        delayMinutes: 3,
        platform: '2',
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.ALJN,
        distanceFromSourceKm: 131,
        scheduledArrival: '07:47',
        scheduledDeparture: '07:49',
        actualArrival: '07:52',
        actualDeparture: '07:54',
        delayMinutes: 5,
        platform: '3',
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.TDL,
        distanceFromSourceKm: 209,
        scheduledArrival: '08:45',
        scheduledDeparture: '08:47',
        actualArrival: '08:52',
        actualDeparture: '08:55',
        delayMinutes: 8,
        platform: '5',
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.ETW,
        distanceFromSourceKm: 301,
        scheduledArrival: '09:40',
        scheduledDeparture: '09:42',
        actualArrival: '09:50',
        actualDeparture: '09:52',
        delayMinutes: 10,
        platform: '3',
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.CNB,
        distanceFromSourceKm: 440,
        scheduledArrival: '11:20',
        scheduledDeparture: '11:25',
        actualArrival: '11:32',
        delayMinutes: 12,
        platform: '1',
        status: 'CURRENT',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.LJN,
        distanceFromSourceKm: 512,
        scheduledArrival: '12:45',
        delayMinutes: 12,
        platform: '6',
        status: 'UPCOMING',
        isHalt: true,
      },
    ],
    routeCoordinates: [
      [77.2195, 28.6429],
      [77.4338, 28.6678],
      [78.0880, 27.8974],
      [78.2435, 27.2069],
      [79.0232, 26.7768],
      [80.3507, 26.4547],
      [80.9218, 26.8322],
    ],
  },
  '22436': {
    train: {
      id: 'train_22436',
      trainNumber: '22436',
      name: 'Vande Bharat Express',
      type: 'Vande Bharat Express',
      source: { code: 'NDLS', name: 'New Delhi' },
      destination: { code: 'BSB', name: 'Varanasi Junction' },
      totalDistanceKm: 759,
      totalDurationMinutes: 480,
      operatingDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
      route: [
        { code: 'NDLS', name: 'New Delhi', scheduledDeparture: '06:00' },
        { code: 'CNB', name: 'Kanpur Central', scheduledArrival: '10:08', scheduledDeparture: '10:10' },
        { code: 'PRYJ', name: 'Prayagraj Junction', scheduledArrival: '12:08', scheduledDeparture: '12:10' },
        { code: 'BSB', name: 'Varanasi Junction', scheduledArrival: '14:00' },
      ],
    },
    stations: [
      {
        station: STATIONS_MAP.NDLS,
        distanceFromSourceKm: 0,
        scheduledDeparture: '06:00',
        actualDeparture: '06:00',
        delayMinutes: 0,
        platform: '16',
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.CNB,
        distanceFromSourceKm: 440,
        scheduledArrival: '10:08',
        scheduledDeparture: '10:10',
        actualArrival: '10:10',
        actualDeparture: '10:12',
        delayMinutes: 2,
        platform: '1',
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.PRYJ,
        distanceFromSourceKm: 635,
        scheduledArrival: '12:08',
        scheduledDeparture: '12:10',
        delayMinutes: 4,
        platform: '6',
        status: 'CURRENT',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.BSB,
        distanceFromSourceKm: 759,
        scheduledArrival: '14:00',
        delayMinutes: 4,
        platform: '1',
        status: 'UPCOMING',
        isHalt: true,
      },
    ],
    routeCoordinates: [
      [77.2195, 28.6429],
      [78.0880, 27.8974],
      [80.3507, 26.4547],
      [81.8463, 25.4358],
      [82.9868, 25.3283],
    ],
  },
};

// Also support 12002 and 12626
TRAINS_DATABASE['12002'] = {
  train: {
    id: 'train_12002',
    trainNumber: '12002',
    name: 'New Delhi - Bhopal Shatabdi Express',
    type: 'Shatabdi Express',
    source: { code: 'NDLS', name: 'New Delhi' },
    destination: { code: 'RKMP', name: 'Rani Kamlapati' },
    totalDistanceKm: 708,
    totalDurationMinutes: 510,
    operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    route: [
      { code: 'NDLS', name: 'New Delhi', scheduledDeparture: '06:00' },
      { code: 'MTJ', name: 'Mathura Junction', scheduledArrival: '07:19', scheduledDeparture: '07:20' },
      { code: 'AGC', name: 'Agra Cantt', scheduledArrival: '07:50', scheduledDeparture: '07:55' },
      { code: 'GWL', name: 'Gwalior Junction', scheduledArrival: '09:23', scheduledDeparture: '09:28' },
      { code: 'VGLJ', name: 'VGL Jhansi Junction', scheduledArrival: '10:45', scheduledDeparture: '10:53' },
      { code: 'BPL', name: 'Bhopal Junction', scheduledArrival: '14:07', scheduledDeparture: '14:12' },
      { code: 'RKMP', name: 'Rani Kamlapati', scheduledArrival: '14:30' },
    ],
  },
  stations: [
    { station: STATIONS_MAP.NDLS, distanceFromSourceKm: 0, scheduledDeparture: '06:00', actualDeparture: '06:00', platform: '1', delayMinutes: 0, status: 'COMPLETED', isHalt: true },
    { station: STATIONS_MAP.MTJ, distanceFromSourceKm: 141, scheduledArrival: '07:19', scheduledDeparture: '07:20', actualArrival: '07:22', actualDeparture: '07:24', platform: '1', delayMinutes: 4, status: 'COMPLETED', isHalt: true },
    { station: STATIONS_MAP.AGC, distanceFromSourceKm: 195, scheduledArrival: '07:50', scheduledDeparture: '07:55', actualArrival: '07:58', actualDeparture: '08:02', platform: '1', delayMinutes: 7, status: 'COMPLETED', isHalt: true },
    { station: STATIONS_MAP.GWL, distanceFromSourceKm: 313, scheduledArrival: '09:23', scheduledDeparture: '09:28', platform: '1', delayMinutes: 5, status: 'CURRENT', isHalt: true },
    { station: STATIONS_MAP.VGLJ, distanceFromSourceKm: 410, scheduledArrival: '10:45', scheduledDeparture: '10:53', platform: '2', delayMinutes: 8, status: 'UPCOMING', isHalt: true },
    { station: STATIONS_MAP.BPL, distanceFromSourceKm: 702, scheduledArrival: '14:07', scheduledDeparture: '14:12', platform: '1', delayMinutes: 10, status: 'UPCOMING', isHalt: true },
    { station: STATIONS_MAP.RKMP, distanceFromSourceKm: 708, scheduledArrival: '14:30', platform: '1', delayMinutes: 10, status: 'UPCOMING', isHalt: true },
  ],
  routeCoordinates: [
    [77.2195, 28.6429],
    [77.6737, 27.4924],
    [78.0062, 27.1593],
    [78.1882, 26.2163],
    [78.5685, 25.4484],
    [77.4143, 23.2662],
    [77.4419, 23.2167],
  ],
};

// Client-side Direct RailRadar fetch helper (with fallback to TRAINS_DATABASE)
const RAILRADAR_KEY = 'rg_ff60afba90bf47d3bcb6c39f7920d3e0';

async function fetchFromRailRadarDirect(endpoint: string) {
  try {
    const res = await fetch(`https://api.railradar.in/v1${endpoint}`, {
      headers: {
        Authorization: `Bearer ${RAILRADAR_KEY}`,
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return null;
}

export async function clientFallbackHandler<T>(endpoint: string): Promise<T> {
  const clean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const parts = clean.split('?')[0].split('/');

  // 1. Search: trains/search?q=...
  if (parts[0] === 'trains' && parts[1] === 'search') {
    const query = new URLSearchParams(endpoint.split('?')[1] || '').get('q')?.toLowerCase() || '';
    const results: TrainSearchResult[] = Object.values(TRAINS_DATABASE)
      .filter(
        (td) =>
          td.train.trainNumber.includes(query) ||
          td.train.name.toLowerCase().includes(query) ||
          td.train.source.name.toLowerCase().includes(query) ||
          td.train.destination.name.toLowerCase().includes(query)
      )
      .map((td) => ({
        trainNumber: td.train.trainNumber,
        name: td.train.name,
        source: td.train.source.name,
        sourceCode: td.train.source.code,
        destination: td.train.destination.name,
        destinationCode: td.train.destination.code,
        status: 'ON TIME' as const,
        currentDelayMinutes: 0,
      }));

    if (results.length === 0 && query.length >= 3) {
      // Try direct RailRadar search
      const rr = await fetchFromRailRadarDirect(`/trains?q=${encodeURIComponent(query)}`);
      if (rr?.data && Array.isArray(rr.data)) {
        return rr.data.map((t: any) => ({
          trainNumber: t.trainNumber,
          name: t.trainName,
          source: t.source?.stationName || '',
          sourceCode: t.source?.stationCode || '',
          destination: t.destination?.stationName || '',
          destinationCode: t.destination?.stationCode || '',
          status: 'ON TIME' as const,
          currentDelayMinutes: 0,
        })) as unknown as T;
      }
    }
    return results as unknown as T;
  }

  // Train specific endpoints
  const trainNumber = parts[1] || '12951';
  const sub = parts[2];
  const dbData = TRAINS_DATABASE[trainNumber] || TRAINS_DATABASE['12951'];

  // 2. Train Details: trains/:trainNumber
  if (parts[0] === 'trains' && parts.length === 2) {
    return dbData.train as unknown as T;
  }

  // 3. Live Status: trains/:trainNumber/live
  if (parts[0] === 'trains' && sub === 'live') {
    // Try live fetch from RailRadar directly
    const rrLive = await fetchFromRailRadarDirect(`/trains/${trainNumber}/live`);
    if (rrLive?.data) {
      const d = rrLive.data;
      const currentLoc = d.currentLocation;
      const delay = Math.round(d.delay || 0);

      const lat = currentLoc?.lat || 23.3441;
      const lng = currentLoc?.lng || 75.0371;

      return {
        trainNumber: d.trainNumber,
        trainName: d.trainName,
        status: d.status === 'running' ? 'ON TIME' : 'DELAYED',
        delayMinutes: delay,
        currentStation: {
          code: currentLoc?.stationCode || 'RTM',
          name: currentLoc?.stationName ? `${currentLoc.stationName} (Passed)` : 'Ratlam Jn (Passed)',
        },
        nextStation: {
          code: d.nextHalt?.stationCode || 'RTM',
          name: d.nextHalt?.stationName || 'Ratlam Jn',
          platform: '5',
          scheduledArrival: '00:25',
        },
        location: {
          lat,
          lng,
          bearing: 42,
          speedKmph: currentLoc?.speed || 83,
          isInterpolated: true,
        },
        progressPercentage: Math.min(100, Math.round(((d.currentLocation?.distanceFromOriginKm || 650) / 1386) * 100)),
        distanceCoveredKm: Math.round(d.currentLocation?.distanceFromOriginKm || 650),
        distanceRemainingKm: Math.max(0, 1386 - Math.round(d.currentLocation?.distanceFromOriginKm || 650)),
        etaNextStation: '00:43',
        etaDestination: '08:45',
        delayTrend: 'STABLE',
        lastUpdatedAt: new Date().toISOString(),
        isStale: false,
      } as unknown as T;
    }

    // Database fallback
    return {
      trainNumber: dbData.train.trainNumber,
      trainName: dbData.train.name,
      status: 'ON TIME' as const,
      delayMinutes: 18,
      currentStation: {
        code: 'RTM',
        name: 'Ratlam Junction (Passed)',
      },
      nextStation: {
        code: 'RTM',
        name: 'Ratlam Junction',
        platform: '5',
        scheduledArrival: '00:25',
      },
      location: {
        lat: 23.3441,
        lng: 75.0371,
        bearing: 38,
        speedKmph: 85,
        isInterpolated: true,
      },
      progressPercentage: 47,
      distanceCoveredKm: 653,
      distanceRemainingKm: 733,
      etaNextStation: '00:43',
      etaDestination: '08:45',
      delayTrend: 'STABLE',
      lastUpdatedAt: new Date().toISOString(),
      isStale: false,
    } as unknown as T;
  }

  // 4. Route Geometry: trains/:trainNumber/route
  if (parts[0] === 'trains' && sub === 'route') {
    const coords = dbData.routeCoordinates;
    const splitIdx = Math.floor(coords.length * 0.45);
    const completedCoords = coords.slice(0, splitIdx + 2);
    const remainingCoords = coords.slice(splitIdx);

    const features: any[] = [
      {
        type: 'Feature',
        properties: { segment: 'completed', trainNumber },
        geometry: { type: 'LineString', coordinates: completedCoords },
      },
      {
        type: 'Feature',
        properties: { segment: 'remaining', trainNumber },
        geometry: { type: 'LineString', coordinates: remainingCoords },
      },
    ];

    // Add stations as points (both halts and intermediate dots)
    dbData.stations.forEach((st, idx) => {
      features.push({
        type: 'Feature',
        properties: {
          code: st.station.code,
          name: st.station.name,
          isHalt: true,
          stationType: 'halt',
          status: st.status,
          platform: st.platform,
        },
        geometry: {
          type: 'Point',
          coordinates: [st.station.longitude, st.station.latitude],
        },
      });

      // Add intermediate waypoint dots between halts
      if (idx < dbData.stations.length - 1) {
        const nextSt = dbData.stations[idx + 1];
        const midLng = (st.station.longitude + nextSt.station.longitude) / 2;
        const midLat = (st.station.latitude + nextSt.station.latitude) / 2;
        features.push({
          type: 'Feature',
          properties: {
            code: `${st.station.code}-W`,
            name: `${st.station.name} Wayside`,
            isHalt: false,
            stationType: 'intermediate',
            status: st.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          },
          geometry: {
            type: 'Point',
            coordinates: [midLng, midLat],
          },
        });
      }
    });

    return { type: 'FeatureCollection', features } as unknown as T;
  }

  // 5. Timeline: trains/:trainNumber/timeline
  if (parts[0] === 'trains' && sub === 'timeline') {
    return dbData.stations as unknown as T;
  }

  // 6. Elevation: trains/:trainNumber/elevation
  if (parts[0] === 'trains' && sub === 'elevation') {
    return {
      profile: [
        { distanceKm: 0, elevationMeters: 14, stationCode: 'MMCT', stationName: 'Mumbai Central' },
        { distanceKm: 30, elevationMeters: 18, stationCode: 'BVI', stationName: 'Borivali' },
        { distanceKm: 263, elevationMeters: 13, stationCode: 'ST', stationName: 'Surat' },
        { distanceKm: 392, elevationMeters: 36, stationCode: 'BRC', stationName: 'Vadodara Junction' },
        { distanceKm: 653, elevationMeters: 493, stationCode: 'RTM', stationName: 'Ratlam Junction' },
        { distanceKm: 920, elevationMeters: 271, stationCode: 'KOTA', stationName: 'Kota Junction' },
        { distanceKm: 1386, elevationMeters: 216, stationCode: 'NDLS', stationName: 'New Delhi' },
      ],
      currentElevationMeters: 493,
      highestElevationMeters: 512,
      lowestElevationMeters: 13,
      elevationGainMeters: 499,
    } as unknown as T;
  }

  // 7. Delays: trains/:trainNumber/delays
  if (parts[0] === 'trains' && sub === 'delays') {
    return dbData.stations.map((s) => ({
      stationCode: s.station.code,
      stationName: s.station.name,
      scheduledTime: s.scheduledArrival || s.scheduledDeparture || '00:00',
      actualTime: s.actualArrival || s.actualDeparture || s.scheduledArrival || '00:00',
      delayMinutes: s.delayMinutes,
      distanceKm: s.distanceFromSourceKm,
    })) as unknown as T;
  }

  // 8. Weather: trains/:trainNumber/weather
  if (parts[0] === 'trains' && sub === 'weather') {
    const routeWeather: RouteWeather = {
      currentStationWeather: {
        stationName: 'Ratlam Junction',
        latitude: 23.3441,
        longitude: 75.0371,
        temperature: 29,
        feelsLike: 31,
        humidity: 62,
        windSpeed: 14,
        condition: 'Clear Sky',
        icon: '01d',
        updatedAt: new Date().toISOString(),
      },
      nextStationWeather: {
        stationName: 'Kota Junction',
        latitude: 25.2138,
        longitude: 75.8648,
        temperature: 28,
        feelsLike: 30,
        humidity: 65,
        windSpeed: 12,
        condition: 'Partly Cloudy',
        icon: '02d',
        updatedAt: new Date().toISOString(),
      },
      destinationWeather: {
        stationName: 'New Delhi',
        latitude: 28.6429,
        longitude: 77.2195,
        temperature: 24,
        feelsLike: 25,
        humidity: 50,
        windSpeed: 8,
        condition: 'Clear',
        icon: '01n',
        updatedAt: new Date().toISOString(),
      },
      checkpoints: [],
    };
    return routeWeather as unknown as T;
  }

  // 9. Places: trains/:trainNumber/places
  if (parts[0] === 'trains' && sub === 'places') {
    const places: GeographicPlace[] = [
      {
        id: 'poi-1',
        name: 'Chhatrapati Shivaji Maharaj Terminus & Gateway of India',
        type: 'MONUMENT',
        latitude: 18.9400,
        longitude: 72.8353,
        distanceFromRouteKm: 3.5,
        description: 'UNESCO World Heritage site and Victorian Gothic historic terminal.',
      },
      {
        id: 'poi-2',
        name: 'Sanjay Gandhi National Park',
        type: 'MOUNTAIN',
        latitude: 19.2215,
        longitude: 72.9124,
        distanceFromRouteKm: 4.2,
        description: 'Sprawling protected forest within Mumbai metropolis limits with ancient Kanheri caves.',
      },
      {
        id: 'poi-3',
        name: 'Tapi River Basin',
        type: 'RIVER',
        latitude: 21.2185,
        longitude: 72.8360,
        distanceFromRouteKm: 1.2,
        description: 'Major Central India river flowing westward into the Arabian Sea.',
      },
      {
        id: 'poi-4',
        name: 'Malwa Plateau & Ratlam Rail Hub',
        type: 'CITY',
        latitude: 23.3315,
        longitude: 75.0367,
        distanceFromRouteKm: 0.8,
        description: 'High volcanic fertile plateau and major railway junction connecting Delhi-Mumbai.',
      },
    ];
    return places as unknown as T;
  }

  // 10. Sharing: journeys/share
  if (parts[0] === 'journeys' && parts[1] === 'share') {
    return {
      shareUrl: `${window.location.origin}/tracking/${trainNumber}`,
      token: `share_${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    } as unknown as T;
  }

  // 11. Favorites: favorites
  if (parts[0] === 'favorites') {
    const raw = localStorage.getItem('railline_favorites');
    const list = raw ? JSON.parse(raw) : [];
    return list as unknown as T;
  }

  return {} as unknown as T;
}
