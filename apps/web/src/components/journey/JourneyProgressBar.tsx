import React from 'react';
import { LiveTrainStatus } from '@railline/types';

export interface JourneyProgressBarProps {
  status: LiveTrainStatus;
}

export const JourneyProgressBar: React.FC<JourneyProgressBarProps> = ({ status }) => {
  const percentage = Math.min(100, Math.max(0, status.progressPercentage));

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-subtle">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Journey Progress
          </span>
          <span className="font-bold text-slate-900 font-mono text-sm">
            {percentage}%
          </span>
        </div>

        <div className="text-slate-500 font-mono text-xs flex items-center gap-3">
          <span>
            <strong className="text-slate-800">{status.distanceCoveredKm} km</strong> covered
          </span>
          <span className="text-slate-300">•</span>
          <span>
            <strong className="text-slate-800">{status.distanceRemainingKm} km</strong> left
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div
        className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-visible"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Journey ${percentage}% completed, ${status.distanceCoveredKm} km traveled`}
      >
        {/* Completed bar */}
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-sky-600 rounded-full transition-all duration-700 ease-out shadow-sm relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Glowing pulse indicator at current position */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-md flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* Origin & Destination Labels */}
      <div className="flex items-center justify-between mt-3 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
          <span className="text-slate-700 font-semibold">{status.currentStation?.name || 'Origin'}</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-700 font-semibold">{status.nextStation?.name || 'Destination'}</span>
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  );
};
