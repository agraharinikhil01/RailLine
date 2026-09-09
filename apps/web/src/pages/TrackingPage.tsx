import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  RefreshCw,
  Share2,
  Radio,
  MapPin,
  Gauge,
  Sun,
  Mountain,
  History,
} from 'lucide-react';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { useRouteGeometry } from '../hooks/useRouteGeometry';
import { useTimeline } from '../hooks/useTimeline';
import { useTrainDetails } from '../hooks/useTrainDetails';
import { useElevation } from '../hooks/useElevation';
import { useDelayHistory } from '../hooks/useDelayHistory';
import { useRouteWeather } from '../hooks/useRouteWeather';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { trainApi } from '../services/trainService';
import { FavoriteButton } from '../components/journey/FavoriteButton';
import { JourneyTimeline } from '../components/journey/JourneyTimeline';
import { JourneyMap } from '../components/map/JourneyMap';
import { WeeklyScheduleCard } from '../components/schedule/WeeklyScheduleCard';
import { PastDelayHistoryCard } from '../components/analytics/PastDelayHistoryCard';
import { ElevationChart } from '../components/analytics/ElevationChart';
import { DelayChart } from '../components/analytics/DelayChart';
import { WeatherCard } from '../components/weather/WeatherCard';
import { RouteWeatherStrip } from '../components/weather/RouteWeatherStrip';
import { GeographyCard } from '../components/companion/GeographyCard';
import { ShareModal } from '../components/sharing/ShareModal';
import { ErrorState } from '../components/ui/ErrorState';
import { JourneyStation } from '@railline/types';

// Circular Progress Ring matching image 1 (e.g. 57%)
const CircularProgressRing: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 24;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#0ea5e9"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="absolute text-[11px] font-bold font-mono text-slate-800">
        {Math.round(percentage)}%
      </span>
    </div>
  );
};

export const TrackingPage: React.FC = () => {
  const { trainNumber = '' } = useParams<{ trainNumber: string }>();

  // Tab State
  const [activeTab, setActiveTab] = useState<'map' | 'history' | 'weather' | 'elevation'>('map');
  const [selectedStation, setSelectedStation] = useState<JourneyStation | null>(null);

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | undefined>();
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);

  // Train Schedule & Details
  const { train: trainDetails } = useTrainDetails(trainNumber);

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

  // Combined operating days from details or status
  const operatingDays = trainDetails?.operatingDays || status?.operatingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/60 p-8">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 mx-auto flex items-center justify-center shadow-xs">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Connecting to Railway Telemetry...</h3>
          <p className="text-xs text-slate-500">Loading live GPS coordinates, track geometries, and station halts</p>
          <div className="w-48 mx-auto h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full animate-indeterminate" />
          </div>
        </div>
      </div>
    );
  }

  if (statusError || !status) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full">
          <ErrorState
            title={`Unable to track train ${trainNumber}`}
            message="Live tracking telemetry is temporarily unavailable or the train number is invalid."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/60 pb-12">
      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trainNumber={status.trainNumber}
        trainName={status.trainName}
        shareUrl={shareUrl}
        isLoading={isGeneratingShare}
      />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* 1. TOP SUBHEADER BAR */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <RouterLink
              to="/"
              className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-slate-800 transition-colors mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Search
            </RouterLink>

            <span className="font-mono font-bold text-sky-600 text-sm">#{status.trainNumber}</span>
            <span className="font-bold text-slate-800 hidden sm:inline">{status.trainName}</span>

            <span
              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                status.status === 'ON TIME'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                  : 'bg-amber-50 text-amber-600 border border-amber-200/80'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.status === 'ON TIME' ? 'bg-emerald-500' : 'bg-amber-500'
                } animate-pulse`}
              />
              {status.status === 'ON TIME'
                ? 'ON TIME'
                : status.delayMinutes >= 60
                ? `${Math.floor(status.delayMinutes / 60)}h ${status.delayMinutes % 60}m DELAYED`
                : `${status.delayMinutes}m DELAYED`}
            </span>

            {/* Running Days Mini Badge */}
            <div className="hidden lg:flex items-center gap-1 pl-2.5 border-l border-slate-200">
              <span className="text-[10px] text-slate-400 font-medium">Runs:</span>
              {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => {
                const isRunning = operatingDays.some(
                  (d) => d.toLowerCase().slice(0, 3) === day.toLowerCase().slice(0, 3)
                );
                return (
                  <span
                    key={day}
                    title={isRunning ? `Runs on ${day}` : `Does not run on ${day}`}
                    className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center transition-colors ${
                      isRunning
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-slate-100 text-slate-300 border border-slate-200 line-through opacity-60'
                    }`}
                  >
                    {day[0]}
                  </span>
                );
              })}
              <span className="text-[10px] text-slate-500 font-mono ml-0.5">
                ({operatingDays.length === 7 ? 'Daily' : `${operatingDays.length}d/wk`})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span className="font-medium text-xs hidden sm:inline">
              ETA:{' '}
              <span className="font-bold font-mono text-slate-800">
                {status.etaDestination || '08:40 AM Tomorrow'}
              </span>
            </span>

            <button
              type="button"
              onClick={() => refetch()}
              title="Refresh telemetry"
              className="p-1 hover:text-slate-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            <FavoriteButton trainNumber={status.trainNumber} />

            <button
              type="button"
              onClick={handleOpenShare}
              title="Share journey"
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-slate-900 shadow-2xs text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* 2. TOP TELEMETRY CARD */}
        <div className="rounded-3xl border border-slate-200/80 shadow-sm bg-white p-6 sm:p-7">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                  CURRENT LOCATION
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate block">
                  {status.currentStation?.name || 'In Transit'}
                </span>
                <span className="text-xs text-slate-500 font-medium block mt-0.5 truncate">
                  {status.nextStation?.name ? (
                    <>
                      Next Halt: <span className="font-semibold text-slate-700">{status.nextStation.name}</span>
                      {status.nextStation.platform ? ` (PF ${status.nextStation.platform})` : ''}
                      {status.etaNextStation ? ` • ETA ${status.etaNextStation}` : ''}
                    </>
                  ) : (
                    status.currentStation?.platform ? `Platform ${status.currentStation.platform}` : 'En Route'
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 md:border-l md:border-slate-100 md:pl-6">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                  LIVE TELEMETRY SPEED
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block font-mono">
                    {status.location?.speedKmph ?? 0}{' '}
                    <span className="text-sm sm:text-base font-semibold text-slate-500">km/h</span>
                  </span>
                  {(status.location?.speedKmph === 0 || !status.location?.speedKmph) ? (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      At Station / Stopped
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Cruising
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-medium block mt-0.5">
                  Status:{' '}
                  <span className={status.delayMinutes > 5 ? 'font-bold text-amber-600' : 'font-bold text-emerald-600'}>
                    {status.delayMinutes > 0
                      ? status.delayMinutes >= 60
                        ? `${Math.floor(status.delayMinutes / 60)}h ${status.delayMinutes % 60}m Late`
                        : `${status.delayMinutes}m Late`
                      : 'On Time'}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 md:border-l md:border-slate-100 md:pl-6">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                  DISTANCE COVERED
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 block font-mono">
                  {status.distanceCoveredKm || 0} km{' '}
                  <span className="text-slate-400 font-normal">/</span>{' '}
                  {(status.distanceCoveredKm || 0) + (status.distanceRemainingKm || 0)} km
                </span>
                <span className="text-xs text-slate-500 font-medium block mt-0.5">
                  {status.distanceRemainingKm || 0} km remaining
                </span>
              </div>

              <CircularProgressRing percentage={status.progressPercentage || 0} />
            </div>
          </div>
          <div className="border-t border-slate-100/90 mt-5 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Auto-refreshes every 30 seconds</span>
            <span>Updated: Just now</span>
          </div>
        </div>

        {/* 3. HORIZONTAL PILL TABS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 ${
              activeTab === 'map'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Vector Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 ${
              activeTab === 'history'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Past History & Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 ${
              activeTab === 'weather'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Weather Companion</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('elevation')}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 ${
              activeTab === 'elevation'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Terrain & Elevation</span>
          </button>
        </div>

        {/* 4. TAB CONTENT */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7 xl:col-span-8 2xl:col-span-8 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden h-[580px] sm:h-[640px] lg:h-[700px] relative bg-slate-950">
                <JourneyMap
                  status={status}
                  routeGeoJSON={routeGeoJSON}
                  stations={timeline}
                  selectedStation={selectedStation}
                  onStationSelect={handleStationClick}
                  className="w-full h-full"
                />
              </div>
              <div className="lg:col-span-5 xl:col-span-4 2xl:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm h-[580px] sm:h-[640px] lg:h-[700px] flex flex-col">
                <JourneyTimeline
                  stations={timeline}
                  onSelectStation={handleStationClick}
                  className="h-full"
                />
              </div>
            </div>

            {/* Weekly Schedule & Past Delay Record Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <WeeklyScheduleCard
                operatingDays={operatingDays}
                trainNumber={status.trainNumber}
                trainName={status.trainName}
              />
              <PastDelayHistoryCard
                timeline={timeline}
                delayHistory={delayHistory}
                trainNumber={status.trainNumber}
                trainName={status.trainName}
                operatingDays={operatingDays}
                currentDelayMinutes={status.delayMinutes}
                isLoading={isDelaysLoading}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <WeeklyScheduleCard
              operatingDays={operatingDays}
              trainNumber={status.trainNumber}
              trainName={status.trainName}
            />
            <PastDelayHistoryCard
              timeline={timeline}
              delayHistory={delayHistory}
              trainNumber={status.trainNumber}
              trainName={status.trainName}
              operatingDays={operatingDays}
              currentDelayMinutes={status.delayMinutes}
              isLoading={isDelaysLoading}
            />
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="space-y-4">
            {routeWeather && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            {routeWeather && <RouteWeatherStrip routeWeather={routeWeather} />}
            <GeographyCard places={places} />
          </div>
        )}

        {activeTab === 'elevation' && (
          <div className="space-y-4">
            <ElevationChart summary={elevationSummary} isLoading={isElevationLoading} />
            <DelayChart delays={delayHistory} isLoading={isDelaysLoading} />
          </div>
        )}
      </div>
    </div>
  );
};
