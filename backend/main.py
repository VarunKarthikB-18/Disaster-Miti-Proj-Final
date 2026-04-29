import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
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

class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_endpoint(chat: ChatMessage):
    msg = chat.message.lower()
    response = "I am your Disaster Mitigation Assistant. How can I help you today?"
    
    if "shelter" in msg or "safe" in msg or "where to go" in msg:
        response = "There are safe shelters marked in green on your map. You can view their live capacity and resources by clicking on them. Use the 'Nearest Rescue Spots' panel to find the closest one to you."
    elif "flood" in msg or "water" in msg:
        response = "Flood Warning Protocol: Immediately move to higher ground. Avoid walking or driving through floodwaters. Follow the designated evacuation routes on the map."
    elif "earthquake" in msg:
        response = "Earthquake Protocol: Drop, Cover, and Hold On. Stay indoors until the shaking stops. If you are outdoors, move away from buildings and streetlights. Report your status using the 'Report Emergency' button if you need help."
    elif "fire" in msg:
        response = "Wildfire Protocol: Evacuate immediately if instructed. Use the glowing white routes on the map, which automatically calculate paths avoiding fire zones."
    elif "help" in msg or "sos" in msg or "emergency" in msg:
        response = "If you are in immediate danger, please use the red 'Report Emergency Here' button in the Action Center. This will instantly alert nearby rescue teams to your exact location."
    
    # Simulate thinking delay
    await asyncio.sleep(1)
    return {"reply": response}

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
                
            elif message.get("action") == "set_location":
                lat = message.get("lat")
                lng = message.get("lng")
                engine.set_center(lat, lng)
                state = engine.get_state()
                state["type"] = "STATE_UPDATE"
                await websocket.send_text(json.dumps(state))
                
            elif message.get("action") == "report_sos":
                lat = message.get("lat")
                lng = message.get("lng")
                emergency_type = message.get("emergency_type")
                engine.report_sos(lat, lng, emergency_type)
                state = engine.get_state()
                state["type"] = "STATE_UPDATE"
                await websocket.send_text(json.dumps(state))
                
    except WebSocketDisconnect:
        if websocket in clients:
            clients.remove(websocket)
