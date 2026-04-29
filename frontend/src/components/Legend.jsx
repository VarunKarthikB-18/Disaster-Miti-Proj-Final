import React, { useState } from 'react';
import { Info, X, MousePointerClick, Route, Activity, Wind } from 'lucide-react';

export function Legend() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-24 right-8 glass-card p-3 rounded-full text-white/70 hover:text-white transition-colors z-40"
        title="Show Guide"
      >
        <Info size={24} />
      </button>
    );
  }

  return (
    <div className="fixed top-24 right-8 w-80 glass-card rounded-2xl p-5 z-40 text-white shadow-2xl border border-white/10 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Info size={18} className="text-[var(--color-safe)]" />
          Quick Guide
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 text-sm text-white/80">
        
        <div className="flex gap-3">
          <Wind className="shrink-0 text-white/50 mt-0.5" size={16} />
          <p>The simulation models real-time fire spread heavily influenced by the changing <strong>Wind Direction</strong> at the top right.</p>
        </div>

        <div className="flex gap-3">
          <MousePointerClick className="shrink-0 text-white/50 mt-0.5" size={16} />
          <p><strong>Click any dot</strong> to inspect its status and risk level.</p>
        </div>

        <div className="flex gap-3">
          <Route className="shrink-0 text-white/50 mt-0.5" size={16} />
          <p>From the inspection card, select <strong>"Set Evacuation Start"</strong> to compute the safest escape route around the fire (white glowing line).</p>
        </div>

        <div className="flex gap-3">
          <Activity className="shrink-0 text-[var(--color-affected)] mt-0.5" size={16} />
          <p>Toggle <strong>Prediction Mode</strong> at the bottom to forecast future spread trajectories.</p>
        </div>

      </div>

      <div className="mt-5 pt-4 border-t border-white/10">
        <div className="text-xs text-white/50 mb-2 uppercase tracking-wider font-bold">Dot Legend</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[rgba(46,204,113,0.8)] shadow-[0_0_5px_rgba(46,204,113,0.8)]"></div> Safe
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#f1c40f] shadow-[0_0_5px_rgba(241,196,15,0.8)]"></div> Affected
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff4757] shadow-[0_0_8px_rgba(255,71,87,1)]"></div> Burning
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2f3640]"></div> Destroyed
          </div>
        </div>
      </div>
    </div>
  );
}
