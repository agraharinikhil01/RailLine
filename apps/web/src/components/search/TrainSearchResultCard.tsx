import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { TrainSearchResult } from '@railline/types';
import { Badge } from '../ui/Badge';

export interface TrainSearchResultCardProps {
  train: TrainSearchResult;
  onClick: () => void;
}

export const TrainSearchResultCard: React.FC<TrainSearchResultCardProps> = ({ train, onClick }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-xl transition-all duration-150 cursor-pointer shadow-subtle hover:shadow-card active:scale-[0.99]"
    >
      <div className="flex items-start gap-3.5 mb-2 sm:mb-0">
        <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex flex-col items-center justify-center text-sky-700 shrink-0 font-mono font-bold text-xs tracking-tight">
          <span>{train.trainNumber}</span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors text-sm">
              {train.name}
            </h4>
            {train.status && (
              <Badge
                variant={train.status === 'ON TIME' ? 'ontime' : train.status === 'DELAYED' ? 'delayed' : 'neutral'}
                dot
              >
                {train.status}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
            <span>{train.source}</span>
            <span className="font-mono text-slate-400">({train.sourceCode})</span>
            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{train.destination}</span>
            <span className="font-mono text-slate-400">({train.destinationCode})</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 font-mono border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        {train.departureTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Dep {train.departureTime}</span>
          </div>
        )}
        <div className="text-sky-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <span>Track Live</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
