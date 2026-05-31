import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, 
  Lightbulb, 
  Compass, 
  Phone,
  AlertTriangle,
  Loader2
} from 'lucide-react';

import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import RouteCard from '../components/RouteCard';
import SafetyScore from '../components/SafetyScore';
import SafetyChatbot from '../components/SafetyChatbot';
import { geocodeSearch, fetchRoutes } from '../services/api';


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

export default function Home() {
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

  // Fetch coordinates using Geocoding service
  const handleGeocodeSearch = async (text, type) => {
    if (!text.trim()) return;
    try {
      const data = await geocodeSearch(text);
      if (type === 'source') {
        setSourceSuggestions(data);
        setActiveSuggestionBox('source');
      } else {
        setDestSuggestions(data);
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
    
    const hasValidSource = customSource && typeof customSource === 'object' && 'lat' in customSource && customSource.lat !== undefined;
    const hasValidDest = customDest && typeof customDest === 'object' && 'lat' in customDest && customDest.lat !== undefined;
    
    let activeSrc = hasValidSource ? customSource : source;
    let activeDst = hasValidDest ? customDest : destination;

    // 1. On-the-fly geocoding for Source if only text is present
    if (!activeSrc && sourceText && sourceText.trim().length > 0) {
      try {
        const data = await geocodeSearch(sourceText);
        if (data && data.length > 0) {
          const item = data[0];
          const formatted = formatLocationName(item.display_name);
          activeSrc = { name: formatted, lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
          setSource(activeSrc);
          setSourceText(formatted);
        } else {
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
        const data = await geocodeSearch(destText);
        if (data && data.length > 0) {
          const item = data[0];
          const formatted = formatLocationName(item.display_name);
          activeDst = { name: formatted, lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
          setDestination(activeDst);
          setDestText(formatted);
        } else {
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
      const data = await fetchRoutes(activeSrc, activeDst);
      const routesList = (data && Array.isArray(data.routes)) ? data.routes : [];
      setRoutes(routesList);
      setRoutingSource(data ? data.routing_source : '');
      
      if (routesList.length > 0) {
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

  // Pan map and focus a facility
  const handleLocateFacility = (fac) => {
    setHighlightedFacility(fac);
  };

  // Calculate initial route on load
  useEffect(() => {
    handleCalculateRoutes();
  }, []);

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
          
          <SearchBar 
            source={source}
            setSource={setSource}
            destination={destination}
            setDestination={setDestination}
            sourceText={sourceText}
            setSourceText={setSourceText}
            destText={destText}
            setDestText={setDestText}
            sourceSuggestions={sourceSuggestions}
            setSourceSuggestions={setSourceSuggestions}
            destSuggestions={destSuggestions}
            setDestSuggestions={setDestSuggestions}
            activeSuggestionBox={activeSuggestionBox}
            setActiveSuggestionBox={setActiveSuggestionBox}
            activePinMode={activePinMode}
            setActivePinMode={setActivePinMode}
            PRESETS={PRESETS}
            handleApplyPreset={handleApplyPreset}
            handleDetectLocation={handleDetectLocation}
            handleSwapLocations={handleSwapLocations}
            handleInputChange={handleInputChange}
            formatLocationName={formatLocationName}
            handleCalculateRoutes={handleCalculateRoutes}
            loading={loading}
          />

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
                {routes.map((route) => (
                  <RouteCard 
                    key={route.id}
                    route={route}
                    activeRoute={activeRoute}
                    setActiveRoute={setActiveRoute}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Middle Map Section (Col span 6) */}
        <section className="xl:col-span-6 relative flex flex-col min-h-[400px] xl:min-h-0 bg-slate-900 border-r border-slate-800 overflow-hidden">
          <MapView 
            source={source}
            destination={destination}
            routes={routes}
            activeRoute={activeRoute}
            setActiveRoute={setActiveRoute}
            activePinMode={activePinMode}
            handlePinSetFromMap={handlePinSetFromMap}
            showLayers={showLayers}
            setShowLayers={setShowLayers}
            highlightedFacility={highlightedFacility}
            legendOpen={legendOpen}
            setLegendOpen={setLegendOpen}
          />
        </section>

        {/* Right Info & Analytics Dashboard (Col span 3) */}
        <section className="xl:col-span-3 border-l border-slate-800 bg-slate-950/80 p-5 overflow-y-auto flex flex-col gap-5 glass-panel">
          <SafetyScore 
            activeRoute={activeRoute}
            handleLocateFacility={handleLocateFacility}
          />
        </section>

      </main>
      
      {/* Floating AI Safety Assistant Chatbot */}
      <SafetyChatbot source={source} destination={destination} activeRoute={activeRoute} />
    </div>
  );
}
