import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Search, Compass } from 'lucide-react';
import { clsx } from 'clsx';

export const Header: React.FC = () => {
  const location = useLocation();

  const isSearchActive = location.pathname === '/';
  const isTrackingActive = location.pathname.startsWith('/tracking');

  // Get the most recent train number dynamically from user's history
  const activeTrainNumber = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('railline_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.trainNumber) {
          return parsed[0].trainNumber;
        }
      }
    } catch {
      // ignore
    }
    return '12951';
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-subtle">
      <div className="w-full px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <RouterLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-sky-500/20 transition-transform group-hover:scale-105">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8-12.5c4.5 0 6 1.05 6 2v2H6V5c0-.95 1.5-2 6-2zm-6 6h12v5H6V9zm2 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              RailLine
            </span>
            <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
        </RouterLink>

        {/* Navigation Actions matching ONLY the 2 screens in the screenshots */}
        <nav className="flex items-center gap-2">
          {/* Search Pill (Screen 1) */}
          <RouterLink
            to="/"
            className={clsx(
              'px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-2xs',
              isSearchActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </RouterLink>

          {/* Live Tracking Pill (Screen 2) */}
          <RouterLink
            to={`/tracking/${activeTrainNumber}`}
            className={clsx(
              'px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-2xs',
              isTrackingActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Live Tracking</span>
          </RouterLink>
        </nav>
      </div>
    </header>
  );
};
