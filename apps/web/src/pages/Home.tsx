import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Clock,
  Compass,
  Zap,
  BarChart3,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useTrainSearch } from '../hooks/useTrainSearch';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { TrainSearchResultCard } from '../components/search/TrainSearchResultCard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { TrainSearchResult } from '@railline/types';

interface QuickSearchItem {
  number: string;
  name: string;
  label: string;
}

const QUICK_SEARCH_CHIPS: QuickSearchItem[] = [
  { number: '12951', name: 'Mumbai Rajdhani Express', label: '12951 (Mumbai Rajdhani)' },
  { number: '22436', name: 'Vande Bharat Express', label: '22436 (Vande Bharat)' },
  { number: '12002', name: 'Bhopal Shatabdi Express', label: '12002 (Bhopal Shatabdi)' },
  { number: '12626', name: 'Kerala Express', label: '12626 (Kerala Express)' },
];

const DEFAULT_RECENT_TRAINS: TrainSearchResult[] = [
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { searchTerm, setSearchTerm, debouncedTerm, results, isLoading } = useTrainSearch(300);
  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();

  // Keyboard shortcut: Cmd+K or Ctrl+K focuses the search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTrain = (train: TrainSearchResult) => {
    addRecentSearch(train);
    navigate(`/tracking/${train.trainNumber}`);
  };

  const handleQuickSearch = (number: string) => {
    setSearchTerm(number);
  };

  // If user has no recent searches stored yet, display the default popular searches from screenshot
  const displayRecentSearches =
    recentSearches.length > 0 ? recentSearches.slice(0, 4) : DEFAULT_RECENT_TRAINS;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-slate-50/50">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full space-y-8">
        {/* ========================================================================= */}
        {/* HERO CARD: Soft Sky Gradient Card matching screenshot 2                   */}
        {/* ========================================================================= */}
        <div className="relative rounded-3xl bg-gradient-to-b from-sky-50/70 via-sky-50/20 to-white border border-sky-100/90 p-8 sm:p-14 shadow-sm text-center overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-sky-200/30 blur-3xl rounded-full pointer-events-none" />

          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-100/70 border border-sky-200/70 text-sky-700 text-xs font-semibold mb-6">
            <span>✦</span>
            <span>Next-Gen Railway Intelligence</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="text-slate-900">Train Tracking, </span>
            <span className="text-sky-500">Redefined.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-xs sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Real-time Indian Railways tracking, interactive vector maps, delay insights, and journey
            analytics wrapped in an Apple-inspired experience.
          </p>

          {/* Large Floating Search Bar */}
          <div className="max-w-2xl mx-auto mt-8 relative">
            <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:border-slate-300 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10 transition-all px-4 py-3.5">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter train number or name (e.g. 12951, Rajdhani)..."
                className="w-full bg-transparent border-none outline-none text-xs sm:text-base text-slate-900 placeholder:text-slate-400 font-sans"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono font-medium text-slate-400 shrink-0 select-none">
                ⌘ K
              </span>
            </div>

            {/* Quick Search Chips with Active State (screenshot 2) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
              <span className="font-medium text-slate-400">Quick search:</span>
              {QUICK_SEARCH_CHIPS.map((chip) => {
                const isActive = searchTerm.trim().includes(chip.number);
                return (
                  <button
                    key={chip.number}
                    type="button"
                    onClick={() => handleQuickSearch(chip.number)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all shadow-2xs ${
                      isActive
                        ? 'bg-sky-500 text-white font-semibold shadow-sm border border-sky-600'
                        : 'bg-white hover:bg-sky-50 border border-slate-200/90 text-slate-600 hover:text-sky-600 hover:border-sky-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* SEARCH RESULTS DIRECTLY INSIDE HERO CARD (Screenshot 2)                  */}
            {/* ========================================================================= */}
            {debouncedTerm.length >= 2 && (
              <div className="mt-6 pt-4 border-t border-sky-100/90 text-left space-y-3">
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    SEARCH RESULTS ({results.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>

                {isLoading && (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                        <Skeleton className="w-1/3 h-4" />
                        <Skeleton className="w-2/3 h-3" />
                      </div>
                    ))}
                  </div>
                )}

                {!isLoading && results.length > 0 && (
                  <div className="space-y-2">
                    {results.map((train) => (
                      <TrainSearchResultCard
                        key={train.trainNumber}
                        train={train}
                        onClick={() => handleSelectTrain(train)}
                      />
                    ))}
                  </div>
                )}

                {!isLoading && results.length === 0 && (
                  <EmptyState
                    icon={Search}
                    title="No trains found"
                    description={`No trains matched "${debouncedTerm}". Try a different number or name.`}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RECENT SEARCHES: 2-Column Cards Grid matching screenshot 2                */}
        {/* ========================================================================= */}
        {debouncedTerm.length < 2 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Recent Searches</span>
              </div>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
              >
                Clear Recent
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {displayRecentSearches.map((train) => (
                <div
                  key={train.trainNumber}
                  onClick={() => handleSelectTrain(train)}
                  className="bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-subtle transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Blue Train Icon Pill */}
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 fill-current"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8-12.5c4.5 0 6 1.05 6 2v2H6V5c0-.95 1.5-2 6-2zm-6 6h12v5H6V9zm2 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <span className="font-mono text-xs font-semibold text-sky-600 block">
                        #{train.trainNumber}
                      </span>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate block">
                        {train.name}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM FEATURE CARDS: 3-Column Highlights visible in screenshot 2         */}
        {/* ========================================================================= */}
        {debouncedTerm.length < 2 && (
          <div className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature 1: Interactive Map Tracking */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Interactive Map Tracking</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Full-screen vector navigation with real-time train movement, bearing heading, and
                    corridor route glow.
                  </p>
                </div>
              </div>

              {/* Feature 2: 30s Auto Refresh */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">30s Auto Refresh</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Continuous live telemetry updates and automatic corridor tracking without manual
                    page reloads.
                  </p>
                </div>
              </div>

              {/* Feature 3: Delay & ETA Intelligence */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Delay & ETA Intelligence</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Smart delay prediction badges and real-time station arrival times across the entire
                    corridor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">RailGaadi</span>
            <span>•</span>
            <span>Next-Gen Railway Journey Intelligence</span>
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
