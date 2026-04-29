import React, { useState, useCallback } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { Grid } from './components/Grid';
import { ControlBar } from './components/ControlBar';
import { CellInfoCard } from './components/CellInfoCard';
import { Legend } from './components/Legend';
import { Wind, Radio } from 'lucide-react';
import './index.css';

function App() {
  const {
    grid,
    predictionGrid,
    wind,
    running,
    isPredicting,
    predictionSteps,
    togglePlay,
    reset,
    togglePrediction,
    updatePredictionSteps
  } = useSimulation();

  const [selectedCell, setSelectedCell] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [evacuationStart, setEvacuationStart] = useState(null);

  const handleCellClick = useCallback((x, y) => {
    setSelectedCell({ x, y, state: grid[y][x] });
  }, [grid]);

  const handleCellHover = useCallback((e, x, y, state) => {
    if (e === null) {
      setHoverCell(null);
    } else {
      setHoverCell({ x, y, state });
    }
  }, []);

  return (
    <div className="relative w-screen h-screen bg-mesh overflow-hidden flex flex-col font-sans select-none">
      
      {/* Background ambient glow based on fire presence */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(231,76,60,0.05)] via-black to-black z-0 pointer-events-none"></div>

      {/* Top Bar */}
      <header className="relative z-20 flex justify-between items-center px-8 py-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${running ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${running ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">
            Disaster Digital Twin
          </h1>
          <span className="ml-2 px-2 py-0.5 rounded text-xs font-mono bg-white/10 text-white/50 border border-white/5">
            LIVE
          </span>
        </div>

        {/* Wind Indicator */}
        <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
          <Wind size={18} className="text-white/70" />
          <span className="text-sm font-medium text-white/80">Wind Direction:</span>
          <span className="text-base font-bold text-[var(--color-safe)] min-w-[2ch]">{wind}</span>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 pb-32 pt-8">
        <Grid 
          grid={grid}
          predictionGrid={predictionGrid}
          onCellClick={handleCellClick}
          onCellHover={handleCellHover}
          evacuationStart={evacuationStart}
        />

        {/* Tooltip on hover */}
        {hoverCell && !selectedCell && (
          <div className="fixed pointer-events-none glass text-white text-xs px-3 py-2 rounded-lg border border-white/10 shadow-2xl z-50 font-mono flex items-center gap-2 transform -translate-x-1/2 -translate-y-[150%]"
               style={{
                 left: '50%',
                 top: '15%'
               }}
          >
             <Radio size={12} className="text-[var(--color-affected)] animate-pulse" />
             [{hoverCell.x}, {hoverCell.y}] 
             <span className="ml-2 text-white/60">
                {hoverCell.state === 0 ? 'Safe' : hoverCell.state === 1 ? 'Affected' : hoverCell.state === 2 ? 'Burning' : 'Destroyed'}
             </span>
          </div>
        )}

      </main>

      {/* UI Overlays */}
      <CellInfoCard 
        cell={selectedCell} 
        close={() => setSelectedCell(null)} 
        setEvacuationStart={(start) => {
          setEvacuationStart(start);
          setSelectedCell(null);
        }}
      />

      <Legend />

      <ControlBar 
        running={running}
        togglePlay={togglePlay}
        reset={reset}
        isPredicting={isPredicting}
        togglePrediction={togglePrediction}
        predictionSteps={predictionSteps}
        updatePredictionSteps={updatePredictionSteps}
      />
      
    </div>
  );
}

export default App;
