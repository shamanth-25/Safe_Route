import React from 'react';
import { 
  Info, 
  CheckCircle2, 
  BarChart2, 
  Phone 
} from 'lucide-react';

export default function SafetyScore({
  activeRoute,
  handleLocateFacility
}) {
  if (!activeRoute) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center gap-2 p-8 border border-slate-850 bg-slate-900/10 rounded-xl text-center">
        <span className="text-xs text-slate-500">Select a route to display comprehensive safety scores and active rationales.</span>
      </div>
    );
  }

  return (
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
                <span className="text-[10px] text-blue-400 font-bold block">👮 CLOSEST SECURITY</span>
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
  );
}
