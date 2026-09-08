import { useState } from 'react';
import { TrainSearchResult } from '@railline/types';

const STORAGE_KEY = 'railline_recent_searches';

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<TrainSearchResult[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addRecentSearch = (train: TrainSearchResult) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.trainNumber !== train.trainNumber);
      const updated = [train, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save recent search to localStorage', err);
      }
      return updated;
    });
  };

  const removeRecentSearch = (trainNumber: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.trainNumber !== trainNumber);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update localStorage', err);
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}
