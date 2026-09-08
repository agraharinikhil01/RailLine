import React, { useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Clock,
  Compass,
  Zap,
  ShieldCheck,
  X,
  Radio,
  Mountain,
  CloudSun,
  Activity,
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
  { number: '15566', name: 'Vaishali Express', label: '15566 (Vaishali)' },
  { number: '12951', name: 'Mumbai Rajdhani Express', label: '12951 (Mumbai Rajdhani)' },
  { number: '22436', name: 'Vande Bharat Express', label: '22436 (Vande Bharat)' },
  { number: '12002', name: 'Bhopal Shatabdi Express', label: '12002 (Bhopal Shatabdi)' },
  { number: '12301', name: 'Howrah Rajdhani Express', label: '12301 (Howrah Rajdhani)' },
  { number: '12626', name: 'Kerala Express', label: '12626 (Kerala Express)' },
];

const DEFAULT_RECENT_TRAINS: TrainSearchResult[] = [
  {
    trainNumber: '15566',
    name: 'Vaishali Express',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Lalit Gram',
    destinationCode: 'LLP',
    departureTime: '20:40',
    arrivalTime: '22:45',
    status: 'ON TIME',
    currentDelayMinutes: 0,
  },
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
  {
    trainNumber: '12002',
    name: 'Bhopal Shatabdi Express',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Rani Kamlapati',
    destinationCode: 'RKMP',
    departureTime: '06:00',
    arrivalTime: '14:30',
    status: 'ON TIME',
    currentDelayMinutes: 0,
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { searchTerm, setSearchTerm, debouncedTerm, results, isLoading } = useTrainSearch(200);
  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches();

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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    if (results.length > 0) {
      handleSelectTrain(results[0]);
    } else if (/^\d{5}$/.test(trimmed)) {
      navigate(`/tracking/${trimmed}`);
    }
  };

  const handleQuickSearch = (number: string) => {
    if (searchTerm.trim() === number) {
      navigate(`/tracking/${number}`);
    } else {
      setSearchTerm(number);
      searchInputRef.current?.focus();
    }
  };

  const hasUserRecents = recentSearches.length > 0;
  // Always pad displayTrains with default popular trains so it consistently fills all 4 columns
  const displayTrains = useMemo(() => {
    if (!hasUserRecents) return DEFAULT_RECENT_TRAINS;
    const combined = [...recentSearches];
    for (const def of DEFAULT_RECENT_TRAINS) {
      if (combined.length >= 4) break;
      if (!combined.some((t) => t.trainNumber === def.trainNumber)) {
        combined.push(def);
      }
    }
    return combined.slice(0, 4);
  }, [hasUserRecents, recentSearches]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-slate-50/60 w-full">
      <main className="w-full px-6 sm:px-10 lg:px-16 py-6 sm:py-8 space-y-7 sm:space-y-8 flex-1">
        {/* ========================================================================= */}
        {/* HERO CARD: Elevated Full-Width Apple Design with ambient glow             */}
        {/* ========================================================================= */}
        <div className="relative rounded-[32px] bg-gradient-to-b from-sky-50/90 via-sky-50/35 to-white border border-sky-100/90 py-10 sm:py-14 lg:py-16 px-6 sm:px-12 shadow-sm text-center overflow-hidden w-full">
          {/* Subtle ambient decorative glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-sky-300/25 to-transparent blur-3xl rounded-full pointer-events-none" />

          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-sky-200/80 text-sky-700 text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
            <span className="text-sky-500 font-bold">✦</span>
            <span>Next-Gen Railway Intelligence</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-900">
            Modern Train{' '}
            <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tracking
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Real-time Indian Railways tracking, interactive vector maps, delay insights, and journey
            analytics wrapped in an Apple-inspired experience.
          </p>

          {/* Large Floating Search Bar */}
          <div className="max-w-2xl lg:max-w-3xl mx-auto mt-8 relative">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-sky-300 focus-within:ring-4 focus-within:ring-sky-500/15 focus-within:border-sky-500 transition-all px-4 sm:px-5 py-3 sm:py-3.5"
            >
              <Search className="w-5 h-5 text-sky-500 shrink-0 mr-3.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchTerm('');
                  }
                }}
                placeholder="Enter train number or name (e.g. 12951, Rajdhani)..."
                className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-slate-900 placeholder:text-slate-400 font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg mr-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shrink-0 active:scale-95 cursor-pointer ml-1"
              >
                <span>Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="hidden sm:inline-flex items-center ml-2 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono font-medium text-slate-400 shrink-0 select-none">
                ⌘ K
              </span>
            </form>

            {/* Quick Search Chips with Active State */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Quick search:</span>
              {QUICK_SEARCH_CHIPS.map((chip) => {
                const isActive = searchTerm.trim().includes(chip.number);
                return (
                  <button
                    key={chip.number}
                    type="button"
                    onClick={() => handleQuickSearch(chip.number)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all shadow-2xs flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-sky-500 text-white font-semibold shadow-sm border border-sky-600 scale-105'
                        : 'bg-white hover:bg-sky-50 border border-slate-200/90 text-slate-700 hover:text-sky-600 hover:border-sky-300'
                    }`}
                  >
                    <span>#{chip.number}</span>
                    <span className="text-slate-400 font-sans text-[11px]">({chip.name.split(' ')[0]})</span>
                  </button>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* SEARCH RESULTS DIRECTLY INSIDE HERO CARD                                 */}
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

                {/* Instant 5-digit Direct Track Card */}
                {/^\d{5}$/.test(searchTerm.trim()) && (
                  <div
                    onClick={() => {
                      const matched = results.find((r) => r.trainNumber === searchTerm.trim());
                      if (matched) {
                        handleSelectTrain(matched);
                      } else {
                        navigate(`/tracking/${searchTerm.trim()}`);
                      }
                    }}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center justify-between cursor-pointer hover:shadow-md hover:scale-[1.005] active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-mono font-bold text-sm shrink-0">
                        #{searchTerm.trim()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm flex items-center gap-2 truncate">
                          <span>{results.find((r) => r.trainNumber === searchTerm.trim())?.name || `Track Train #${searchTerm.trim()}`}</span>
                          <span className="text-[10px] bg-emerald-400/30 text-emerald-100 border border-emerald-300/40 px-1.5 py-0.5 rounded font-mono font-semibold">LIVE RADAR</span>
                        </div>
                        <div className="text-xs text-sky-100 truncate mt-0.5">
                          {results.find((r) => r.trainNumber === searchTerm.trim())
                            ? `${results.find((r) => r.trainNumber === searchTerm.trim())?.source} → ${results.find((r) => r.trainNumber === searchTerm.trim())?.destination}`
                            : 'Click to launch live GPS tracking, speed, and full route map'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold bg-white text-sky-600 px-3.5 py-2 rounded-lg shrink-0 shadow-2xs hover:bg-sky-50 transition-colors ml-3">
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

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
                  /^\d{5}$/.test(searchTerm.trim()) ? (
                    <div className="p-6 bg-white border border-slate-200/90 rounded-2xl text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                        <Compass className="w-6 h-6 animate-pulse" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Track Train #{searchTerm.trim()}</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Live telemetry tracking is ready for train #{searchTerm.trim()}. Click below to view real-time position and route on the map.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/tracking/${searchTerm.trim()}`)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <span>Open Live Radar #{searchTerm.trim()}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="No trains found"
                      description={`No trains matched "${debouncedTerm}". Try a 5-digit number (e.g. 15566, 12951, 12301) or a different train name.`}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RECENT SEARCHES: 4-Column Ticket Cards Grid spanning full page width       */}
        {/* ========================================================================= */}
        {debouncedTerm.length < 2 && (
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                {hasUserRecents ? (
                  <>
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>Recent Searches</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-sky-600" />
                    <span>Popular Trains</span>
                  </>
                )}
              </div>
              {hasUserRecents && (
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                >
                  Clear Recent
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
              {displayTrains.map((train) => (
                <div
                  key={train.trainNumber}
                  onClick={() => handleSelectTrain(train)}
                  className="bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-sky-300 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group relative gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100/80 group-hover:scale-105 transition-transform">
                        <svg
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8-12.5c4.5 0 6 1.05 6 2v2H6V5c0-.95 1.5-2 6-2zm-6 6h12v5H6V9zm2 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                        </svg>
                      </div>
                      <span className="font-mono text-xs font-bold text-sky-600">
                        #{train.trainNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {train.status && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            train.status === 'ON TIME'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                              : 'bg-amber-50 text-amber-600 border border-amber-200/80'
                          }`}
                        >
                          {train.status}
                        </span>
                      )}
                      {hasUserRecents && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(train.trainNumber);
                          }}
                          title="Remove from recent"
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-slate-600 transition-opacity rounded-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                      {train.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                      <span className="text-slate-700 font-semibold truncate">{train.sourceCode || train.source}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-slate-700 font-semibold truncate">{train.destinationCode || train.destination}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                    <span>{train.departureTime && train.arrivalTime ? `${train.departureTime} → ${train.arrivalTime}` : 'Daily Express'}</span>
                    <span className="group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all text-slate-400 text-xs font-sans font-semibold flex items-center">
                      Track <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LIVE NETWORK TELEMETRY BANNER: Occupies full width, live stats strip      */}
        {/* ========================================================================= */}
        {debouncedTerm.length < 2 && (
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-2xs w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Indian Railways Network Pulse
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 font-mono">
                      LIVE RADAR
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time position feeds across all 16 Indian Railways operational zones with 30s telemetry updates.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 self-stretch sm:self-auto justify-between sm:justify-start">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  GPS Satellite Sync
                </span>
                <span className="text-slate-400">•</span>
                <span>Active</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Express Trains
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  12,400+
                </span>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Live GPS Telemetry
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Station Network
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  7,325
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Stations & Halts Covered
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Auto-Refresh Rate
                </span>
                <span className="text-xl sm:text-2xl font-black text-sky-600 font-mono">
                  30 Sec
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Continuous Live Polling
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Schedule Accuracy
                </span>
                <span className="text-xl sm:text-2xl font-black text-indigo-600 font-mono">
                  99.8%
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Dynamic ETA Prediction
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM FEATURE CARDS: 4-Column Highlights matching page grid              */}
        {/* ========================================================================= */}
        {debouncedTerm.length < 2 && (
          <div className="pt-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
              {/* Feature 1: Interactive Map Tracking */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Interactive Vector Map</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                      Full-screen vector navigation with real-time train movement, bearing heading, and corridor route glow.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-sky-600 font-semibold flex items-center gap-1">
                  MapTiler HD Vector Glow
                </div>
              </div>

              {/* Feature 2: 30s Auto Refresh */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">30s Auto Refresh</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                      Continuous live telemetry updates and automatic corridor tracking without manual page reloads.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  Live WebSocket & Polling
                </div>
              </div>

              {/* Feature 3: Terrain & Elevation */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                    <Mountain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Terrain & Elevation</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                      High-resolution topography profiles showing altitude, gradients, and ghat sections along the corridor.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                  OpenTopography 30m DEM
                </div>
              </div>

              {/* Feature 4: Delay & Weather Intelligence */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Weather & Delay ETA</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                      Multi-station live weather companion combined with smart delay trends and dynamic ETA predictions.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-violet-600 font-semibold flex items-center gap-1">
                  OpenWeather & Analytics
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-8 w-full">
        <div className="w-full px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
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
