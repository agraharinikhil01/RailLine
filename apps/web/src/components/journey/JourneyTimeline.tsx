import React from 'react';
import { CheckCircle2, Radio, Circle } from 'lucide-react';
import { JourneyStation } from '@railline/types';
import { clsx } from 'clsx';

export interface JourneyTimelineProps {
  stations: JourneyStation[];
  onSelectStation?: (station: JourneyStation) => void;
  className?: string;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  stations,
  onSelectStation,
  className = '',
}) => {
  if (!stations || stations.length === 0) return null;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Station Route Timeline
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
        {stations.map((item) => {
          const isCompleted = item.status === 'COMPLETED';
          const isCurrent = item.status === 'CURRENT';

          const time = isCompleted
            ? item.actualArrival || item.scheduledArrival || item.actualDeparture || item.scheduledDeparture
            : item.expectedArrival || item.scheduledArrival || item.expectedDeparture || item.scheduledDeparture;

          return (
            <div
              key={item.station.code}
              onClick={() => onSelectStation?.(item)}
              className={clsx(
                'flex items-start justify-between gap-3 p-2 rounded-xl transition-all cursor-pointer',
                isCurrent
                  ? 'bg-sky-50/70 border border-sky-100'
                  : 'hover:bg-slate-50 border border-transparent'
              )}
            >
              {/* Left Column: Status Icon + Station Identity */}
              <div className="flex items-start gap-3 min-w-0">
                {/* Node Icon */}
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <Radio className="w-4 h-4 text-sky-500 animate-pulse" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300" />
                  )}
                </div>

                {/* Station Name, Badges & Distance */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={clsx(
                        'text-xs sm:text-sm tracking-tight',
                        isCurrent
                          ? 'font-bold text-sky-600'
                          : isCompleted
                          ? 'font-bold text-slate-800'
                          : 'font-medium text-slate-600'
                      )}
                    >
                      {item.station.name} ({item.station.code})
                    </span>

                    {/* LIVE LOCATION Badge if Current */}
                    {isCurrent && (
                      <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                        LIVE LOCATION
                      </span>
                    )}

                    {/* Platform Pill */}
                    {item.platform && (
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        PF {item.platform}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                    {item.distanceFromSourceKm} km
                  </span>
                </div>
              </div>

              {/* Right Column: Time & Delay */}
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-slate-800 block">
                  {time || '—'}
                </span>

                <div className="mt-0.5">
                  {item.delayMinutes > 0 ? (
                    <span className="text-[11px] font-mono text-amber-600 font-medium">
                      +{item.delayMinutes}m delay
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-600 font-medium">
                      On Time
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
