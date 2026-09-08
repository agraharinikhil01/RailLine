import React from 'react';
import { Check, Clock } from 'lucide-react';
import { JourneyStation } from '@railline/types';
import { clsx } from 'clsx';

export interface JourneyTimelineProps {
  stations: JourneyStation[];
  onSelectStation?: (station: JourneyStation) => void;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  stations,
  onSelectStation,
}) => {
  if (!stations || stations.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-subtle">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Station Timeline & Halts
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {stations.length} scheduled stations along this route
          </p>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {stations.map((item, index) => {
          const isCompleted = item.status === 'COMPLETED';
          const isCurrent = item.status === 'CURRENT';
          const isUpcoming = item.status === 'UPCOMING';

          return (
            <div
              key={item.station.code}
              onClick={() => onSelectStation?.(item)}
              className={clsx(
                'relative flex items-start justify-between gap-4 group transition-colors',
                onSelectStation && 'cursor-pointer'
              )}
            >
              {/* Timeline Node Marker */}
              <div
                className={clsx(
                  'absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm',
                  isCompleted && 'bg-emerald-500 text-white ring-4 ring-emerald-50',
                  isCurrent && 'bg-sky-500 text-white ring-4 ring-sky-100 animate-pulse',
                  isUpcoming && 'bg-white border-2 border-slate-300 text-slate-400'
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 bg-white rounded-full" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Station Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span
                    className={clsx(
                      'text-sm font-semibold tracking-tight',
                      isCurrent ? 'text-sky-600 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-600'
                    )}
                  >
                    {item.station.name}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-medium">
                    ({item.station.code})
                  </span>
                  {item.platform && (
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                      PF {item.platform}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 mt-0.5 font-mono flex items-center gap-2">
                  <span>{item.distanceFromSourceKm} km</span>
                  {item.station.state && (
                    <>
                      <span>•</span>
                      <span>{item.station.state}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Timing & Delay */}
              <div className="text-right shrink-0">
                <div className="text-xs font-mono font-semibold text-slate-800">
                  {isCompleted
                    ? item.actualArrival || item.scheduledArrival || item.actualDeparture || item.scheduledDeparture
                    : item.expectedArrival || item.scheduledArrival || item.expectedDeparture || item.scheduledDeparture}
                </div>

                <div className="flex items-center justify-end gap-1 mt-0.5">
                  {item.delayMinutes > 0 ? (
                    <span className="text-[11px] font-mono text-amber-600 font-semibold flex items-center">
                      <Clock className="w-3 h-3 mr-0.5" />
                      +{item.delayMinutes}m
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
