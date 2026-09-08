import { ElevationPoint } from '@railline/types';
import { activeTrainProvider } from './index';

export interface ElevationProvider {
  getElevationProfile(trainNumber: string): Promise<ElevationPoint[]>;
}

// Typical elevation levels (in meters) for major Indian railway stations along routes
const STATION_ELEVATION_METERS: Record<string, number> = {
  MMCT: 14,    // Mumbai Central (coastal)
  BVI: 18,     // Borivali
  ST: 19,      // Surat
  BRC: 36,     // Vadodara
  RTM: 493,    // Ratlam (Malwa Plateau ascent)
  KOTA: 253,   // Kota
  SWM: 268,    // Sawai Madhopur
  BTE: 174,    // Bharatpur
  MTJ: 177,    // Mathura
  NDLS: 216,   // New Delhi
  GZB: 217,    // Ghaziabad
  ALJN: 186,   // Aligarh
  TDL: 166,    // Tundla
  ETW: 151,    // Etawah
  CNB: 127,    // Kanpur Central (Gangetic plains)
  LKO: 123,    // Lucknow Charbagh
  LJN: 123,    // Lucknow Jn
  PRYJ: 98,    // Prayagraj (Triveni Sangam plains)
  BSB: 80,     // Varanasi
  DDU: 78,     // Pt Deen Dayal Upadhyaya
  GAYA: 113,   // Gaya
  DHN: 227,    // Dhanbad (Chota Nagpur plateau)
  ASN: 106,    // Asansol
  HWH: 9,      // Howrah (Hooghly delta)
};

function getStationElevation(station: { code: string; latitude?: number; longitude?: number }): number {
  if (STATION_ELEVATION_METERS[station.code]) {
    return STATION_ELEVATION_METERS[station.code];
  }
  const lat = station.latitude || 0;
  const lng = station.longitude || 0;
  if (lat && lng) {
    // Coastal belts (Konkan, Coromandel, Gujarat coast)
    if (lng <= 73.5 || (lng >= 80.2 && lat <= 16) || (lat <= 11 && lng >= 75)) {
      return Math.round(10 + Math.abs((lat * 7) % 30));
    }
    // Deccan / Malwa Plateau (South & Central India interior)
    if (lat >= 12 && lat <= 24 && lng >= 74 && lng <= 80) {
      return Math.round(420 + Math.abs((lat * 17 + lng * 11) % 350));
    }
    // Gangetic plain
    if (lat >= 24 && lat <= 29 && lng >= 77 && lng <= 88) {
      return Math.round(80 + Math.abs((lng - 77) * 8));
    }
  }
  return 180;
}

export class MockElevationProvider implements ElevationProvider {
  async getElevationProfile(trainNumber: string): Promise<ElevationPoint[]> {
    const stations = await activeTrainProvider.getRouteStations(trainNumber);
    if (!stations || stations.length === 0) return [];

    const points: ElevationPoint[] = [];

    for (let i = 0; i < stations.length; i++) {
      const curr = stations[i];
      const baseElevation = getStationElevation(curr.station);

      points.push({
        distanceKm: curr.distanceFromSourceKm,
        elevationMeters: baseElevation,
        stationCode: curr.station.code,
        stationName: curr.station.name,
        isCurrentPosition: curr.status === 'CURRENT',
      });

      // If gap to next station is significant, interpolate realistic terrain topography points
      if (i < stations.length - 1) {
        const next = stations[i + 1];
        const nextElevation = getStationElevation(next.station);
        const gapKm = next.distanceFromSourceKm - curr.distanceFromSourceKm;

        // Add 2 intermediate points to render a natural geographic terrain profile
        if (gapKm > 30) {
          const step1Dist = Math.round(curr.distanceFromSourceKm + gapKm * 0.33);
          const step2Dist = Math.round(curr.distanceFromSourceKm + gapKm * 0.66);

          // Subtle natural rolling hills variance
          const variance = ((i * 17) % 25) - 10;
          const step1Elev = Math.round(baseElevation + (nextElevation - baseElevation) * 0.33 + variance);
          const step2Elev = Math.round(baseElevation + (nextElevation - baseElevation) * 0.66 - variance);

          points.push({
            distanceKm: step1Dist,
            elevationMeters: Math.max(10, step1Elev),
          });

          points.push({
            distanceKm: step2Dist,
            elevationMeters: Math.max(10, step2Elev),
          });
        }
      }
    }

    return points;
  }
}

export const elevationProvider: ElevationProvider = new MockElevationProvider();
