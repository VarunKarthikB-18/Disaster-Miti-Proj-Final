import React, { useMemo, useCallback } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Simple BFS for Evacuation Path
function findEvacuationPath(start, grid) {
  const size = grid.length;
  if (!size) return [];
  
  const queue = [[start]];
  const visited = new Set();
  visited.add(`${start.x},${start.y}`);

  // Edge cells are considered safe evacuation exits
  const isExit = (x, y) => x === 0 || y === 0 || x === size - 1 || y === size - 1;
  const isSafe = (x, y) => grid[y][x] === 0 || grid[y][x] === 1;

  // Directions: N, S, E, W
  const dirs = [[0, -1], [0, 1], [1, 0], [-1, 0]];

  while (queue.length > 0) {
    const path = queue.shift();
    const curr = path[path.length - 1];

    if (isExit(curr.x, curr.y)) {
      return path;
    }

    for (let [dx, dy] of dirs) {
      const nx = curr.x + dx;
      const ny = curr.y + dy;
      
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        if (!visited.has(`${nx},${ny}`) && isSafe(nx, ny)) {
          visited.add(`${nx},${ny}`);
          queue.push([...path, { x: nx, y: ny }]);
        }
      }
    }
  }
  return []; // No path found
}

const Cell = React.memo(({ x, y, state, predState, isPathNode, onClick, onMouseEnter }) => {
  const stateClass = 
    state === 0 ? 'cell-safe' :
    state === 1 ? 'cell-affected' :
    state === 2 ? 'cell-burning' : 'cell-destroyed';

  const predClass = predState > 0 ? (predState === 2 ? 'cell-predicted-high' : 'cell-predicted') : '';

  return (
    <div
      className={cn(
        'w-full h-full rounded-sm cell cursor-pointer relative',
        stateClass,
        isPathNode && 'path-node'
      )}
      onClick={() => onClick(x, y)}
      onMouseEnter={(e) => onMouseEnter(e, x, y, state)}
    >
      {predState > 0 && <div className={cn('absolute inset-0 rounded-sm z-0', predClass)}></div>}
    </div>
  );
});

export function Grid({ grid, predictionGrid, onCellClick, onCellHover, evacuationStart }) {
  const size = grid.length;

  const path = useMemo(() => {
    if (!evacuationStart || !grid.length) return [];
    return findEvacuationPath(evacuationStart, grid);
  }, [evacuationStart, grid]);

  const pathSet = useMemo(() => {
    return new Set(path.map(p => `${p.x},${p.y}`));
  }, [path]);

  if (!size) return <div className="text-white">Loading simulation...</div>;

  return (
    <div 
      className="grid gap-[2px] p-4 rounded-3xl glass-card"
      style={{ 
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        width: 'min(75vh, 75vw)',
        height: 'min(75vh, 75vw)'
      }}
      onMouseLeave={() => onCellHover(null)}
    >
      {grid.map((row, y) =>
        row.map((cellState, x) => (
          <Cell 
            key={`${x}-${y}`} 
            x={x} 
            y={y} 
            state={cellState} 
            predState={predictionGrid[y]?.[x] || 0}
            isPathNode={pathSet.has(`${x},${y}`)}
            onClick={onCellClick}
            onMouseEnter={onCellHover}
          />
        ))
      )}
    </div>
  );
}
