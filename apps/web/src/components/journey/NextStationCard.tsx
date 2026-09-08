import React from 'react';
import { ArrowRightCircle, Clock, Milestone } from 'lucide-react';
import { LiveTrainStatus } from '@railline/types';

export interface NextStationCardProps {
  status: LiveTrainStatus;
}

export const NextStationCard: React.FC<NextStationCardProps> = ({ status }) => {
  const next = status.nextStation;

  if (!next) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-subtle">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Next Stop
        </span>
        <h3 className="text-sm font-semibold text-slate-700 mt-2">
          Train reached final destination
        </h3>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-subtle flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Next Stop
        </span>
        <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <ArrowRightCircle className="w-3.5 h-3.5" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {next.name}
          </h3>
          <span className="font-mono text-xs font-semibold text-slate-400">
            ({next.code})
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2.5">
          <div>
            <span className="text-slate-400 flex items-center gap-1 text-[10px] uppercase font-medium">
              <Clock className="w-3 h-3" />
              Expected ETA
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-bold text-slate-900 font-mono text-sm">
                {status.etaNextStation || next.scheduledArrival || '—'}
              </span>
              {status.delayMinutes > 0 && (
                <span className="text-amber-600 font-mono text-[11px] font-semibold">
                  +{status.delayMinutes}m
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-400 flex items-center gap-1 text-[10px] uppercase font-medium">
              <Milestone className="w-3 h-3" />
              Remaining Dist
            </span>
            <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
              {status.distanceRemainingKm} km
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
