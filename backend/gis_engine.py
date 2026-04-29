import random
import time
import uuid
import math

# Center roughly around San Francisco for the demo
CENTER_LAT = 37.7749
CENTER_LNG = -122.4194

class GISEngine:
    def __init__(self):
        self.shelters = [
            {
                "id": str(uuid.uuid4()),
                "name": "Central Relief Base",
                "lat": 37.7749,
                "lng": -122.4194,
                "capacity": 500,
                "current_occupancy": 120,
                "resources": {"food": 85, "water": 90, "medical": 70} # Percentages
            },
            {
                "id": str(uuid.uuid4()),
                "name": "North District Shelter",
                "lat": 37.8044,
                "lng": -122.4220,
                "capacity": 300,
                "current_occupancy": 250,
                "resources": {"food": 40, "water": 50, "medical": 30}
            },
            {
                "id": str(uuid.uuid4()),
                "name": "South Safe Zone",
                "lat": 37.7510,
                "lng": -122.4080,
                "capacity": 400,
                "current_occupancy": 50,
                "resources": {"food": 95, "water": 95, "medical": 90}
            }
        ]
        
        self.sos_alerts = []
        # Pre-seed with some alerts
        for _ in range(5):
            self._generate_sos()
            
        self.running = True

    def _generate_sos(self):
        # Generate random point within ~5km radius
        radius_in_degrees = 5 / 111.0 # approx 111km per degree
        u = random.random()
        v = random.random()
        w = radius_in_degrees * math.sqrt(u)
        t = 2 * math.pi * v
        x = w * math.cos(t)
        y = w * math.sin(t)
        
        new_lat = CENTER_LAT + x
        new_lng = CENTER_LNG + y / math.cos(CENTER_LAT * math.pi / 180)
        
        priorities = ["High", "High", "Critical", "Medium"]
        types = ["Medical Emergency", "Trapped", "Evacuation Request", "Supply Needed"]
        
        self.sos_alerts.append({
            "id": str(uuid.uuid4()),
            "lat": new_lat,
            "lng": new_lng,
            "type": random.choice(types),
            "priority": random.choice(priorities),
            "timestamp": time.time(),
            "status": "Pending"
        })

    def step(self):
        if not self.running:
            return
            
        # Randomly generate new SOS alerts occasionally (10% chance per tick)
        if random.random() < 0.1:
            self._generate_sos()
            
        # Keep list manageable
        if len(self.sos_alerts) > 20:
            self.sos_alerts.pop(0)

        # Fluctuate shelter resources slightly to simulate real-time consumption
        for shelter in self.shelters:
            if random.random() < 0.3:
                shelter["resources"]["food"] = max(0, shelter["resources"]["food"] - random.randint(0, 2))
                shelter["resources"]["water"] = max(0, shelter["resources"]["water"] - random.randint(0, 2))
                shelter["current_occupancy"] = min(shelter["capacity"], shelter["current_occupancy"] + random.randint(0, 3))

    def resolve_sos(self, sos_id):
        for alert in self.sos_alerts:
            if alert["id"] == sos_id:
                alert["status"] = "Dispatched"
                break

    def get_state(self):
        return {
            "shelters": self.shelters,
            "sos_alerts": self.sos_alerts,
            "active_incidents": len([a for a in self.sos_alerts if a["status"] == "Pending"]),
            "running": self.running
        }
