import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Clock } from 'lucide-react';
import { StationDelayPoint } from '../../services/trainService';
import { Skeleton } from '../ui/Skeleton';

export interface DelayChartProps {
  delays: StationDelayPoint[];
  isLoading?: boolean;
}

export const DelayChart: React.FC<DelayChartProps> = ({ delays, isLoading }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-56 rounded-xl" />;
  }

  if (!delays || delays.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Station Delay Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Arrival delay variance recorded across journey checkpoints
          </p>
        </div>
      </div>

      <div className="w-full h-44 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={delays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="stationCode"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(v) => `+${v}m`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as StationDelayPoint;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-floating font-mono border border-slate-800">
                      <div className="font-sans font-semibold text-white mb-1">
                        {data.stationName} ({data.stationCode})
                      </div>
                      <div className={data.delayMinutes > 5 ? 'text-amber-400' : 'text-emerald-400'}>
                        Delay: <strong>+{data.delayMinutes} min</strong>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Sched: {data.scheduledTime} | Actual: {data.actualTime}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="delayMinutes" radius={[4, 4, 0, 0]}>
              {delays.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.delayMinutes > 15 ? '#EF4444' : entry.delayMinutes > 5 ? '#F59E0B' : '#10B981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
