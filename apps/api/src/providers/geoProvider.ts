import { GeographicPlace } from '@railline/types';

export interface GeoProvider {
  getNearbyPlaces(trainNumber: string, category?: string): Promise<GeographicPlace[]>;
}

// Contextual geographical attractions along major Indian railway routes
const ROUTE_GEOGRAPHIC_PLACES: Record<string, GeographicPlace[]> = {
  '12004': [
    {
      id: 'poi-yamuna-delhi',
      name: 'Yamuna River Bridge',
      type: 'BRIDGE',
      latitude: 28.6631,
      longitude: 77.2530,
      distanceFromRouteKm: 0.1,
      description: 'Historical railway crossing over the Yamuna River linking Old Delhi and Ghaziabad.',
      elevationMeters: 205,
    },
    {
      id: 'poi-hindon-river',
      name: 'Hindon River',
      type: 'RIVER',
      latitude: 28.6700,
      longitude: 77.4100,
      distanceFromRouteKm: 1.2,
      description: 'Tributary river of the Yamuna flowing through western Uttar Pradesh.',
      elevationMeters: 210,
    },
    {
      id: 'poi-ganga-canal',
      name: 'Upper Ganges Canal Aqueduct',
      type: 'RIVER',
      latitude: 27.9100,
      longitude: 78.1100,
      distanceFromRouteKm: 0.4,
      description: 'Historic British engineering canal supplying water to western UP agricultural belt.',
      elevationMeters: 184,
    },
    {
      id: 'poi-chambal-ravines',
      name: 'Chambal Wildlife Corridor',
      type: 'GHAT',
      latitude: 26.8500,
      longitude: 79.0500,
      distanceFromRouteKm: 12.5,
      description: 'Rugged ravines and sanctuary sanctuary known for Gharials and Gangetic dolphins.',
      elevationMeters: 145,
    },
    {
      id: 'poi-ganga-kanpur',
      name: 'Ganga River Basin (Kanpur)',
      type: 'RIVER',
      latitude: 26.4700,
      longitude: 80.3600,
      distanceFromRouteKm: 1.8,
      description: 'Holy Ganges river corridor as the train enters industrial Kanpur.',
      elevationMeters: 125,
    },
    {
      id: 'poi-bara-imambara',
      name: 'Bara Imambara & Rumi Darwaza',
      type: 'MONUMENT',
      latitude: 26.8690,
      longitude: 80.9130,
      distanceFromRouteKm: 4.2,
      description: 'Magnificent 18th-century architectural wonder built by Nawab Asaf-ud-Daula.',
      elevationMeters: 124,
    },
  ],
  '12951': [
    {
      id: 'poi-vasai-creek',
      name: 'Vasai Creek Railway Bridges',
      type: 'BRIDGE',
      latitude: 19.3300,
      longitude: 72.8400,
      distanceFromRouteKm: 0.2,
      description: 'Estuarine crossing separating Salsette island from mainland Maharashtra.',
      elevationMeters: 10,
    },
    {
      id: 'poi-tapi-river',
      name: 'Tapi River Bridge (Surat)',
      type: 'RIVER',
      latitude: 21.2100,
      longitude: 72.8300,
      distanceFromRouteKm: 0.3,
      description: 'Major westward flowing river crossing the diamond city of Surat.',
      elevationMeters: 18,
    },
    {
      id: 'poi-narmada-golden',
      name: 'Narmada River & Silver Jubilee Bridge',
      type: 'BRIDGE',
      latitude: 21.7100,
      longitude: 72.9900,
      distanceFromRouteKm: 0.1,
      description: 'Iconic railway crossing over the holy Narmada River at Bharuch.',
      elevationMeters: 22,
    },
    {
      id: 'poi-vindhya-range',
      name: 'Vindhya Mountain Ascent',
      type: 'MOUNTAIN',
      latitude: 23.2000,
      longitude: 74.8500,
      distanceFromRouteKm: 2.5,
      description: 'Scenic railway gradient climbing through the Vindhya hills into the Malwa plateau.',
      elevationMeters: 460,
    },
    {
      id: 'poi-chambal-kota',
      name: 'Chambal River Gorge (Kota)',
      type: 'RIVER',
      latitude: 25.1900,
      longitude: 75.8300,
      distanceFromRouteKm: 1.5,
      description: 'Perennial canyon river forming dramatic rocky valleys around Kota.',
      elevationMeters: 248,
    },
    {
      id: 'poi-ranthambore',
      name: 'Ranthambore National Park Borders',
      type: 'MOUNTAIN',
      latitude: 26.0100,
      longitude: 76.3800,
      distanceFromRouteKm: 8.0,
      description: 'Protected Bengal Tiger sanctuary forest ridges along the Aravali-Vindhya junction.',
      elevationMeters: 275,
    },
  ],
  '22436': [
    {
      id: 'poi-sangam',
      name: 'Triveni Sangam (Prayagraj)',
      type: 'RIVER',
      latitude: 25.4290,
      longitude: 81.8840,
      distanceFromRouteKm: 3.8,
      description: 'Confluence of Ganga, Yamuna, and mythical Saraswati rivers, sacred pilgrimage site.',
      elevationMeters: 96,
    },
    {
      id: 'poi-naini-bridge',
      name: 'Old Naini Bridge',
      type: 'BRIDGE',
      latitude: 25.4200,
      longitude: 81.8600,
      distanceFromRouteKm: 0.8,
      description: 'Double-deck steel truss bridge across the Yamuna River, built in 1865.',
      elevationMeters: 102,
    },
    {
      id: 'poi-kashi-vishwanath',
      name: 'Kashi Vishwanath Corridor (Varanasi)',
      type: 'MONUMENT',
      latitude: 25.3109,
      longitude: 83.0107,
      distanceFromRouteKm: 4.1,
      description: 'Ancient spiritual heart of Varanasi on the western banks of the holy Ganges.',
      elevationMeters: 82,
    },
  ],
};

export class MockGeoProvider implements GeoProvider {
  async getNearbyPlaces(trainNumber: string, category?: string): Promise<GeographicPlace[]> {
    const places = ROUTE_GEOGRAPHIC_PLACES[trainNumber] || ROUTE_GEOGRAPHIC_PLACES['12004'];
    if (category) {
      return places.filter((p) => p.type.toLowerCase() === category.toLowerCase());
    }
    return places;
  }
}

export const geoProvider: GeoProvider = new MockGeoProvider();
