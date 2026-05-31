import React, { useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Polyline, 
  Popup, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Sparkles, 
  X, 
  Lightbulb, 
  Shield, 
  Activity, 
  Pill, 
  Compass 
} from 'lucide-react';

import 'leaflet/dist/leaflet.css';

// Fix for broken default Leaflet markers in Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Inline SVGs for Custom Leaflet DivIcons
export const ICONS = {
  source: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#22c55e" stroke="#ffffff" stroke-width="2" class="w-8 h-8 filter drop-shadow-md"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  dest: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="2" class="w-8 h-8 filter drop-shadow-md"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  streetlight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#facc15" class="w-5 h-5"><circle cx="12" cy="12" r="10" fill="rgba(250, 204, 21, 0.2)" stroke="#eab308" stroke-width="1"/><circle cx="12" cy="12" r="4" fill="#facc15"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42" stroke="#eab308" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  police: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" stroke="#ffffff" stroke-width="1" class="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><text x="12" y="14" fill="white" font-size="8" font-weight="bold" text-anchor="middle" font-family="sans-serif">P</text></svg>`,
  hospital: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="1" class="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3v2z"/></svg>`,
  pharmacy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" stroke="#ffffff" stroke-width="1" class="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3 11h-2v2h-2v-2H9v-2h2V9h2v2h2v2z"/></svg>`,
  metro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#a855f7" stroke="#ffffff" stroke-width="1.5" class="w-6 h-6"><rect x="4" y="6" width="16" height="10" rx="2" fill="#a855f7"/><path d="M7 11h10v2H7z" fill="white"/><circle cx="8" cy="14" r="1" fill="white"/><circle cx="16" cy="14" r="1" fill="white"/><path d="M6 16l-2 3M18 16l2 3" stroke="#a855f7" stroke-width="2" stroke-linecap="round"/></svg>`
};

export const createDivIcon = (svgKey, className = '') => {
  return L.divIcon({
    html: `<div class="marker-pin-wrapper ${className}">${ICONS[svgKey]}</div>`,
    className: 'custom-div-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

// Component to dynamically fit route bounds
function MapBoundsManager({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates.map(c => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  return null;
}

// Component to handle map clicks for manual pinning
function MapClickHandler({ activePinMode, onPinSet }) {
  useMapEvents({
    click: (e) => {
      if (!activePinMode) return;
      const { lat, lng } = e.latlng;
      onPinSet(activePinMode, lat, lng);
    }
  });
  return null;
}

// Component to auto pan when a facility is located
function MapPanner({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.setView(target, 16, { animate: true });
    }
  }, [target, map]);
  return null;
}

// Polyline wrapper to safely manage bringing active paths to front without React key re-ordering canvas glitches
function SafePolyline({ route, isSelected, style, coords, setActiveRoute }) {
  const polylineRef = React.useRef(null);
  
  useEffect(() => {
    if (polylineRef.current && isSelected) {
      try {
        polylineRef.current.bringToFront();
      } catch (e) {
        console.error("Leaflet bringToFront error:", e);
      }
    }
  }, [isSelected]);

  return (
    <Polyline
      ref={polylineRef}
      positions={coords}
      color={style.color}
      weight={style.weight}
      opacity={style.opacity}
      className={style.className}
      eventHandlers={{
        click: () => setActiveRoute(route)
      }}
    >
      <Popup>
        <div className="text-slate-950 font-sans">
          <strong className="text-purple-600 block">{route.name}</strong>
          <span className="text-xs block mt-0.5">Safety Score: <strong>{route.safety_score}/100</strong></span>
          <span className="text-[10px] text-slate-500">Dist: {route.distance_km} km | {route.duration_min} min</span>
        </div>
      </Popup>
    </Polyline>
  );
}

export default function MapView({
  source,
  destination,
  routes,
  activeRoute,
  setActiveRoute,
  activePinMode,
  handlePinSetFromMap,
  showLayers,
  setShowLayers,
  highlightedFacility,
  legendOpen,
  setLegendOpen
}) {
  // Format OSRM/ORS LineString coordinates into [lat, lon] array for Leaflet
  const getPolylineCoords = (geometry) => {
    if (!geometry || !geometry.coordinates) return [];
    return geometry.coordinates.map(coord => [coord[1], coord[0]]);
  };

  // Calculate colors for route safety types
  const getRouteStyle = (route, isSelected) => {
    const isRecommended = route.recommendation_type === 'RECOMMENDED';
    const isModerate = route.recommendation_type === 'MODERATE';
    
    let color = '#ef4444'; // Red for alternative/less safe
    let className = 'route-glow-alternative';
    
    if (isRecommended) {
      color = '#22c55e'; // Vibrant Emerald
      className = 'route-glow-recommended';
    } else if (isModerate) {
      color = '#f59e0b'; // Warm Amber
      className = 'route-glow-moderate';
    }
    
    return {
      color,
      weight: isSelected ? 8 : 4,
      opacity: isSelected ? 1.0 : 0.45,
      className: isSelected ? className : ''
    };
  };

  return (
    <div className="w-full h-full min-h-[400px] xl:min-h-0 flex-1 relative overflow-hidden">
      
      {/* Legend Overlay (Top Left) */}
      <div className="absolute top-4 left-4 z-40 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3.5 py-3 rounded-xl shadow-2xl flex flex-col gap-2 max-w-xs pointer-events-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Route Indicators</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block"></span>
          <span className="text-xs font-semibold text-slate-200">Recommended (Safest Route)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 bg-amber-500 rounded-full inline-block"></span>
          <span className="text-xs font-semibold text-slate-300">Moderate Alternative</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 bg-red-500 rounded-full inline-block"></span>
          <span className="text-xs font-semibold text-slate-400">Cautionary (Less Shielded)</span>
        </div>
      </div>

      {/* Map Layer Controls Overlay (Top Right) */}
      <div className="absolute top-4 right-4 z-40 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3.5 py-3.5 rounded-xl shadow-2xl flex flex-col gap-2.5 pointer-events-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Show Infrastructure</span>
        
        <label className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-slate-100 cursor-pointer">
          <input 
            type="checkbox" 
            className="rounded border-slate-800 text-purple-600 focus:ring-0 focus:ring-offset-0 bg-slate-950 w-4 h-4 cursor-pointer"
            checked={showLayers.streetlights}
            onChange={() => setShowLayers({...showLayers, streetlights: !showLayers.streetlights})}
          />
          <span className="flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
            Streetlights
          </span>
        </label>

        <label className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-slate-100 cursor-pointer">
          <input 
            type="checkbox" 
            className="rounded border-slate-800 text-purple-600 focus:ring-0 focus:ring-offset-0 bg-slate-950 w-4 h-4 cursor-pointer"
            checked={showLayers.police}
            onChange={() => setShowLayers({...showLayers, police: !showLayers.police})}
          />
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            Police Stations
          </span>
        </label>

        <label className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-slate-100 cursor-pointer">
          <input 
            type="checkbox" 
            className="rounded border-slate-800 text-purple-600 focus:ring-0 focus:ring-offset-0 bg-slate-950 w-4 h-4 cursor-pointer"
            checked={showLayers.hospitals}
            onChange={() => setShowLayers({...showLayers, hospitals: !showLayers.hospitals})}
          />
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-red-400" />
            Hospitals
          </span>
        </label>

        <label className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-slate-100 cursor-pointer">
          <input 
            type="checkbox" 
            className="rounded border-slate-800 text-purple-600 focus:ring-0 focus:ring-offset-0 bg-slate-950 w-4 h-4 cursor-pointer"
            checked={showLayers.pharmacies}
            onChange={() => setShowLayers({...showLayers, pharmacies: !showLayers.pharmacies})}
          />
          <span className="flex items-center gap-1">
            <Pill className="w-3.5 h-3.5 text-emerald-400" />
            Pharmacies
          </span>
        </label>

        <label className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-slate-100 cursor-pointer">
          <input 
            type="checkbox" 
            className="rounded border-slate-800 text-purple-600 focus:ring-0 focus:ring-offset-0 bg-slate-950 w-4 h-4 cursor-pointer"
            checked={showLayers.metro}
            onChange={() => setShowLayers({...showLayers, metro: !showLayers.metro})}
          />
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            Metro Stations
          </span>
        </label>
      </div>

      {/* Floating Map Legend (Index) */}
      <div className="absolute bottom-5 left-5 z-[1000] pointer-events-auto transition-all duration-300 ease-in-out">
        {legendOpen ? (
          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/80 p-4 rounded-xl shadow-2xl max-w-[200px] flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Map Index</span>
              </div>
              <button 
                onClick={() => setLegendOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded hover:bg-slate-800/60 cursor-pointer transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 scale-75 origin-center" dangerouslySetInnerHTML={{ __html: ICONS.source }} />
                <span className="text-[11px] font-medium text-slate-300">Starting Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 scale-75 origin-center" dangerouslySetInnerHTML={{ __html: ICONS.dest }} />
                <span className="text-[11px] font-medium text-slate-300">Destination</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 scale-75 origin-center bg-yellow-400/5 rounded-full border border-yellow-400/20" dangerouslySetInnerHTML={{ __html: ICONS.streetlight }} />
                <span className="text-[11px] font-medium text-slate-300">Streetlight</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 scale-75 origin-center bg-blue-500/5 rounded-lg border border-blue-500/20" dangerouslySetInnerHTML={{ __html: ICONS.police }} />
                <span className="text-[11px] font-medium text-slate-300">Police Station</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 scale-75 origin-center bg-red-500/5 rounded-full border border-red-500/20" dangerouslySetInnerHTML={{ __html: ICONS.hospital }} />
                <span className="text-[11px] font-medium text-slate-300">Hospital</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 scale-75 origin-center bg-emerald-500/5 rounded-full border border-emerald-500/20" dangerouslySetInnerHTML={{ __html: ICONS.pharmacy }} />
                <span className="text-[11px] font-medium text-slate-300">Pharmacy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center shrink-0 scale-75 origin-center bg-purple-500/5 rounded-lg border border-purple-500/20" dangerouslySetInnerHTML={{ __html: ICONS.metro }} />
                <span className="text-[11px] font-medium text-slate-300">Metro Station</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setLegendOpen(true)}
            className="bg-slate-950/90 hover:bg-slate-900 border border-slate-800 p-2 rounded-full shadow-2xl cursor-pointer hover:border-purple-500/40 text-purple-400 hover:text-purple-300 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 ml-1" />
            <span className="text-[9px] font-bold uppercase tracking-wider pr-1.5">Map Index</span>
          </button>
        )}
      </div>

      <MapContainer 
        center={[17.4483, 78.3915]} 
        zoom={13} 
        className="w-full h-full"
        zoomControl={true}
      >
        {/* Premium CartoDB Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Fit Map Boundaries */}
        {activeRoute && <MapBoundsManager coordinates={getPolylineCoords(activeRoute.geometry)} />}

        {/* Click Handlers */}
        <MapClickHandler activePinMode={activePinMode} onPinSet={handlePinSetFromMap} />

        {/* Pan helper */}
        {highlightedFacility && <MapPanner target={highlightedFacility.coordinates} />}

        {/* Source Marker */}
        {source && (
          <Marker 
            position={[source.lat, source.lon]} 
            icon={createDivIcon('source')}
          >
            <Popup>
              <div className="text-slate-950 font-sans p-1">
                <strong className="text-emerald-600 text-xs block mb-0.5">🟢 STARTING POINT</strong>
                <span className="text-xs font-semibold">{source.name}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker 
            position={[destination.lat, destination.lon]} 
            icon={createDivIcon('dest')}
          >
            <Popup>
              <div className="text-slate-950 font-sans p-1">
                <strong className="text-red-500 text-xs block mb-0.5">🔴 DESTINATION</strong>
                <span className="text-xs font-semibold">{destination.name}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Draw All Alternative Routes */}
        {routes.map((route) => {
          const isSelected = activeRoute?.id === route.id;
          const style = getRouteStyle(route, isSelected);
          const coords = getPolylineCoords(route.geometry);
          
          return (
            <SafePolyline
              key={`${route.id}-${isSelected}`}
              route={route}
              isSelected={isSelected}
              style={style}
              coords={coords}
              setActiveRoute={setActiveRoute}
            />
          );
        })}

        {/* Draw Points along the Active Selected Route */}
        {activeRoute && activeRoute.facilities && (
          <>
            {/* 1. Streetlights */}
            {showLayers.streetlights && activeRoute.facilities.streetlights.map((light, i) => (
              <Marker 
                key={`light-${i}`} 
                position={light.coordinates} 
                icon={createDivIcon('streetlight', 'animate-pulse')}
              >
                <Popup>
                  <div className="text-slate-950 font-sans text-xs">
                    💡 Streetlight Lamp Post
                    <span className="text-[10px] text-slate-500 block">Verified coverage along safety buffer.</span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 2. Police Stations */}
            {showLayers.police && activeRoute.facilities.police.map((pol, i) => (
              <Marker 
                key={`police-${i}`} 
                position={pol.coordinates} 
                icon={createDivIcon('police')}
              >
                <Popup>
                  <div className="text-slate-950 font-sans text-xs">
                    👮 {pol.name}
                    <span className="text-[10px] text-slate-500 block">Police Station inside 200m safety shield.</span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 3. Hospitals */}
            {showLayers.hospitals && activeRoute.facilities.hospitals.map((hosp, i) => (
              <Marker 
                key={`hosp-${i}`} 
                position={hosp.coordinates} 
                icon={createDivIcon('hospital')}
              >
                <Popup>
                  <div className="text-slate-950 font-sans text-xs">
                    🏥 {hosp.name}
                    <span className="text-[10px] text-slate-500 block">Medical facility / Emergency Room nearby.</span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 4. Pharmacies */}
            {showLayers.pharmacies && activeRoute.facilities.pharmacies.map((pharm, i) => (
              <Marker 
                key={`pharm-${i}`} 
                position={pharm.coordinates} 
                icon={createDivIcon('pharmacy')}
              >
                <Popup>
                  <div className="text-slate-950 font-sans text-xs">
                    💊 {pharm.name}
                    <span className="text-[10px] text-slate-500 block">Pharmacy store / Medical shop nearby.</span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 5. Metro Stations */}
            {showLayers.metro && activeRoute.facilities.metro.map((met, i) => (
              <Marker 
                key={`metro-${i}`} 
                position={met.coordinates} 
                icon={createDivIcon('metro')}
              >
                <Popup>
                  <div className="text-slate-950 font-sans text-xs">
                    🚇 {met.name}
                    <span className="text-[10px] text-slate-500 block">Active Hyderabad Metro Station.</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* Focus and Pulse Highlighted Facility Marker */}
        {highlightedFacility && (
          <Marker 
            position={highlightedFacility.coordinates} 
            icon={createDivIcon(highlightedFacility.type, 'ring-4 ring-emerald-400')}
          >
            <Popup>
              <div className="text-slate-950 font-sans text-xs">
                <strong>🎯 FOCUS TARGET:</strong> {highlightedFacility.name}
                <span className="text-[10px] text-slate-500 block mt-0.5">Proximity: {highlightedFacility.distance_m}m away</span>
              </div>
            </Popup>
          </Marker>
        )}

      </MapContainer>
    </div>
  );
}
