import { useQuery } from '@tanstack/react-query';
import { trainApi } from '../services/trainService';
import { RouteWeather } from '@railline/types';

export function useRouteWeather(trainNumber: string) {
  const query = useQuery<RouteWeather>({
    queryKey: ['trains', 'weather', trainNumber],
    queryFn: () => trainApi.getRouteWeather(trainNumber),
    enabled: !!trainNumber,
    staleTime: 10 * 60 * 1000, // 10 min cache (PRD §18)
  });

  return {
    routeWeather: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
