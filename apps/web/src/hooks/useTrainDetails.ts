import { useQuery } from '@tanstack/react-query';
import { trainApi } from '../services/trainService';
import { Train } from '@railline/types';

export function useTrainDetails(trainNumber: string) {
  const query = useQuery<Train>({
    queryKey: ['trains', 'details', trainNumber],
    queryFn: () => trainApi.getTrainDetails(trainNumber),
    enabled: !!trainNumber,
    staleTime: 60000,
  });

  return {
    train: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
