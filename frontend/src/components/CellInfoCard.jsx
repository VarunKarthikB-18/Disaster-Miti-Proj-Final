import React from 'react';
import { MapPin, ShieldAlert, Flame, Home, Route } from 'lucide-react';

export function CellInfoCard({ cell, setEvacuationStart, close }) {
  if (!cell) return null;

  const { x, y, state } = cell;

  const stateInfo = {
    0: { label: 'Safe', color: 'text-[var(--color-safe)]', risk: 'Low (0-5%)', icon: <Home size={18} />, time: '> 10 mins' },
    1: { label: 'Affected', color: 'text-[var(--color-affected)]', risk: 'Medium (30-60%)', icon: <ShieldAlert size={18} />, time: '2 - 5 mins' },
    2: { label: 'Burning', color: 'text-[var(--color-burning)]', risk: 'Critical (100%)', icon: <Flame size={18} />, time: 'Immediate' },
    3: { label: 'Destroyed', color: 'text-[var(--color-destroyed)]', risk: 'N/A', icon: <MapPin size={18} />, time: 'N/A' },
  };

  const info = stateInfo[state];

  return (
    <div className="absolute top-24 left-8 w-72 glass-card rounded-2xl p-5 z-40 text-white shadow-2xl border border-white/10 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 text-white/60 text-sm font-mono bg-black/40 px-2 py-1 rounded">
          <MapPin size={14} />
          {x}, {y}
        </div>
        <button onClick={close} className="text-white/40 hover:text-white transition-colors">
          ✕
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl bg-black/40 ${info.color}`}>
          {info.icon}
        </div>
        <div>
          <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Current State</div>
          <div className={`text-xl font-bold ${info.color}`}>{info.label}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-xs text-white/50 mb-1">Risk Score</div>
          <div className="text-sm font-medium">{info.risk}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-xs text-white/50 mb-1">Est. Impact</div>
          <div className="text-sm font-medium">{info.time}</div>
        </div>
      </div>

      <button
        onClick={() => setEvacuationStart({x, y})}
        className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
      >
        <Route size={18} />
        Set as Evacuation Start
      </button>

    </div>
  );
}
