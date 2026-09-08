import { useQuery } from '@tanstack/react-query';
import { trainApi } from '../services/trainService';
import { JourneyStation } from '@railline/types';

export function useTimeline(trainNumber: string) {
  const query = useQuery<JourneyStation[]>({
    queryKey: ['trains', 'timeline', trainNumber],
    queryFn: () => trainApi.getTimeline(trainNumber),
    enabled: !!trainNumber,
    staleTime: 30000,
  });

  return {
    timeline: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
