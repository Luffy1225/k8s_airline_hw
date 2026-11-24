import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LiveFlight } from '../types';
import { Plane, Compass, Gauge, ArrowUpRight, Clock, Search, RefreshCw, ChevronRight, Eye, Crosshair, Wind, Thermometer } from 'lucide-react';

interface LiveMapProps {
  flights: LiveFlight[];
  onSelectFlightToBook?: (origin: string, destination: string) => void;
  onRefresh?: () => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({ flights, onSelectFlightToBook, onRefresh }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const backgroundRoutesGroupRef = useRef<L.LayerGroup | null>(null);
  const activeRouteLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedFlight, setSelectedFlight] = useState<LiveFlight | null>(null);
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cameraLock, setCameraLock] = useState<boolean>(true);

  // Sync selectedFlight when flights array updates via polling
  useEffect(() => {
    if (selectedFlight) {
      const updated = flights.find((f) => f.flight_no === selectedFlight.flight_no);
      if (updated) {
        setSelectedFlight(updated);
      }
    } else if (flights.length > 0) {
      const defaultFlight = flights.find((f) => f.flight_no === 'BR12') || flights[0];
      setSelectedFlight(defaultFlight);
    }
  }, [flights]);

  // Camera lock: smoothly follow airplane on map
  useEffect(() => {
    if (cameraLock && selectedFlight && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedFlight.current_lat, selectedFlight.current_lng], {
        animate: true,
        duration: 1.0,
      });
    }
  }, [selectedFlight?.current_lat, selectedFlight?.current_lng, cameraLock]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center map around Pacific / East Asia
    const map = L.map(mapContainerRef.current, {
      center: [28.0, 155.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 11,
      zoomControl: false,
      worldCopyJump: true,
    });

    // Add clean, high-resolution, watermark-free map tiles
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
      maxZoom: 16,
    }).addTo(map);

    // Zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    backgroundRoutesGroupRef.current = L.layerGroup().addTo(map);
    activeRouteLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Ensure map tiles calculate full container height
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Filter flights by region & search query
  const filteredFlights = flights.filter((f) => {
    const matchesQuery = 
      f.flight_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.destination.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tail_no.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (filterRegion === 'all') return true;
    if (filterRegion === 'north_america') {
      return ['LAX', 'SFO', 'SEA', 'JFK'].includes(f.destination.iata) || ['LAX', 'SFO', 'SEA', 'JFK'].includes(f.origin.iata);
    }
    if (filterRegion === 'europe') {
      return ['LHR', 'CDG', 'MXP', 'VIE'].includes(f.destination.iata) || ['LHR', 'CDG', 'MXP', 'VIE'].includes(f.origin.iata);
    }
    if (filterRegion === 'asia') {
      return ['NRT', 'HND', 'KIX', 'ICN', 'HKG', 'SIN', 'BKK'].includes(f.destination.iata);
    }
    return true;
  });

  // Render background routes for entire airline network
  useEffect(() => {
    const bgGroup = backgroundRoutesGroupRef.current;
    if (!bgGroup) return;

    bgGroup.clearLayers();

    flights.forEach((f) => {
      if (f.full_path && f.full_path.length > 1) {
        L.polyline(f.full_path, {
          color: '#886f68',
          weight: 1.5,
          opacity: 0.35,
          dashArray: '3, 6',
        }).addTo(bgGroup);
      }
    });
  }, [flights]);

  // Update plane markers and selected route on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentMarkers = markersRef.current;
    const activeFlightNos = new Set(filteredFlights.map((f) => f.flight_no));

    // Remove obsolete markers
    Object.keys(currentMarkers).forEach((flightNo) => {
      if (!activeFlightNos.has(flightNo)) {
        currentMarkers[flightNo].remove();
        delete currentMarkers[flightNo];
      }
    });

    // Add or update markers
    filteredFlights.forEach((flight) => {
      const isSelected = selectedFlight?.flight_no === flight.flight_no;
      const headingDeg = flight.heading || 0;

      // Custom SVG Airplane Icon with exact rotation and gold halo
      const customIcon = L.divIcon({
        className: 'custom-airplane-icon',
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            ${isSelected ? '<div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(136, 111, 104, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            <div style="transform: rotate(${headingDeg}deg); width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; transition: transform 0.4s ease-out;">
              <div style="background-color: ${isSelected ? '#886f68' : '#3d2c2e'}; border: 2.5px solid ${isSelected ? '#ffffff' : '#d1ccdc'}; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
                </svg>
              </div>
            </div>
            <div style="position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%); background: #3d2c2e; color: #ffffff; padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 9px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3); pointer-events: none; border: 1px solid rgba(255,255,255,0.3);">
              ${flight.flight_no}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      if (currentMarkers[flight.flight_no]) {
        currentMarkers[flight.flight_no].setLatLng([flight.current_lat, flight.current_lng]);
        currentMarkers[flight.flight_no].setIcon(customIcon);
      } else {
        const marker = L.marker([flight.current_lat, flight.current_lng], { icon: customIcon })
          .addTo(map)
          .on('click', () => {
            setSelectedFlight(flight);
          });
        currentMarkers[flight.flight_no] = marker;
      }
    });

    // Draw route for selected flight
    if (activeRouteLayerGroupRef.current) {
      activeRouteLayerGroupRef.current.clearLayers();

      if (selectedFlight) {
        const orig = selectedFlight.origin;
        const dest = selectedFlight.destination;

        // Use precomputed great circle paths
        if (selectedFlight.completed_path && selectedFlight.completed_path.length > 1) {
          L.polyline(selectedFlight.completed_path, {
            color: '#886f68',
            weight: 4,
            opacity: 0.95,
          }).addTo(activeRouteLayerGroupRef.current);
        }

        if (selectedFlight.remaining_path && selectedFlight.remaining_path.length > 1) {
          L.polyline(selectedFlight.remaining_path, {
            color: '#424c55',
            weight: 3,
            opacity: 0.8,
            dashArray: '6, 8',
          }).addTo(activeRouteLayerGroupRef.current);
        }

        // Airport badge markers
        const airportIcon = (label: string, city: string) =>
          L.divIcon({
            className: 'airport-label-icon',
            html: `
              <div style="background: #3d2c2e; color: #f5edf0; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 11px; border: 1.5px solid #886f68; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.35); text-align: center;">
                ${label} <span style="font-size: 10px; font-weight: normal; color: #d1ccdc;">(${city})</span>
              </div>
            `,
            iconSize: [80, 24],
            iconAnchor: [40, 28],
          });

        const origLng = (orig as any).lng_adj || orig.lng;
        const destLng = (dest as any).lng_adj || dest.lng;

        L.marker([orig.lat, origLng], { icon: airportIcon(orig.iata, orig.city) }).addTo(activeRouteLayerGroupRef.current);
        L.marker([dest.lat, destLng], { icon: airportIcon(dest.iata, dest.city) }).addTo(activeRouteLayerGroupRef.current);
      }
    }
  }, [filteredFlights, selectedFlight]);

  // Center on flight when selected
  const handleSelectFlight = (flight: LiveFlight) => {
    setSelectedFlight(flight);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([flight.current_lat, flight.current_lng], 5, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] flex bg-[#f5edf0] overflow-hidden select-none">
      {/* Top Filter & Control Floating Bar */}
      <div className="absolute top-5 left-6 right-6 z-20 flex items-center justify-between gap-4 pointer-events-none">
        {/* Search & Region Selector */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#f5edf0]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#d1ccdc] shadow-xl">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#424c55] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="搜尋航班號或城市 (如 BR12, 東京)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 text-xs font-medium rounded-xl bg-white border border-[#d1ccdc] text-[#3d2c2e] focus:outline-none focus:ring-1 focus:ring-[#886f68] w-64 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1 border-l border-[#d1ccdc] pl-2">
            {[
              { id: 'all', label: '全部航班' },
              { id: 'north_america', label: '北美長程' },
              { id: 'europe', label: '歐洲航線' },
              { id: 'asia', label: '亞洲區域' },
            ].map((reg) => (
              <button
                key={reg.id}
                onClick={() => setFilterRegion(reg.id)}
                className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
                  filterRegion === reg.id
                    ? 'bg-[#3d2c2e] text-[#f5edf0] shadow-xs'
                    : 'text-[#424c55] hover:bg-[#d1ccdc]/40'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="即時更新遙測數據"
              className="p-2 text-[#424c55] hover:text-[#3d2c2e] hover:bg-[#d1ccdc]/40 rounded-xl transition-colors border-l border-[#d1ccdc] ml-1"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Camera Lock toggle */}
          <button
            onClick={() => setCameraLock(!cameraLock)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-bold transition-all border ml-1 ${
              cameraLock
                ? 'bg-[#886f68] text-white border-[#886f68] shadow-xs'
                : 'bg-white text-[#424c55] border-[#d1ccdc] hover:bg-[#d1ccdc]/30'
            }`}
            title="開啟或關閉雷達鏡頭跟隨航機"
          >
            <Crosshair className={`w-3.5 h-3.5 ${cameraLock ? 'animate-spin' : ''}`} />
            <span>鏡頭鎖定: {cameraLock ? '追蹤中' : '自由視角'}</span>
          </button>
        </div>

        {/* Global Live Summary Badge */}
        <div className="pointer-events-auto flex items-center gap-3 px-5 py-2.5 bg-[#3d2c2e]/95 text-[#f5edf0] backdrop-blur-md rounded-2xl border border-[#886f68] shadow-xl text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">{filteredFlights.length} 架長榮航機即時在空</span>
          <span className="text-[#d1ccdc]/50">|</span>
          <span className="text-[#d1ccdc] font-mono">大圓航線即時遙測</span>
        </div>
      </div>

      {/* Main Full-Height Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Bottom-Left Floating Telemetry HUD / Flight Detail Card */}
      {selectedFlight && (
        <div className="absolute bottom-6 left-6 w-[500px] z-20 pointer-events-auto bg-[#f5edf0]/95 backdrop-blur-xl rounded-3xl border border-[#d1ccdc] shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between border-b border-[#d1ccdc]/60 pb-3.5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-serif font-bold text-3xl text-[#3d2c2e]">
                  {selectedFlight.flight_no}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#886f68]/20 text-[#886f68] border border-[#886f68]/40">
                  {selectedFlight.tail_no}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                  {selectedFlight.status}
                </span>
              </div>
              <p className="text-xs text-[#424c55] mt-1 font-medium">
                {selectedFlight.aircraft_name} ({selectedFlight.aircraft})
              </p>
            </div>

            <button
              onClick={() => setSelectedFlight(null)}
              className="text-[#424c55] hover:text-[#3d2c2e] text-2xl font-bold p-1 leading-none transition-colors"
            >
              &times;
            </button>
          </div>

          {/* Route & Progress Section */}
          <div className="py-5">
            <div className="flex items-center justify-between text-center">
              <div className="text-left">
                <p className="font-serif font-bold text-2xl text-[#3d2c2e]">{selectedFlight.origin.iata}</p>
                <p className="text-xs text-[#424c55] font-semibold">{selectedFlight.origin.city}</p>
                <p className="text-[11px] text-[#886f68] mt-1 font-mono font-bold">STD {selectedFlight.dep_time}</p>
              </div>

              <div className="flex-1 px-6 flex flex-col items-center">
                <Plane className="w-5 h-5 text-[#886f68] mb-1.5 transform rotate-90" />
                <div className="w-full bg-[#d1ccdc] h-2 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-[#3d2c2e] h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedFlight.progress_percent}%` }}
                  />
                </div>
                <div className="flex justify-between w-full text-[11px] text-[#424c55] mt-1.5 font-mono font-semibold">
                  <span>{selectedFlight.progress_percent}% 完成</span>
                  <span>剩餘 {Math.floor(selectedFlight.remaining_mins / 60)}h {selectedFlight.remaining_mins % 60}m</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-serif font-bold text-2xl text-[#3d2c2e]">{selectedFlight.destination.iata}</p>
                <p className="text-xs text-[#424c55] font-semibold">{selectedFlight.destination.city}</p>
                <p className="text-[11px] text-[#886f68] mt-1 font-mono font-bold">STA {selectedFlight.arr_time}</p>
              </div>
            </div>
          </div>

          {/* Telemetry HUD Grid */}
          <div className="grid grid-cols-4 gap-2 py-3 border-t border-[#d1ccdc]/60 bg-white/70 rounded-2xl px-3 my-2 shadow-2xs">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-[#424c55] font-medium">
                <ArrowUpRight className="w-3 h-3 text-[#886f68]" /> 巡航高度
              </div>
              <p className="text-sm font-bold font-mono text-[#3d2c2e] mt-0.5">
                FL{Math.round(selectedFlight.altitude_ft / 100)}
              </p>
              <span className="text-[10px] text-[#886f68] font-mono">{selectedFlight.altitude_ft.toLocaleString()} ft</span>
            </div>

            <div className="text-center border-l border-[#d1ccdc]/60">
              <div className="flex items-center justify-center gap-1 text-[11px] text-[#424c55] font-medium">
                <Gauge className="w-3 h-3 text-[#886f68]" /> 即時地速
              </div>
              <p className="text-sm font-bold font-mono text-[#3d2c2e] mt-0.5">
                {selectedFlight.ground_speed_kts} <span className="text-[10px] font-normal">KTS</span>
              </p>
              <span className="text-[10px] text-[#886f68] font-mono">M {(selectedFlight.ground_speed_kts / 574).toFixed(2)}</span>
            </div>

            <div className="text-center border-l border-[#d1ccdc]/60">
              <div className="flex items-center justify-center gap-1 text-[11px] text-[#424c55] font-medium">
                <Compass className="w-3 h-3 text-[#886f68]" /> 航向方位
              </div>
              <p className="text-sm font-bold font-mono text-[#3d2c2e] mt-0.5">
                {Math.round(selectedFlight.heading)}°
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold">TRUE HDG</span>
            </div>

            <div className="text-center border-l border-[#d1ccdc]/60">
              <div className="flex items-center justify-center gap-1 text-[11px] text-[#424c55] font-medium">
                <Wind className="w-3 h-3 text-[#886f68]" /> 高空氣象
              </div>
              <p className="text-sm font-bold font-mono text-[#3d2c2e] mt-0.5">
                -52°C
              </p>
              <span className="text-[10px] text-sky-700 font-semibold">順風 +42 kts</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-3">
            {onSelectFlightToBook && (
              <button
                onClick={() => onSelectFlightToBook(selectedFlight.origin.iata, selectedFlight.destination.iata)}
                className="flex-1 py-3 px-5 rounded-2xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-[#886f68]/40"
              >
                <span>預訂此航線機票</span>
                <ChevronRight className="w-4 h-4 text-[#886f68]" />
              </button>
            )}
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([selectedFlight.current_lat, selectedFlight.current_lng], 7, { duration: 1 });
                }
              }}
              className="py-3 px-4 rounded-2xl border border-[#d1ccdc] bg-white hover:bg-[#d1ccdc]/30 text-[#424c55] hover:text-[#3d2c2e] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-[#886f68]" />
              <span>特寫追蹤</span>
            </button>
          </div>
        </div>
      )}

      {/* Right-Side Desktop Live Flight Board */}
      <div className="absolute top-20 right-6 z-20 pointer-events-auto w-80 max-h-[calc(100vh-8rem)] bg-[#f5edf0]/95 backdrop-blur-xl rounded-3xl border border-[#d1ccdc] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#d1ccdc]/60 bg-white/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#3d2c2e] tracking-wider uppercase">線上航機雷達清單</span>
          </div>
          <span className="text-xs text-[#886f68] font-mono font-bold">{filteredFlights.length} 班次</span>
        </div>
        <div className="overflow-y-auto divide-y divide-[#d1ccdc]/40 flex-1">
          {filteredFlights.map((flight) => {
            const isSelected = selectedFlight?.flight_no === flight.flight_no;
            return (
              <div
                key={flight.flight_no}
                onClick={() => handleSelectFlight(flight)}
                className={`p-3.5 text-left cursor-pointer transition-all ${
                  isSelected ? 'bg-[#d1ccdc]/60 border-l-4 border-[#886f68]' : 'hover:bg-white/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-base text-[#3d2c2e]">{flight.flight_no}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#424c55]/10 text-[#424c55]">
                    {flight.tail_no}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#424c55] mt-1 font-semibold">
                  <span>{flight.origin.iata} ➔ {flight.destination.iata}</span>
                  <span className="text-xs text-[#886f68] font-mono font-bold">{flight.altitude_ft.toLocaleString()} ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
