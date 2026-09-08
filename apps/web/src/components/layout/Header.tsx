import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Heart, Sliders, MapPin, Radio } from 'lucide-react';
import { clsx } from 'clsx';

export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-subtle">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <RouterLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-slate-800 transition-colors">
            <span className="font-mono text-sm font-bold tracking-tighter">RL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-slate-900 tracking-tight">
              RailLine
            </span>
            <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" />
              Live
            </span>
            <span className="text-xs text-slate-400 hidden md:inline font-medium pl-1 border-l border-slate-200">
              Railway Journey Intelligence
            </span>
          </div>
        </RouterLink>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <RouterLink
            to="/"
            className={clsx(
              'px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5',
              isActive('/')
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            <MapPin className="w-3.5 h-3.5 text-sky-500" />
            <span>Track Train</span>
          </RouterLink>

          <RouterLink
            to="/favorites"
            className={clsx(
              'px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5',
              isActive('/favorites')
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Favorites</span>
          </RouterLink>

          <RouterLink
            to="/settings"
            className={clsx(
              'px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5',
              isActive('/settings')
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings</span>
          </RouterLink>
        </nav>
      </div>
    </header>
  );
};
