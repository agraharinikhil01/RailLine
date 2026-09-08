import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { ArrowLeft, BarChart3, Compass, Map as MapIcon } from 'lucide-react';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { useRouteGeometry } from '../hooks/useRouteGeometry';
import { useTimeline } from '../hooks/useTimeline';
import { useElevation } from '../hooks/useElevation';
import { useDelayHistory } from '../hooks/useDelayHistory';
import { useRouteWeather } from '../hooks/useRouteWeather';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { trainApi } from '../services/trainService';
import { TrainHeader } from '../components/journey/TrainHeader';
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
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export const Journey: React.FC = () => {
  const { trainNumber = '' } = useParams<{ trainNumber: string }>();

  // Active Tab State (Navigation between Map Hero, Analytics, and Travel Companion)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'companion'>('overview');

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | undefined>();
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);

  // Telemetry & Route Data
  const {
    status,
    isLoading: isStatusLoading,
    isRefetching,
    error: statusError,
    refetch,
  } = useLiveStatus(trainNumber);

  const { routeGeoJSON } = useRouteGeometry(trainNumber);
  const { timeline } = useTimeline(trainNumber);

  // Phase 2 Analytics & Companion Data
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

  if (isStatusLoading && !status) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Skeleton className="w-48 h-8 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="w-full h-[450px] rounded-2xl" />
            <Skeleton className="w-full h-24 rounded-xl" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="w-full h-36 rounded-xl" />
            <Skeleton className="w-full h-36 rounded-xl" />
            <Skeleton className="w-full h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (statusError || !status) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <ErrorState
          title={`Unable to track train ${trainNumber}`}
          message="Live tracking data is temporarily unavailable or the train number is invalid. Please verify and try again."
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
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Train Header Banner */}
      <TrainHeader
        status={status}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
        onShareClick={handleOpenShare}
      />

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trainNumber={status.trainNumber}
        trainName={status.trainName}
        shareUrl={shareUrl}
        isLoading={isGeneratingShare}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 w-full flex-1">
        {/* Navigation & Section Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <RouterLink
            to="/"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Train Search
          </RouterLink>

          {/* Section Tabs (PRD §8 Information Architecture: Overview / Analytics / Travel Companion) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map & Journey</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics & Elevation</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('companion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'companion'
                  ? 'bg-white text-slate-900 shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Weather & Highlights</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Map & Journey Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Column (Map & Telemetry) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Interactive Live Navigation Map */}
              <JourneyMap
                status={status}
                routeGeoJSON={routeGeoJSON}
                stations={timeline}
                className="h-[420px] sm:h-[500px]"
              />

              {/* Journey Progress Bar */}
              <JourneyProgressBar status={status} />

              {/* Quick Telemetry Stats */}
              <DistanceStatsCard status={status} />

              {/* Route Weather Strip preview */}
              {routeWeather && <RouteWeatherStrip routeWeather={routeWeather} />}
            </div>

            {/* Sidebar Column (Current Station, Next Station, Timeline) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Current Station Card */}
              <CurrentStationCard status={status} />

              {/* Next Stop Card */}
              <NextStationCard status={status} />

              {/* Station Timeline */}
              <JourneyTimeline stations={timeline} />
            </div>
          </div>
        )}

        {/* Tab 2: Analytics & Elevation (PRD §5) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
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

            {/* Comprehensive Journey Halts */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-subtle">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Station Halt Details & Distance Log
              </h3>
              <JourneyTimeline stations={timeline} />
            </div>
          </div>
        )}

        {/* Tab 3: Smart Travel Companion (PRD §6) */}
        {activeTab === 'companion' && (
          <div className="space-y-6">
            {/* Multi-Station Weather Cards */}
            {routeWeather && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                  Live Station Weather Telemetry
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <WeatherCard
                    weather={routeWeather.currentStationWeather}
                    label="Current Halt"
                    badgeText="Live"
                  />
                  <WeatherCard
                    weather={routeWeather.nextStationWeather}
                    label="Next Stop"
                    badgeText="Upcoming"
                  />
                  <WeatherCard
                    weather={routeWeather.destinationWeather}
                    label="Final Destination"
                    badgeText="Arrival"
                  />
                </div>
              </div>
            )}

            {/* Route Weather Strip */}
            {routeWeather && <RouteWeatherStrip routeWeather={routeWeather} />}

            {/* Geographic Highlights (Rivers, Bridges, Mountains, Monuments) */}
            <GeographyCard places={places} />
          </div>
        )}
      </div>
    </div>
  );
};
