import numpy as np
import random
import asyncio

class DisasterSimulation:
    def __init__(self, size=40):
        self.size = size
        # States: 0=Safe, 1=Affected, 2=Burning, 3=Destroyed
        self.grid = np.zeros((size, size), dtype=int)
        
        # Initial fires
        self._ignite_random(3)
        
        # Wind: (dx, dy), labels
        self.wind_directions = [
            ((0, -1), "N"),
            ((1, -1), "NE"),
            ((1, 0), "E"),
            ((1, 1), "SE"),
            ((0, 1), "S"),
            ((-1, 1), "SW"),
            ((-1, 0), "W"),
            ((-1, -1), "NW")
        ]
        self.current_wind = random.choice(self.wind_directions)
        self.wind_ticks = 0
        
        self.base_prob = 0.08
        self.affected_threshold = 0.05
        
        self.running = True

    def _ignite_random(self, count):
        for _ in range(count):
            x, y = random.randint(5, self.size-6), random.randint(5, self.size-6)
            self.grid[y, x] = 2

    def reset(self):
        self.grid = np.zeros((self.size, self.size), dtype=int)
        self._ignite_random(3)
        self.current_wind = random.choice(self.wind_directions)
        self.wind_ticks = 0

    def step(self):
        if not self.running:
            return

        new_grid = self.grid.copy()
        
        # Wind change logic
        self.wind_ticks += 1
        if self.wind_ticks > random.randint(8, 12):
            self.current_wind = random.choice(self.wind_directions)
            self.wind_ticks = 0

        wx, wy = self.current_wind[0]

        for y in range(self.size):
            for x in range(self.size):
                state = self.grid[y, x]
                
                if state == 3:
                    continue  # Destroyed
                    
                if state == 2:
                    # Fire burns out to Destroyed over time (approx 20% chance per tick)
                    if random.random() < 0.2:
                        new_grid[y, x] = 3
                    continue

                if state == 0 or state == 1:
                    # Check neighbors
                    burning_neighbors = 0
                    wind_factor = 1.0
                    
                    for dy in [-1, 0, 1]:
                        for dx in [-1, 0, 1]:
                            if dx == 0 and dy == 0:
                                continue
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < self.size and 0 <= nx < self.size:
                                if self.grid[ny, nx] == 2:
                                    burning_neighbors += 1
                                    # If the neighbor is upwind from this cell, wind pushes fire here
                                    # Vector from neighbor to cell: (-dx, -dy)
                                    # If that matches wind direction, increase wind_factor
                                    if dx == -wx and dy == -wy:
                                        wind_factor += 2.0
                                    elif dx == -wx or dy == -wy:
                                        wind_factor += 0.5
                                        
                    if burning_neighbors > 0:
                        prob = self.base_prob * wind_factor * burning_neighbors
                        if prob > random.random():
                            new_grid[y, x] = 2
                        elif prob > self.affected_threshold and state == 0:
                            new_grid[y, x] = 1 # Affected

        self.grid = new_grid

    def predict(self, steps=30):
        # Simulate forward N steps returning only the grid state
        # without affecting the real grid
        sim_copy = self.grid.copy()
        wx, wy = self.current_wind[0]
        
        prediction_grid = np.zeros((self.size, self.size), dtype=int)
        
        for _ in range(steps):
            next_sim = sim_copy.copy()
            for y in range(self.size):
                for x in range(self.size):
                    if sim_copy[y, x] == 2:
                        if random.random() < 0.2:
                            next_sim[y, x] = 3
                        prediction_grid[y, x] = max(prediction_grid[y, x], 2)
                    elif sim_copy[y, x] in [0, 1]:
                        burning_neighbors = 0
                        wind_factor = 1.0
                        for dy in [-1, 0, 1]:
                            for dx in [-1, 0, 1]:
                                if dx == 0 and dy == 0: continue
                                ny, nx = y + dy, x + dx
                                if 0 <= ny < self.size and 0 <= nx < self.size:
                                    if sim_copy[ny, nx] == 2:
                                        burning_neighbors += 1
                                        if dx == -wx and dy == -wy:
                                            wind_factor += 2.0
                                        elif dx == -wx or dy == -wy:
                                            wind_factor += 0.5
                        if burning_neighbors > 0:
                            prob = self.base_prob * wind_factor * burning_neighbors
                            if prob > random.random():
                                next_sim[y, x] = 2
                                prediction_grid[y, x] = max(prediction_grid[y, x], 2)
                            elif prob > self.affected_threshold and sim_copy[y, x] == 0:
                                next_sim[y, x] = 1
                                prediction_grid[y, x] = max(prediction_grid[y, x], 1)
            sim_copy = next_sim
            
        return prediction_grid.tolist()

    def get_state(self):
        return {
            "grid": self.grid.tolist(),
            "wind": self.current_wind[1],
            "running": self.running
        }
