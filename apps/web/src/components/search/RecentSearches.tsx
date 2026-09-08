import React from 'react';
import { History, X } from 'lucide-react';
import { TrainSearchResult } from '@railline/types';

export interface RecentSearchesProps {
  searches: TrainSearchResult[];
  onSelect: (train: TrainSearchResult) => void;
  onRemove: (trainNumber: string) => void;
  onClear: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSelect,
  onRemove,
  onClear,
}) => {
  if (searches.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <History className="w-3.5 h-3.5" />
          <span>Recent Searches</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {searches.map((train) => (
          <div
            key={train.trainNumber}
            className="group inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-700 shadow-subtle shrink-0 transition-all cursor-pointer"
            onClick={() => onSelect(train)}
          >
            <span className="font-mono text-sky-600 font-bold">{train.trainNumber}</span>
            <span className="max-w-[120px] truncate text-slate-600">{train.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(train.trainNumber);
              }}
              className="text-slate-300 hover:text-slate-500 p-0.5 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
