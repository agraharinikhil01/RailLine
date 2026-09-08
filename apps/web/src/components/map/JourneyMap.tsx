import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import {
  Maximize2,
  Minimize2,
  Crosshair,
  Compass,
  Plus,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { LiveTrainStatus, JourneyStation } from '@railline/types';

export interface JourneyMapProps {
  status: LiveTrainStatus;
  routeGeoJSON?: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  stations?: JourneyStation[];
  selectedStation?: JourneyStation | null;
  className?: string;
  onStationSelect?: (station: JourneyStation) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  showHudPill?: boolean;
}

// MapTiler Dataviz Dark style with Carto Dark Matter fallback (PRD §4.2)
const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY;
const DARK_MAP_STYLE = maptilerKey && maptilerKey !== 'default_key'
  ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${maptilerKey}`
  : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const JourneyMap: React.FC<JourneyMapProps> = ({
  status,
  routeGeoJSON,
  stations,
  selectedStation,
  className = '',
  onStationSelect,
  onToggleSidebar,
  isSidebarOpen = true,
  showHudPill = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const trainMarkerRef = useRef<maplibregl.Marker | null>(null);
  const trainMarkerElRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const [isFollowMode, setIsFollowMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLng = status.location.lng || 77.2195;
    const initialLat = status.location.lat || 28.6429;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: DARK_MAP_STYLE,
      center: [initialLng, initialLat],
      zoom: 7,
      pitch: 35, // 3D perspective pitch angle for immersive navigation feel
      bearing: status.location.bearing || 0,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      setMapLoaded(true);
      map.resize();
    });

    // Detect manual user dragging to pause camera follow mode (PRD §3.7)
    map.on('dragstart', () => {
      setIsFollowMode(false);
    });

    mapRef.current = map;

    // Auto-resize observer so the map dynamically recalculates its dimensions whenever
    // the layout changes (e.g. sidebar toggle, window resize)
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update animated Train Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!trainMarkerElRef.current) {
      const el = document.createElement('div');
      el.className = 'train-marker-wrapper relative cursor-pointer';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 rounded-full bg-sky-500/20 animate-radar pointer-events-none"></div>
          <div class="absolute w-8 h-8 rounded-full bg-sky-400/30 animate-pulse pointer-events-none"></div>
          <div class="w-8 h-8 rounded-full bg-slate-950 border-2 border-sky-400 shadow-floating flex items-center justify-center text-sky-300 font-mono text-xs transform transition-transform duration-300">
            🚆
          </div>
        </div>
      `;
      trainMarkerElRef.current = el;

      const marker = new maplibregl.Marker({ element: el, rotationAlignment: 'map' })
        .setLngLat([status.location.lng, status.location.lat])
        .addTo(map);

      trainMarkerRef.current = marker;
    } else if (trainMarkerRef.current) {
      trainMarkerRef.current.setLngLat([status.location.lng, status.location.lat]);

      if (status.location.bearing !== undefined) {
        trainMarkerRef.current.setRotation(status.location.bearing);
      }
    }
  }, [status.location.lat, status.location.lng, status.location.bearing]);

  // Camera Follow Mode (PRD §3.7)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isFollowMode) return;

    map.easeTo({
      center: [status.location.lng, status.location.lat],
      duration: 1200,
      zoom: Math.max(map.getZoom(), 7.5),
    });
  }, [status.location.lat, status.location.lng, isFollowMode]);

  // Focus on Selected Station (when clicked from timeline or map)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStation) return;

    map.flyTo({
      center: [selectedStation.station.longitude, selectedStation.station.latitude],
      zoom: 9.5,
      duration: 1200,
    });

    // Close any previous popup
    if (popupRef.current) {
      popupRef.current.remove();
    }

    const popupHtml = `
      <div class="p-3 bg-slate-900 text-white rounded-xl font-sans text-xs border border-slate-700 shadow-xl min-w-[200px]">
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="font-bold text-sky-400 text-sm">${selectedStation.station.name}</span>
          <span class="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
            ${selectedStation.station.code}
          </span>
        </div>
        <div class="text-[11px] text-slate-300 mb-2">
          ${selectedStation.distanceFromSourceKm} km from origin ${selectedStation.platform ? `• PF ${selectedStation.platform}` : ''}
        </div>
        <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
          <span class="text-slate-400">Scheduled:</span>
          <span class="font-semibold text-white">${selectedStation.scheduledArrival || selectedStation.scheduledDeparture || '—'}</span>
        </div>
        <div class="flex items-center justify-between text-[11px] font-mono mt-0.5">
          <span class="text-slate-400">Delay:</span>
          <span class="${selectedStation.delayMinutes > 5 ? 'text-amber-400' : 'text-emerald-400'} font-semibold">
            ${selectedStation.delayMinutes > 0 ? `+${selectedStation.delayMinutes} min` : 'On Time'}
          </span>
        </div>
      </div>
    `;

    const popup = new maplibregl.Popup({ closeButton: false, offset: 15, className: 'dark-map-popup' })
      .setLngLat([selectedStation.station.longitude, selectedStation.station.latitude])
      .setHTML(popupHtml)
      .addTo(map);

    popupRef.current = popup;
  }, [selectedStation]);

  // Add Route GeoJSON Line and Station Markers to Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !routeGeoJSON) return;

    const sourceId = 'railline-route-source';
    const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource;

    if (existingSource) {
      existingSource.setData(routeGeoJSON);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: routeGeoJSON,
      });

      // Remaining Route Layer (Dashed muted slate line)
      map.addLayer({
        id: 'route-remaining',
        type: 'line',
        source: sourceId,
        filter: ['==', ['get', 'segment'], 'remaining'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#475569',
          'line-width': 3.5,
          'line-opacity': 0.7,
          'line-dasharray': [2, 1],
        },
      });

      // Completed Route Glow Layer (Cyan halo)
      map.addLayer({
        id: 'route-completed-glow',
        type: 'line',
        source: sourceId,
        filter: ['==', ['get', 'segment'], 'completed'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#0284c7',
          'line-width': 10,
          'line-opacity': 0.35,
          'line-blur': 4,
        },
      });

      // Completed Route Layer (Solid cyan line)
      map.addLayer({
        id: 'route-completed',
        type: 'line',
        source: sourceId,
        filter: ['==', ['get', 'segment'], 'completed'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#38bdf8',
          'line-width': 4.5,
          'line-opacity': 0.95,
        },
      });

      // Station Point Halts
      map.addLayer({
        id: 'route-stations',
        type: 'circle',
        source: sourceId,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 6,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#0f172a',
        },
      });

      // Station Labels
      map.addLayer({
        id: 'route-station-labels',
        type: 'symbol',
        source: sourceId,
        filter: ['==', '$type', 'Point'],
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        },
        paint: {
          'text-color': '#e2e8f0',
          'text-halo-color': '#090d16',
          'text-halo-width': 2,
        },
      });

      // Click on station point
      map.on('click', 'route-stations', (e) => {
        if (!e.features || e.features.length === 0) return;
        const code = e.features[0].properties?.code;
        const matched = stations?.find((s) => s.station.code === code);
        if (matched && onStationSelect) {
          onStationSelect(matched);
        }
      });

      map.on('mouseenter', 'route-stations', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'route-stations', () => {
        map.getCanvas().style.cursor = '';
      });
    }
  }, [mapLoaded, routeGeoJSON, stations, onStationSelect]);

  // Controls
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 300 });
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 300 });
  }, []);

  const handleResetNorth = useCallback(() => {
    mapRef.current?.easeTo({ bearing: 0, pitch: 0, duration: 600 });
  }, []);

  const handleToggleFollow = useCallback(() => {
    setIsFollowMode((prev) => {
      const next = !prev;
      if (next && mapRef.current) {
        mapRef.current.easeTo({
          center: [status.location.lng, status.location.lat],
          duration: 800,
        });
      }
      return next;
    });
  }, [status.location.lat, status.location.lng]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  }, []);

  // Listen to browser fullscreen change
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      mapRef.current?.resize();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div className={`relative w-full h-full min-h-0 bg-slate-950 overflow-hidden ${className}`}>
      {/* MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-0" />

      {/* Top Left Floating Train HUD Pill (optional) */}
      {showHudPill && (
        <div
          className={`absolute top-4 transition-all duration-200 z-20 pointer-events-none ${
            !isSidebarOpen ? 'left-36 sm:left-48' : 'left-4'
          }`}
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-200 shadow-floating backdrop-blur-md">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
            <span className="font-bold text-white tracking-wide">{status.trainNumber}</span>
            <span className="text-slate-500">•</span>
            <span className="font-semibold text-sky-400">{status.location.speedKmph || 0} km/h</span>
            {status.currentStation && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-sans truncate max-w-[140px]">
                  {status.currentStation.name}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Left Following Train Pill (matches screenshot 1) */}
      {isFollowMode && (
        <div className="absolute bottom-4 left-4 z-20">
          <button
            type="button"
            onClick={handleToggleFollow}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200 shadow-floating backdrop-blur-md transition-all active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Following Train</span>
          </button>
        </div>
      )}

      {/* Floating Controls Bar (Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
        {/* Toggle Sidebar Button (Expand / Collapse) */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? 'Collapse Sidebar (Full Map Mode)' : 'Show Sidebar'}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-floating backdrop-blur-md transition-all active:scale-95"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4 text-sky-400" />}
          </button>
        )}

        {/* Camera Follow Mode Toggle */}
        <button
          type="button"
          onClick={handleToggleFollow}
          title={isFollowMode ? 'Camera Follow: ON (Tracking Train)' : 'Camera Follow: OFF'}
          className={`p-2.5 rounded-xl text-xs font-medium border shadow-floating backdrop-blur-md transition-all active:scale-95 ${
            isFollowMode
              ? 'bg-sky-500 text-white border-sky-400 ring-2 ring-sky-400/40'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Reset North Bearing */}
        <button
          type="button"
          onClick={handleResetNorth}
          title="Reset to North Orientation"
          className="p-2.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700 hover:bg-slate-800 shadow-floating backdrop-blur-md transition-all active:scale-95"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700 hover:bg-slate-800 shadow-floating backdrop-blur-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700 hover:bg-slate-800 shadow-floating backdrop-blur-md transition-all active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Browser Fullscreen Toggle */}
        <button
          type="button"
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Browser Fullscreen' : 'Enter Fullscreen'}
          className="p-2.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700 hover:bg-slate-800 shadow-floating backdrop-blur-md transition-all active:scale-95"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-sky-400" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Route Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-3.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono backdrop-blur-md pointer-events-none shadow-floating">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1.5 rounded-full bg-sky-400 shadow-sm" />
          <span>Covered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1.5 rounded-full bg-slate-600" />
          <span>Remaining</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white border border-slate-900" />
          <span>Station Halt</span>
        </div>
      </div>
    </div>
  );
};
