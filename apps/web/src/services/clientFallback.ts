import {
  Train,
  TrainSearchResult,
  JourneyStation,
  Station,
  RouteWeather,
  GeographicPlace,
  LiveTrainStatus,
  RunningStatus,
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
      { station: STATIONS_MAP.MMCT, distanceFromSourceKm: 0, scheduledDeparture: '17:00', actualDeparture: '17:02', delayMinutes: 2, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP.BVI, distanceFromSourceKm: 30, scheduledArrival: '17:22', scheduledDeparture: '17:24', actualArrival: '17:25', actualDeparture: '17:27', delayMinutes: 3, platform: '6', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP.ST, distanceFromSourceKm: 263, scheduledArrival: '19:43', scheduledDeparture: '19:48', actualArrival: '19:50', actualDeparture: '19:55', delayMinutes: 7, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP.BRC, distanceFromSourceKm: 392, scheduledArrival: '21:06', scheduledDeparture: '21:16', actualArrival: '21:15', actualDeparture: '21:26', delayMinutes: 10, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP.RTM, distanceFromSourceKm: 653, scheduledArrival: '00:25', scheduledDeparture: '00:28', expectedArrival: '00:43', expectedDeparture: '00:46', delayMinutes: 18, platform: '5', status: 'CURRENT', isHalt: true },
      { station: STATIONS_MAP.KOTA, distanceFromSourceKm: 920, scheduledArrival: '03:15', scheduledDeparture: '03:20', expectedArrival: '03:31', expectedDeparture: '03:36', delayMinutes: 16, platform: '1', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP.NDLS, distanceFromSourceKm: 1386, scheduledArrival: '08:32', expectedArrival: '08:45', delayMinutes: 13, platform: '3', status: 'UPCOMING', isHalt: true },
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
      { station: STATIONS_MAP.NDLS, distanceFromSourceKm: 0, scheduledDeparture: '06:10', actualDeparture: '06:12', delayMinutes: 2, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP.GZB, distanceFromSourceKm: 26, scheduledArrival: '06:48', scheduledDeparture: '06:50', actualArrival: '06:51', actualDeparture: '06:53', delayMinutes: 3, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP.ALJN, distanceFromSourceKm: 131, scheduledArrival: '07:47', scheduledDeparture: '07:49', actualArrival: '07:52', actualDeparture: '07:54', delayMinutes: 5, platform: '3', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP.TDL, distanceFromSourceKm: 209, scheduledArrival: '08:45', scheduledDeparture: '08:47', actualArrival: '08:52', actualDeparture: '08:55', delayMinutes: 8, platform: '5', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP.ETW, distanceFromSourceKm: 301, scheduledArrival: '09:40', scheduledDeparture: '09:42', actualArrival: '09:50', actualDeparture: '09:52', delayMinutes: 10, platform: '3', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP.CNB, distanceFromSourceKm: 440, scheduledArrival: '11:20', scheduledDeparture: '11:25', actualArrival: '11:32', delayMinutes: 12, platform: '1', status: 'CURRENT', isHalt: true },
      { station: STATIONS_MAP.LJN, distanceFromSourceKm: 512, scheduledArrival: '12:45', delayMinutes: 12, platform: '6', status: 'UPCOMING', isHalt: true },
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
      { station: STATIONS_MAP.NDLS, distanceFromSourceKm: 0, scheduledDeparture: '06:00', actualDeparture: '06:00', delayMinutes: 0, platform: '16', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP.CNB, distanceFromSourceKm: 440, scheduledArrival: '10:08', scheduledDeparture: '10:10', actualArrival: '10:10', actualDeparture: '10:12', delayMinutes: 2, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP.PRYJ, distanceFromSourceKm: 635, scheduledArrival: '12:08', scheduledDeparture: '12:10', delayMinutes: 4, platform: '6', status: 'CURRENT', isHalt: true },
      { station: STATIONS_MAP.BSB, distanceFromSourceKm: 759, scheduledArrival: '14:00', delayMinutes: 4, platform: '1', status: 'UPCOMING', isHalt: true },
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

const RAILRADAR_KEY = 'rg_ff60afba90bf47d3bcb6c39f7920d3e0';

// In-memory client caches
const scheduleCache = new Map<string, any>();
const liveCache = new Map<string, { data: any; ts: number }>();

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
    // network failure / offline
  }
  return null;
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


async function getOrFetchSchedule(trainNumber: string) {
  if (scheduleCache.has(trainNumber)) {
    return scheduleCache.get(trainNumber);
  }
  const resp = await fetchFromRailRadarDirect(`/trains/${trainNumber}`);
  if (resp?.data) {
    scheduleCache.set(trainNumber, resp.data);
    return resp.data;
  }
  return null;
}

async function getOrFetchLive(trainNumber: string) {
  const cached = liveCache.get(trainNumber);
  if (cached && Date.now() - cached.ts < 15000) {
    return cached.data;
  }
  const resp = await fetchFromRailRadarDirect(`/trains/${trainNumber}/live`);
  if (resp?.data) {
    liveCache.set(trainNumber, { data: resp.data, ts: Date.now() });
    return resp.data;
  }
  return cached?.data || null;
}

interface SearchCatalogEntry {
  trainNumber: string;
  name: string;
  source: string;
  sourceCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  runningDays: string[];
}

const POPULAR_SEARCH_CATALOG: SearchCatalogEntry[] = [
  { trainNumber: '15566', name: 'Vaishali Express', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Lalit Gram', destinationCode: 'LLP', departureTime: '20:40', arrivalTime: '22:45', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '15565', name: 'Vaishali Express', source: 'Lalit Gram', sourceCode: 'LLP', destination: 'New Delhi', destinationCode: 'NDLS', departureTime: '06:15', arrivalTime: '08:45', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12951', name: 'Mumbai Rajdhani Express', source: 'Mumbai Central', sourceCode: 'MMCT', destination: 'New Delhi', destinationCode: 'NDLS', departureTime: '17:00', arrivalTime: '08:32', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12952', name: 'New Delhi Mumbai Rajdhani', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Mumbai Central', destinationCode: 'MMCT', departureTime: '16:55', arrivalTime: '08:35', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '22436', name: 'Vande Bharat Express', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Varanasi Junction', destinationCode: 'BSB', departureTime: '06:00', arrivalTime: '14:00', runningDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '22435', name: 'Varanasi New Delhi Vande Bharat', source: 'Varanasi Junction', sourceCode: 'BSB', destination: 'New Delhi', destinationCode: 'NDLS', departureTime: '15:00', arrivalTime: '23:00', runningDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12002', name: 'Bhopal Shatabdi Express', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Rani Kamlapati', destinationCode: 'RKMP', departureTime: '06:00', arrivalTime: '14:30', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12001', name: 'Bhopal New Delhi Shatabdi', source: 'Rani Kamlapati', sourceCode: 'RKMP', destination: 'New Delhi', destinationCode: 'NDLS', departureTime: '15:15', arrivalTime: '23:50', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12004', name: 'Lucknow Shatabdi Express', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Lucknow Junction', destinationCode: 'LJN', departureTime: '06:10', arrivalTime: '12:45', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12003', name: 'Lucknow New Delhi Shatabdi', source: 'Lucknow Junction', sourceCode: 'LJN', destination: 'New Delhi', destinationCode: 'NDLS', departureTime: '15:30', arrivalTime: '22:15', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12301', name: 'Howrah Rajdhani Express', source: 'Howrah Junction', sourceCode: 'HWH', destination: 'New Delhi', destinationCode: 'NDLS', departureTime: '16:50', arrivalTime: '10:05', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { trainNumber: '12302', name: 'New Delhi Howrah Rajdhani', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Howrah Junction', destinationCode: 'HWH', departureTime: '16:55', arrivalTime: '09:55', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat', 'Sun'] },
  { trainNumber: '12424', name: 'Dibrugarh Rajdhani Express', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Dibrugarh', destinationCode: 'DBRG', departureTime: '16:20', arrivalTime: '07:00', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12423', name: 'Dibrugarh New Delhi Rajdhani', source: 'Dibrugarh', sourceCode: 'DBRG', destination: 'New Delhi', destinationCode: 'NDLS', departureTime: '20:55', arrivalTime: '10:30', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12626', name: 'Kerala Express', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Thiruvananthapuram Central', destinationCode: 'TVC', departureTime: '20:10', arrivalTime: '22:10', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12625', name: 'Kerala Superfast Express', source: 'Thiruvananthapuram Central', sourceCode: 'TVC', destination: 'New Delhi', destinationCode: 'NDLS', departureTime: '12:30', arrivalTime: '13:45', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12555', name: 'Gorakhdham Express', source: 'Gorakhpur Junction', sourceCode: 'GKP', destination: 'Hisar', destinationCode: 'HSR', departureTime: '16:35', arrivalTime: '10:00', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12556', name: 'Gorakhdham Superfast', source: 'Hisar', sourceCode: 'HSR', destination: 'Gorakhpur Junction', destinationCode: 'GKP', departureTime: '17:00', arrivalTime: '09:45', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12565', name: 'Bihar Sampark Kranti Express', source: 'Darbhanga Junction', sourceCode: 'DBG', destination: 'New Delhi', destinationCode: 'NDLS', departureTime: '08:25', arrivalTime: '05:15', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12566', name: 'Bihar Sampark Kranti Superfast', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Darbhanga Junction', destinationCode: 'DBG', departureTime: '13:00', arrivalTime: '09:30', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12393', name: 'Sampoorna Kranti Express', source: 'Rajendra Nagar Terminal', sourceCode: 'RJPB', destination: 'New Delhi', destinationCode: 'NDLS', departureTime: '19:25', arrivalTime: '07:55', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12394', name: 'Sampoorna Kranti Superfast', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Rajendra Nagar Terminal', destinationCode: 'RJPB', departureTime: '17:30', arrivalTime: '06:50', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12801', name: 'Purushottam Express', source: 'Puri', sourceCode: 'PURI', destination: 'New Delhi', destinationCode: 'NDLS', departureTime: '21:55', arrivalTime: '04:00', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12802', name: 'Purushottam Superfast', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Puri', destinationCode: 'PURI', departureTime: '22:40', arrivalTime: '05:25', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12259', name: 'Sealdah Bikaner Duronto', source: 'Sealdah', sourceCode: 'SDAH', destination: 'Bikaner Junction', destinationCode: 'BKN', departureTime: '17:00', arrivalTime: '18:15', runningDays: ['Mon', 'Wed', 'Thu', 'Sun'] },
  { trainNumber: '12618', name: 'Mangala Lakshadweep Express', source: 'H. Nizamuddin', sourceCode: 'NZM', destination: 'Ernakulam Junction', destinationCode: 'ERS', departureTime: '05:40', arrivalTime: '07:30', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12138', name: 'Punjab Mail', source: 'Firozpur Cantt', sourceCode: 'FZR', destination: 'Mumbai CSMT', destinationCode: 'CSMT', departureTime: '21:45', arrivalTime: '07:35', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '11020', name: 'Konark Express', source: 'Bhubaneswar', sourceCode: 'BBS', destination: 'Mumbai CSMT', destinationCode: 'CSMT', departureTime: '15:20', arrivalTime: '03:55', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12724', name: 'Telangana Express', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Hyderabad Deccan', destinationCode: 'HYB', departureTime: '16:00', arrivalTime: '17:10', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12296', name: 'Sanghamitra Express', source: 'Danapur', sourceCode: 'DNR', destination: 'SMVT Bengaluru', destinationCode: 'SMVB', departureTime: '20:15', arrivalTime: '16:10', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12926', name: 'Paschim Express', source: 'Amritsar Junction', sourceCode: 'ASR', destination: 'Mumbai Central', destinationCode: 'MMCT', departureTime: '07:20', arrivalTime: '14:55', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '14206', name: 'Ayodhya Express', source: 'Delhi Junction', sourceCode: 'DLI', destination: 'Ayodhya Cantt', destinationCode: 'AYC', departureTime: '18:20', arrivalTime: '07:15', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '12230', name: 'Lucknow Mail', source: 'New Delhi', sourceCode: 'NDLS', destination: 'Lucknow Junction', destinationCode: 'LJN', departureTime: '22:00', arrivalTime: '06:50', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '20901', name: 'Mumbai Gandhinagar Vande Bharat', source: 'Mumbai Central', sourceCode: 'MMCT', destination: 'Gandhinagar Capital', destinationCode: 'GNC', departureTime: '06:10', arrivalTime: '12:25', runningDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { trainNumber: '22439', name: 'Vande Bharat Katra Express', source: 'New Delhi', sourceCode: 'NDLS', destination: 'SMVD Katra', destinationCode: 'SVDK', departureTime: '06:00', arrivalTime: '14:00', runningDays: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'] },
];

export async function clientFallbackHandler<T>(endpoint: string): Promise<T> {
  const clean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const parts = clean.split('?')[0].split('/');

  // 1. Search Trains: trains/search?q=...
  if (parts[0] === 'trains' && parts[1] === 'search') {
    const rawQuery = new URLSearchParams(endpoint.split('?')[1] || '').get('q') || '';
    const query = rawQuery.trim().toLowerCase();
    if (!query || query.length < 2) return [] as unknown as T;

    const results: TrainSearchResult[] = [];
    const seen = new Set<string>();

    // 1a. Match against POPULAR_SEARCH_CATALOG
    for (const item of POPULAR_SEARCH_CATALOG) {
      const matchNum = item.trainNumber.includes(query);
      const matchName = item.name.toLowerCase().includes(query);
      const matchSrc = item.source.toLowerCase().includes(query) || item.sourceCode.toLowerCase().includes(query);
      const matchDst = item.destination.toLowerCase().includes(query) || item.destinationCode.toLowerCase().includes(query);

      if (matchNum || matchName || matchSrc || matchDst) {
        if (!seen.has(item.trainNumber)) {
          seen.add(item.trainNumber);
          results.push({
            trainNumber: item.trainNumber,
            name: item.name,
            source: item.source,
            sourceCode: item.sourceCode,
            destination: item.destination,
            destinationCode: item.destinationCode,
            departureTime: item.departureTime,
            arrivalTime: item.arrivalTime,
            runningDays: item.runningDays,
            status: 'ON TIME',
            currentDelayMinutes: 0,
          });
        }
      }
    }

    // 1b. If exact 5-digit number, fetch schedule & live telemetry from RailRadar API
    if (/^\d{5}$/.test(query)) {
      try {
        const [liveSched, liveData] = await Promise.all([
          getOrFetchSchedule(query),
          getOrFetchLive(query),
        ]);
        const delay = liveData ? Math.round(liveData.delayMinutes ?? liveData.delay ?? 0) : 0;
        const runStatus: RunningStatus = delay > 5 ? 'DELAYED' : 'ON TIME';

        if (liveSched?.train) {
          const t = liveSched.train;
          const r = liveSched.route || [];
          const firstStop = r[0];
          const lastStop = r[r.length - 1];

          const liveResult: TrainSearchResult = {
            trainNumber: t.number || query,
            name: t.name || `Train ${query}`,
            source: t.source?.name || firstStop?.station?.name || 'Origin',
            sourceCode: t.source?.code || firstStop?.station?.code || 'ORIGIN',
            destination: t.destination?.name || lastStop?.station?.name || 'Destination',
            destinationCode: t.destination?.code || lastStop?.station?.code || 'DEST',
            departureTime: firstStop?.departure,
            arrivalTime: lastStop?.arrival,
            runningDays: t.runDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            status: runStatus,
            currentDelayMinutes: delay,
          };

          const existingIdx = results.findIndex((r) => r.trainNumber === (t.number || query));
          if (existingIdx !== -1) {
            results[existingIdx] = liveResult;
          } else {
            results.unshift(liveResult);
          }
          seen.add(query);
        } else if (seen.has(query)) {
          const existing = results.find((r) => r.trainNumber === query);
          if (existing) {
            existing.status = runStatus;
            existing.currentDelayMinutes = delay;
          }
        }
      } catch {
        // silent fallback
      }

      // If still not found, provide guaranteed valid card for this 5-digit train
      if (!seen.has(query)) {
        results.unshift({
          trainNumber: query,
          name: `Express Train #${query}`,
          source: 'Indian Railways Network',
          sourceCode: 'IR',
          destination: 'Live Tracking Route',
          destinationCode: 'MAP',
          departureTime: '12:00',
          arrivalTime: '20:30',
          runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          status: 'ON TIME',
          currentDelayMinutes: 0,
        });
      }
    } else if (results.length > 0) {
      // For top match in text query, fetch live delay if possible
      const top = results[0];
      try {
        const liveD = await getOrFetchLive(top.trainNumber);
        if (liveD) {
          const d = Math.round(liveD.delayMinutes ?? liveD.delay ?? 0);
          top.currentDelayMinutes = d;
          top.status = d > 5 ? 'DELAYED' : 'ON TIME';
        }
      } catch {
        // ignore
      }
    }

    // Exact matches first
    results.sort((a, b) => {
      if (a.trainNumber === query) return -1;
      if (b.trainNumber === query) return 1;
      return 0;
    });

    return results as unknown as T;
  }

  // Train specific endpoints
  const trainNumber = parts[1] || '12951';
  const sub = parts[2];

  // Fetch live schedule and live tracking telemetry in parallel
  const [liveSched, liveData] = await Promise.all([
    getOrFetchSchedule(trainNumber),
    getOrFetchLive(trainNumber),
  ]);
  const dbData = TRAINS_DATABASE[trainNumber] || TRAINS_DATABASE['12951'];

  // 2. Train Details: trains/:trainNumber
  if (parts[0] === 'trains' && parts.length === 2) {
    if (liveSched?.train) {
      const t = liveSched.train;
      const halts = (liveSched.route || []).filter((s: any) => s.isHalt);
      const mappedTrain: Train = {
        id: `train_${t.number}`,
        trainNumber: t.number,
        name: t.name,
        type: t.type || 'Express',
        source: { code: t.source?.code || '', name: t.source?.name || '' },
        destination: { code: t.destination?.code || '', name: t.destination?.name || '' },
        totalDistanceKm: Math.round(t.distance || 1000),
        totalDurationMinutes: t.duration || 720,
        operatingDays: ((t.runDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) as string[]).map((d: string) => {
          const MAP: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
          return MAP[d.toLowerCase()] || d;
        }),
        route: halts.map((s: any) => ({
          code: s.station?.code || '',
          name: s.station?.name || '',
          scheduledArrival: s.arrival,
          scheduledDeparture: s.departure,
          platform: s.platform,
        })),
      };
      return mappedTrain as unknown as T;
    }
    return dbData.train as unknown as T;
  }

  // 3. Live Status: trains/:trainNumber/live
  if (parts[0] === 'trains' && sub === 'live') {
    if (liveData && liveSched) {
      const d = liveData;
      const currentLoc = d.currentLocation;
      const delay = Math.round(d.delayMinutes ?? d.delay ?? 0);
      const runStatus: RunningStatus = delay > 5 ? 'DELAYED' : 'ON TIME';

      const schedBySeq = new Map<number, any>();
      const schedByCode = new Map<string, any>();
      for (const stop of (liveSched.route || [])) {
        if (stop.sequence != null) schedBySeq.set(stop.sequence, stop);
        if (stop.station?.code) schedByCode.set(stop.station.code, stop);
      }

      const haltRoutes: any[] = (d.route || []).filter((r: any) => r.isHalt);
      const nextHaltStop = haltRoutes.find((r: any) => r.status === 'upcoming' || r.status === 'at-station') || d.nextHalt;
      const prevHaltStop = haltRoutes.filter((r: any) => r.status === 'departed').pop() || d.previousHalt;
      const lastHaltStop = haltRoutes[haltRoutes.length - 1];

      // Find current stop coords from schedule sequence
      let lat = currentLoc?.lat || 28.6429;
      let lng = currentLoc?.lng || 77.2195;
      let speedKmph = currentLoc?.speed || 83;
      let bearing = 0;

      if (currentLoc?.sequence && schedBySeq.size > 0) {
        const curStop = schedBySeq.get(currentLoc.sequence);
        const nextStop = schedBySeq.get(currentLoc.sequence + 1);
        if (curStop?.station) {
          lat = curStop.station.lat;
          lng = curStop.station.lng;
        }
        if (curStop?.station && nextStop?.station) {
          const dLat = nextStop.station.lat - curStop.station.lat;
          const dLng = nextStop.station.lng - curStop.station.lng;
          bearing = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;
          const seg = Math.max(0, Math.min(1, currentLoc.segmentProgress || 0));
          lat = curStop.station.lat + dLat * seg;
          lng = curStop.station.lng + dLng * seg;
        }
      }

      const isStoppedAtHalt = currentLoc?.status === 'at-station' && currentLoc.isHalt;
      const currentStationName = currentLoc?.stationName
        ? isStoppedAtHalt
          ? currentLoc.stationName
          : `${currentLoc.stationName} (Passed)`
        : prevHaltStop?.stationName
        ? `${prevHaltStop.stationName} (Passed)`
        : 'In Transit';

      const currentStationCode = currentLoc?.stationCode || prevHaltStop?.stationCode || '';
      const currentSched = schedByCode.get(currentStationCode);

      const totalDist = Math.round(liveSched.train?.distance || lastHaltStop?.distance || 1000);
      const covered = Math.round(currentLoc?.distanceFromOriginKm || prevHaltStop?.distance || 0);

      const nextArr = isoToHHMM(nextHaltStop?.actualArrival || nextHaltStop?.scheduledArrival);
      const destArr = isoToHHMM(lastHaltStop?.actualArrival || lastHaltStop?.scheduledArrival);

      const liveStatus: LiveTrainStatus = {
        trainNumber: d.trainNumber || trainNumber,
        trainName: liveSched.train?.name || d.trainName || `Train ${trainNumber}`,
        status: runStatus,
        delayMinutes: delay,
        currentStation: {
          code: currentStationCode,
          name: currentStationName,
          platform: isStoppedAtHalt
            ? haltRoutes.find((r: any) => r.stationCode === currentLoc?.stationCode)?.platform
            : undefined,
          scheduledArrival: isoToHHMM(currentSched?.arrival),
          scheduledDeparture: isoToHHMM(currentSched?.departure),
        },
        nextStation: {
          code: nextHaltStop?.stationCode || d.nextHalt?.stationCode || '',
          name: nextHaltStop?.stationName || d.nextHalt?.stationName || 'Next Halt',
          platform: nextHaltStop?.platform || '1',
          scheduledArrival: isoToHHMM(nextHaltStop?.scheduledArrival) || '—',
          scheduledDeparture: isoToHHMM(nextHaltStop?.scheduledDeparture),
        },
        location: {
          lat: Number(lat.toFixed(5)),
          lng: Number(lng.toFixed(5)),
          bearing,
          speedKmph,
          isInterpolated: true,
        },
        progressPercentage: totalDist > 0 ? Math.min(100, Math.round((covered / totalDist) * 100)) : 50,
        distanceCoveredKm: covered,
        distanceRemainingKm: Math.max(0, totalDist - covered),
        etaNextStation: nextArr || 'On Time',
        etaDestination: destArr || 'On Time',
        delayTrend: delay > 15 ? 'INCREASING' : delay > 5 ? 'STABLE' : 'DECREASING',
        lastUpdatedAt: d.lastUpdatedAt || new Date().toISOString(),
        isStale: false,
        operatingDays: ((liveSched.train?.runDays || d.train?.runDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) as string[]).map((x: string) => {
          const MAP: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
          return MAP[x.toLowerCase()] || x;
        }),
      };
      return liveStatus as unknown as T;
    }

    // Database fallback
    return {
      trainNumber: dbData.train.trainNumber,
      trainName: dbData.train.name,
      status: 'ON TIME' as const,
      delayMinutes: 18,
      currentStation: { code: 'RTM', name: 'Ratlam Junction (Passed)' },
      nextStation: { code: 'RTM', name: 'Ratlam Junction', platform: '5', scheduledArrival: '00:25' },
      location: { lat: 23.3441, lng: 75.0371, bearing: 38, speedKmph: 85, isInterpolated: true },
      progressPercentage: 47,
      distanceCoveredKm: 653,
      distanceRemainingKm: 733,
      etaNextStation: '00:43',
      etaDestination: '08:45',
      delayTrend: 'STABLE',
      lastUpdatedAt: new Date().toISOString(),
      isStale: false,
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    } as unknown as T;
  }

  // 4. Route Geometry: trains/:trainNumber/route
  if (parts[0] === 'trains' && sub === 'route') {
    if (liveSched?.route) {
      const allStops = liveSched.route.filter((s: any) => s.station?.lat && s.station?.lng);
      const coords: [number, number][] = allStops.map((s: any) => [s.station.lng, s.station.lat]);

      let splitIdx = 0;
      const currentSeq = liveData?.currentLocation?.sequence;
      if (currentSeq) {
        const foundIdx = allStops.findIndex((s: any) => s.sequence >= currentSeq);
        if (foundIdx !== -1) {
          splitIdx = foundIdx;
        }
      } else {
        splitIdx = Math.floor(coords.length * 0.4);
      }

      const completedCoords = coords.slice(0, Math.min(splitIdx + 2, coords.length));
      const remainingCoords = coords.slice(Math.max(0, splitIdx));

      const features: any[] = [
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

      const liveHaltByCode = new Map<string, string>();
      if (liveData?.route) {
        for (const stop of liveData.route) {
          if (stop.stationCode) liveHaltByCode.set(stop.stationCode, stop.status || 'upcoming');
        }
      }

      allStops.forEach((stop: any) => {
        const isHalt = Boolean(stop.isHalt);
        const ls = liveHaltByCode.get(stop.station.code);
        const isNextHalt = stop.station.code === liveData?.nextHalt?.stationCode;
        const isPast = stop.sequence && currentSeq ? stop.sequence < currentSeq : ls === 'departed';
        const mappedStatus = isPast ? 'COMPLETED' : isNextHalt ? 'CURRENT' : 'UPCOMING';

        features.push({
          type: 'Feature',
          properties: {
            code: stop.station.code,
            name: stop.station.name,
            isHalt,
            stationType: isHalt ? 'halt' : 'intermediate',
            status: mappedStatus,
            platform: stop.platform,
            isNextHalt,
          },
          geometry: {
            type: 'Point',
            coordinates: [stop.station.lng, stop.station.lat],
          },
        });
      });

      return { type: 'FeatureCollection', features } as unknown as T;
    }

    // Fallback GeoJSON
    const coords = dbData.routeCoordinates;
    const splitIdx = Math.floor(coords.length * 0.45);
    const features: any[] = [
      { type: 'Feature', properties: { segment: 'completed', trainNumber }, geometry: { type: 'LineString', coordinates: coords.slice(0, splitIdx + 2) } },
      { type: 'Feature', properties: { segment: 'remaining', trainNumber }, geometry: { type: 'LineString', coordinates: coords.slice(splitIdx) } },
    ];
    dbData.stations.forEach((st) => {
      features.push({
        type: 'Feature',
        properties: { code: st.station.code, name: st.station.name, isHalt: true, stationType: 'halt', status: st.status, platform: st.platform },
        geometry: { type: 'Point', coordinates: [st.station.longitude, st.station.latitude] },
      });
    });
    return { type: 'FeatureCollection', features } as unknown as T;
  }

  // 5. Timeline: trains/:trainNumber/timeline
  if (parts[0] === 'trains' && sub === 'timeline') {
    if (liveData?.route && liveSched?.route) {
      const schedByCode = new Map<string, any>();
      for (const stop of liveSched.route) {
        if (stop.station?.code) schedByCode.set(stop.station.code, stop);
      }

      const haltRoutes = (liveData.route as any[]).filter((r: any) => r.isHalt);
      const currentSeq = liveData.currentLocation?.sequence || 0;

      const stations: JourneyStation[] = haltRoutes.map((stop: any) => {
        const sched = schedByCode.get(stop.stationCode || '');
        const stationObj = {
          code: stop.stationCode || '',
          name: stop.stationName || '',
          latitude: sched?.station?.lat || 0,
          longitude: sched?.station?.lng || 0,
        };

        let status: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
        if (stop.status === 'departed' || (stop.sequence && stop.sequence < currentSeq)) {
          status = 'COMPLETED';
        } else if (stop.stationCode === liveData.nextHalt?.stationCode || stop.status === 'at-station') {
          status = 'CURRENT';
        } else {
          status = 'UPCOMING';
        }

        const delay = Math.round(stop.delayArrival ?? stop.delayDeparture ?? liveData.delayMinutes ?? 0);

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
          isHalt: true,
        };
      });

      return stations as unknown as T;
    } else if (liveSched?.route) {
      const halts = liveSched.route.filter((s: any) => s.isHalt && s.station);
      const stations: JourneyStation[] = halts.map((s: any, idx: number) => ({
        station: {
          code: s.station.code,
          name: s.station.name,
          latitude: s.station.lat,
          longitude: s.station.lng,
        },
        distanceFromSourceKm: Math.round(s.distance || 0),
        scheduledArrival: s.arrival,
        scheduledDeparture: s.departure,
        platform: s.platform,
        delayMinutes: 0,
        status: idx < 3 ? 'COMPLETED' : idx === 3 ? 'CURRENT' : 'UPCOMING',
        isHalt: true,
      }));
      return stations as unknown as T;
    }
    return dbData.stations as unknown as T;
  }

  // 6. Elevation: trains/:trainNumber/elevation
  if (parts[0] === 'trains' && sub === 'elevation') {
    return {
      profile: [
        { distanceKm: 0, elevationMeters: 14, stationCode: 'MMCT', stationName: 'Origin' },
        { distanceKm: 300, elevationMeters: 150, stationCode: 'ST', stationName: 'Way 1' },
        { distanceKm: 650, elevationMeters: 493, stationCode: 'RTM', stationName: 'Central Plateau' },
        { distanceKm: 1000, elevationMeters: 271, stationCode: 'KOTA', stationName: 'Way 2' },
        { distanceKm: 1386, elevationMeters: 216, stationCode: 'NDLS', stationName: 'Destination' },
      ],
      currentElevationMeters: 493,
      highestElevationMeters: 512,
      lowestElevationMeters: 14,
      elevationGainMeters: 498,
    } as unknown as T;
  }

  // 7. Delays: trains/:trainNumber/delays
  if (parts[0] === 'trains' && sub === 'delays') {
    if (liveData?.route) {
      const halts = (liveData.route as any[]).filter((r: any) => r.isHalt);
      return halts.map((s: any) => ({
        stationCode: s.stationCode || '',
        stationName: s.stationName || '',
        scheduledTime: isoToHHMM(s.scheduledArrival) || isoToHHMM(s.scheduledDeparture) || '00:00',
        actualTime: isoToHHMM(s.actualArrival) || isoToHHMM(s.actualDeparture) || isoToHHMM(s.scheduledArrival) || '00:00',
        delayMinutes: Math.round(s.delayArrival ?? s.delayDeparture ?? liveData.delayMinutes ?? 0),
        distanceKm: Math.round(s.distance || 0),
      })) as unknown as T;
    }
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
        stationName: 'Current Location',
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
        stationName: 'Next Station',
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
        stationName: 'Destination',
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
        name: 'Heritage Railway Corridor Landmark',
        type: 'MONUMENT',
        latitude: 18.9400,
        longitude: 72.8353,
        distanceFromRouteKm: 3.5,
        description: 'Historic station architectural marvel connecting interstate networks.',
      },
      {
        id: 'poi-2',
        name: 'National Forest & Natural Landmark',
        type: 'MOUNTAIN',
        latitude: 19.2215,
        longitude: 72.9124,
        distanceFromRouteKm: 4.2,
        description: 'Protected forest expanse along the railway lines.',
      },
      {
        id: 'poi-3',
        name: 'River Basin Bridge Crossing',
        type: 'RIVER',
        latitude: 21.2185,
        longitude: 72.8360,
        distanceFromRouteKm: 1.2,
        description: 'Major river crossing engineered across tidal waters.',
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
