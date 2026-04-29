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
    
    # Default fallback
    response = "I am your Disaster Mitigation Assistant. Try asking me about 'finding a shelter', 'getting directions', or protocol for 'floods' or 'earthquakes'."
    
    # Keyword clusters
    if any(word in msg for word in ["shelter", "safe", "where to go", "nearest", "spot", "location", "go to"]):
        response = "To reach the nearest safe spot, look at the 'Nearest Rescue Spots' list on the left side of your screen. Click on any shelter there, and I will instantly draw the fastest street route for you on the map!"
    elif any(word in msg for word in ["direction", "directions", "route", "reach", "path", "how do i"]):
        response = "I can help you navigate! Just click on any green shelter marker on the map or select one from the 'Nearest Rescue Spots' sidebar list. A glowing green route will be drawn from your live location directly to the shelter using real street data."
    elif any(word in msg for word in ["flood", "water"]):
        response = "Flood Warning Protocol: Immediately move to higher ground. Avoid walking or driving through floodwaters. Select a shelter on the map to find the safest route."
    elif any(word in msg for word in ["earthquake", "quake"]):
        response = "Earthquake Protocol: Drop, Cover, and Hold On. Stay indoors until the shaking stops. If you are outdoors, move away from buildings and streetlights."
    elif any(word in msg for word in ["fire", "wildfire", "smoke"]):
        response = "Wildfire Protocol: Evacuate immediately. Use the map to find the nearest shelter and click it to generate a safe driving route away from the danger zone."
    elif any(word in msg for word in ["help", "sos", "emergency", "danger", "stuck", "trapped", "injured"]):
        response = "If you are in immediate danger, please click the red 'Report Emergency Here' button in the Action Center (bottom left). This will instantly drop an SOS pin at your exact GPS coordinates and alert rescue teams!"
    elif any(word in msg for word in ["hello", "hi", "hey"]):
        response = "Hello! I am your AI Assistant. I can help you find nearby shelters, get directions, or guide you through emergency protocols. What do you need?"

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
