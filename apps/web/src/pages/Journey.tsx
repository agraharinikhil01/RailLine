import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Compass,
  Map as MapIcon,
  RefreshCw,
  Share2,
  Radio,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { useRouteGeometry } from '../hooks/useRouteGeometry';
import { useTimeline } from '../hooks/useTimeline';
import { useElevation } from '../hooks/useElevation';
import { useDelayHistory } from '../hooks/useDelayHistory';
import { useRouteWeather } from '../hooks/useRouteWeather';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { trainApi } from '../services/trainService';
import { TrainStatusBadge } from '../components/journey/TrainStatusBadge';
import { FavoriteButton } from '../components/journey/FavoriteButton';
import { CurrentStationCard } from '../components/journey/CurrentStationCard';
import { NextStationCard } from '../components/journey/NextStationCard';
import { JourneyProgressBar } from '../components/journey/JourneyProgressBar';
import { DistanceStatsCard } from '../components/journey/DistanceStatsCard';
import { JourneyTimeline } from '../components/journey/JourneyTimeline';
import { JourneyMap } from '../components/map/JourneyMap';
import { ElevationChart } from '../components/analytics/ElevationChart';
import { DelayChart } from '../components/analytics/DelayChart';
import { WeatherCard } from '../components/weather/WeatherCard';
import { RouteWeatherStrip } from '../components/weather/RouteWeatherStrip';
import { GeographyCard } from '../components/companion/GeographyCard';
import { ShareModal } from '../components/sharing/ShareModal';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { JourneyStation } from '@railline/types';

export const Journey: React.FC = () => {
  const { trainNumber = '' } = useParams<{ trainNumber: string }>();

  // Full-Screen Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'companion'>('overview');
  const [selectedStation, setSelectedStation] = useState<JourneyStation | null>(null);

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | undefined>();
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);

  // Telemetry & Route Queries
  const {
    status,
    isLoading: isStatusLoading,
    isRefetching,
    error: statusError,
    refetch,
  } = useLiveStatus(trainNumber);

  const { routeGeoJSON } = useRouteGeometry(trainNumber);
  const { timeline } = useTimeline(trainNumber);

  // Analytics & Travel Companion Queries
  const { summary: elevationSummary, isLoading: isElevationLoading } = useElevation(trainNumber);
  const { delays: delayHistory, isLoading: isDelaysLoading } = useDelayHistory(trainNumber);
  const { routeWeather } = useRouteWeather(trainNumber);
  const { places } = useNearbyPlaces(trainNumber);

  const handleOpenShare = async () => {
    setIsShareModalOpen(true);
    if (!shareUrl) {
      setIsGeneratingShare(true);
      try {
        const res = await trainApi.createShareLink(trainNumber);
        setShareUrl(res.shareUrl);
      } catch (err) {
        console.warn('Failed to generate share token', err);
      } finally {
        setIsGeneratingShare(false);
      }
    }
  };

  const handleStationClick = (station: JourneyStation) => {
    setSelectedStation(station);
  };

  if (isStatusLoading && !status) {
    return (
      <div className="w-full h-[calc(100vh-3.5rem)] flex items-center justify-center bg-slate-900 p-8">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 mx-auto flex items-center justify-center animate-pulse">
            <Radio className="w-6 h-6 animate-ping" />
          </div>
          <h3 className="text-base font-bold text-white">Connecting to Railway Telemetry...</h3>
          <p className="text-xs text-slate-400">Loading live GPS coordinates, track geometries, and station halts</p>
          <Skeleton className="w-full h-2 rounded-full" />
        </div>
      </div>
    );
  }

  if (statusError || !status) {
    return (
      <div className="w-full h-[calc(100vh-3.5rem)] flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full">
          <ErrorState
            title={`Unable to track train ${trainNumber}`}
            message="Live tracking telemetry is temporarily unavailable or the train number is invalid."
            onRetry={() => refetch()}
          />
          <div className="mt-6 text-center">
            <RouterLink
              to="/"
              className="inline-flex items-center text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Return to Train Search
            </RouterLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden bg-slate-950">
      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trainNumber={status.trainNumber}
        trainName={status.trainName}
        shareUrl={shareUrl}
        isLoading={isGeneratingShare}
      />

      {/* Floating Toggle Button when Sidebar is Collapsed on Desktop */}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          title="Open Journey Details Panel"
          className="absolute top-4 left-4 z-30 p-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 shadow-floating border border-slate-200 backdrop-blur-md transition-all active:scale-95 flex items-center gap-2 text-xs font-semibold"
        >
          <PanelLeftOpen className="w-4 h-4 text-sky-600" />
          <span className="hidden sm:inline">{status.trainNumber} • Details</span>
        </button>
      )}

      {/* ========================================================================= */}
      {/* LEFT SIDEBAR: Full-Height Command Panel (Collapsible)                    */}
      {/* ========================================================================= */}
      {isSidebarOpen && (
        <aside className="w-full md:w-[440px] lg:w-[480px] xl:w-[500px] h-[50vh] md:h-full flex flex-col bg-white border-r border-slate-200 z-30 shadow-2xl shrink-0 transition-all duration-300">
          {/* Top Fixed Header in Sidebar */}
          <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <RouterLink
                to="/"
                className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Train Search
              </RouterLink>

              <div className="flex items-center gap-1.5">
                <FavoriteButton trainNumber={status.trainNumber} />

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => refetch()}
                  isLoading={isRefetching}
                  className="text-xs h-8 px-2.5 text-slate-700"
                  title="Refresh train location"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenShare}
                  className="text-xs h-8 px-2.5 text-slate-700"
                  title="Share journey link"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>

                {/* Desktop Collapse Button */}
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  title="Collapse Sidebar for Fullscreen Map"
                  className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Train Title & Status Row */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-1 bg-slate-900 text-white rounded-md font-mono font-bold text-xs tracking-wider">
                  {status.trainNumber}
                </span>
                <TrainStatusBadge status={status.status} delayMinutes={status.delayMinutes} />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight line-clamp-1">
                {status.trainName}
              </h1>

              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium text-emerald-600">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  Live GPS
                </span>
                <span>•</span>
                <span className="text-slate-400">
                  {isRefetching ? 'Updating live telemetry...' : `Live Telemetry Active`}
                </span>
                {status.isStale && (
                  <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                    Cached
                  </span>
                )}
              </div>
            </div>

            {/* Navigation Tabs (Overview / Analytics / Travel Companion) */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Journey</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-white text-slate-900 shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('companion')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'companion'
                    ? 'bg-white text-slate-900 shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Weather</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content inside Sidebar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {/* TAB 1: OVERVIEW & HALTS */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Station Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CurrentStationCard status={status} />
                  <NextStationCard status={status} />
                </div>

                {/* Progress Bar */}
                <JourneyProgressBar status={status} />

                {/* Quick Telemetry Cards (Speed, Delay trend, ETA, Bearing) */}
                <DistanceStatsCard status={status} />

                {/* Route Weather Strip preview */}
                {routeWeather && <RouteWeatherStrip routeWeather={routeWeather} />}

                {/* Station Timeline */}
                <div>
                  <div className="flex items-center justify-between mb-2 px-0.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Interactive Station Halts
                    </span>
                    <span className="text-[10px] text-sky-600 font-medium">
                      Click halt to fly on map
                    </span>
                  </div>
                  <JourneyTimeline
                    stations={timeline}
                    onSelectStation={handleStationClick}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: ANALYTICS & ELEVATION */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                {/* Topography Elevation Profile */}
                <ElevationChart
                  summary={elevationSummary}
                  isLoading={isElevationLoading}
                />

                {/* Delay Variance Chart across Stations */}
                <DelayChart
                  delays={delayHistory}
                  isLoading={isDelaysLoading}
                />

                {/* Complete Station Log */}
                <JourneyTimeline
                  stations={timeline}
                  onSelectStation={handleStationClick}
                />
              </div>
            )}

            {/* TAB 3: SMART TRAVEL COMPANION */}
            {activeTab === 'companion' && (
              <div className="space-y-4">
                {/* Multi-Station Weather Cards */}
                {routeWeather && (
                  <div className="space-y-3">
                    <WeatherCard
                      weather={routeWeather.currentStationWeather}
                      label="Current Station"
                      badgeText="Live"
                    />
                    <WeatherCard
                      weather={routeWeather.nextStationWeather}
                      label="Next Station"
                      badgeText="Upcoming"
                    />
                    <WeatherCard
                      weather={routeWeather.destinationWeather}
                      label="Destination"
                      badgeText="Arrival"
                    />
                  </div>
                )}

                {/* Route Weather Strip */}
                {routeWeather && <RouteWeatherStrip routeWeather={routeWeather} />}

                {/* Geographic Highlights (Rivers, Bridges, Mountains, Monuments) */}
                <GeographyCard places={places} />
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* RIGHT SIDE: 100% Full-Screen Interactive Map Canvas                       */}
      {/* ========================================================================= */}
      <main className="flex-1 h-full w-full min-h-0 relative overflow-hidden bg-slate-950">
        <JourneyMap
          status={status}
          routeGeoJSON={routeGeoJSON}
          stations={timeline}
          selectedStation={selectedStation}
          onStationSelect={handleStationClick}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
          className="w-full h-full"
        />
      </main>
    </div>
  );
};
