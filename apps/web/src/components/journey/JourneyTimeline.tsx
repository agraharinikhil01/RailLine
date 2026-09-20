import React, { useState, useCallback } from 'react';
import { CheckCircle2, Radio, Circle, ChevronDown } from 'lucide-react';
import { JourneyStation } from '@railline/types';
import { clsx } from 'clsx';

export interface JourneyTimelineProps {
  stations: JourneyStation[];
  routeGeoJSON?: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  onSelectStation?: (station: JourneyStation) => void;
  className?: string;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  stations,
  routeGeoJSON,
  onSelectStation,
  className = '',
}) => {
  const [expandedStations, setExpandedStations] = useState<Record<string, boolean>>({});

  const toggleExpand = (code: string) => {
    setExpandedStations((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // Helper to get smaller intermediate non-stop stations between current station and next station
  const getIntermediateStops = useCallback(
    (curStation: JourneyStation, nextStation?: JourneyStation) => {
      // 1. Direct from API (if populated)
      if (curStation.intermediateStations && curStation.intermediateStations.length > 0) {
        return curStation.intermediateStations;
      }

      // 2. From routeGeoJSON features (if available)
      if (routeGeoJSON?.features) {
        const curDist = curStation.distanceFromSourceKm ?? 0;
        const nextDist = nextStation?.distanceFromSourceKm ?? Infinity;

        const matching = routeGeoJSON.features.filter((f) => {
          if (f.geometry.type !== 'Point') return false;
          const p = f.properties as any;
          if (!p) return false;
          const isIntermediate = p.stationType === 'intermediate' || p.isHalt === false;
          const dist = p.distance ?? p.distanceKm ?? p.distanceFromOriginKm;
          if (!isIntermediate) return false;
          if (typeof dist === 'number') {
            return dist > curDist && dist < nextDist;
          }
          return false;
        });

        if (matching.length > 0) {
          return matching.map((f) => {
            const p = f.properties as any;
            return {
              code: p.code || '',
              name: p.name || '',
              distanceKm: Math.round(p.distance ?? p.distanceKm ?? p.distanceFromOriginKm ?? 0),
            };
          });
        }
      }

      return [];
    },
    [routeGeoJSON]
  );

  if (!stations || stations.length === 0) return null;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Station Route Timeline
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Click any primary station to view non-stop passing stations
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar">
        {stations.map((item, idx) => {
          if (!item) return null;
          const isCompleted = item.status === 'COMPLETED';
          const isCurrent = item.status === 'CURRENT';

          const time = isCompleted
            ? item.actualArrival || item.scheduledArrival || item.actualDeparture || item.scheduledDeparture
            : item.expectedArrival || item.scheduledArrival || item.expectedDeparture || item.scheduledDeparture;

          const stCode = item.station?.code || (item as any).stationCode || `STN-${idx}`;
          const stName = item.station?.name || (item as any).stationName || stCode;

          const nextStation = stations[idx + 1];
          const intermediateStops = getIntermediateStops(item, nextStation);
          const isExpanded = !!expandedStations[stCode];

          return (
            <div key={`${stCode}-${idx}`} className="space-y-1">
              <div
                onClick={() => {
                  onSelectStation?.(item);
                  toggleExpand(stCode);
                }}
                className={clsx(
                  'flex items-start justify-between gap-3 p-2.5 rounded-xl transition-all cursor-pointer select-none',
                  isCurrent
                    ? 'bg-sky-50/80 border border-sky-200/80 shadow-2xs'
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
                        {stName} ({stCode})
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

                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.distanceFromSourceKm ?? 0} km
                      </span>

                      {/* Non-Stop Station Toggle Badge */}
                      {intermediateStops.length > 0 && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-600 hover:text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded transition-colors"
                          title={isExpanded ? 'Click to collapse non-stop stations' : 'Click to view non-stop passing stations'}
                        >
                          <span>{isExpanded ? 'Hide' : 'Show'} {intermediateStops.length} non-stop</span>
                          <ChevronDown
                            className={clsx(
                              'w-3 h-3 transition-transform duration-200',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        </span>
                      )}
                    </div>
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
                        +{item.delayMinutes >= 60
                          ? `${Math.floor(item.delayMinutes / 60)}h ${item.delayMinutes % 60}m`
                          : `${item.delayMinutes}m`}{' '}
                        delay
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-600 font-medium">
                        On Time
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Accordion: Intermediate passing stations where train doesn't halt */}
              {isExpanded && intermediateStops.length > 0 && (
                <div className="ml-5 pl-4 border-l-2 border-dashed border-sky-200 py-1.5 space-y-1.5 my-1 animate-in fade-in duration-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pb-0.5">
                    <span>Passing Stations (Non-Stop)</span>
                    <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                      {intermediateStops.length} stops
                    </span>
                  </div>

                  {intermediateStops.map((subSt, sIdx) => (
                    <div
                      key={`${subSt.code}-${sIdx}`}
                      className="flex items-center justify-between gap-2 py-1 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/90 text-xs transition-colors border border-slate-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        <span className="font-semibold text-slate-700 truncate text-[11px]">
                          {subSt.name}
                        </span>
                        {subSt.code && (
                          <span className="text-[9px] font-mono text-slate-400 font-bold shrink-0">
                            ({subSt.code})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono font-bold text-slate-600">
                          {subSt.distanceKm} km
                        </span>
                        <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600">
                          Non-stop
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
