import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainApi } from '../services/trainService';
import { TrainSearchResult } from '@railline/types';

export function useFavorites() {
  const queryClient = useQueryClient();

  const query = useQuery<TrainSearchResult[]>({
    queryKey: ['favorites'],
    queryFn: () => trainApi.getFavorites(),
  });

  const addMutation = useMutation({
    mutationFn: (trainNumber: string) => trainApi.addFavorite(trainNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (trainNumber: string) => trainApi.removeFavorite(trainNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isFavorite = (trainNumber: string): boolean => {
    return (query.data || []).some((item) => item.trainNumber === trainNumber);
  };

  const toggleFavorite = (trainNumber: string) => {
    if (isFavorite(trainNumber)) {
      removeMutation.mutate(trainNumber);
    } else {
      addMutation.mutate(trainNumber);
    }
  };

  return {
    favorites: query.data || [],
    isLoading: query.isLoading,
    isFavorite,
    toggleFavorite,
    isMutating: addMutation.isPending || removeMutation.isPending,
  };
}
