import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, PlayCircle, Flag } from 'lucide-react';
import { RunningStatus } from '@railline/types';
import { Badge } from '../ui/Badge';

export interface TrainStatusBadgeProps {
  status: RunningStatus;
  delayMinutes?: number;
  className?: string;
}

export const TrainStatusBadge: React.FC<TrainStatusBadgeProps> = ({
  status,
  delayMinutes = 0,
  className,
}) => {
  switch (status) {
    case 'ON TIME':
      return (
        <Badge variant="ontime" className={className}>
          <CheckCircle2 className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
          <span>ON TIME</span>
        </Badge>
      );

    case 'DELAYED':
      return (
        <Badge variant="delayed" className={className}>
          <Clock className="w-3.5 h-3.5 mr-0.5 text-amber-600" />
          <span>DELAYED {delayMinutes > 0 ? `+${delayMinutes}m` : ''}</span>
        </Badge>
      );

    case 'ARRIVED':
      return (
        <Badge variant="accent" className={className}>
          <Flag className="w-3.5 h-3.5 mr-0.5 text-sky-600" />
          <span>ARRIVED</span>
        </Badge>
      );

    case 'NOT STARTED':
      return (
        <Badge variant="neutral" className={className}>
          <PlayCircle className="w-3.5 h-3.5 mr-0.5 text-slate-500" />
          <span>NOT STARTED</span>
        </Badge>
      );

    case 'COMPLETED':
      return (
        <Badge variant="ontime" className={className}>
          <CheckCircle2 className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
          <span>COMPLETED</span>
        </Badge>
      );

    case 'DATA UNAVAILABLE':
    default:
      return (
        <Badge variant="critical" className={className}>
          <AlertTriangle className="w-3.5 h-3.5 mr-0.5 text-rose-600" />
          <span>DATA UNAVAILABLE</span>
        </Badge>
      );
  }
};
