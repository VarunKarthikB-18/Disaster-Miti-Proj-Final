import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from gis_engine import GISEngine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = GISEngine()
clients = []

async def simulation_loop():
    while True:
        if engine.running:
            engine.step()
            state = engine.get_state()
            state["type"] = "STATE_UPDATE"
            
            disconnected = []
            for client in clients:
                try:
                    await client.send_text(json.dumps(state))
                except:
                    disconnected.append(client)
                    
            for client in disconnected:
                clients.remove(client)
                
        await asyncio.sleep(2) # 2 seconds tick for map updates

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())

@app.websocket("/ws/gis")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    
    init_state = engine.get_state()
    init_state["type"] = "STATE_UPDATE"
    await websocket.send_text(json.dumps(init_state))
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("action") == "resolve_sos":
                sos_id = message.get("sos_id")
                engine.resolve_sos(sos_id)
                state = engine.get_state()
                state["type"] = "STATE_UPDATE"
                await websocket.send_text(json.dumps(state))
                
    except WebSocketDisconnect:
        if websocket in clients:
            clients.remove(websocket)
