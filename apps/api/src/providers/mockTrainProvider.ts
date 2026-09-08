import {
  Train,
  TrainSearchResult,
  LiveTrainStatus,
  JourneyStation,
  Station,
  RunningStatus,
} from '@railline/types';
import { TrainProvider } from './trainProvider';

interface TrainRouteData {
  train: Train;
  stations: JourneyStation[];
  routeCoordinates: [number, number][]; // [lng, lat] for GeoJSON
}

// Famous railway stations with accurate Indian geographic coordinates
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
  LKO: { code: 'LKO', name: 'Lucknow Charbagh', latitude: 26.8317, longitude: 80.9234, state: 'Uttar Pradesh' },
  LJN: { code: 'LJN', name: 'Lucknow Junction NER', latitude: 26.8322, longitude: 80.9218, state: 'Uttar Pradesh' },
  PRYJ: { code: 'PRYJ', name: 'Prayagraj Junction', latitude: 25.4358, longitude: 81.8463, state: 'Uttar Pradesh' },
  DDU: { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn', latitude: 25.2796, longitude: 83.1189, state: 'Uttar Pradesh' },
  BSB: { code: 'BSB', name: 'Varanasi Junction', latitude: 25.3283, longitude: 82.9868, state: 'Uttar Pradesh' },
  GAYA: { code: 'GAYA', name: 'Gaya Junction', latitude: 24.8073, longitude: 84.9996, state: 'Bihar' },
  DHN: { code: 'DHN', name: 'Dhanbad Junction', latitude: 23.7925, longitude: 86.4304, state: 'Jharkhand' },
  ASN: { code: 'ASN', name: 'Asansol Junction', latitude: 23.6871, longitude: 86.9746, state: 'West Bengal' },
  HWH: { code: 'HWH', name: 'Howrah Junction', latitude: 22.5839, longitude: 88.3426, state: 'West Bengal' },
  GKP: { code: 'GKP', name: 'Gorakhpur Junction', latitude: 26.7588, longitude: 83.3820, state: 'Uttar Pradesh' },
  BST: { code: 'BST', name: 'Basti', latitude: 26.7997, longitude: 82.7533, state: 'Uttar Pradesh' },
  GD: { code: 'GD', name: 'Gonda Junction', latitude: 27.1352, longitude: 81.9610, state: 'Uttar Pradesh' },
  BBK: { code: 'BBK', name: 'Barabanki Junction', latitude: 26.9248, longitude: 81.1895, state: 'Uttar Pradesh' },
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
      [72.8193, 18.9696], // MMCT
      [72.8573, 19.2294], // BVI
      [72.8407, 21.2049], // ST
      [73.1812, 22.3107], // BRC
      [74.2000, 22.8000],
      [75.0371, 23.3441], // RTM
      [75.4000, 24.3000],
      [75.8648, 25.2138], // KOTA
      [76.3686, 25.9928], // SWM
      [77.4988, 27.2343], // BTE
      [77.6737, 27.4924], // MTJ
      [77.2195, 28.6429], // NDLS
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
        expectedArrival: '11:32',
        expectedDeparture: '11:37',
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
        expectedArrival: '12:57',
        delayMinutes: 12,
        platform: '6',
        status: 'UPCOMING',
        isHalt: true,
      },
    ],
    routeCoordinates: [
      [77.2195, 28.6429], // NDLS
      [77.4338, 28.6678], // GZB
      [78.0880, 27.8974], // ALJN
      [78.2435, 27.2069], // TDL
      [79.0232, 26.7768], // ETW
      [80.3507, 26.4547], // CNB
      [80.9218, 26.8322], // LJN
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
        expectedArrival: '12:12',
        expectedDeparture: '12:14',
        delayMinutes: 4,
        platform: '6',
        status: 'CURRENT',
        isHalt: true,
      },
      {
        station: STATIONS_MAP.BSB,
        distanceFromSourceKm: 759,
        scheduledArrival: '14:00',
        expectedArrival: '14:04',
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

export class MockTrainProvider implements TrainProvider {
  async searchTrains(query: string): Promise<TrainSearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results: TrainSearchResult[] = [];

    for (const [trainNumber, data] of Object.entries(TRAINS_DATABASE)) {
      const train = data.train;
      const matchNumber = train.trainNumber.includes(q);
      const matchName = train.name.toLowerCase().includes(q);
      const matchSource = train.source.name.toLowerCase().includes(q);
      const matchDest = train.destination.name.toLowerCase().includes(q);

      if (matchNumber || matchName || matchSource || matchDest) {
        results.push({
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
      }
    }

    // Exact matches sorted first
    results.sort((a, b) => {
      if (a.trainNumber === q) return -1;
      if (b.trainNumber === q) return 1;
      return 0;
    });

    return results;
  }

  async getTrainDetails(trainNumber: string): Promise<Train | null> {
    const data = TRAINS_DATABASE[trainNumber];
    return data ? data.train : null;
  }

  async getLiveStatus(trainNumber: string): Promise<LiveTrainStatus | null> {
    const data = TRAINS_DATABASE[trainNumber];
    if (!data) return null;

    const currentStationObj = data.stations.find((s) => s.status === 'CURRENT') || data.stations[0];
    const currentIndex = data.stations.indexOf(currentStationObj);
    const nextStationObj = data.stations[currentIndex + 1] || currentStationObj;

    // Calculate realistic simulation progress based on current station
    const distanceCovered = currentStationObj.distanceFromSourceKm;
    const distanceRemaining = Math.max(0, data.train.totalDistanceKm - distanceCovered);
    const progressPercentage = Math.round((distanceCovered / data.train.totalDistanceKm) * 100);

    // Subtle drift simulator so coordinate moves slightly on each live polling
    const now = Date.now();
    const cycle = (now / 10000) % 1; // 0 to 1 over 10 seconds
    const latInterp = currentStationObj.station.latitude + (nextStationObj.station.latitude - currentStationObj.station.latitude) * (cycle * 0.15);
    const lngInterp = currentStationObj.station.longitude + (nextStationObj.station.longitude - currentStationObj.station.longitude) * (cycle * 0.15);

    // Calculate heading/bearing
    const y = Math.sin((nextStationObj.station.longitude - currentStationObj.station.longitude) * (Math.PI / 180)) * Math.cos(nextStationObj.station.latitude * (Math.PI / 180));
    const x = Math.cos(currentStationObj.station.latitude * (Math.PI / 180)) * Math.sin(nextStationObj.station.latitude * (Math.PI / 180)) -
              Math.sin(currentStationObj.station.latitude * (Math.PI / 180)) * Math.cos(nextStationObj.station.latitude * (Math.PI / 180)) * Math.cos((nextStationObj.station.longitude - currentStationObj.station.longitude) * (Math.PI / 180));
    const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

    const delay = currentStationObj.delayMinutes || 0;
    const status: RunningStatus = delay > 5 ? 'DELAYED' : 'ON TIME';

    return {
      trainNumber: data.train.trainNumber,
      trainName: data.train.name,
      status,
      delayMinutes: delay,
      currentStation: {
        code: currentStationObj.station.code,
        name: currentStationObj.station.name,
        platform: currentStationObj.platform,
        scheduledArrival: currentStationObj.scheduledArrival,
        scheduledDeparture: currentStationObj.scheduledDeparture,
      },
      nextStation: {
        code: nextStationObj.station.code,
        name: nextStationObj.station.name,
        platform: nextStationObj.platform,
        scheduledArrival: nextStationObj.scheduledArrival,
        scheduledDeparture: nextStationObj.scheduledDeparture,
      },
      location: {
        lat: Number(latInterp.toFixed(5)),
        lng: Number(lngInterp.toFixed(5)),
        bearing: Math.round(bearing),
        speedKmph: 110,
        isInterpolated: true,
      },
      progressPercentage,
      distanceCoveredKm: distanceCovered,
      distanceRemainingKm: distanceRemaining,
      etaNextStation: nextStationObj.expectedArrival || nextStationObj.scheduledArrival,
      etaDestination: data.stations[data.stations.length - 1].expectedArrival || data.stations[data.stations.length - 1].scheduledArrival,
      delayTrend: delay > 10 ? 'INCREASING' : 'STABLE',
      lastUpdatedAt: new Date().toISOString(),
      isStale: false,
    };
  }

  async getRouteStations(trainNumber: string): Promise<JourneyStation[]> {
    const data = TRAINS_DATABASE[trainNumber];
    return data ? data.stations : [];
  }

  async getRouteGeometry(trainNumber: string): Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null> {
    const data = TRAINS_DATABASE[trainNumber];
    if (!data) return null;

    const completedCoords: [number, number][] = [];
    const remainingCoords: [number, number][] = [];

    const currentStation = data.stations.find((s) => s.status === 'CURRENT') || data.stations[0];
    const currentIndex = data.stations.indexOf(currentStation);

    // Build completed vs remaining route segments
    data.routeCoordinates.forEach((coord, idx) => {
      // Station coords mapped approximately to route
      if (idx <= Math.min(currentIndex + 1, data.routeCoordinates.length - 1)) {
        completedCoords.push(coord);
      }
      if (idx >= Math.max(0, currentIndex)) {
        remainingCoords.push(coord);
      }
    });

    const features: GeoJSON.Feature<GeoJSON.Geometry>[] = [
      {
        type: 'Feature',
        properties: {
          segment: 'completed',
          trainNumber,
        },
        geometry: {
          type: 'LineString',
          coordinates: completedCoords.length > 1 ? completedCoords : data.routeCoordinates.slice(0, 2),
        },
      },
      {
        type: 'Feature',
        properties: {
          segment: 'remaining',
          trainNumber,
        },
        geometry: {
          type: 'LineString',
          coordinates: remainingCoords.length > 1 ? remainingCoords : data.routeCoordinates,
        },
      },
    ];

    // Add station point features
    data.stations.forEach((st) => {
      features.push({
        type: 'Feature',
        properties: {
          code: st.station.code,
          name: st.station.name,
          status: st.status,
          delayMinutes: st.delayMinutes,
          platform: st.platform,
        },
        geometry: {
          type: 'Point',
          coordinates: [st.station.longitude, st.station.latitude],
        },
      });
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  }
}
