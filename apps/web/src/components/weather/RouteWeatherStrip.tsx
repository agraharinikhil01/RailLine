import React from 'react';
import { RouteWeather } from '@railline/types';
import { Sun, Cloud, CloudRain } from 'lucide-react';

export interface RouteWeatherStripProps {
  routeWeather?: RouteWeather;
}

export const RouteWeatherStrip: React.FC<RouteWeatherStripProps> = ({ routeWeather }) => {
  if (!routeWeather || !routeWeather.checkpoints || routeWeather.checkpoints.length === 0) {
    return null;
  }

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return <CloudRain className="w-3.5 h-3.5 text-sky-500" />;
    if (c.includes('sun') || c.includes('clear')) return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    return <Cloud className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-subtle">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Route Corridor Weather
        </span>
        <span className="text-[11px] text-slate-400 font-mono">Real-time forecasts</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
        {routeWeather.checkpoints.map((cp, idx) => (
          <div
            key={cp.stationCode || idx}
            className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs shrink-0"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">{cp.stationName}</span>
              <span className="text-[10px] text-slate-400 font-mono">{cp.condition}</span>
            </div>

            <div className="flex items-center gap-1 font-mono font-bold text-slate-900 text-sm">
              {getWeatherIcon(cp.condition)}
              <span>{cp.temperature}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
