import { useQuery } from '@tanstack/react-query';
import { trainApi } from '../services/trainService';

export function useRouteGeometry(trainNumber: string) {
  const query = useQuery<GeoJSON.FeatureCollection<GeoJSON.Geometry>>({
    queryKey: ['trains', 'route', trainNumber],
    queryFn: () => trainApi.getRouteGeometry(trainNumber),
    enabled: !!trainNumber,
    staleTime: 60 * 60 * 1000, // Route geometry is static
  });

  return {
    routeGeoJSON: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
