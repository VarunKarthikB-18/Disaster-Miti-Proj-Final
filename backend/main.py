import asyncio
import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from gis_engine import GISEngine

load_dotenv()

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
                
        await asyncio.sleep(2)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())

class ChatMessage(BaseModel):
    message: str
    api_key: str = ""

SYSTEM_PROMPT = """You are an AI Disaster Mitigation Assistant embedded in a real-time emergency response dashboard. 
You help users during natural disasters by:
- Giving emergency protocols for floods, earthquakes, fires, cyclones, tsunamis
- Guiding them to the nearest shelter using the dashboard's map features
- Providing first aid instructions
- Advising on evacuation procedures
- Answering general disaster preparedness questions

Keep responses concise (2-4 sentences max), clear, and actionable. 
If someone asks about reaching a shelter or directions, tell them to click on a shelter in the 'Nearest Rescue Spots' panel on the left sidebar to see street-level directions on the map.
Always prioritize safety. Be calm and reassuring."""

@app.post("/api/chat")
async def chat_endpoint(chat: ChatMessage):
    msg = chat.message.strip()
    
    # Use provided key or fall back to env key
    api_key = chat.api_key or os.getenv("GEMINI_API_KEY", "")
    
    # If API key is available, use Gemini
    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            
            # Try models in order of preference
            models = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"]
            last_error = None
            for model in models:
                try:
                    response = client.models.generate_content(
                        model=model,
                        contents=[
                            {"role": "user", "parts": [{"text": SYSTEM_PROMPT + "\n\nUser question: " + msg}]}
                        ]
                    )
                    return {"reply": response.text}
                except Exception as model_err:
                    last_error = model_err
                    continue
            
            # All models failed — fall through to keyword engine
            pass
        except Exception as e:
            # Fall through to keyword engine
            pass
    
    # Fallback: smart keyword matching
    msg_lower = msg.lower()
    response = "I'm your Disaster Assistant. Try asking about 'shelters', 'directions', 'floods', or 'earthquakes'. For smarter responses, add your Gemini API key in settings."
    
    if any(w in msg_lower for w in ["shelter", "safe", "nearest", "spot", "where", "go to"]):
        response = "Click any shelter in the 'Nearest Rescue Spots' panel on the left. A green route will be drawn on the map showing you the fastest street-level path to safety!"
    elif any(w in msg_lower for w in ["direction", "route", "reach", "path", "how do i", "navigate"]):
        response = "To get directions: click a green shelter dot on the map or select one from the 'Nearest Rescue Spots' sidebar. The system will calculate real road directions instantly."
    elif any(w in msg_lower for w in ["flood", "water", "rain"]):
        response = "Flood Protocol: Move to higher ground immediately. Don't walk or drive through floodwaters. Use the map to locate the nearest elevated shelter."
    elif any(w in msg_lower for w in ["earthquake", "quake", "tremor"]):
        response = "Earthquake Protocol: Drop, Cover, Hold On. Stay indoors until shaking stops. Move away from windows and heavy objects."
    elif any(w in msg_lower for w in ["fire", "wildfire", "smoke", "burn"]):
        response = "Fire Protocol: Evacuate immediately. Cover your nose with a damp cloth. Use the map to find the nearest shelter away from the fire zone."
    elif any(w in msg_lower for w in ["cyclone", "hurricane", "storm", "wind"]):
        response = "Cyclone Protocol: Move to the strongest, innermost room. Stay away from windows. If near the coast, evacuate inland immediately."
    elif any(w in msg_lower for w in ["help", "sos", "emergency", "danger", "stuck", "trapped"]):
        response = "Click the red 'Report Emergency Here' button in the Action Center. This drops an SOS pin at your GPS location and alerts rescue teams!"
    elif any(w in msg_lower for w in ["first aid", "injury", "bleeding", "cpr", "medical"]):
        response = "Basic First Aid: Apply pressure to stop bleeding. For burns, run cool water for 10 min. For choking, perform the Heimlich maneuver. Call emergency services."
    elif any(w in msg_lower for w in ["hello", "hi", "hey", "good"]):
        response = "Hello! I'm your Disaster AI Assistant. I can help with emergency protocols, finding shelters, or getting directions. What do you need?"
    
    await asyncio.sleep(0.5)
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
