import { useQuery } from '@tanstack/react-query';
import { trainApi, StationDelayPoint } from '../services/trainService';

export function useDelayHistory(trainNumber: string) {
  const query = useQuery<StationDelayPoint[]>({
    queryKey: ['trains', 'delays', trainNumber],
    queryFn: () => trainApi.getDelayHistory(trainNumber),
    enabled: !!trainNumber,
    staleTime: 30000,
  });

  return {
    delays: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
