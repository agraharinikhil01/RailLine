import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const Header: React.FC = () => {
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
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Track Train
          </RouterLink>
          <a
            href="#explore"
            onClick={(e) => {
              e.preventDefault();
              alert('Phase 2 Explore & Route Geography is coming up next!');
            }}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:inline-block"
          >
            Explore Route
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 text-xs font-mono text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors ml-1 hidden sm:inline-block"
          >
            v1.0 MVP
          </a>
        </nav>
      </div>
    </header>
  );
};
