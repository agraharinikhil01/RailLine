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
  ASH: { code: 'ASH', name: 'Aishbagh Junction', latitude: 26.8373, longitude: 80.9100, state: 'Uttar Pradesh' },
  LKO: { code: 'LKO', name: 'Lucknow Charbagh', latitude: 26.8317, longitude: 80.9234, state: 'Uttar Pradesh' },
  LJN: { code: 'LJN', name: 'Lucknow Junction NER', latitude: 26.8322, longitude: 80.9218, state: 'Uttar Pradesh' },
  BNZ: { code: 'BNZ', name: 'Badshahnagar', latitude: 26.8742, longitude: 80.9856, state: 'Uttar Pradesh' },
  BBK: { code: 'BBK', name: 'Barabanki Junction', latitude: 26.9248, longitude: 81.1895, state: 'Uttar Pradesh' },
  GD: { code: 'GD', name: 'Gonda Junction', latitude: 27.1352, longitude: 81.9610, state: 'Uttar Pradesh' },
  BST: { code: 'BST', name: 'Basti', latitude: 26.7997, longitude: 82.7533, state: 'Uttar Pradesh' },
  KLD: { code: 'KLD', name: 'Khalilabad', latitude: 26.7788, longitude: 83.0711, state: 'Uttar Pradesh' },
  GKP: { code: 'GKP', name: 'Gorakhpur Junction', latitude: 26.7588, longitude: 83.3820, state: 'Uttar Pradesh' },
  DEOS: { code: 'DEOS', name: 'Deoria Sadar', latitude: 26.5024, longitude: 83.7797, state: 'Uttar Pradesh' },
  SV: { code: 'SV', name: 'Siwan Junction', latitude: 26.2205, longitude: 84.3571, state: 'Bihar' },
  CPR: { code: 'CPR', name: 'Chhapra Junction', latitude: 25.7796, longitude: 84.7499, state: 'Bihar' },
  SEE: { code: 'SEE', name: 'Sonpur Junction', latitude: 25.6980, longitude: 85.1950, state: 'Bihar' },
  HJP: { code: 'HJP', name: 'Hajipur Junction', latitude: 25.6858, longitude: 85.2137, state: 'Bihar' },
  MFP: { code: 'MFP', name: 'Muzaffarpur Junction', latitude: 26.1209, longitude: 85.3906, state: 'Bihar' },
  SPJ: { code: 'SPJ', name: 'Samastipur Junction', latitude: 25.8631, longitude: 85.7813, state: 'Bihar' },
  DSS: { code: 'DSS', name: 'Dalsingh Sarai', latitude: 25.6667, longitude: 85.8333, state: 'Bihar' },
  BJU: { code: 'BJU', name: 'Barauni Junction', latitude: 25.4746, longitude: 85.9734, state: 'Bihar' },
  BGS: { code: 'BGS', name: 'Begusarai', latitude: 25.4182, longitude: 86.1311, state: 'Bihar' },
  KGG: { code: 'KGG', name: 'Khagaria Junction', latitude: 25.5034, longitude: 86.4716, state: 'Bihar' },
  MNE: { code: 'MNE', name: 'Mansi Junction', latitude: 25.5256, longitude: 86.5878, state: 'Bihar' },
  SHC: { code: 'SHC', name: 'Saharsa Junction', latitude: 25.8835, longitude: 86.6006, state: 'Bihar' },
  LLP: { code: 'LLP', name: 'Lalit Gram', latitude: 26.4258, longitude: 87.0375, state: 'Bihar' },
  PRYJ: { code: 'PRYJ', name: 'Prayagraj Junction', latitude: 25.4358, longitude: 81.8463, state: 'Uttar Pradesh' },
  DDU: { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn', latitude: 25.2796, longitude: 83.1189, state: 'Uttar Pradesh' },
  BSB: { code: 'BSB', name: 'Varanasi Junction', latitude: 25.3283, longitude: 82.9868, state: 'Uttar Pradesh' },
  GAYA: { code: 'GAYA', name: 'Gaya Junction', latitude: 24.8073, longitude: 84.9996, state: 'Bihar' },
  DHN: { code: 'DHN', name: 'Dhanbad Junction', latitude: 23.7925, longitude: 86.4304, state: 'Jharkhand' },
  ASN: { code: 'ASN', name: 'Asansol Junction', latitude: 23.6871, longitude: 86.9746, state: 'West Bengal' },
  HWH: { code: 'HWH', name: 'Howrah Junction', latitude: 22.5839, longitude: 88.3426, state: 'West Bengal' },
  HSR: { code: 'HSR', name: 'Hisar Junction', latitude: 29.1539, longitude: 75.7229, state: 'Haryana' },
  BTI: { code: 'BTI', name: 'Bathinda Junction', latitude: 30.2110, longitude: 74.9455, state: 'Punjab' },
  SSA: { code: 'SSA', name: 'Sirsa', latitude: 29.5349, longitude: 75.0294, state: 'Haryana' },
  BHT: { code: 'BHT', name: 'Bhattu', latitude: 29.3900, longitude: 75.3400, state: 'Haryana' },
  ADR: { code: 'ADR', name: 'Mandi Adampur', latitude: 29.2700, longitude: 75.4600, state: 'Haryana' },
  BNW: { code: 'BNW', name: 'Bhiwani Junction', latitude: 28.7930, longitude: 76.1390, state: 'Haryana' },
  KLNK: { code: 'KLNK', name: 'Kalanaur Kalan', latitude: 28.8300, longitude: 76.3900, state: 'Haryana' },
  ROK: { code: 'ROK', name: 'Rohtak Junction', latitude: 28.8955, longitude: 76.6066, state: 'Haryana' },
  BGZ: { code: 'BGZ', name: 'Bahadurgarh', latitude: 28.6925, longitude: 76.9238, state: 'Haryana' },
  NNO: { code: 'NNO', name: 'Nangloi', latitude: 28.6833, longitude: 77.0667, state: 'Delhi' },
  SSB: { code: 'SSB', name: 'Shakur Basti', latitude: 28.6833, longitude: 77.1308, state: 'Delhi' },
  DBG: { code: 'DBG', name: 'Darbhanga Junction', latitude: 26.1542, longitude: 85.8918, state: 'Bihar' },
  RJPB: { code: 'RJPB', name: 'Rajendra Nagar Terminal', latitude: 25.5975, longitude: 85.1633, state: 'Bihar' },
  PURI: { code: 'PURI', name: 'Puri', latitude: 19.8135, longitude: 85.8312, state: 'Odisha' },
  BKN: { code: 'BKN', name: 'Bikaner Junction', latitude: 28.0167, longitude: 73.3119, state: 'Rajasthan' },
  SDAH: { code: 'SDAH', name: 'Sealdah', latitude: 22.5697, longitude: 88.3713, state: 'West Bengal' },
  NZM: { code: 'NZM', name: 'Hazrat Nizamuddin', latitude: 28.5889, longitude: 77.2534, state: 'Delhi' },
  CSMT: { code: 'CSMT', name: 'Mumbai CSMT', latitude: 18.9402, longitude: 72.8356, state: 'Maharashtra' },
  FZR: { code: 'FZR', name: 'Firozpur Cantt', latitude: 30.9237, longitude: 74.6136, state: 'Punjab' },
  BBS: { code: 'BBS', name: 'Bhubaneswar', latitude: 20.2644, longitude: 85.8427, state: 'Odisha' },
  HYB: { code: 'HYB', name: 'Hyderabad Deccan', latitude: 17.3924, longitude: 78.4682, state: 'Telangana' },
  DNR: { code: 'DNR', name: 'Danapur', latitude: 25.6267, longitude: 85.0441, state: 'Bihar' },
  SMVB: { code: 'SMVB', name: 'SMVT Bengaluru', latitude: 13.0039, longitude: 77.6534, state: 'Karnataka' },
  ASR: { code: 'ASR', name: 'Amritsar Junction', latitude: 31.6340, longitude: 74.8723, state: 'Punjab' },
  DLI: { code: 'DLI', name: 'Old Delhi Junction', latitude: 28.6606, longitude: 77.2285, state: 'Delhi' },
  AYC: { code: 'AYC', name: 'Ayodhya Cantt', latitude: 26.7756, longitude: 82.1384, state: 'Uttar Pradesh' },
  GNC: { code: 'GNC', name: 'Gandhinagar Capital', latitude: 23.2354, longitude: 72.6397, state: 'Gujarat' },
  SVDK: { code: 'SVDK', name: 'SMVD Katra', latitude: 32.9902, longitude: 74.9318, state: 'Jammu and Kashmir' },
  DBRG: { code: 'DBRG', name: 'Dibrugarh', latitude: 27.4728, longitude: 94.9120, state: 'Assam' },
  AGC: { code: 'AGC', name: 'Agra Cantt', latitude: 27.1593, longitude: 78.0062, state: 'Uttar Pradesh' },
  GWL: { code: 'GWL', name: 'Gwalior Junction', latitude: 26.2163, longitude: 78.1882, state: 'Madhya Pradesh' },
  VGLJ: { code: 'VGLJ', name: 'VGL Jhansi Junction', latitude: 25.4484, longitude: 78.5685, state: 'Uttar Pradesh' },
  BPL: { code: 'BPL', name: 'Bhopal Junction', latitude: 23.2662, longitude: 77.4143, state: 'Madhya Pradesh' },
  RKMP: { code: 'RKMP', name: 'Rani Kamlapati', latitude: 23.2167, longitude: 77.4419, state: 'Madhya Pradesh' },
  NGP: { code: 'NGP', name: 'Nagpur Junction', latitude: 21.1524, longitude: 79.0888, state: 'Maharashtra' },
  BZA: { code: 'BZA', name: 'Vijayawada Junction', latitude: 16.5173, longitude: 80.6200, state: 'Andhra Pradesh' },
  MAS: { code: 'MAS', name: 'Mgr Chennai Central', latitude: 13.0827, longitude: 80.2707, state: 'Tamil Nadu' },
  ERS: { code: 'ERS', name: 'Ernakulam Junction', latitude: 9.9678, longitude: 76.2949, state: 'Kerala' },
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
  '12002': {
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
      {
        station: STATIONS_MAP['NDLS'],
        scheduledDeparture: '06:00',
        actualDeparture: '06:00',
        platform: '1',
        distanceFromSourceKm: 0,
        delayMinutes: 0,
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['MTJ'],
        scheduledArrival: '07:19',
        scheduledDeparture: '07:20',
        actualArrival: '07:22',
        actualDeparture: '07:24',
        platform: '1',
        distanceFromSourceKm: 141,
        delayMinutes: 4,
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['AGC'],
        scheduledArrival: '07:50',
        scheduledDeparture: '07:55',
        actualArrival: '07:58',
        actualDeparture: '08:02',
        platform: '1',
        distanceFromSourceKm: 195,
        delayMinutes: 7,
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['GWL'],
        scheduledArrival: '09:23',
        scheduledDeparture: '09:28',
        platform: '1',
        distanceFromSourceKm: 313,
        delayMinutes: 5,
        status: 'CURRENT',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['VGLJ'],
        scheduledArrival: '10:45',
        scheduledDeparture: '10:53',
        platform: '2',
        distanceFromSourceKm: 410,
        delayMinutes: 8,
        status: 'UPCOMING',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['BPL'],
        scheduledArrival: '14:07',
        scheduledDeparture: '14:12',
        platform: '1',
        distanceFromSourceKm: 702,
        delayMinutes: 10,
        status: 'UPCOMING',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['RKMP'],
        scheduledArrival: '14:30',
        platform: '1',
        distanceFromSourceKm: 708,
        delayMinutes: 10,
        status: 'UPCOMING',
        isHalt: true,
      },
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
  },
  '12626': {
    train: {
      id: 'train_12626',
      trainNumber: '12626',
      name: 'Kerala Superfast Express',
      type: 'Superfast Express',
      source: { code: 'NDLS', name: 'New Delhi' },
      destination: { code: 'TVC', name: 'Thiruvananthapuram Central' },
      totalDistanceKm: 3036,
      totalDurationMinutes: 3030,
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      route: [
        { code: 'NDLS', name: 'New Delhi', scheduledDeparture: '20:10' },
        { code: 'MTJ', name: 'Mathura Junction', scheduledArrival: '21:38', scheduledDeparture: '21:40' },
        { code: 'AGC', name: 'Agra Cantt', scheduledArrival: '22:20', scheduledDeparture: '22:25' },
        { code: 'GWL', name: 'Gwalior Junction', scheduledArrival: '00:03', scheduledDeparture: '00:05' },
        { code: 'BPL', name: 'Bhopal Junction', scheduledArrival: '05:20', scheduledDeparture: '05:25' },
        { code: 'NGP', name: 'Nagpur Junction', scheduledArrival: '11:45', scheduledDeparture: '11:50' },
        { code: 'BZA', name: 'Vijayawada Junction', scheduledArrival: '22:00', scheduledDeparture: '22:10' },
        { code: 'ERS', name: 'Ernakulam Junction', scheduledArrival: '16:55', scheduledDeparture: '17:00' },
        { code: 'TVC', name: 'Thiruvananthapuram Central', scheduledArrival: '22:10' },
      ],
    },
    stations: [
      {
        station: STATIONS_MAP['NDLS'],
        scheduledDeparture: '20:10',
        actualDeparture: '20:10',
        platform: '3',
        distanceFromSourceKm: 0,
        delayMinutes: 0,
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['MTJ'],
        scheduledArrival: '21:38',
        scheduledDeparture: '21:40',
        actualArrival: '21:45',
        actualDeparture: '21:47',
        platform: '1',
        distanceFromSourceKm: 141,
        delayMinutes: 7,
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['AGC'],
        scheduledArrival: '22:20',
        scheduledDeparture: '22:25',
        actualArrival: '22:30',
        actualDeparture: '22:36',
        platform: '1',
        distanceFromSourceKm: 195,
        delayMinutes: 11,
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['GWL'],
        scheduledArrival: '00:03',
        scheduledDeparture: '00:05',
        actualArrival: '00:18',
        actualDeparture: '00:20',
        platform: '1',
        distanceFromSourceKm: 313,
        delayMinutes: 15,
        status: 'COMPLETED',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['BPL'],
        scheduledArrival: '05:20',
        scheduledDeparture: '05:25',
        platform: '1',
        distanceFromSourceKm: 702,
        delayMinutes: 20,
        status: 'CURRENT',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['NGP'],
        scheduledArrival: '11:45',
        scheduledDeparture: '11:50',
        platform: '2',
        distanceFromSourceKm: 1092,
        delayMinutes: 25,
        status: 'UPCOMING',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['BZA'],
        scheduledArrival: '22:00',
        scheduledDeparture: '22:10',
        platform: '7',
        distanceFromSourceKm: 1756,
        delayMinutes: 30,
        status: 'UPCOMING',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['ERS'],
        scheduledArrival: '16:55',
        scheduledDeparture: '17:00',
        platform: '1',
        distanceFromSourceKm: 2830,
        delayMinutes: 25,
        status: 'UPCOMING',
        isHalt: true,
      },
      {
        station: STATIONS_MAP['TVC'],
        scheduledArrival: '22:10',
        platform: '2',
        distanceFromSourceKm: 3036,
        delayMinutes: 20,
        status: 'UPCOMING',
        isHalt: true,
      },
    ],
    routeCoordinates: [
      [77.2195, 28.6429],
      [77.6737, 27.4924],
      [78.0062, 27.1593],
      [78.1882, 26.2163],
      [77.4143, 23.2662],
      [79.0888, 21.1524],
      [80.6200, 16.5173],
      [76.2949, 9.9678],
      [76.9525, 8.4875],
    ],
  },
  '15566': {
    train: {
      id: 'train_15566',
      trainNumber: '15566',
      name: 'Vaishali Express',
      type: 'Superfast Express',
      source: { code: 'NDLS', name: 'New Delhi' },
      destination: { code: 'LLP', name: 'Lalit Gram' },
      totalDistanceKm: 1380,
      totalDurationMinutes: 1565,
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      route: [
        { code: 'NDLS', name: 'New Delhi', scheduledDeparture: '20:40' },
        { code: 'GZB', name: 'Ghaziabad Junction', scheduledArrival: '21:26', scheduledDeparture: '21:28' },
        { code: 'ALJN', name: 'Aligarh Junction', scheduledArrival: '22:46', scheduledDeparture: '22:48' },
        { code: 'TDL', name: 'Tundla Junction', scheduledArrival: '23:45', scheduledDeparture: '23:47' },
        { code: 'ETW', name: 'Etawah Junction', scheduledArrival: '00:53', scheduledDeparture: '00:55' },
        { code: 'CNB', name: 'Kanpur Central', scheduledArrival: '02:45', scheduledDeparture: '02:50' },
        { code: 'ASH', name: 'Aishbagh Junction', scheduledArrival: '04:35', scheduledDeparture: '04:45' },
        { code: 'BNZ', name: 'Badshahnagar', scheduledArrival: '05:07', scheduledDeparture: '05:10' },
        { code: 'BBK', name: 'Barabanki Junction', scheduledArrival: '05:46', scheduledDeparture: '05:48' },
        { code: 'GD', name: 'Gonda Junction', scheduledArrival: '07:10', scheduledDeparture: '07:15' },
        { code: 'BST', name: 'Basti', scheduledArrival: '08:26', scheduledDeparture: '08:29' },
        { code: 'KLD', name: 'Khalilabad', scheduledArrival: '08:58', scheduledDeparture: '09:00' },
        { code: 'GKP', name: 'Gorakhpur Junction', scheduledArrival: '09:50', scheduledDeparture: '10:00' },
        { code: 'DEOS', name: 'Deoria Sadar', scheduledArrival: '10:58', scheduledDeparture: '11:00' },
        { code: 'SV', name: 'Siwan Junction', scheduledArrival: '11:55', scheduledDeparture: '12:00' },
        { code: 'CPR', name: 'Chhapra Junction', scheduledArrival: '13:15', scheduledDeparture: '13:25' },
        { code: 'SEE', name: 'Sonpur Junction', scheduledArrival: '14:28', scheduledDeparture: '14:30' },
        { code: 'HJP', name: 'Hajipur Junction', scheduledArrival: '14:40', scheduledDeparture: '14:45' },
        { code: 'MFP', name: 'Muzaffarpur Junction', scheduledArrival: '15:45', scheduledDeparture: '15:50' },
        { code: 'SPJ', name: 'Samastipur Junction', scheduledArrival: '16:50', scheduledDeparture: '16:55' },
        { code: 'DSS', name: 'Dalsingh Sarai', scheduledArrival: '17:16', scheduledDeparture: '17:18' },
        { code: 'BJU', name: 'Barauni Junction', scheduledArrival: '18:00', scheduledDeparture: '18:10' },
        { code: 'BGS', name: 'Begusarai', scheduledArrival: '18:31', scheduledDeparture: '18:33' },
        { code: 'KGG', name: 'Khagaria Junction', scheduledArrival: '19:15', scheduledDeparture: '19:17' },
        { code: 'MNE', name: 'Mansi Junction', scheduledArrival: '19:33', scheduledDeparture: '19:35' },
        { code: 'SHC', name: 'Saharsa Junction', scheduledArrival: '20:30', scheduledDeparture: '21:00' },
        { code: 'LLP', name: 'Lalit Gram', scheduledArrival: '22:45' },
      ],
    },
    stations: [
      { station: STATIONS_MAP['NDLS'], distanceFromSourceKm: 0, scheduledDeparture: '20:40', actualDeparture: '20:45', delayMinutes: 5, platform: '8', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['GZB'], distanceFromSourceKm: 26, scheduledArrival: '21:26', scheduledDeparture: '21:28', actualArrival: '21:35', actualDeparture: '21:38', delayMinutes: 10, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['ALJN'], distanceFromSourceKm: 131, scheduledArrival: '22:46', scheduledDeparture: '22:48', actualArrival: '22:58', actualDeparture: '23:01', delayMinutes: 13, platform: '3', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['TDL'], distanceFromSourceKm: 209, scheduledArrival: '23:45', scheduledDeparture: '23:47', actualArrival: '00:02', actualDeparture: '00:05', delayMinutes: 18, platform: '5', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['ETW'], distanceFromSourceKm: 301, scheduledArrival: '00:53', scheduledDeparture: '00:55', actualArrival: '01:15', actualDeparture: '01:17', delayMinutes: 22, platform: '3', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['CNB'], distanceFromSourceKm: 440, scheduledArrival: '02:45', scheduledDeparture: '02:50', actualArrival: '03:10', actualDeparture: '03:18', delayMinutes: 28, platform: '6', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['ASH'], distanceFromSourceKm: 512, scheduledArrival: '04:35', scheduledDeparture: '04:45', actualArrival: '05:00', actualDeparture: '05:12', delayMinutes: 27, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['BNZ'], distanceFromSourceKm: 523, scheduledArrival: '05:07', scheduledDeparture: '05:10', actualArrival: '05:32', actualDeparture: '05:35', delayMinutes: 25, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['BBK'], distanceFromSourceKm: 548, scheduledArrival: '05:46', scheduledDeparture: '05:48', actualArrival: '06:12', actualDeparture: '06:15', delayMinutes: 27, platform: '3', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['GD'], distanceFromSourceKm: 637, scheduledArrival: '07:10', scheduledDeparture: '07:15', actualArrival: '07:42', actualDeparture: '07:48', delayMinutes: 33, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['BST'], distanceFromSourceKm: 726, scheduledArrival: '08:26', scheduledDeparture: '08:29', actualArrival: '08:58', actualDeparture: '09:02', delayMinutes: 33, platform: '3', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['KLD'], distanceFromSourceKm: 755, scheduledArrival: '08:58', scheduledDeparture: '09:00', actualArrival: '09:30', actualDeparture: '09:32', delayMinutes: 32, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['GKP'], distanceFromSourceKm: 789, scheduledArrival: '09:50', scheduledDeparture: '10:00', actualArrival: '10:20', actualDeparture: '10:32', delayMinutes: 32, platform: '1', status: 'CURRENT', isHalt: true },
      { station: STATIONS_MAP['DEOS'], distanceFromSourceKm: 839, scheduledArrival: '10:58', scheduledDeparture: '11:00', expectedArrival: '11:28', expectedDeparture: '11:30', delayMinutes: 30, platform: '3', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['SV'], distanceFromSourceKm: 908, scheduledArrival: '11:55', scheduledDeparture: '12:00', expectedArrival: '12:22', expectedDeparture: '12:27', delayMinutes: 27, platform: '1', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['CPR'], distanceFromSourceKm: 970, scheduledArrival: '13:15', scheduledDeparture: '13:25', expectedArrival: '13:40', expectedDeparture: '13:50', delayMinutes: 25, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['SEE'], distanceFromSourceKm: 1024, scheduledArrival: '14:28', scheduledDeparture: '14:30', expectedArrival: '14:52', expectedDeparture: '14:54', delayMinutes: 24, platform: '4', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['HJP'], distanceFromSourceKm: 1029, scheduledArrival: '14:40', scheduledDeparture: '14:45', expectedArrival: '15:02', expectedDeparture: '15:07', delayMinutes: 22, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['MFP'], distanceFromSourceKm: 1083, scheduledArrival: '15:45', scheduledDeparture: '15:50', expectedArrival: '16:05', expectedDeparture: '16:10', delayMinutes: 20, platform: '1', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['SPJ'], distanceFromSourceKm: 1135, scheduledArrival: '16:50', scheduledDeparture: '16:55', expectedArrival: '17:08', expectedDeparture: '17:13', delayMinutes: 18, platform: '4', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['DSS'], distanceFromSourceKm: 1158, scheduledArrival: '17:16', scheduledDeparture: '17:18', expectedArrival: '17:34', expectedDeparture: '17:36', delayMinutes: 18, platform: '1', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['BJU'], distanceFromSourceKm: 1186, scheduledArrival: '18:00', scheduledDeparture: '18:10', expectedArrival: '18:16', expectedDeparture: '18:26', delayMinutes: 16, platform: '5', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['BGS'], distanceFromSourceKm: 1201, scheduledArrival: '18:31', scheduledDeparture: '18:33', expectedArrival: '18:46', expectedDeparture: '18:48', delayMinutes: 15, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['KGG'], distanceFromSourceKm: 1241, scheduledArrival: '19:15', scheduledDeparture: '19:17', expectedArrival: '19:28', expectedDeparture: '19:30', delayMinutes: 13, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['MNE'], distanceFromSourceKm: 1250, scheduledArrival: '19:33', scheduledDeparture: '19:35', expectedArrival: '19:45', expectedDeparture: '19:47', delayMinutes: 12, platform: '1', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['SHC'], distanceFromSourceKm: 1292, scheduledArrival: '20:30', scheduledDeparture: '21:00', expectedArrival: '20:40', expectedDeparture: '21:10', delayMinutes: 10, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['LLP'], distanceFromSourceKm: 1380, scheduledArrival: '22:45', expectedArrival: '22:55', delayMinutes: 10, platform: '1', status: 'UPCOMING', isHalt: true },
    ],
    routeCoordinates: [
      [77.2195, 28.6429],
      [77.4338, 28.6678],
      [78.0880, 27.8974],
      [78.2435, 27.2069],
      [79.0232, 26.7768],
      [80.3507, 26.4547],
      [80.9100, 26.8373],
      [80.9856, 26.8742],
      [81.1895, 26.9248],
      [81.9610, 27.1352],
      [82.7533, 26.7997],
      [83.0711, 26.7788],
      [83.3820, 26.7588],
      [83.7797, 26.5024],
      [84.3571, 26.2205],
      [84.7499, 25.7796],
      [85.1950, 25.6980],
      [85.2137, 25.6858],
      [85.3906, 26.1209],
      [85.7813, 25.8631],
      [85.8333, 25.6667],
      [85.9734, 25.4746],
      [86.1311, 25.4182],
      [86.4716, 25.5034],
      [86.5878, 25.5256],
      [86.6006, 25.8835],
      [87.0375, 26.4258],
    ],
  },
  '15565': {
    train: {
      id: 'train_15565',
      trainNumber: '15565',
      name: 'Vaishali Express',
      type: 'Superfast Express',
      source: { code: 'LLP', name: 'Lalit Gram' },
      destination: { code: 'NDLS', name: 'New Delhi' },
      totalDistanceKm: 1380,
      totalDurationMinutes: 1590,
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      route: [
        { code: 'LLP', name: 'Lalit Gram', scheduledDeparture: '06:15' },
        { code: 'SHC', name: 'Saharsa Junction', scheduledArrival: '07:55', scheduledDeparture: '08:25' },
        { code: 'MNE', name: 'Mansi Junction', scheduledArrival: '09:18', scheduledDeparture: '09:20' },
        { code: 'KGG', name: 'Khagaria Junction', scheduledArrival: '09:32', scheduledDeparture: '09:34' },
        { code: 'BGS', name: 'Begusarai', scheduledArrival: '10:10', scheduledDeparture: '10:12' },
        { code: 'BJU', name: 'Barauni Junction', scheduledArrival: '10:50', scheduledDeparture: '11:00' },
        { code: 'DSS', name: 'Dalsingh Sarai', scheduledArrival: '11:32', scheduledDeparture: '11:34' },
        { code: 'SPJ', name: 'Samastipur Junction', scheduledArrival: '12:05', scheduledDeparture: '12:10' },
        { code: 'MFP', name: 'Muzaffarpur Junction', scheduledArrival: '13:00', scheduledDeparture: '13:05' },
        { code: 'HJP', name: 'Hajipur Junction', scheduledArrival: '14:05', scheduledDeparture: '14:10' },
        { code: 'SEE', name: 'Sonpur Junction', scheduledArrival: '14:20', scheduledDeparture: '14:22' },
        { code: 'CPR', name: 'Chhapra Junction', scheduledArrival: '15:35', scheduledDeparture: '15:45' },
        { code: 'SV', name: 'Siwan Junction', scheduledArrival: '16:40', scheduledDeparture: '16:45' },
        { code: 'DEOS', name: 'Deoria Sadar', scheduledArrival: '17:40', scheduledDeparture: '17:42' },
        { code: 'GKP', name: 'Gorakhpur Junction', scheduledArrival: '19:00', scheduledDeparture: '19:10' },
        { code: 'KLD', name: 'Khalilabad', scheduledArrival: '19:48', scheduledDeparture: '19:50' },
        { code: 'BST', name: 'Basti', scheduledArrival: '20:17', scheduledDeparture: '20:20' },
        { code: 'GD', name: 'Gonda Junction', scheduledArrival: '21:35', scheduledDeparture: '21:40' },
        { code: 'BBK', name: 'Barabanki Junction', scheduledArrival: '23:18', scheduledDeparture: '23:20' },
        { code: 'BNZ', name: 'Badshahnagar', scheduledArrival: '00:03', scheduledDeparture: '00:06' },
        { code: 'ASH', name: 'Aishbagh Junction', scheduledArrival: '00:30', scheduledDeparture: '00:40' },
        { code: 'CNB', name: 'Kanpur Central', scheduledArrival: '02:25', scheduledDeparture: '02:30' },
        { code: 'ETW', name: 'Etawah Junction', scheduledArrival: '04:00', scheduledDeparture: '04:02' },
        { code: 'TDL', name: 'Tundla Junction', scheduledArrival: '05:25', scheduledDeparture: '05:27' },
        { code: 'ALJN', name: 'Aligarh Junction', scheduledArrival: '06:28', scheduledDeparture: '06:30' },
        { code: 'GZB', name: 'Ghaziabad Junction', scheduledArrival: '07:48', scheduledDeparture: '07:50' },
        { code: 'NDLS', name: 'New Delhi', scheduledArrival: '08:45' },
      ],
    },
    stations: [
      { station: STATIONS_MAP['LLP'], distanceFromSourceKm: 0, scheduledDeparture: '06:15', actualDeparture: '06:15', delayMinutes: 0, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['SHC'], distanceFromSourceKm: 88, scheduledArrival: '07:55', scheduledDeparture: '08:25', actualArrival: '08:00', actualDeparture: '08:30', delayMinutes: 5, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['MNE'], distanceFromSourceKm: 130, scheduledArrival: '09:18', scheduledDeparture: '09:20', actualArrival: '09:25', actualDeparture: '09:27', delayMinutes: 7, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['KGG'], distanceFromSourceKm: 139, scheduledArrival: '09:32', scheduledDeparture: '09:34', actualArrival: '09:40', actualDeparture: '09:42', delayMinutes: 8, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['BGS'], distanceFromSourceKm: 179, scheduledArrival: '10:10', scheduledDeparture: '10:12', actualArrival: '10:20', actualDeparture: '10:22', delayMinutes: 10, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['BJU'], distanceFromSourceKm: 194, scheduledArrival: '10:50', scheduledDeparture: '11:00', actualArrival: '11:05', actualDeparture: '11:15', delayMinutes: 15, platform: '5', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['DSS'], distanceFromSourceKm: 222, scheduledArrival: '11:32', scheduledDeparture: '11:34', actualArrival: '11:46', actualDeparture: '11:48', delayMinutes: 14, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['SPJ'], distanceFromSourceKm: 245, scheduledArrival: '12:05', scheduledDeparture: '12:10', actualArrival: '12:20', actualDeparture: '12:25', delayMinutes: 15, platform: '4', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['MFP'], distanceFromSourceKm: 297, scheduledArrival: '13:00', scheduledDeparture: '13:05', actualArrival: '13:16', actualDeparture: '13:21', delayMinutes: 16, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['HJP'], distanceFromSourceKm: 351, scheduledArrival: '14:05', scheduledDeparture: '14:10', actualArrival: '14:22', actualDeparture: '14:27', delayMinutes: 17, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['SEE'], distanceFromSourceKm: 356, scheduledArrival: '14:20', scheduledDeparture: '14:22', actualArrival: '14:38', actualDeparture: '14:40', delayMinutes: 18, platform: '4', status: 'CURRENT', isHalt: true },
      { station: STATIONS_MAP['CPR'], distanceFromSourceKm: 410, scheduledArrival: '15:35', scheduledDeparture: '15:45', expectedArrival: '15:52', expectedDeparture: '16:02', delayMinutes: 17, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['SV'], distanceFromSourceKm: 472, scheduledArrival: '16:40', scheduledDeparture: '16:45', expectedArrival: '16:55', expectedDeparture: '17:00', delayMinutes: 15, platform: '1', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['DEOS'], distanceFromSourceKm: 541, scheduledArrival: '17:40', scheduledDeparture: '17:42', expectedArrival: '17:54', expectedDeparture: '17:56', delayMinutes: 14, platform: '3', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['GKP'], distanceFromSourceKm: 591, scheduledArrival: '19:00', scheduledDeparture: '19:10', expectedArrival: '19:15', expectedDeparture: '19:25', delayMinutes: 15, platform: '1', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['KLD'], distanceFromSourceKm: 625, scheduledArrival: '19:48', scheduledDeparture: '19:50', expectedArrival: '20:02', expectedDeparture: '20:04', delayMinutes: 14, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['BST'], distanceFromSourceKm: 654, scheduledArrival: '20:17', scheduledDeparture: '20:20', expectedArrival: '20:30', expectedDeparture: '20:33', delayMinutes: 13, platform: '3', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['GD'], distanceFromSourceKm: 743, scheduledArrival: '21:35', scheduledDeparture: '21:40', expectedArrival: '21:46', expectedDeparture: '21:51', delayMinutes: 11, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['BBK'], distanceFromSourceKm: 832, scheduledArrival: '23:18', scheduledDeparture: '23:20', expectedArrival: '23:28', expectedDeparture: '23:30', delayMinutes: 10, platform: '3', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['BNZ'], distanceFromSourceKm: 857, scheduledArrival: '00:03', scheduledDeparture: '00:06', expectedArrival: '00:12', expectedDeparture: '00:15', delayMinutes: 9, platform: '1', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['ASH'], distanceFromSourceKm: 868, scheduledArrival: '00:30', scheduledDeparture: '00:40', expectedArrival: '00:38', expectedDeparture: '00:48', delayMinutes: 8, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['CNB'], distanceFromSourceKm: 940, scheduledArrival: '02:25', scheduledDeparture: '02:30', expectedArrival: '02:32', expectedDeparture: '02:37', delayMinutes: 7, platform: '6', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['ETW'], distanceFromSourceKm: 1079, scheduledArrival: '04:00', scheduledDeparture: '04:02', expectedArrival: '04:06', expectedDeparture: '04:08', delayMinutes: 6, platform: '3', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['TDL'], distanceFromSourceKm: 1171, scheduledArrival: '05:25', scheduledDeparture: '05:27', expectedArrival: '05:30', expectedDeparture: '05:32', delayMinutes: 5, platform: '5', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['ALJN'], distanceFromSourceKm: 1249, scheduledArrival: '06:28', scheduledDeparture: '06:30', expectedArrival: '06:32', expectedDeparture: '06:34', delayMinutes: 4, platform: '3', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['GZB'], distanceFromSourceKm: 1354, scheduledArrival: '07:48', scheduledDeparture: '07:50', expectedArrival: '07:51', expectedDeparture: '07:53', delayMinutes: 3, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['NDLS'], distanceFromSourceKm: 1380, scheduledArrival: '08:45', expectedArrival: '08:48', delayMinutes: 3, platform: '8', status: 'UPCOMING', isHalt: true },
    ],
    routeCoordinates: [
      [87.0375, 26.4258],
      [86.6006, 25.8835],
      [86.5878, 25.5256],
      [86.4716, 25.5034],
      [86.1311, 25.4182],
      [85.9734, 25.4746],
      [85.8333, 25.6667],
      [85.7813, 25.8631],
      [85.3906, 26.1209],
      [85.2137, 25.6858],
      [85.1950, 25.6980],
      [84.7499, 25.7796],
      [84.3571, 26.2205],
      [83.7797, 26.5024],
      [83.3820, 26.7588],
      [83.0711, 26.7788],
      [82.7533, 26.7997],
      [81.9610, 27.1352],
      [81.1895, 26.9248],
      [80.9856, 26.8742],
      [80.9100, 26.8373],
      [80.3507, 26.4547],
      [79.0232, 26.7768],
      [78.2435, 27.2069],
      [78.0880, 27.8974],
      [77.4338, 28.6678],
      [77.2195, 28.6429],
    ],
  },
  '12556': {
    train: {
      id: 'train_12556',
      trainNumber: '12556',
      name: 'Gorakhdham Superfast Express',
      type: 'Superfast Express',
      source: { code: 'HSR', name: 'Hisar Junction' },
      destination: { code: 'GKP', name: 'Gorakhpur Junction' },
      totalDistanceKm: 960,
      totalDurationMinutes: 1005,
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      route: [
        { code: 'HSR', name: 'Hisar Junction', scheduledDeparture: '17:00' },
        { code: 'BNW', name: 'Bhiwani Junction', scheduledArrival: '17:40', scheduledDeparture: '17:45' },
        { code: 'KLNK', name: 'Kalanaur Kalan', scheduledArrival: '18:10', scheduledDeparture: '18:12' },
        { code: 'ROK', name: 'Rohtak Junction', scheduledArrival: '18:35', scheduledDeparture: '18:37' },
        { code: 'BGZ', name: 'Bahadurgarh', scheduledArrival: '19:10', scheduledDeparture: '19:12' },
        { code: 'SSB', name: 'Shakur Basti', scheduledArrival: '19:40', scheduledDeparture: '19:42' },
        { code: 'NDLS', name: 'New Delhi', scheduledArrival: '20:55', scheduledDeparture: '21:25' },
        { code: 'CNB', name: 'Kanpur Central', scheduledArrival: '02:55', scheduledDeparture: '03:00' },
        { code: 'LKO', name: 'Lucknow Charbagh', scheduledArrival: '04:50', scheduledDeparture: '05:00' },
        { code: 'BBK', name: 'Barabanki Junction', scheduledArrival: '05:43', scheduledDeparture: '05:45' },
        { code: 'GD', name: 'Gonda Junction', scheduledArrival: '07:05', scheduledDeparture: '07:10' },
        { code: 'BST', name: 'Basti', scheduledArrival: '08:18', scheduledDeparture: '08:21' },
        { code: 'KLD', name: 'Khalilabad', scheduledArrival: '08:48', scheduledDeparture: '08:50' },
        { code: 'GKP', name: 'Gorakhpur Junction', scheduledArrival: '09:45' },
      ],
    },
    stations: [
      { station: STATIONS_MAP['HSR'], distanceFromSourceKm: 0, scheduledDeparture: '17:00', actualDeparture: '17:02', delayMinutes: 2, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['BNW'], distanceFromSourceKm: 60, scheduledArrival: '17:40', scheduledDeparture: '17:45', actualArrival: '17:48', actualDeparture: '17:53', delayMinutes: 8, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['KLNK'], distanceFromSourceKm: 89, scheduledArrival: '18:10', scheduledDeparture: '18:12', actualArrival: '18:22', actualDeparture: '18:24', delayMinutes: 12, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['ROK'], distanceFromSourceKm: 109, scheduledArrival: '18:35', scheduledDeparture: '18:37', actualArrival: '18:50', actualDeparture: '18:54', delayMinutes: 17, platform: '1', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['BGZ'], distanceFromSourceKm: 149, scheduledArrival: '19:10', scheduledDeparture: '19:12', actualArrival: '19:30', actualDeparture: '19:32', delayMinutes: 20, platform: '2', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['SSB'], distanceFromSourceKm: 168, scheduledArrival: '19:40', scheduledDeparture: '19:42', actualArrival: '20:05', actualDeparture: '20:07', delayMinutes: 25, platform: '3', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['NDLS'], distanceFromSourceKm: 179, scheduledArrival: '20:55', scheduledDeparture: '21:25', actualArrival: '21:25', actualDeparture: '21:55', delayMinutes: 30, platform: '6', status: 'COMPLETED', isHalt: true },
      { station: STATIONS_MAP['CNB'], distanceFromSourceKm: 619, scheduledArrival: '02:55', scheduledDeparture: '03:00', actualArrival: '03:32', actualDeparture: '03:38', delayMinutes: 38, platform: '7', status: 'CURRENT', isHalt: true },
      { station: STATIONS_MAP['LKO'], distanceFromSourceKm: 691, scheduledArrival: '04:50', scheduledDeparture: '05:00', expectedArrival: '05:25', expectedDeparture: '05:35', delayMinutes: 35, platform: '4', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['BBK'], distanceFromSourceKm: 719, scheduledArrival: '05:43', scheduledDeparture: '05:45', expectedArrival: '06:15', expectedDeparture: '06:17', delayMinutes: 32, platform: '3', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['GD'], distanceFromSourceKm: 808, scheduledArrival: '07:05', scheduledDeparture: '07:10', expectedArrival: '07:35', expectedDeparture: '07:40', delayMinutes: 30, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['BST'], distanceFromSourceKm: 897, scheduledArrival: '08:18', scheduledDeparture: '08:21', expectedArrival: '08:44', expectedDeparture: '08:47', delayMinutes: 26, platform: '3', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['KLD'], distanceFromSourceKm: 926, scheduledArrival: '08:48', scheduledDeparture: '08:50', expectedArrival: '09:12', expectedDeparture: '09:14', delayMinutes: 24, platform: '2', status: 'UPCOMING', isHalt: true },
      { station: STATIONS_MAP['GKP'], distanceFromSourceKm: 960, scheduledArrival: '09:45', expectedArrival: '10:05', delayMinutes: 20, platform: '5', status: 'UPCOMING', isHalt: true },
    ],
    routeCoordinates: [
      [75.7229, 29.1539],
      [76.1390, 28.7930],
      [76.3900, 28.8300],
      [76.6066, 28.8955],
      [76.9238, 28.6925],
      [77.1308, 28.6833],
      [77.2195, 28.6429],
      [80.3507, 26.4547],
      [80.9234, 26.8317],
      [81.1895, 26.9248],
      [81.9610, 27.1352],
      [82.7533, 26.7997],
      [83.0711, 26.7788],
      [83.3820, 26.7588],
    ],
  },
};

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

export function getOrCreateTrainRouteData(trainNumber: string): TrainRouteData | null {
  if (TRAINS_DATABASE[trainNumber]) {
    return TRAINS_DATABASE[trainNumber];
  }

  // Check POPULAR_SEARCH_CATALOG for metadata
  const catalogItem = POPULAR_SEARCH_CATALOG.find((t) => t.trainNumber === trainNumber);
  if (!catalogItem) {
    return null;
  }

  const name = catalogItem.name;
  const srcCode = catalogItem.sourceCode || 'NDLS';
  const srcName = catalogItem.source || 'New Delhi';
  const dstCode = catalogItem.destinationCode || 'HWH';
  const dstName = catalogItem.destination || 'Destination';
  const days = catalogItem.runningDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const srcStation: Station = STATIONS_MAP[srcCode] || {
    code: srcCode,
    name: srcName,
    latitude: 28.6429,
    longitude: 77.2195,
  };
  const dstStation: Station = STATIONS_MAP[dstCode] || {
    code: dstCode,
    name: dstName,
    latitude: 25.5975,
    longitude: 85.1633,
  };

  // Build a route corridor
  const stops: Station[] = [srcStation];
  const candidates = ['CNB', 'PRYJ', 'BSB', 'DDU', 'GAYA'].filter(
    (c) => c !== srcCode && c !== dstCode && STATIONS_MAP[c]
  );
  candidates.forEach((c) => {
    if (STATIONS_MAP[c]) stops.push(STATIONS_MAP[c]);
  });
  stops.push(dstStation);

  const numStops = stops.length;
  const totalDist = 800 + ((parseInt(trainNumber, 10) || 500) % 700);

  const stations: JourneyStation[] = stops.map((st, i) => {
    const frac = i / (numStops - 1);
    const dist = Math.round(totalDist * frac);
    const status: 'COMPLETED' | 'CURRENT' | 'UPCOMING' =
      i < 2 ? 'COMPLETED' : i === 2 ? 'CURRENT' : 'UPCOMING';
    const depHour = 6 + Math.floor(frac * 14);
    const depMin = (i * 23) % 60;
    const timeStr = `${String(depHour % 24).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`;

    return {
      station: st,
      distanceFromSourceKm: dist,
      scheduledArrival: i === 0 ? undefined : timeStr,
      scheduledDeparture: i === numStops - 1 ? undefined : timeStr,
      actualArrival: i <= 2 ? timeStr : undefined,
      actualDeparture: i < 2 ? timeStr : undefined,
      expectedArrival: i > 2 ? timeStr : undefined,
      expectedDeparture: i > 2 ? timeStr : undefined,
      delayMinutes: (parseInt(trainNumber, 10) || 10) % 25,
      platform: String(((i + 2) % 6) + 1),
      status,
      isHalt: true,
    };
  });

  const routeCoordinates: [number, number][] = stops.map((st) => [
    st.longitude,
    st.latitude,
  ]);

  const synthesized: TrainRouteData = {
    train: {
      id: `train_${trainNumber}`,
      trainNumber,
      name,
      type: 'Superfast Express',
      source: { code: srcCode, name: srcName },
      destination: { code: dstCode, name: dstName },
      totalDistanceKm: totalDist,
      totalDurationMinutes: Math.round(totalDist * 1.2),
      operatingDays: days,
      route: stations.map((s) => ({
        code: s.station.code,
        name: s.station.name,
        scheduledArrival: s.scheduledArrival,
        scheduledDeparture: s.scheduledDeparture,
        platform: s.platform,
      })),
    },
    stations,
    routeCoordinates,
  };

  TRAINS_DATABASE[trainNumber] = synthesized;
  return synthesized;
}

export class MockTrainProvider implements TrainProvider {
  async searchTrains(query: string): Promise<TrainSearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results: TrainSearchResult[] = [];
    const seen = new Set<string>();

    // 1. Search POPULAR_SEARCH_CATALOG
    for (const item of POPULAR_SEARCH_CATALOG) {
      const matchNumber = item.trainNumber.includes(q);
      const matchName = item.name.toLowerCase().includes(q);
      const matchSource = item.source.toLowerCase().includes(q) || item.sourceCode.toLowerCase().includes(q);
      const matchDest = item.destination.toLowerCase().includes(q) || item.destinationCode.toLowerCase().includes(q);

      if (matchNumber || matchName || matchSource || matchDest) {
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

    // 2. Search TRAINS_DATABASE for any additional trains
    for (const [trainNumber, data] of Object.entries(TRAINS_DATABASE)) {
      if (seen.has(trainNumber)) continue;
      const train = data.train;
      const matchNumber = train.trainNumber.includes(q);
      const matchName = train.name.toLowerCase().includes(q);
      const matchSource = train.source.name.toLowerCase().includes(q);
      const matchDest = train.destination.name.toLowerCase().includes(q);

      if (matchNumber || matchName || matchSource || matchDest) {
        seen.add(train.trainNumber);
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
          status: 'ON TIME',
          currentDelayMinutes: 0,
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
    const data = getOrCreateTrainRouteData(trainNumber);
    return data ? data.train : null;
  }

  async getLiveStatus(trainNumber: string): Promise<LiveTrainStatus | null> {
    const data = getOrCreateTrainRouteData(trainNumber);
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
    const data = getOrCreateTrainRouteData(trainNumber);
    return data ? data.stations : [];
  }

  async getRouteGeometry(trainNumber: string): Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null> {
    const data = getOrCreateTrainRouteData(trainNumber);
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
          isHalt: true,
          stationType: 'halt',
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
