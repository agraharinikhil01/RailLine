import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sliders, RefreshCw, Eye, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Settings: React.FC = () => {
  const [refreshInterval, setRefreshInterval] = useState<'30' | '60'>('30');
  const [cameraFollowDefault, setCameraFollowDefault] = useState<boolean>(true);
  const [cleared, setCleared] = useState(false);

  const handleClearData = () => {
    localStorage.clear();
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-600" />
              Settings & Preferences
            </h1>
            <p className="text-xs text-slate-500">
              Configure telemetry refresh, map follow modes, and system performance
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tracking Telemetry */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-sky-500" />
              Live Telemetry Refresh
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Interval between automated train position and delay polling queries (PRD §3.9)
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setRefreshInterval('30')}
                className={`p-3 rounded-xl border text-xs font-mono font-medium transition-all ${
                  refreshInterval === '30'
                    ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-sm">30 Seconds</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Recommended • Standard</div>
              </button>

              <button
                type="button"
                onClick={() => setRefreshInterval('60')}
                className={`p-3 rounded-xl border text-xs font-mono font-medium transition-all ${
                  refreshInterval === '60'
                    ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-sm">60 Seconds</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Low Bandwidth Mode</div>
              </button>
            </div>
          </div>

          {/* Map Behavior */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-500" />
              Map Camera & Themes
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Map follows train automatically when live coordinates update
            </p>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">
                Default Camera Follow Mode
              </span>
              <input
                type="checkbox"
                checked={cameraFollowDefault}
                onChange={(e) => setCameraFollowDefault(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
            </label>

            <div className="mt-3 p-3 bg-slate-950 text-slate-300 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between">
              <span>Map Theme</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 text-[10px] uppercase font-bold">
                Dark Navigation (Locked)
              </span>
            </div>
          </div>

          {/* Privacy & Storage */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Local Storage & Privacy
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Recent searches and cached train timetables are stored in your browser
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              {cleared ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Local Cache Cleared
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Clear Recent Searches & Cache
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 py-6 border-t border-slate-200/80 mt-12">
        RailLine v1.0 • Production Journey Intelligence
      </div>
    </div>
  );
};
