import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainApi } from '../services/trainService';
import { TrainSearchResult } from '@railline/types';

export function useTrainSearch(debounceMs = 300) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [searchTerm, debounceMs]);

  const query = useQuery<TrainSearchResult[]>({
    queryKey: ['trains', 'search', debouncedTerm],
    queryFn: () => trainApi.searchTrains(debouncedTerm),
    enabled: debouncedTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    results: query.data || [],
    isLoading: query.isLoading && debouncedTerm.length >= 2,
    isFetching: query.isFetching,
    error: query.error,
  };
}
