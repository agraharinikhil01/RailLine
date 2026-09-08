import React from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';
import { Weather } from '@railline/types';

export interface WeatherCardProps {
  weather?: Weather;
  label: string;
  badgeText?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, label, badgeText }) => {
  if (!weather) return null;

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return <CloudRain className="w-5 h-5 text-sky-500" />;
    if (c.includes('sun') || c.includes('clear')) return <Sun className="w-5 h-5 text-amber-500" />;
    return <Cloud className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-subtle flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {badgeText && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold">
            {badgeText}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <h4 className="text-base font-bold text-slate-900 truncate">
            {weather.stationName}
          </h4>
          <span className="font-mono text-2xl font-bold text-slate-900">
            {weather.temperature}°
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-3">
          {getWeatherIcon(weather.condition)}
          <span>{weather.condition}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 text-[11px]">Feels {weather.feelsLike}°</span>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-sky-500 shrink-0" />
            <span>{weather.humidity}%</span>
          </div>

          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{weather.windSpeed} km/h</span>
          </div>

          <div className="flex items-center gap-1">
            <CloudRain className="w-3 h-3 text-blue-400 shrink-0" />
            <span>{weather.rainProbability || 0}% rain</span>
          </div>
        </div>
      </div>
    </div>
  );
};
