import { useQuery } from '@tanstack/react-query';
import { trainApi, ElevationSummary } from '../services/trainService';

export function useElevation(trainNumber: string) {
  const query = useQuery<ElevationSummary>({
    queryKey: ['trains', 'elevation', trainNumber],
    queryFn: () => trainApi.getElevationSummary(trainNumber),
    enabled: !!trainNumber,
    staleTime: 60 * 60 * 1000, // Elevation is long-cached (1 hr)
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
