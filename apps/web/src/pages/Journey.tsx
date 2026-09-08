import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { useRouteGeometry } from '../hooks/useRouteGeometry';
import { useTimeline } from '../hooks/useTimeline';
import { TrainHeader } from '../components/journey/TrainHeader';
import { CurrentStationCard } from '../components/journey/CurrentStationCard';
import { NextStationCard } from '../components/journey/NextStationCard';
import { JourneyProgressBar } from '../components/journey/JourneyProgressBar';
import { DistanceStatsCard } from '../components/journey/DistanceStatsCard';
import { JourneyTimeline } from '../components/journey/JourneyTimeline';
import { JourneyMap } from '../components/map/JourneyMap';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export const Journey: React.FC = () => {
  const { trainNumber = '' } = useParams<{ trainNumber: string }>();

  const {
    status,
    isLoading: isStatusLoading,
    isRefetching,
    error: statusError,
    refetch,
  } = useLiveStatus(trainNumber);

  const { routeGeoJSON } = useRouteGeometry(trainNumber);
  const { timeline } = useTimeline(trainNumber);

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
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <RouterLink
            to="/"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Train Search
          </RouterLink>
        </div>

        {/* Core Layout: Desktop 2-column, Mobile stacked */}
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

            {/* Quick Distance & Telemetry Stats */}
            <DistanceStatsCard status={status} />
          </div>

          {/* Sidebar Column (Current Halt, Next Stop, Timeline) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Current Station */}
            <CurrentStationCard status={status} />

            {/* Next Stop Card */}
            <NextStationCard status={status} />

            {/* Station Timeline */}
            <JourneyTimeline stations={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
};
