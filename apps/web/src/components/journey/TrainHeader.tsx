import React, { useState, useEffect } from 'react';
import { RefreshCw, Share2, Check, Radio } from 'lucide-react';
import { LiveTrainStatus } from '@railline/types';
import { TrainStatusBadge } from './TrainStatusBadge';
import { Button } from '../ui/Button';

export interface TrainHeaderProps {
  status: LiveTrainStatus;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const TrainHeader: React.FC<TrainHeaderProps> = ({
  status,
  onRefresh,
  isRefreshing = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - new Date(status.lastUpdatedAt).getTime()) / 1000);
      setSecondsAgo(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [status.lastUpdatedAt]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Train ID and Title */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-mono font-bold text-sm tracking-wider shadow-sm">
            {status.trainNumber}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {status.trainName}
              </h1>
              <TrainStatusBadge status={status.status} delayMinutes={status.delayMinutes} />
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <Radio className="w-3 h-3 animate-pulse" />
                Live Telemetry
              </span>
              <span>•</span>
              <span className="text-slate-400">
                {isRefreshing ? 'Updating live position...' : `Updated ${secondsAgo}s ago`}
              </span>
              {status.isStale && (
                <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                  ⚠ Cached
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            className="text-xs text-slate-700"
            title="Refresh train location"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            className="text-xs text-slate-700"
            title="Share journey link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                Share
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
