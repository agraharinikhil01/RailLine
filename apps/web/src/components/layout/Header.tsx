import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Heart, Sliders, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <RouterLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-slate-800 transition-colors">
            <span className="font-mono text-base font-bold tracking-tighter">RL</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              RailLine
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/60">
                Live
              </span>
            </span>
            <span className="text-[11px] text-slate-400 -mt-1 hidden sm:block">
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
