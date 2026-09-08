import React from 'react';
import { Gauge, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { LiveTrainStatus } from '@railline/types';

export interface DistanceStatsCardProps {
  status: LiveTrainStatus;
}

export const DistanceStatsCard: React.FC<DistanceStatsCardProps> = ({ status }) => {
  const getTrendIcon = () => {
    switch (status.delayTrend) {
      case 'INCREASING':
        return <TrendingUp className="w-3.5 h-3.5 text-rose-500" />;
      case 'DECREASING':
        return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
      case 'STABLE':
      default:
        return <Minus className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Speed */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-subtle">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          <Gauge className="w-3.5 h-3.5 text-sky-500" />
          <span>Speed</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-xl font-bold text-slate-900">
            {status.location.speedKmph || 0}
          </span>
          <span className="text-xs text-slate-400 font-mono">km/h</span>
        </div>
      </div>

      {/* Delay Trend */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-subtle">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          {getTrendIcon()}
          <span>Delay Trend</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-sm font-bold text-slate-900 capitalize">
            {status.delayTrend ? status.delayTrend.toLowerCase() : 'Stable'}
          </span>
          {status.delayMinutes > 0 && (
            <span className="text-xs text-amber-600 font-mono">
              (+{status.delayMinutes}m)
            </span>
          )}
        </div>
      </div>

      {/* Destination ETA */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-subtle">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span>Final ETA</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-xl font-bold text-slate-900">
            {status.etaDestination || '—'}
          </span>
        </div>
      </div>

      {/* Bearing / Heading */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-subtle">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          <span>🧭</span>
          <span>Heading</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-xl font-bold text-slate-900">
            {status.location.bearing || 0}°
          </span>
          <span className="text-xs text-slate-400 font-mono">track</span>
        </div>
      </div>
    </div>
  );
};
