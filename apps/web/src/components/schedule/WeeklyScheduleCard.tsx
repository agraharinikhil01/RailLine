import React from 'react';
import { Calendar, Check, X, Info } from 'lucide-react';

export interface WeeklyScheduleCardProps {
  operatingDays?: string[];
  trainNumber?: string;
  trainName?: string;
  className?: string;
}

const ALL_DAYS = [
  { short: 'Mon', full: 'Monday', dayIndex: 1 },
  { short: 'Tue', full: 'Tuesday', dayIndex: 2 },
  { short: 'Wed', full: 'Wednesday', dayIndex: 3 },
  { short: 'Thu', full: 'Thursday', dayIndex: 4 },
  { short: 'Fri', full: 'Friday', dayIndex: 5 },
  { short: 'Sat', full: 'Saturday', dayIndex: 6 },
  { short: 'Sun', full: 'Sunday', dayIndex: 0 },
];

export const WeeklyScheduleCard: React.FC<WeeklyScheduleCardProps> = ({
  operatingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  trainNumber,
  trainName,
  className = '',
}) => {
  // Normalize days to lowercase 3-letter strings for safe comparison
  const activeDaysSet = new Set(
    operatingDays.map((d) => d.toLowerCase().slice(0, 3))
  );

  const totalRunningDays = ALL_DAYS.filter((d) =>
    activeDaysSet.has(d.short.toLowerCase())
  ).length;

  const nonRunningDays = ALL_DAYS.filter(
    (d) => !activeDaysSet.has(d.short.toLowerCase())
  );

  const isDaily = totalRunningDays === 7;

  // Current day in Indian Standard Time (UTC+5:30)
  const now = new Date();
  const utcOffsetMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istNow = new Date(utcOffsetMs + 5.5 * 3600000);
  const currentDayIndex = istNow.getDay(); // 0 is Sun, 1 is Mon, etc.

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Weekly Operating Schedule
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide border ${
                  isDaily
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isDaily ? 'Daily Service' : `${totalRunningDays} Days / Week`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Days when train {trainNumber ? `#${trainNumber}` : ''}{trainName ? ` (${trainName})` : ''} operates and scheduled off-days
            </p>
          </div>
        </div>

        {/* Total Frequency Summary Badge */}
        <div className="text-left sm:text-right">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Weekly Frequency
          </span>
          <span className="text-xs font-bold font-mono text-slate-800">
            {totalRunningDays} of 7 Days Active
          </span>
        </div>
      </div>

      {/* 7-Day Visual Pill Strip */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 my-5">
        {ALL_DAYS.map((day) => {
          const isRunning = activeDaysSet.has(day.short.toLowerCase());
          const isToday = day.dayIndex === currentDayIndex;

          return (
            <div
              key={day.short}
              className={`relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border transition-all text-center ${
                isRunning
                  ? 'bg-emerald-50/70 border-emerald-200/90 text-emerald-900 shadow-2xs'
                  : 'bg-slate-50/80 border-slate-200 text-slate-400 opacity-60'
              } ${isToday ? 'ring-2 ring-sky-500 ring-offset-1' : ''}`}
            >
              {/* "Today" Marker */}
              {isToday && (
                <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-sky-500 text-white text-[8px] font-bold uppercase tracking-wider font-mono">
                  Today
                </span>
              )}

              {/* Day Code */}
              <span className="text-xs sm:text-sm font-bold uppercase font-mono">
                {day.short}
              </span>

              {/* Status Icon */}
              <div className="mt-1">
                {isRunning ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center">
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[9px] sm:text-[10px] font-semibold mt-1 font-mono uppercase ${
                  isRunning ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                {isRunning ? 'Runs' : 'Off'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detailed Status Breakdown Note */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3 sm:p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
        <div className="min-w-0 space-y-0.5">
          <div className="font-semibold text-slate-800">
            {isDaily ? (
              <span>Runs all 7 days of the week (Monday through Sunday) without any scheduled off-days.</span>
            ) : (
              <span>
                Operates on <strong>{operatingDays.join(', ')}</strong> ({totalRunningDays} days/week).
              </span>
            )}
          </div>
          {nonRunningDays.length > 0 && (
            <div className="text-amber-700 font-medium text-[11px]">
              Does not run on:{' '}
              <strong className="underline decoration-amber-300">
                {nonRunningDays.map((d) => d.full).join(', ')}
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
