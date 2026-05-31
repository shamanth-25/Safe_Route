import React from 'react';
import { 
  Award, 
  Lightbulb, 
  Shield, 
  Activity, 
  Pill, 
  Compass 
} from 'lucide-react';

export default function RouteCard({
  route,
  activeRoute,
  setActiveRoute
}) {
  const isSelected = activeRoute?.id === route.id;
  const isRecommended = route.recommendation_type === 'RECOMMENDED';
  const isModerate = route.recommendation_type === 'MODERATE';
  
  return (
    <div 
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
}
