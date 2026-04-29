import React from 'react';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function ControlBar({
  running,
  togglePlay,
  reset,
  isPredicting,
  togglePrediction,
  predictionSteps,
  updatePredictionSteps
}) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-card rounded-full px-6 py-3 flex items-center gap-6 z-50">
      
      {/* Play / Pause */}
      <button 
        onClick={togglePlay}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        title={running ? "Pause" : "Play"}
      >
        {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
      </button>

      {/* Reset */}
      <button 
        onClick={reset}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        title="Reset Simulation"
      >
        <RotateCcw size={20} />
      </button>

      <div className="w-px h-8 bg-white/20 mx-2"></div>

      {/* Prediction Toggle */}
      <div className="flex items-center gap-4">
        <button
            onClick={togglePrediction}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-colors font-medium text-sm",
                isPredicting ? "bg-[var(--color-affected)] text-black shadow-[0_0_15px_rgba(241,196,15,0.4)]" : "bg-white/10 text-white hover:bg-white/20"
            )}
        >
            <Activity size={18} />
            Prediction Mode
        </button>

        {isPredicting && (
            <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full">
                <span className="text-xs text-white/70 min-w-[40px]">{predictionSteps} steps</span>
                <input 
                    type="range" 
                    min="10" 
                    max="60" 
                    step="10"
                    value={predictionSteps}
                    onChange={(e) => updatePredictionSteps(parseInt(e.target.value))}
                    className="w-24 accent-[var(--color-affected)]"
                />
            </div>
        )}
      </div>
    </div>
  );
}
