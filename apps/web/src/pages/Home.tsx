import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, ShieldCheck } from 'lucide-react';
import { useTrainSearch } from '../hooks/useTrainSearch';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { SearchInput } from '../components/ui/SearchInput';
import { TrainSearchResultCard } from '../components/search/TrainSearchResultCard';
import { RecentSearches } from '../components/search/RecentSearches';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { TrainSearchResult } from '@railline/types';

const POPULAR_TRAINS: TrainSearchResult[] = [
  {
    trainNumber: '12951',
    name: 'Mumbai Rajdhani Express',
    source: 'Mumbai Central',
    sourceCode: 'MMCT',
    destination: 'New Delhi',
    destinationCode: 'NDLS',
    departureTime: '17:00',
    arrivalTime: '08:32',
    status: 'DELAYED',
    currentDelayMinutes: 18,
  },
  {
    trainNumber: '12004',
    name: 'Lucknow Shatabdi Express',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Lucknow Junction',
    destinationCode: 'LJN',
    departureTime: '06:10',
    arrivalTime: '12:45',
    status: 'DELAYED',
    currentDelayMinutes: 12,
  },
  {
    trainNumber: '22436',
    name: 'Vande Bharat Express',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Varanasi Junction',
    destinationCode: 'BSB',
    departureTime: '06:00',
    arrivalTime: '14:00',
    status: 'ON TIME',
    currentDelayMinutes: 0,
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm, debouncedTerm, results, isLoading } = useTrainSearch(300);
  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches();

  const handleSelectTrain = (train: TrainSearchResult) => {
    addRecentSearch(train);
    navigate(`/journey/${train.trainNumber}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        {/* Hero Headline */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Railway Navigation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Track your train. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700">
              Understand your journey.
            </span>
          </h1>

          <p className="mt-3.5 text-sm sm:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
            Real-time railway tracking, interactive dark map navigation, live station halts, and arrival telemetry.
          </p>
        </div>

        {/* Search Box Container */}
        <div className="max-w-xl mx-auto mb-8">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            isLoading={isLoading}
            placeholder="Search by train number (e.g. 12951) or name (e.g. Shatabdi)..."
            className="text-base py-3 pl-11 shadow-card"
            autoFocus
          />

          {/* Recent Searches */}
          <div className="mt-4">
            <RecentSearches
              searches={recentSearches}
              onSelect={handleSelectTrain}
              onRemove={removeRecentSearch}
              onClear={clearRecentSearches}
            />
          </div>
        </div>

        {/* Results / Suggestions Area */}
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Loading Skeletons */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="w-1/3 h-4" />
                      <Skeleton className="w-2/3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {!isLoading && debouncedTerm.length >= 2 && results.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                Matching Trains ({results.length})
              </div>
              {results.map((train) => (
                <TrainSearchResultCard
                  key={train.trainNumber}
                  train={train}
                  onClick={() => handleSelectTrain(train)}
                />
              ))}
            </div>
          )}

          {/* Empty Search Results State */}
          {!isLoading && debouncedTerm.length >= 2 && results.length === 0 && (
            <EmptyState
              icon={Search}
              title="No trains found"
              description={`We couldn't find any trains matching "${debouncedTerm}". Try searching by train number (e.g. 12951) or station name.`}
            />
          )}

          {/* Default State: Featured Trains */}
          {debouncedTerm.length < 2 && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Featured Live Trains
                </span>
                <span className="text-xs text-slate-400 font-mono">Real-time simulator active</span>
              </div>

              {POPULAR_TRAINS.map((train) => (
                <TrainSearchResultCard
                  key={train.trainNumber}
                  train={train}
                  onClick={() => handleSelectTrain(train)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">RailLine</span>
            <span>•</span>
            <span>Production Railway Journey Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Live Telemetry Powered
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
