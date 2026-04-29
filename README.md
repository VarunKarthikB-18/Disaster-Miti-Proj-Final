# Dynamic Disaster Digital Twin System (Near Real-Time)

Near real-time (1Hz) **fire spread simulation** on a 40x40 city grid, with a fast **30–60 step prediction** overlay pushed to a React UI via WebSockets.

## Project structure

```
backend/
  main.py
  simulation.py
  models.py
  websocket.py
frontend/
  src/
    App.jsx
    Grid.jsx
    socket.js
```

## Run the backend (FastAPI + WebSocket)

From the repo root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Backend endpoints:
- `POST /start` / `POST /stop`
- `POST /prediction_horizon/{steps}` (10–60, UI uses 30–60)
- WebSocket: `ws://localhost:8000/ws`

## Run the frontend (Vite + React)

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the UI at `http://localhost:5173`.

## What you’ll see

- **Current state**: safe / affected / burning / destroyed (water shown as blue)
- **Prediction overlay**:
  - yellow: will be affected
  - red: critical (will burn / be destroyed)
- **Live inputs**: wind changes every ~10s, random new ignitions periodically
- **Extra**: evacuation path (BFS) drawn as small white squares
