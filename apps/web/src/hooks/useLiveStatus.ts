import { useQuery } from '@tanstack/react-query';
import { trainApi } from '../services/trainService';
import { LiveTrainStatus } from '@railline/types';

export function useLiveStatus(trainNumber: string) {
  const query = useQuery<LiveTrainStatus>({
    queryKey: ['trains', 'live', trainNumber],
    queryFn: () => trainApi.getLiveStatus(trainNumber),
    enabled: !!trainNumber,
    refetchInterval: 30000, // 30 seconds live refresh per PRD §3.9
    staleTime: 15000,
    refetchOnWindowFocus: true,
  });

  return {
    status: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
