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

export class MockElevationProvider implements ElevationProvider {
  async getElevationProfile(trainNumber: string): Promise<ElevationPoint[]> {
    const stations = await activeTrainProvider.getRouteStations(trainNumber);
    if (!stations || stations.length === 0) return [];

    const points: ElevationPoint[] = [];

    for (let i = 0; i < stations.length; i++) {
      const curr = stations[i];
      const baseElevation = STATION_ELEVATION_METERS[curr.station.code] || 150;

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
        const nextElevation = STATION_ELEVATION_METERS[next.station.code] || 150;
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
