import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, MapPin, Radio, ShieldCheck } from 'lucide-react';
import { trainApi } from '../services/trainService';
import { TrainStatusBadge } from '../components/journey/TrainStatusBadge';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export const SharedJourney: React.FC = () => {
  const { shareToken = '' } = useParams<{ shareToken: string }>();

  const { data: journey, isLoading, error, refetch } = useQuery({
    queryKey: ['shared-journey', shareToken],
    queryFn: () => trainApi.getSharedJourney(shareToken),
    enabled: !!shareToken,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-4">
        <Skeleton className="w-1/2 h-8" />
        <Skeleton className="w-full h-48 rounded-2xl" />
        <Skeleton className="w-full h-32 rounded-xl" />
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <ErrorState
          title="Shared Journey Unavailable"
          message="This shared tracking link may have expired or is invalid. Please request an updated link from the passenger."
          onRetry={() => refetch()}
        />
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
            Go to RailLine Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-xl mx-auto w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to RailLine Home
          </Link>
        </div>

        {/* Shared Journey Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card overflow-hidden">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-6">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-sky-400 border border-slate-700">
                {journey.trainNumber}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <Radio className="w-3 h-3 animate-pulse" />
                Live Tracking Active
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {journey.trainName}
            </h1>

            <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
              <span>{journey.source}</span>
              <span>→</span>
              <span>{journey.destination}</span>
            </div>
          </div>

          {/* Body Information */}
          <div className="p-6 space-y-5">
            {/* Status & Delay */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Running Status
              </span>
              <TrainStatusBadge status={journey.status} delayMinutes={journey.delayMinutes} />
            </div>

            {/* Current Position */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Currently Near
                </span>
                <span className="text-base font-bold text-slate-900">
                  {journey.currentStationName || 'Between Stations'}
                </span>
                {journey.nextStationName && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Next Halt: {journey.nextStationName}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Journey Progress</span>
                <span className="font-bold text-slate-900">{journey.progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${journey.progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{journey.distanceCoveredKm} km covered</span>
                <span>{journey.distanceRemainingKm} km to go</span>
              </div>
            </div>

            {/* Destination ETA */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Expected Destination Arrival</span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {journey.etaDestination || 'On schedule'}
              </span>
            </div>

            {/* Open Full Interactive Map Button */}
            <div className="pt-2">
              <Link
                to={`/journey/${journey.trainNumber}`}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-center"
              >
                <span>Open Full Interactive Map & Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Security note footer */}
      <div className="text-center text-xs text-slate-400 py-4 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Verified Public Snapshot by RailLine</span>
      </div>
    </div>
  );
};
