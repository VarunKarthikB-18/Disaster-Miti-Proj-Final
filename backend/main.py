import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from simulation import DisasterSimulation

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulation = DisasterSimulation(size=40)
clients = []

async def simulation_loop():
    while True:
        if simulation.running:
            simulation.step()
            state = simulation.get_state()
            state["type"] = "STATE_UPDATE"
            
            # Broadcast to all connected clients
            disconnected = []
            for client in clients:
                try:
                    await client.send_text(json.dumps(state))
                except:
                    disconnected.append(client)
                    
            for client in disconnected:
                clients.remove(client)
                
        await asyncio.sleep(1) # 1 tick per second

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())

@app.websocket("/ws/simulation")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    
    # Send initial state
    init_state = simulation.get_state()
    init_state["type"] = "STATE_UPDATE"
    await websocket.send_text(json.dumps(init_state))
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("action") == "toggle_play":
                simulation.running = not simulation.running
                state = simulation.get_state()
                state["type"] = "STATE_UPDATE"
                await websocket.send_text(json.dumps(state))
                
            elif message.get("action") == "reset":
                simulation.reset()
                state = simulation.get_state()
                state["type"] = "STATE_UPDATE"
                await websocket.send_text(json.dumps(state))
                
            elif message.get("action") == "predict":
                steps = message.get("steps", 30)
                prediction_grid = simulation.predict(steps=steps)
                await websocket.send_text(json.dumps({
                    "type": "PREDICTION_RESULT",
                    "grid": prediction_grid
                }))
                
    except WebSocketDisconnect:
        if websocket in clients:
            clients.remove(websocket)
