import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Navigation, 
  Locate, 
  ArrowLeftRight, 
  Compass, 
  HelpCircle,
  Loader2
} from 'lucide-react';

export default function SearchBar({
  source,
  setSource,
  destination,
  setDestination,
  sourceText,
  setSourceText,
  destText,
  setDestText,
  sourceSuggestions,
  setSourceSuggestions,
  destSuggestions,
  setDestSuggestions,
  activeSuggestionBox,
  setActiveSuggestionBox,
  activePinMode,
  setActivePinMode,
  PRESETS,
  handleApplyPreset,
  handleDetectLocation,
  handleSwapLocations,
  handleInputChange,
  formatLocationName,
  handleCalculateRoutes,
  loading
}) {
  return (
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
            className={`p-2 rounded-lg border text-sm font-medium transition-all active:scale-95 ${
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
          <HelpCircle className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
          <div>
            <span className="font-bold">Interactive Pin Mode: </span>
            Click anywhere directly on the map to set your {activePinMode} point.
          </div>
        </div>
      )}

      {/* Main Calculate Routes Action Button */}
      <button 
        onClick={() => handleCalculateRoutes()}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing Safety Data...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Calculate Safest Routes
          </>
        )}
      </button>
    </div>
  );
}
