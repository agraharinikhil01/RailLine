import { useQuery } from '@tanstack/react-query';
import { trainApi } from '../services/trainService';
import { GeographicPlace } from '@railline/types';

export function useNearbyPlaces(trainNumber: string, category?: string) {
  const query = useQuery<GeographicPlace[]>({
    queryKey: ['trains', 'places', trainNumber, category || 'all'],
    queryFn: () => trainApi.getNearbyPlaces(trainNumber, category),
    enabled: !!trainNumber,
    staleTime: 30 * 60 * 1000,
  });

  return {
    places: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
