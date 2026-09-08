import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { Maximize2, Minimize2, Crosshair, Compass } from 'lucide-react';
import { LiveTrainStatus, JourneyStation } from '@railline/types';

export interface JourneyMapProps {
  status: LiveTrainStatus;
  routeGeoJSON?: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  stations?: JourneyStation[];
  className?: string;
  onStationSelect?: (station: JourneyStation) => void;
}

// CARTO Dark Matter vector style provides a reliable dark map theme (PRD §4.2)
const DARK_MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const JourneyMap: React.FC<JourneyMapProps> = ({
  status,
  routeGeoJSON,
  stations,
  className = '',
  onStationSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const trainMarkerRef = useRef<maplibregl.Marker | null>(null);
  const trainMarkerElRef = useRef<HTMLDivElement | null>(null);

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
      zoom: 6.8,
      pitch: 30, // 3D perspective angle
      bearing: 0,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      setMapLoaded(true);
    });

    // Detect manual user dragging to pause follow mode (PRD §3.7)
    map.on('dragstart', () => {
      setIsFollowMode(false);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Set up custom animated Train Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!trainMarkerElRef.current) {
      const el = document.createElement('div');
      el.className = 'train-marker-wrapper relative cursor-pointer';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full bg-sky-500/20 animate-radar"></div>
          <div class="absolute w-7 h-7 rounded-full bg-sky-400/30 animate-pulse"></div>
          <div class="w-7 h-7 rounded-full bg-slate-900 border-2 border-sky-400 shadow-lg flex items-center justify-center text-sky-300 font-mono text-[10px] transform transition-transform duration-300">
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
      // Smoothly update train marker coordinates
      trainMarkerRef.current.setLngLat([status.location.lng, status.location.lat]);

      // Rotate marker element based on train bearing if available
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
      zoom: Math.max(map.getZoom(), 7.2),
    });
  }, [status.location.lat, status.location.lng, isFollowMode]);

  // Add Route GeoJSON Line and Station Markers to Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !routeGeoJSON) return;

    // Route lines source
    const sourceId = 'railline-route-source';
    const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource;

    if (existingSource) {
      existingSource.setData(routeGeoJSON);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: routeGeoJSON,
      });

      // Remaining Route Layer (Muted slate line)
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
          'line-width': 3,
          'line-opacity': 0.6,
          'line-dasharray': [2, 1],
        },
      });

      // Completed Route Layer (Glowing electric cyan line)
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
          'line-width': 8,
          'line-opacity': 0.25,
          'line-blur': 3,
        },
      });

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
          'line-width': 4,
          'line-opacity': 0.95,
        },
      });

      // Station Points Layer
      map.addLayer({
        id: 'route-stations',
        type: 'circle',
        source: sourceId,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 5,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#0f172a',
        },
      });

      // Station Labels Layer
      map.addLayer({
        id: 'route-station-labels',
        type: 'symbol',
        source: sourceId,
        filter: ['==', '$type', 'Point'],
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        },
        paint: {
          'text-color': '#cbd5e1',
          'text-halo-color': '#0b0f19',
          'text-halo-width': 1.5,
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

  // Reset North Bearing
  const handleResetNorth = useCallback(() => {
    mapRef.current?.easeTo({ bearing: 0, pitch: 0, duration: 600 });
  }, []);

  // Toggle Camera Follow Mode
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

  // Toggle Fullscreen
  const handleToggleFullscreen = useCallback(() => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  }, []);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-map-overlay ${className}`}>
      {/* MapLibre DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]" />

      {/* Map Control Buttons Overlay (Top Right) */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
        {/* Camera Follow Mode Toggle */}
        <button
          type="button"
          onClick={handleToggleFollow}
          title={isFollowMode ? 'Disable Camera Follow' : 'Follow Train'}
          className={`p-2 rounded-lg text-xs font-medium border shadow-lg backdrop-blur-md transition-all ${
            isFollowMode
              ? 'bg-sky-500 text-white border-sky-400 ring-2 ring-sky-400/30'
              : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Reset Bearing / North */}
        <button
          type="button"
          onClick={handleResetNorth}
          title="Reset North orientation"
          className="p-2 rounded-lg bg-slate-900/80 text-slate-300 border border-slate-700 hover:bg-slate-800 shadow-lg backdrop-blur-md transition-all"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          className="p-2 rounded-lg bg-slate-900/80 text-slate-300 border border-slate-700 hover:bg-slate-800 shadow-lg backdrop-blur-md transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Status Pill (Top Left) */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-200 shadow-floating backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="font-semibold text-white">{status.trainNumber}</span>
          <span className="text-slate-400">•</span>
          <span>{status.location.speedKmph || 0} km/h</span>
        </div>
      </div>

      {/* Legend Overlay (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-mono backdrop-blur-md pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1 rounded-full bg-sky-400" />
          <span>Covered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1 rounded-full bg-slate-600" />
          <span>Remaining</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white border border-slate-900" />
          <span>Halt</span>
        </div>
      </div>
    </div>
  );
};
