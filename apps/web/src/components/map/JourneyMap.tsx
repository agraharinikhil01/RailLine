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
  ChevronsLeft,
  ChevronsRight,
  LocateFixed,
  MapPin,
  Layers,
  MousePointer,
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

export type MapStyleKey = 'satellite' | 'dark' | 'outdoor';

const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY || 'RbtagRyEluq70WIwgao8';

const MAP_STYLES: Record<MapStyleKey, { label: string; icon: string; url: string; desc: string }> = {
  satellite: {
    label: 'Real Satellite',
    icon: '🛰️',
    url: maptilerKey && maptilerKey !== 'default_key'
      ? `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerKey}`
      : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    desc: 'Photorealistic Earth & Tracks',
  },
  dark: {
    label: 'Cyber Dark',
    icon: '🌌',
    url: maptilerKey && maptilerKey !== 'default_key'
      ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${maptilerKey}`
      : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    desc: 'Neon Glowing Route',
  },
  outdoor: {
    label: '3D Topo',
    icon: '🏔️',
    url: maptilerKey && maptilerKey !== 'default_key'
      ? `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${maptilerKey}`
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    desc: 'Elevation Relief & Landscape',
  },
};

export const JourneyMap: React.FC<JourneyMapProps> = ({
  status,
  routeGeoJSON,
  stations = [],
  selectedStation,
  className = '',
  onStationSelect,
  onToggleSidebar,
  isSidebarOpen = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const trainMarkerRef = useRef<maplibregl.Marker | null>(null);
  const trainMarkerElRef = useRef<HTMLDivElement | null>(null);
  const arrivalMarkerRef = useRef<maplibregl.Marker | null>(null);
  const arrivalMarkerElRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const [currentStyle, setCurrentStyle] = useState<MapStyleKey>('satellite');
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState<boolean>(false);
  const [isFollowMode, setIsFollowMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Wheel interaction mode: 'cruise' (travel route start to end) vs 'zoom'
  const [scrollMode, setScrollMode] = useState<'cruise' | 'zoom'>('cruise');

  // Active station index for corridor cruising
  const [cruiseIndex, setCruiseIndex] = useState<number>(0);
  const cruiseIndexRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(0);

  // Helper to re-add custom route line and stations layers to map
  const addRouteLayersToMap = useCallback(
    (map: maplibregl.Map, geojson?: GeoJSON.FeatureCollection<GeoJSON.Geometry>) => {
      if (!map || !geojson) return;
      const sourceId = 'railline-route-source';

      const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
      if (existingSource) {
        existingSource.setData(geojson);
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson,
        });
      }

      // Remaining Route Layer (dashed amber / slate line)
      if (!map.getLayer('route-remaining')) {
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
            'line-color': '#f59e0b',
            'line-width': 3.5,
            'line-opacity': 0.85,
            'line-dasharray': [2, 1.5],
          },
        });
      }

      // Completed Route Glow Layer (Cyan halo glow)
      if (!map.getLayer('route-completed-glow')) {
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
            'line-width': 12,
            'line-opacity': 0.6,
            'line-blur': 5,
          },
        });
      }

      // Completed Route Layer (Solid vibrant cyan neon line)
      if (!map.getLayer('route-completed')) {
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
            'line-color': '#00f0ff',
            'line-width': 4.5,
            'line-opacity': 0.95,
          },
        });
      }

      // 1. Intermediate Passing Stations (Subtle small dots between major halts)
      if (!map.getLayer('route-intermediate-stations')) {
        map.addLayer({
          id: 'route-intermediate-stations',
          type: 'circle',
          source: sourceId,
          filter: ['all', ['==', '$type', 'Point'], ['==', ['get', 'stationType'], 'intermediate']],
          paint: {
            'circle-radius': 3.0,
            'circle-color': [
              'case',
              ['==', ['get', 'status'], 'COMPLETED'],
              '#38bdf8',
              '#94a3b8',
            ],
            'circle-opacity': 0.85,
            'circle-stroke-width': 1.2,
            'circle-stroke-color': '#020617',
          },
        });
      }

      // 2. Intermediate Station Labels (Tiny name labels visible when zooming in between stations)
      if (!map.getLayer('route-intermediate-labels')) {
        map.addLayer({
          id: 'route-intermediate-labels',
          type: 'symbol',
          source: sourceId,
          minzoom: 8.2,
          filter: ['all', ['==', '$type', 'Point'], ['==', ['get', 'stationType'], 'intermediate']],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 8.5,
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-max-width': 8,
          },
          paint: {
            'text-color': '#94a3b8',
            'text-halo-color': '#020617',
            'text-halo-width': 2.0,
          },
        });
      }

      // 3. Major Halt Stations (Prominent Halt Dots)
      if (!map.getLayer('route-halt-stations')) {
        map.addLayer({
          id: 'route-halt-stations',
          type: 'circle',
          source: sourceId,
          filter: ['all', ['==', '$type', 'Point'], ['!=', ['get', 'stationType'], 'intermediate']],
          paint: {
            'circle-radius': 6.5,
            'circle-color': '#ffffff',
            'circle-stroke-width': 3,
            'circle-stroke-color': [
              'case',
              ['==', ['get', 'status'], 'COMPLETED'],
              '#0284c7',
              '#f59e0b',
            ],
          },
        });
      }

      // 4. Major Halt Station Labels (Crisp prominent labels)
      if (!map.getLayer('route-halt-labels')) {
        map.addLayer({
          id: 'route-halt-labels',
          type: 'symbol',
          source: sourceId,
          filter: ['all', ['==', '$type', 'Point'], ['!=', ['get', 'stationType'], 'intermediate']],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 11,
            'text-offset': [0, 1.5],
            'text-anchor': 'top',
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#090d16',
            'text-halo-width': 2.5,
          },
        });
      }

      // Handle clicking on any station (Halt or Intermediate)
      const handleStationClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (!props) return;
        const code = props.code;
        const name = props.name;
        const ptCoords = (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number];

        const matched = stations?.find((s) => s.station.code === code);
        if (matched) {
          const idx = stations.findIndex((s) => s.station.code === code);
          if (idx !== -1) {
            cruiseIndexRef.current = idx;
            setCruiseIndex(idx);
          }
          onStationSelect?.(matched);
        } else {
          // Popup for intermediate passing stations
          if (popupRef.current) popupRef.current.remove();
          const isPassed = props.status === 'COMPLETED';
          const popupHtml = `
            <div class="p-3 bg-slate-950/95 text-white rounded-2xl font-sans text-xs border border-slate-700 shadow-2xl min-w-[190px] backdrop-blur-md">
              <div class="flex items-center justify-between gap-2 mb-1">
                <span class="font-bold text-sky-400 text-sm">${name}</span>
                <span class="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">${code}</span>
              </div>
              <div class="text-[11px] text-slate-400 mb-1.5">
                Passing Station • Wayside
              </div>
              <div class="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                <span class="text-slate-400">Status:</span>
                <span class="${isPassed ? 'text-sky-400' : 'text-amber-400'} font-semibold">
                  ${isPassed ? 'Passed' : 'Upcoming'}
                </span>
              </div>
            </div>
          `;
          popupRef.current = new maplibregl.Popup({ closeButton: false, offset: 12, className: 'dark-map-popup' })
            .setLngLat(ptCoords)
            .setHTML(popupHtml)
            .addTo(map);
        }
      };

      map.off('click', 'route-halt-stations', () => {});
      map.on('click', 'route-halt-stations', handleStationClick);

      map.off('click', 'route-intermediate-stations', () => {});
      map.on('click', 'route-intermediate-stations', handleStationClick);

      map.on('mouseenter', 'route-halt-stations', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'route-halt-stations', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('mouseenter', 'route-intermediate-stations', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'route-intermediate-stations', () => {
        map.getCanvas().style.cursor = '';
      });
    },
    [stations, onStationSelect]
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLng = status.location.lng || 77.2195;
    const initialLat = status.location.lat || 28.6429;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES.satellite.url,
      center: [initialLng, initialLat],
      zoom: 7.5,
      pitch: 42, // 3D perspective pitch angle for realistic aerial navigation
      bearing: status.location.bearing || 0,
      attributionControl: false,
    });

    // Disable default scrollZoom so mouse wheel can smoothly cruise route start to end
    map.scrollZoom.disable();

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      setMapLoaded(true);
      map.resize();
      if (routeGeoJSON) {
        addRouteLayersToMap(map, routeGeoJSON);
      }
    });

    // Detect manual user dragging to pause follow mode
    map.on('dragstart', () => {
      setIsFollowMode(false);
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      trainMarkerRef.current?.remove();
      trainMarkerRef.current = null;
      trainMarkerElRef.current = null;
      arrivalMarkerRef.current?.remove();
      arrivalMarkerRef.current = null;
      arrivalMarkerElRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Style Switch
  const handleSelectStyle = (styleKey: MapStyleKey) => {
    const map = mapRef.current;
    if (!map || styleKey === currentStyle) return;

    setCurrentStyle(styleKey);
    setIsStyleMenuOpen(false);

    map.setStyle(MAP_STYLES[styleKey].url);
    map.once('style.load', () => {
      if (routeGeoJSON) {
        addRouteLayersToMap(map, routeGeoJSON);
      }
      map.resize();
    });
  };

  // Re-apply route GeoJSON on load or changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !routeGeoJSON) return;
    addRouteLayersToMap(map, routeGeoJSON);
  }, [mapLoaded, routeGeoJSON, addRouteLayersToMap]);

  // Update animated Real-Time Train Marker & Arrival Station Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // 1. LIVE TRAIN LOCOMOTIVE MARKER
    const speed = status.location.speedKmph || 0;
    const bearing = status.location.bearing || 0;
    const trainLng = status.location.lng;
    const trainLat = status.location.lat;

    if (trainLng && trainLat) {
      if (!trainMarkerElRef.current) {
        const el = document.createElement('div');
        el.className = 'train-marker-wrapper relative cursor-pointer select-none';
        trainMarkerElRef.current = el;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([trainLng, trainLat])
          .addTo(map);

        trainMarkerRef.current = marker;
      } else if (trainMarkerRef.current) {
        trainMarkerRef.current.setLngLat([trainLng, trainLat]);
      }

      if (trainMarkerElRef.current) {
        trainMarkerElRef.current.innerHTML = `
          <div class="relative flex flex-col items-center justify-center -translate-y-4 pointer-events-auto">
            <!-- Floating Live Speed Badge -->
            <div class="mb-1 px-2.5 py-0.5 rounded-full bg-slate-950/95 text-sky-300 font-mono text-[10px] font-bold border border-sky-400/80 shadow-lg shadow-sky-950 flex items-center gap-1 backdrop-blur-md whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>${speed} km/h</span>
            </div>

            <!-- Train Locomotive & Radar Wave (Rotates with track bearing) -->
            <div class="relative flex items-center justify-center" style="transform: rotate(${bearing}deg); transform-origin: center center;">
              <!-- Conical Headlight Beam -->
              <div class="absolute -top-7 w-9 h-11 bg-gradient-to-t from-amber-300/40 via-amber-200/20 to-transparent blur-[3px] rounded-t-full pointer-events-none"></div>

              <!-- Radar Wave Ping -->
              <div class="absolute w-14 h-14 rounded-full bg-sky-400/25 animate-ping pointer-events-none"></div>
              <div class="absolute w-10 h-10 rounded-full bg-sky-500/35 animate-pulse pointer-events-none"></div>

              <!-- High-Detail Locomotive SVG -->
              <div class="w-9 h-11 relative flex items-center justify-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] hover:scale-110 transition-transform">
                <svg viewBox="0 0 48 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Chassis -->
                  <rect x="8" y="10" width="32" height="48" rx="7" fill="#020617"/>
                  <!-- Locomotive Body with Cyan Line -->
                  <path d="M10 20C10 13.3726 15.3726 8 22 8H26C32.6274 8 38 13.3726 38 20V52C38 55.3137 35.3137 58 32 58H16C12.6863 58 10 55.3137 10 52V20Z" fill="#0f172a" stroke="#00f0ff" stroke-width="2.5"/>
                  <!-- Aerodynamic Windshield -->
                  <path d="M14 19C14 14.5 18 12 24 12C30 12 34 14.5 34 19V27H14V19Z" fill="#0284c7"/>
                  <path d="M16 19C16 15.5 19 14 24 14C29 14 32 15.5 32 19V25H16V19Z" fill="#bae6fd" fill-opacity="0.9"/>
                  <line x1="24" y1="14" x2="24" y2="25" stroke="#0f172a" stroke-width="1.5"/>
                  <!-- IR Tri-Band Stripe -->
                  <rect x="11" y="29" width="26" height="4" fill="#f97316"/>
                  <rect x="11" y="34" width="26" height="2" fill="#e2e8f0"/>
                  <!-- Twin Headlights -->
                  <circle cx="16" cy="11" r="2.8" fill="#fef08a" stroke="#ffffff" stroke-width="1"/>
                  <circle cx="32" cy="11" r="2.8" fill="#fef08a" stroke="#ffffff" stroke-width="1"/>
                  <circle cx="24" cy="9" r="1.8" fill="#ffffff"/>
                  <!-- Roof Components -->
                  <rect x="18" y="42" width="12" height="8" rx="2" fill="#1e293b" stroke="#475569" stroke-width="1"/>
                  <line x1="20" y1="46" x2="28" y2="46" stroke="#94a3b8" stroke-width="1.2"/>
                  <line x1="24" y1="42" x2="24" y2="50" stroke="#94a3b8" stroke-width="1.2"/>
                  <!-- Coupler -->
                  <rect x="19" y="58" width="10" height="3" rx="1" fill="#334155"/>
                </svg>
              </div>
            </div>
          </div>
        `;
      }
    }

    // 2. ARRIVAL STATION TRAIN INDICATOR MARKER
    // Display a mini train locomotive badge where the train is arriving / pohochne wali hai
    const nextCode = status.nextStation?.code;
    let nextCoords: [number, number] | null = null;
    let targetStationName = status.nextStation?.name || '';
    let targetPlatform = status.nextStation?.platform;
    let targetEta = status.etaNextStation || status.nextStation?.scheduledArrival;

    if (nextCode) {
      const st = stations?.find((s) => s.station.code === nextCode);
      if (st) {
        nextCoords = [st.station.longitude, st.station.latitude];
        if (!targetStationName) targetStationName = st.station.name;
        if (!targetPlatform) targetPlatform = st.platform;
      } else if (routeGeoJSON?.features) {
        const pt = routeGeoJSON.features.find(
          (f) => f.geometry.type === 'Point' && (f.properties as any)?.code === nextCode
        );
        if (pt && pt.geometry.type === 'Point') {
          nextCoords = pt.geometry.coordinates as [number, number];
          if (!targetStationName) targetStationName = (pt.properties as any)?.name;
        }
      }
    }

    if (nextCoords) {
      if (!arrivalMarkerElRef.current) {
        const arrEl = document.createElement('div');
        arrEl.className = 'arrival-marker-wrapper relative cursor-pointer select-none';
        arrivalMarkerElRef.current = arrEl;

        const arrMarker = new maplibregl.Marker({ element: arrEl })
          .setLngLat(nextCoords)
          .addTo(map);
        arrivalMarkerRef.current = arrMarker;
      } else if (arrivalMarkerRef.current) {
        arrivalMarkerRef.current.setLngLat(nextCoords);
      }

      if (arrivalMarkerElRef.current) {
        arrivalMarkerElRef.current.innerHTML = `
          <div class="flex flex-col items-center select-none cursor-pointer group -translate-y-4">
            <!-- Animated arrival badge with mini train locomotive -->
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-sans text-[11px] font-bold shadow-xl shadow-orange-950/70 border border-amber-300/90 backdrop-blur-md animate-bounce">
              <!-- Mini Train Locomotive Icon -->
              <div class="w-4 h-4 rounded bg-white/20 flex items-center justify-center p-0.5 shrink-0">
                <svg viewBox="0 0 24 24" class="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V7h12v4z"/>
                </svg>
              </div>
              <span class="whitespace-nowrap">Next: ${targetStationName}</span>
              ${targetPlatform ? `<span class="bg-black/35 px-1.5 py-0.2 rounded text-[9px] font-mono">PF ${targetPlatform}</span>` : ''}
              ${targetEta ? `<span class="text-amber-200 text-[10px] font-mono">${targetEta}</span>` : ''}
            </div>
            <!-- Target station pulse ring -->
            <div class="relative flex items-center justify-center mt-1">
              <div class="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping pointer-events-none"></div>
              <div class="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-lg"></div>
            </div>
          </div>
        `;

        arrivalMarkerElRef.current.onclick = () => {
          const st = stations?.find((s) => s.station.code === nextCode);
          if (st) onStationSelect?.(st);
        };
      }
    } else if (arrivalMarkerRef.current) {
      arrivalMarkerRef.current.remove();
      arrivalMarkerRef.current = null;
      arrivalMarkerElRef.current = null;
    }
  }, [
    mapLoaded,
    status.location.lat,
    status.location.lng,
    status.location.bearing,
    status.location.speedKmph,
    status.nextStation?.code,
    status.nextStation?.name,
    status.nextStation?.platform,
    status.nextStation?.scheduledArrival,
    status.etaNextStation,
    stations,
    routeGeoJSON,
    onStationSelect,
  ]);

  // Camera Follow Mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isFollowMode) return;

    map.easeTo({
      center: [status.location.lng, status.location.lat],
      duration: 1200,
      zoom: Math.max(map.getZoom(), 8),
    });
  }, [status.location.lat, status.location.lng, isFollowMode]);

  // Focus on Selected Station (when clicked from timeline or map)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStation) return;

    map.flyTo({
      center: [selectedStation.station.longitude, selectedStation.station.latitude],
      zoom: 10,
      pitch: 45,
      duration: 1000,
    });

    if (popupRef.current) {
      popupRef.current.remove();
    }

    const popupHtml = `
      <div class="p-3.5 bg-slate-950/95 text-white rounded-2xl font-sans text-xs border border-slate-700/90 shadow-2xl min-w-[210px] backdrop-blur-md">
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="font-bold text-sky-400 text-sm">${selectedStation.station.name}</span>
          <span class="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">
            ${selectedStation.station.code}
          </span>
        </div>
        <div class="text-[11px] text-slate-300 mb-2">
          ${selectedStation.distanceFromSourceKm} km from origin ${selectedStation.platform ? `• Platform ${selectedStation.platform}` : ''}
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

  // =========================================================================
  // MOUSE WHEEL SCROLL NAVIGATION: Cruise along route from Start to End
  // =========================================================================
  const handleJumpToStation = useCallback(
    (index: number) => {
      if (!stations || stations.length === 0) return;
      const validIdx = Math.max(0, Math.min(stations.length - 1, index));
      cruiseIndexRef.current = validIdx;
      setCruiseIndex(validIdx);
      setIsFollowMode(false);

      const target = stations[validIdx];
      if (target && mapRef.current) {
        mapRef.current.flyTo({
          center: [target.station.longitude, target.station.latitude],
          zoom: 9.8,
          pitch: 45,
          duration: 800,
          essential: true,
        });
        onStationSelect?.(target);
      }
    },
    [stations, onStationSelect]
  );

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // If user holds Ctrl or Cmd, or explicitly toggled to zoom mode: perform zoom
      if (e.ctrlKey || e.metaKey || scrollMode === 'zoom') {
        const map = mapRef.current;
        if (map) {
          if (e.deltaY < 0) {
            map.zoomIn({ duration: 150 });
          } else {
            map.zoomOut({ duration: 150 });
          }
        }
        return;
      }

      // CRUISE MODE: Scroll down travels forward towards destination, scroll up travels towards start/origin
      e.preventDefault();
      e.stopPropagation();

      if (!stations || stations.length < 2) return;

      const now = Date.now();
      if (now - lastScrollTimeRef.current < 160) return;
      lastScrollTimeRef.current = now;

      const step = e.deltaY > 0 ? 1 : -1;
      const nextIdx = Math.max(0, Math.min(stations.length - 1, cruiseIndexRef.current + step));

      if (nextIdx !== cruiseIndexRef.current) {
        handleJumpToStation(nextIdx);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [stations, scrollMode, handleJumpToStation]);

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

  const handleSnapToTrain = useCallback(() => {
    setIsFollowMode(true);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [status.location.lng, status.location.lat],
        zoom: 8.5,
        pitch: 42,
        bearing: status.location.bearing || 0,
        duration: 1000,
      });
    }
  }, [status.location.lat, status.location.lng, status.location.bearing]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      mapRef.current?.resize();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const currentCruiseStation = stations[cruiseIndex] || stations[0];

  return (
    <div className={`relative w-full h-full min-h-0 bg-slate-950 overflow-hidden ${className}`}>
      {/* MapLibre Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-0" />

      {/* TOP LEFT: Map Style Switcher (Satellite, Cyber Dark, 3D Topo) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStyleMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/90 shadow-xl backdrop-blur-md text-xs font-semibold transition-all active:scale-95"
            title="Change Map Style"
          >
            <span className="text-base leading-none">{MAP_STYLES[currentStyle].icon}</span>
            <span className="hidden sm:inline">{MAP_STYLES[currentStyle].label}</span>
            <Layers className="w-3.5 h-3.5 text-sky-400 ml-0.5" />
          </button>

          {isStyleMenuOpen && (
            <div className="absolute left-0 mt-2 w-52 bg-slate-950/95 border border-slate-700/90 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md z-30 space-y-1">
              <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase text-slate-400 border-b border-slate-800">
                Map Perspectives
              </div>
              {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => {
                const item = MAP_STYLES[key];
                const isActive = currentStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectStyle(key)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scroll Mode Toggle (Cruise vs Zoom) */}
        <button
          type="button"
          onClick={() => setScrollMode((prev) => (prev === 'cruise' ? 'zoom' : 'cruise'))}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border shadow-xl backdrop-blur-md transition-all active:scale-95 ${
            scrollMode === 'cruise'
              ? 'bg-sky-500 text-white border-sky-400'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
          title={
            scrollMode === 'cruise'
              ? 'Cruise Mode: Mouse wheel scrolls along corridor from Origin to Destination'
              : 'Zoom Mode: Mouse wheel zooms in and out'
          }
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {scrollMode === 'cruise' ? 'Cruise Mode ↕' : 'Zoom Mode'}
          </span>
        </button>
      </div>

      {/* TOP RIGHT: Floating Controls Bar */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? 'Collapse Sidebar (Full Map)' : 'Show Sidebar'}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-xl backdrop-blur-md transition-all active:scale-95"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4 text-sky-400" />}
          </button>
        )}

        <button
          type="button"
          onClick={handleSnapToTrain}
          title={isFollowMode ? 'Tracking Live Train (Active)' : 'Center on Live Train'}
          className={`p-2.5 rounded-xl text-xs font-medium border shadow-xl backdrop-blur-md transition-all active:scale-95 ${
            isFollowMode
              ? 'bg-sky-500 text-white border-sky-400 ring-2 ring-sky-400/40'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResetNorth}
          title="Reset to North Orientation"
          className="p-2.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700 hover:bg-slate-800 shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700 hover:bg-slate-800 shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700 hover:bg-slate-800 shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700 hover:bg-slate-800 shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-sky-400" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* BOTTOM CENTER: Interactive Corridor Scrubber & Mouse Scroll Cruise Dock */}
      {stations && stations.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] sm:w-[560px] max-w-[96%] bg-slate-950/90 border border-slate-700/90 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <button
              type="button"
              onClick={() => handleJumpToStation(0)}
              className="text-slate-300 hover:text-white font-bold flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800"
              title="Jump to Origin / Departure Station"
            >
              <ChevronsLeft className="w-3.5 h-3.5 text-sky-400" />
              <span>{stations[0]?.station.code || 'START'}</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-sky-300 font-sans font-semibold min-w-0">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-[260px]">
                {currentCruiseStation?.station.name}
              </span>
              <span className="text-slate-400 text-[10px] font-mono shrink-0">
                ({cruiseIndex + 1}/{stations.length})
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleJumpToStation(stations.length - 1)}
              className="text-slate-300 hover:text-white font-bold flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800"
              title="Jump to Final Destination Station"
            >
              <span>{stations[stations.length - 1]?.station.code || 'DEST'}</span>
              <ChevronsRight className="w-3.5 h-3.5 text-sky-400" />
            </button>
          </div>

          {/* Interactive Progress Bar */}
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={stations.length - 1}
              value={cruiseIndex}
              onChange={(e) => handleJumpToStation(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <span className="text-sky-400 font-bold">↕ Scroll Mouse:</span>
              <span>Cruise Start ⇄ Destination</span>
            </span>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-slate-500">
                {currentCruiseStation?.distanceFromSourceKm} km
              </span>
              <button
                type="button"
                onClick={handleSnapToTrain}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
                title="Snap camera back to Live Train"
              >
                <LocateFixed className="w-3 h-3" />
                <span>Snap Train</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

