import React from 'react';
import { Compass, Waves, Mountain, Landmark } from 'lucide-react';
import { GeographicPlace } from '@railline/types';

export interface GeographyCardProps {
  places: GeographicPlace[];
}

export const GeographyCard: React.FC<GeographyCardProps> = ({ places }) => {
  if (!places || places.length === 0) return null;

  const getCategoryIcon = (type: GeographicPlace['type']) => {
    switch (type) {
      case 'RIVER':
        return <Waves className="w-4 h-4 text-sky-500" />;
      case 'BRIDGE':
        return <span className="text-sm">🌉</span>;
      case 'MOUNTAIN':
        return <Mountain className="w-4 h-4 text-emerald-600" />;
      case 'MONUMENT':
        return <Landmark className="w-4 h-4 text-amber-600" />;
      case 'GHAT':
      default:
        return <Compass className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Route Highlights & Geography
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rivers, engineering bridges, mountain corridors, and historical monuments
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {places.map((place) => (
          <div
            key={place.id}
            className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-subtle">
                {getCategoryIcon(place.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {place.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {place.distanceFromRouteKm} km away
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5 mb-1.5">
                  <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700">
                    {place.type}
                  </span>
                  {place.elevationMeters && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {place.elevationMeters}m MSL
                    </span>
                  )}
                </div>

                {place.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {place.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
