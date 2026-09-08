import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { LiveTrainStatus } from '@railline/types';

export interface CurrentStationCardProps {
  status: LiveTrainStatus;
}

export const CurrentStationCard: React.FC<CurrentStationCardProps> = ({ status }) => {
  const station = status.currentStation;
  const isBetween = !station;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-subtle flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Current Station
        </span>
        <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center">
          <MapPin className="w-3.5 h-3.5" />
        </div>
      </div>

      <div>
        {isBetween ? (
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-sky-500 animate-pulse" />
              Between Stations
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Approaching {status.nextStation?.name || 'next halt'}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {station.name}
              </h3>
              <span className="font-mono text-xs font-semibold text-slate-400">
                ({station.code})
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2.5">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Platform</span>
                <span className="font-semibold text-slate-700 font-mono">
                  {station.platform ? `PF ${station.platform}` : '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Arrived / Dep</span>
                <span className="font-semibold text-slate-700 font-mono">
                  {station.scheduledArrival || station.scheduledDeparture || 'On schedule'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
