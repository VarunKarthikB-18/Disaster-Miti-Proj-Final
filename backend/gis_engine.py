import random
import time
import uuid
import math

# Center roughly around San Francisco for the demo
CENTER_LAT = 37.7749
CENTER_LNG = -122.4194

class GISEngine:
    def __init__(self):
        self.center_lat = 20.5937 # Default India
        self.center_lng = 78.9629
        self.shelters = []
        self.sos_alerts = []
        self.running = True
        self._init_data()

    def set_center(self, lat, lng):
        self.center_lat = lat
        self.center_lng = lng
        self._init_data()

    def _init_data(self):
        self.shelters = []
        self.sos_alerts = []
        # Generate 3 shelters around center
        for i in range(3):
            self.shelters.append({
                "id": str(uuid.uuid4()),
                "name": f"Relief Base {['Alpha', 'Beta', 'Gamma'][i]}",
                "lat": self.center_lat + random.uniform(-0.05, 0.05),
                "lng": self.center_lng + random.uniform(-0.05, 0.05),
                "capacity": random.randint(300, 600),
                "current_occupancy": random.randint(50, 200),
                "resources": {"food": random.randint(50, 100), "water": random.randint(50, 100), "medical": random.randint(40, 100)}
            })
        for _ in range(3):
            self._generate_sos()

    def _generate_sos(self):
        # Generate random point within ~5km radius
        radius_in_degrees = 5 / 111.0 # approx 111km per degree
        u = random.random()
        v = random.random()
        w = radius_in_degrees * math.sqrt(u)
        t = 2 * math.pi * v
        x = w * math.cos(t)
        y = w * math.sin(t)
        
        new_lat = self.center_lat + x
        new_lng = self.center_lng + y / math.cos(self.center_lat * math.pi / 180)
        
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

    def report_sos(self, lat, lng, emergency_type):
        self.sos_alerts.append({
            "id": str(uuid.uuid4()),
            "lat": lat,
            "lng": lng,
            "type": emergency_type,
            "priority": "Critical",
            "timestamp": time.time(),
            "status": "Pending",
            "is_user": True
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
