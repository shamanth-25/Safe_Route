import React, { useState, useEffect, useRef } from 'react';
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
import axios from 'axios';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Shield, 
  Activity, 
  Pill, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Award, 
  ArrowLeftRight, 
  Info, 
  Sparkles, 
  Loader2, 
  BarChart2, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Compass, 
  Locate,
  X
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
const ICONS = {
  source: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#22c55e" stroke="#ffffff" stroke-width="2" class="w-8 h-8 filter drop-shadow-md"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  dest: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="2" class="w-8 h-8 filter drop-shadow-md"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  streetlight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#facc15" class="w-5 h-5"><circle cx="12" cy="12" r="10" fill="rgba(250, 204, 21, 0.2)" stroke="#eab308" stroke-width="1"/><circle cx="12" cy="12" r="4" fill="#facc15"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42" stroke="#eab308" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  police: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" stroke="#ffffff" stroke-width="1" class="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><text x="12" y="14" fill="white" font-size="8" font-weight="bold" text-anchor="middle" font-family="sans-serif">P</text></svg>`,
  hospital: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="1" class="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3v2z"/></svg>`,
  pharmacy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" stroke="#ffffff" stroke-width="1" class="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3 11h-2v2h-2v-2H9v-2h2V9h2v2h2v2z"/></svg>`,
  metro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#a855f7" stroke="#ffffff" stroke-width="1.5" class="w-6 h-6"><rect x="4" y="6" width="16" height="10" rx="2" fill="#a855f7"/><path d="M7 11h10v2H7z" fill="white"/><circle cx="8" cy="14" r="1" fill="white"/><circle cx="16" cy="14" r="1" fill="white"/><path d="M6 16l-2 3M18 16l2 3" stroke="#a855f7" stroke-width="2" stroke-linecap="round"/></svg>`
};

const createDivIcon = (svgKey, className = '') => {
  return L.divIcon({
    html: `<div class="marker-pin-wrapper ${className}">${ICONS[svgKey]}</div>`,
    className: 'custom-div-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

const API_BASE = 'http://localhost:8000';

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
    click: async (e) => {
      if (!activePinMode) return;
      
      const { lat, lng } = e.latlng;
      onPinSet(activePinMode, lat, lng);
    }
  });
  return null;
}

const PRESETS = [
  {
    id: 'it',
    label: '💻 IT Corridor',
    description: 'Madhapur ➔ Gachibowli',
    source: { name: 'Madhapur, Hyderabad', lat: 17.4483, lon: 78.3915 },
    dest: { name: 'Gachibowli, Hyderabad', lat: 17.4401, lon: 78.3489 }
  },
  {
    id: 'heritage',
    label: '🏰 Heritage Trail',
    description: 'Charminar ➔ Golconda',
    source: { name: 'Charminar, Hyderabad', lat: 17.3616, lon: 78.4747 },
    dest: { name: 'Golconda Fort, Hyderabad', lat: 17.3833, lon: 78.4011 }
  },
  {
    id: 'transit',
    label: '🚇 Transit Hub',
    description: 'Begumpet ➔ Secunderabad',
    source: { name: 'Begumpet, Hyderabad', lat: 17.4447, lon: 78.4664 },
    dest: { name: 'Secunderabad Station, Hyderabad', lat: 17.4334, lon: 78.5017 }
  },
  {
    id: 'city',
    label: '🌳 City Core',
    description: 'Nampally ➔ Jubilee Hills',
    source: { name: 'Nampally Station, Hyderabad', lat: 17.3924, lon: 78.4682 },
    dest: { name: 'Jubilee Hills, Hyderabad', lat: 17.4299, lon: 78.4069 }
  }
];

export default function App() {
  // Input locations
  const [source, setSource] = useState({ name: 'Madhapur, Hyderabad', lat: 17.4483, lon: 78.3915 });
  const [destination, setDestination] = useState({ name: 'Gachibowli, Hyderabad', lat: 17.4401, lon: 78.3489 });
  
  // Search text inputs & autocompletes
  const [sourceText, setSourceText] = useState(source.name);
  const [destText, setDestText] = useState(destination.name);
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [activeSuggestionBox, setActiveSuggestionBox] = useState(null); // 'source' | 'destination' | null
  
  // Interactive Map click modes
  const [activePinMode, setActivePinMode] = useState(null); // 'source' | 'destination' | null
  
  // API State
  const [routes, setRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routingSource, setRoutingSource] = useState('');
  
  // Map Layer visibility controls
  const [showLayers, setShowLayers] = useState({
    streetlights: true,
    police: true,
    hospitals: true,
    pharmacies: true,
    metro: true
  });
  
  // Custom located marker to highlight from nearest list
  const [highlightedFacility, setHighlightedFacility] = useState(null);
  
  // Interactive map legend state
  const [legendOpen, setLegendOpen] = useState(true);
  
  // Smart address display formatter (keeps flat details + landmark name)
  const formatLocationName = (displayName) => {
    if (!displayName) return '';
    const parts = displayName.split(',');
    if (parts.length > 2) {
      const firstSegment = parts[0].trim();
      const isFlatPattern = /^(flat|f\.?no|house|h\.?no|plot|villa|apt|apartment|block|room|floor|suite)/i.test(firstSegment);
      if (isFlatPattern) {
        return `${firstSegment}, ${parts[1].trim()}`;
      }
    }
    return parts[0].trim();
  };

  // Fetch coordinates using Nominatim API (limited to Hyderabad region)
  const handleGeocodeSearch = async (text, type) => {
    if (!text.trim()) return;
    
    try {
      const response = await axios.get(`${API_BASE}/api/geocode`, {
        params: { q: text }
      });
      
      if (type === 'source') {
        setSourceSuggestions(response.data);
        setActiveSuggestionBox('source');
      } else {
        setDestSuggestions(response.data);
        setActiveSuggestionBox('destination');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  // Debounced input change for geocoder
  const handleInputChange = (val, type) => {
    if (type === 'source') {
      setSourceText(val);
      if (val.length > 3) handleGeocodeSearch(val, 'source');
      else setSourceSuggestions([]);
    } else {
      setDestText(val);
      if (val.length > 3) handleGeocodeSearch(val, 'dest');
      else setDestSuggestions([]);
    }
  };

  // Reverse geocoding for manual map clicks
  const handleReverseGeocode = async (lat, lon) => {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon,
          format: 'json'
        }
      });
      return res.data.display_name.split(',').slice(0, 3).join(',');
    } catch (e) {
      return `Pinned Coordinate (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    }
  };

  // Trigger browser's Geolocation API to detect current location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Reverse geocode to get a friendly address name
        const friendlyName = await handleReverseGeocode(latitude, longitude);
        const loc = { name: friendlyName, lat: latitude, lon: longitude };
        
        setSource(loc);
        setSourceText(friendlyName);
        setLoading(false);
        
        // Automatically calculate routes immediately!
        handleCalculateRoutes(loc, destination);
      },
      (error) => {
        console.error(error);
        // Fallback to default coordinates with clean labels if browser blocks permissions
        const fallbackLoc = { name: "Current Location (Manual)", lat: 17.4483, lon: 78.3915 };
        setSource(fallbackLoc);
        setSourceText(fallbackLoc.name);
        setLoading(false);
        alert("Location access denied or timed out. Placed pin at center of Madhapur instead! You can click the map target icon next to the input to adjust it.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Pin coordinates when map is clicked
  const handlePinSetFromMap = async (type, lat, lon) => {
    setLoading(true);
    const friendlyName = await handleReverseGeocode(lat, lon);
    const loc = { name: friendlyName, lat, lon };
    
    if (type === 'source') {
      setSource(loc);
      setSourceText(friendlyName);
    } else {
      setDestination(loc);
      setDestText(friendlyName);
    }
    setActivePinMode(null);
    setLoading(false);
  };

  // Fetch routes from FastAPI
  const handleCalculateRoutes = async (customSource = null, customDest = null) => {
    setLoading(true);
    setError(null);
    setHighlightedFacility(null);
    
    // Filter out React click event object if called directly from onClick
    const hasValidSource = customSource && typeof customSource === 'object' && 'lat' in customSource && customSource.lat !== undefined;
    const hasValidDest = customDest && typeof customDest === 'object' && 'lat' in customDest && customDest.lat !== undefined;
    
    let activeSrc = hasValidSource ? customSource : source;
    let activeDst = hasValidDest ? customDest : destination;

    // 1. On-the-fly geocoding for Source if only text is present
    if (!activeSrc && sourceText && sourceText.trim().length > 0) {
      try {
        const res = await axios.get(`${API_BASE}/api/geocode`, { params: { q: sourceText } });
        if (res.data && res.data.length > 0) {
          const item = res.data[0];
          const formatted = formatLocationName(item.display_name);
          activeSrc = { name: formatted, lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
          setSource(activeSrc);
          setSourceText(formatted);
        } else {
          // Default center fallback
          activeSrc = { name: sourceText, lat: 17.4483, lon: 78.3915 };
          setSource(activeSrc);
        }
      } catch (e) {
        activeSrc = { name: sourceText, lat: 17.4483, lon: 78.3915 };
        setSource(activeSrc);
      }
    }

    // 2. On-the-fly geocoding for Destination if only text is present
    if (!activeDst && destText && destText.trim().length > 0) {
      try {
        const res = await axios.get(`${API_BASE}/api/geocode`, { params: { q: destText } });
        if (res.data && res.data.length > 0) {
          const item = res.data[0];
          const formatted = formatLocationName(item.display_name);
          activeDst = { name: formatted, lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
          setDestination(activeDst);
          setDestText(formatted);
        } else {
          // Default center fallback
          activeDst = { name: destText, lat: 17.4401, lon: 78.3489 };
          setDestination(activeDst);
        }
      } catch (e) {
        activeDst = { name: destText, lat: 17.4401, lon: 78.3489 };
        setDestination(activeDst);
      }
    }

    if (!activeSrc || !activeDst) {
      setError('Please specify both a starting point and destination.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/routes`, {
        source_lat: activeSrc.lat,
        source_lon: activeSrc.lon,
        dest_lat: activeDst.lat,
        dest_lon: activeDst.lon
      });
      
      const routesList = response.data.routes;
      setRoutes(routesList);
      setRoutingSource(response.data.routing_source);
      
      if (routesList.length > 0) {
        // Active is the safest recommended (first index)
        setActiveRoute(routesList[0]);
      } else {
        setError('No routes could be mapped between these locations.');
      }
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to analyze routes. Please check backend connection.';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errMsg = detail;
        } else if (Array.isArray(detail)) {
          errMsg = detail.map(d => `${d.loc ? d.loc.join('.') : 'error'}: ${d.msg}`).join(', ');
        } else if (typeof detail === 'object') {
          errMsg = JSON.stringify(detail);
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Preset loading handler
  const handleApplyPreset = (preset) => {
    setSource(preset.source);
    setSourceText(preset.source.name);
    setDestination(preset.dest);
    setDestText(preset.dest.name);
    handleCalculateRoutes(preset.source, preset.dest);
  };

  // Swap Source & Destination
  const handleSwapLocations = () => {
    const temp = source;
    setSource(destination);
    setSourceText(destination.name);
    setDestination(temp);
    setDestText(temp.name);
    handleCalculateRoutes(destination, temp);
  };

  // Calculate initial route on load
  useEffect(() => {
    handleCalculateRoutes();
  }, []);

  // Format OSRM/ORS LineString coordinates into [lat, lon] array for Leaflet
  const getPolylineCoords = (geometry) => {
    if (!geometry || !geometry.coordinates) return [];
    return geometry.coordinates.map(coord => [coord[1], coord[0]]);
  };

  // Pan map and focus a facility
  const handleLocateFacility = (fac) => {
    setHighlightedFacility(fac);
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
    <div className="h-screen overflow-hidden bg-slate-950 flex flex-col text-slate-100 selection:bg-purple-500 selection:text-white font-sans antialiased">
      
      {/* 1. Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-emerald-400 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-emerald-950/40">
            <Shield className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight catchy-header">SafePath</h1>
              <span className="text-sm bg-purple-500/25 text-purple-400 border border-purple-500/35 px-2.5 py-0.5 rounded-full font-mono font-bold">HYDERABAD</span>
            </div>
            <p className="text-sm text-slate-350 mt-0.5">Find the most illuminated and emergency-accessible route, not just the shortest.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {routingSource && (
            <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              Engine: <strong className="text-blue-400">{routingSource}</strong>
            </span>
          )}
          <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
            Active lights in system: <strong className="text-yellow-400">14,284</strong>
          </span>
          <a href="tel:112" className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all">
            <Phone className="w-3.5 h-3.5 animate-pulse" />
            Quick Emergency: 112
          </a>
        </div>
      </header>

      {/* 2. Main Dashboard Layout Grid */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden">
        
        {/* Left Control Sidebar (Col span 3) */}
        <section className="xl:col-span-3 border-r border-slate-800 bg-slate-950/80 p-5 overflow-y-auto flex flex-col gap-5 glass-panel">
          
          {/* Card: Location Input */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-300 tracking-wide uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Plan Safe Route
            </h2>

            {/* Quick Presets (One-Click Routing) */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-2 shadow-inner">
              <label className="text-[10px] font-bold text-purple-400 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Quick Presets (One-Click)
              </label>
              <div className="grid grid-cols-2 gap-2 mt-0.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-800 hover:border-purple-500/40 bg-slate-900/35 hover:bg-purple-950/15 text-center transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-purple-500/5 group text-[11px]"
                  >
                    <span className="font-bold text-slate-200 group-hover:text-white leading-tight">
                      {preset.label}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 leading-none font-mono scale-95 origin-center">
                      {preset.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input: Source */}
            <div className="relative">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Source Location</label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                    value={sourceText} 
                    onChange={(e) => handleInputChange(e.target.value, 'source')}
                    onFocus={() => setActiveSuggestionBox('source')}
                    placeholder="Enter source in Hyderabad..."
                  />
                </div>
                <button 
                  onClick={handleDetectLocation}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-950/80 text-purple-400 hover:text-purple-300 hover:border-purple-500/40 text-sm font-medium transition-all active:scale-95"
                  title="Detect my current location"
                >
                  <Navigation className="w-4 h-4 shrink-0" />
                </button>
                <button 
                  onClick={() => setActivePinMode(activePinMode === 'source' ? null : 'source')}
                  className={`p-2 rounded-lg border text-sm font-medium transition-all active:scale-95 ${
                    activePinMode === 'source' 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400' 
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Click on the map to pin source"
                >
                  <Locate className="w-4 h-4" />
                </button>
              </div>

              {/* Autocomplete Dropdown: Source */}
              {activeSuggestionBox === 'source' && (sourceSuggestions.length > 0 || (sourceText && sourceText.trim().length > 2)) && (
                <ul className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                  {sourceSuggestions.map((item) => (
                    <li 
                      key={item.place_id} 
                      onClick={() => {
                        const formattedName = formatLocationName(item.display_name);
                        setSource({ name: formattedName, lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
                        setSourceText(formattedName);
                        setSourceSuggestions([]);
                        setActiveSuggestionBox(null);
                      }}
                      className="px-4 py-2 text-xs text-slate-300 hover:bg-purple-900/30 hover:text-white cursor-pointer border-b border-slate-800 last:border-0 truncate"
                    >
                      {item.display_name}
                    </li>
                  ))}
                  <li 
                    onClick={() => {
                      setSource({ name: sourceText, lat: 17.4483, lon: 78.3915 });
                      setSourceSuggestions([]);
                      setActiveSuggestionBox(null);
                    }}
                    className="px-4 py-2.5 text-xs text-purple-400 font-bold hover:bg-purple-900/30 hover:text-purple-200 cursor-pointer flex items-center gap-1.5 border-t border-slate-800"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Use: "{sourceText}" (Set on Madhapur Center)</span>
                  </li>
                </ul>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2.5">
              <button 
                onClick={handleSwapLocations}
                className="bg-slate-850 hover:bg-slate-800 text-purple-400 hover:text-purple-300 p-1.5 rounded-full border border-slate-800 hover:border-purple-500/40 shadow-md transition-all active:scale-95"
              >
                <ArrowLeftRight className="w-4 h-4 rotate-90" />
              </button>
            </div>

            {/* Input: Destination */}
            <div className="relative">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Destination Location</label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Navigation className="w-4 h-4 text-red-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                    value={destText} 
                    onChange={(e) => handleInputChange(e.target.value, 'dest')}
                    onFocus={() => setActiveSuggestionBox('destination')}
                    placeholder="Enter destination in Hyderabad..."
                  />
                </div>
                <button 
                  onClick={() => setActivePinMode(activePinMode === 'destination' ? null : 'destination')}
                  className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                    activePinMode === 'destination' 
                      ? 'bg-red-500/20 text-red-400 border-red-400' 
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Click on the map to pin destination"
                >
                  <Locate className="w-4 h-4" />
                </button>
              </div>

              {/* Autocomplete Dropdown: Destination */}
              {activeSuggestionBox === 'destination' && (destSuggestions.length > 0 || (destText && destText.trim().length > 2)) && (
                <ul className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                  {destSuggestions.map((item) => (
                    <li 
                      key={item.place_id} 
                      onClick={() => {
                        const formattedName = formatLocationName(item.display_name);
                        setDestination({ name: formattedName, lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
                        setDestText(formattedName);
                        setDestSuggestions([]);
                        setActiveSuggestionBox(null);
                      }}
                      className="px-4 py-2 text-xs text-slate-300 hover:bg-purple-900/30 hover:text-white cursor-pointer border-b border-slate-800 last:border-0 truncate"
                    >
                      {item.display_name}
                    </li>
                  ))}
                  <li 
                    onClick={() => {
                      setDestination({ name: destText, lat: 17.4401, lon: 78.3489 });
                      setDestSuggestions([]);
                      setActiveSuggestionBox(null);
                    }}
                    className="px-4 py-2.5 text-xs text-purple-400 font-bold hover:bg-purple-900/30 hover:text-purple-200 cursor-pointer flex items-center gap-1.5 border-t border-slate-800"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Use: "{destText}" (Set on Gachibowli Center)</span>
                  </li>
                </ul>
              )}
            </div>

            {/* Instruction during map pinning */}
            {activePinMode && (
              <div className="text-xs bg-purple-950/40 text-purple-400 border border-purple-500/20 p-2.5 rounded-lg animate-pulse flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Click directly on the map to pin your <strong>{activePinMode}</strong> coordinate.</span>
              </div>
            )}

            {/* Action button */}
            <button 
              onClick={handleCalculateRoutes}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-400 hover:to-purple-500 text-slate-950 font-bold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-purple-500/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Generating Safety Analytics...
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-slate-950" />
                  Calculate Safest Routes
                </>
              )}
            </button>
          </div>

          {/* Route Comparison Dashboard */}
          <div className="flex-1 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-300 tracking-wide uppercase flex items-center justify-between">
              <span>Route Dashboard</span>
              {routes.length > 0 && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono font-normal normal-case">
                  {routes.length} options found
                </span>
              )}
            </h2>

            {error && (
              <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3.5 rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {loading && !routes.length && (
              <div className="flex-1 flex flex-col justify-center items-center gap-3 p-8 border border-slate-850 bg-slate-900/20 rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                <span className="text-xs text-slate-400 text-center">Intersecting datasets...<br/>Streetlights, Police Stations, Hospitals, Metro lines</span>
              </div>
            )}

            {routes.length > 0 && (
              <div className="flex flex-col gap-3.5">
                {routes.map((route) => {
                  const isSelected = activeRoute?.id === route.id;
                  const isRecommended = route.recommendation_type === 'RECOMMENDED';
                  const isModerate = route.recommendation_type === 'MODERATE';
                  
                  return (
                    <div 
                      key={route.id}
                      onClick={() => setActiveRoute(route)}
                      className={`glass-card p-4 rounded-xl cursor-pointer select-none transition-all flex flex-col gap-2.5 relative overflow-hidden ${
                        isSelected 
                          ? 'border-l-4 border-l-purple-500 ring-1 ring-purple-500/50 bg-slate-900/80 shadow-md' 
                          : 'border border-slate-850 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                            {route.name}
                            {isRecommended && (
                              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-0.5">
                                <Award className="w-3 h-3" />
                                Safest
                              </span>
                            )}
                            {isModerate && (
                              <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                Moderate
                              </span>
                            )}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Dist: {route.distance_km} km | Time: {route.duration_min} min
                          </span>
                        </div>

                        {/* Safety Score Badge */}
                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border shadow-sm ${
                          route.safety_score >= 80 
                            ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30' 
                            : route.safety_score >= 50 
                            ? 'bg-amber-950/30 text-amber-400 border-amber-500/30' 
                            : 'bg-red-950/30 text-red-400 border-red-500/30'
                        }`}>
                          <span className="text-lg font-black font-mono leading-none">{route.safety_score}</span>
                          <span className="text-[8px] font-bold uppercase tracking-widest leading-none mt-0.5">SAFETY</span>
                        </div>
                      </div>

                      {/* Summary Metrics */}
                      <div className="grid grid-cols-5 gap-1.5 text-center bg-slate-950/40 p-2 rounded-lg text-[10px] border border-slate-900">
                        <div className="flex flex-col items-center">
                          <Lightbulb className="w-3.5 h-3.5 text-yellow-400 mb-0.5" />
                          <span className="font-bold text-slate-300 font-mono">{route.counts.streetlights}</span>
                          <span className="text-[8px] text-slate-500">Lights</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Shield className="w-3.5 h-3.5 text-blue-400 mb-0.5" />
                          <span className="font-bold text-slate-300 font-mono">{route.counts.police}</span>
                          <span className="text-[8px] text-slate-500">Police</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Activity className="w-3.5 h-3.5 text-red-400 mb-0.5" />
                          <span className="font-bold text-slate-300 font-mono">{route.counts.hospitals}</span>
                          <span className="text-[8px] text-slate-500">Med</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Pill className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                          <span className="font-bold text-slate-300 font-mono">{route.counts.pharmacies}</span>
                          <span className="text-[8px] text-slate-500">Rx</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Compass className="w-3.5 h-3.5 text-purple-400 mb-0.5" />
                          <span className="font-bold text-slate-300 font-mono">{route.counts.metro}</span>
                          <span className="text-[8px] text-slate-500">Metro</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Middle Map Section (Col span 6) */}
        <section className="xl:col-span-6 relative flex flex-col min-h-[400px] xl:min-h-0 bg-slate-900 border-r border-slate-800 overflow-hidden">
          
          {/* Legend Overlay (Top Left) */}
          <div className="absolute top-4 left-4 z-40 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3.5 py-3 rounded-xl shadow-2xl flex flex-col gap-2 max-w-xs">
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
          <div className="absolute top-4 right-4 z-40 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3.5 py-3.5 rounded-xl shadow-2xl flex flex-col gap-2.5">
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

          {/* Leaflet Map Frame */}
          <div className="w-full h-full min-h-[400px] xl:min-h-0 flex-1 relative overflow-hidden">
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
              center={[17.44, 78.38]} 
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
                  <Polyline
                    key={route.id}
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
        </section>

        {/* Right Info & Analytics Dashboard (Col span 3) */}
        <section className="xl:col-span-3 border-l border-slate-800 bg-slate-950/80 p-5 overflow-y-auto flex flex-col gap-5 glass-panel">
          
          {/* Active Route Core Breakdown */}
          {activeRoute ? (
            <div className="flex flex-col gap-4">
              
              {/* Circular Gauge Ring & Score */}
              <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center gap-4 shadow-xl shadow-slate-950/40">
                <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">Night Safety Score</span>
                
                <div className="relative flex items-center justify-center">
                  {/* SVG Gauge */}
                  <svg className="w-32 h-32 transform -rotate-90 filter drop-shadow-[0_0_12px_rgba(168,85,247,0.15)]">
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="52" 
                      stroke="rgba(255,255,255,0.03)" 
                      strokeWidth="8" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="52" 
                      stroke={
                        activeRoute.safety_score >= 80 ? '#10b981' : 
                        activeRoute.safety_score >= 50 ? '#f59e0b' : '#ef4444'
                      } 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="326.7"
                      strokeDashoffset={326.7 - (326.7 * activeRoute.safety_score) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center flex flex-col items-center">
                    <span 
                      className={`text-4xl font-black font-mono tracking-tight block ${
                        activeRoute.safety_score >= 80 ? 'text-emerald-400' : 
                        activeRoute.safety_score >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}
                      style={{ textShadow: activeRoute.safety_score >= 80 ? '0 0 15px rgba(16,185,129,0.3)' : 'none' }}
                    >
                      {activeRoute.safety_score}
                    </span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block -mt-1">Rank</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-extrabold text-white flex items-center justify-center gap-1.5 tracking-tight">
                    {activeRoute.safety_score >= 80 ? 'Highly Secure Route' : 
                     activeRoute.safety_score >= 50 ? 'Moderate Safety Route' : 'Caution Advised'}
                  </h3>
                  <p className="text-xs text-slate-450 px-2 leading-relaxed">
                    Calculated across {activeRoute.counts.streetlights} streetlights and active emergency resources.
                  </p>
                </div>
              </div>

              {/* Reasons list */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-purple-400" />
                  Safety Rationale
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {activeRoute.reasons.map((reason, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safety Score Breakdown Progress Bars */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  GIS Score Breakdown
                </h3>
                
                <div className="flex flex-col gap-2.5">
                  {/* Streetlight Score */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                      <span>💡 Streetlight Density (50%)</span>
                      <span className="font-mono font-bold text-yellow-400">{activeRoute.subscores.streetlights}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900">
                      <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${activeRoute.subscores.streetlights}%` }}></div>
                    </div>
                  </div>

                  {/* Police Score */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                      <span>👮 Police Shield (20%)</span>
                      <span className="font-mono font-bold text-blue-400">{activeRoute.subscores.police}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900">
                      <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${activeRoute.subscores.police}%` }}></div>
                    </div>
                  </div>

                  {/* Hospital Score */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                      <span>🏥 Hospital Access (15%)</span>
                      <span className="font-mono font-bold text-red-400">{activeRoute.subscores.hospitals}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900">
                      <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${activeRoute.subscores.hospitals}%` }}></div>
                    </div>
                  </div>

                  {/* Pharmacy Score */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                      <span>💊 Pharmacy Access (10%)</span>
                      <span className="font-mono font-bold text-emerald-400">{activeRoute.subscores.pharmacies}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900">
                      <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${activeRoute.subscores.pharmacies}%` }}></div>
                    </div>
                  </div>

                  {/* Metro Score */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                      <span>🚇 Metro Proximity (5%)</span>
                      <span className="font-mono font-bold text-purple-400">{activeRoute.subscores.metro}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900">
                      <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${activeRoute.subscores.metro}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Proximity Quick Assistance */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-red-400" />
                  Emergency Proximity
                </h3>

                <div className="flex flex-col gap-3">
                  {/* Police Proximity */}
                  {activeRoute.nearest_emergency && activeRoute.nearest_emergency.police ? (
                    <div className="flex justify-between items-center bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg">
                      <div className="min-w-0">
                        <span className="text-[10px] text-blue-400 font-bold block">👮 CLOSET SECURITY</span>
                        <h4 className="text-xs font-bold text-slate-200 truncate">{activeRoute.nearest_emergency.police.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">Distance: {activeRoute.nearest_emergency.police.distance_m}m</span>
                      </div>
                      <button 
                        onClick={() => handleLocateFacility({ ...activeRoute.nearest_emergency.police, type: 'police' })}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded border border-blue-500/20 hover:border-blue-500/40 transition-all shrink-0 cursor-pointer"
                      >
                        Locate
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 p-2 text-center bg-slate-950/40 rounded-lg">No police station found within analyzed buffers.</div>
                  )}

                  {/* Hospital Proximity */}
                  {activeRoute.nearest_emergency && activeRoute.nearest_emergency.hospital ? (
                    <div className="flex justify-between items-center bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg">
                      <div className="min-w-0">
                        <span className="text-[10px] text-red-400 font-bold block">🏥 NEAREST MEDICAL</span>
                        <h4 className="text-xs font-bold text-slate-200 truncate">{activeRoute.nearest_emergency.hospital.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">Distance: {activeRoute.nearest_emergency.hospital.distance_m}m</span>
                      </div>
                      <button 
                        onClick={() => handleLocateFacility({ ...activeRoute.nearest_emergency.hospital, type: 'hospital' })}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded border border-red-500/20 hover:border-red-500/40 transition-all shrink-0 cursor-pointer"
                      >
                        Locate
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 p-2 text-center bg-slate-950/40 rounded-lg">No medical center found within analyzed buffers.</div>
                  )}

                  {/* Pharmacy Proximity */}
                  {activeRoute.nearest_emergency && activeRoute.nearest_emergency.pharmacy ? (
                    <div className="flex justify-between items-center bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg">
                      <div className="min-w-0">
                        <span className="text-[10px] text-emerald-400 font-bold block">💊 NEAREST PHARMACY</span>
                        <h4 className="text-xs font-bold text-slate-200 truncate">{activeRoute.nearest_emergency.pharmacy.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">Distance: {activeRoute.nearest_emergency.pharmacy.distance_m}m</span>
                      </div>
                      <button 
                        onClick={() => handleLocateFacility({ ...activeRoute.nearest_emergency.pharmacy, type: 'pharmacy' })}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20 hover:border-emerald-500/40 transition-all shrink-0 cursor-pointer"
                      >
                        Locate
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 p-2 text-center bg-slate-950/40 rounded-lg">No pharmacies found within analyzed buffers.</div>
                  )}

                  {/* Metro Proximity */}
                  {activeRoute.nearest_emergency && activeRoute.nearest_emergency.metro ? (
                    <div className="flex justify-between items-center bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg">
                      <div className="min-w-0">
                        <span className="text-[10px] text-purple-400 font-bold block">🚇 NEAREST TRANSIT</span>
                        <h4 className="text-xs font-bold text-slate-200 truncate">{activeRoute.nearest_emergency.metro.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">Distance: {activeRoute.nearest_emergency.metro.distance_m}m</span>
                      </div>
                      <button 
                        onClick={() => handleLocateFacility({ ...activeRoute.nearest_emergency.metro, type: 'metro' })}
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] font-bold px-2 py-1 rounded border border-purple-500/20 hover:border-purple-500/40 transition-all shrink-0 cursor-pointer"
                      >
                        Locate
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 p-2 text-center bg-slate-950/40 rounded-lg">No metro station found within analyzed buffers.</div>
                  )}

                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8 border border-slate-850 bg-slate-900/10 rounded-xl gap-4">
              <Compass className="w-12 h-12 text-slate-655 text-slate-600 animate-pulse" />
              <div>
                <h3 className="font-semibold text-sm text-slate-300">Safety Analysis Awaiting</h3>
                <p className="text-xs text-slate-500 mt-1">Calculations and safety gauges will load once the routing engine completes analysis.</p>
              </div>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}
