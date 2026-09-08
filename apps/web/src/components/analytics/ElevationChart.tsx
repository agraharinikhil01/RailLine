import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { Mountain, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { ElevationSummary } from '../../services/trainService';
import { Skeleton } from '../ui/Skeleton';

export interface ElevationChartProps {
  summary?: ElevationSummary;
  isLoading?: boolean;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-64 rounded-xl" />;
  }

  if (!summary || summary.profile.length === 0) {
    return null;
  }

  const currentPoint = summary.profile.find((p) => p.isCurrentPosition) || summary.profile[0];

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center">
              <Mountain className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Route Elevation & Topography
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic elevation profile across track distance
          </p>
        </div>

        {/* Topography Metrics Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-mono">
            <span className="text-slate-400 block text-[10px] uppercase">Current</span>
            <span className="font-bold text-sky-600">{summary.currentElevationMeters} m</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-mono flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Peak</span>
              <span className="font-bold text-slate-800">{summary.highestElevationMeters} m</span>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-mono flex items-center gap-1.5">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Lowest</span>
              <span className="font-bold text-slate-800">{summary.lowestElevationMeters} m</span>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-mono flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Climb</span>
              <span className="font-bold text-slate-800">+{summary.elevationGainMeters} m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="w-full h-52 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={summary.profile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="distanceKm"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(v) => `${v}km`}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(v) => `${v}m`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-floating font-mono border border-slate-800">
                      {data.stationName && (
                        <div className="font-sans font-semibold text-sky-400 mb-1">
                          {data.stationName}
                        </div>
                      )}
                      <div>Elevation: <strong className="text-white">{data.elevationMeters} m</strong></div>
                      <div className="text-slate-400">Distance: {data.distanceKm} km</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="elevationMeters"
              stroke="#0284C7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#elevationGradient)"
            />
            {currentPoint && (
              <ReferenceDot
                x={currentPoint.distanceKm}
                y={currentPoint.elevationMeters}
                r={6}
                fill="#38BDF8"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
