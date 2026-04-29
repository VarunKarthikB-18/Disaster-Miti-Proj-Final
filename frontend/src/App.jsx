import React, { useState } from 'react';
import { useGIS } from './hooks/useGIS';
import { MapComponent } from './components/MapComponent';
import { Chatbot } from './components/Chatbot';
import { Shield, AlertTriangle, Truck, CheckCircle2, Navigation, Crosshair, PhoneCall, MapPin } from 'lucide-react';
import './index.css';

// Helper to calculate distance in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2-lat1) * (Math.PI/180);
  var dLon = (lon2-lon1) * (Math.PI/180); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function App() {
  const { shelters, sosAlerts, activeIncidents, resolveSOS, setLocation, reportSOS } = useGIS();
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Get user location on mount
  React.useEffect(() => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);
        setLocation(lat, lng);
        setIsLocating(false);
      }, (error) => {
        console.error("Error getting location", error);
        // Fallback to default
        setUserLocation([20.5937, 78.9629]);
        setLocation(20.5937, 78.9629);
        setIsLocating(false);
      });
    } else {
      // Fallback to default
      setUserLocation([20.5937, 78.9629]);
      setLocation(20.5937, 78.9629);
      setIsLocating(false);
    }
  }, [setLocation]);

  const handleSOSClick = (sos) => {
    setSelectedSOS(sos);
    setSelectedShelter(null);
  };

  const handleShelterClick = (shelter) => {
    setSelectedShelter(shelter);
    setSelectedSOS(null);
  };

  const handleDispatch = () => {
    if (selectedSOS) {
      resolveSOS(selectedSOS.id);
      setSelectedSOS(null);
    }
  };

  return (
    <div className="flex w-screen h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      
      {/* Sidebar Dashboard */}
      <aside className="w-96 bg-[#111111] border-r border-white/10 flex flex-col z-10 shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-blue-500" size={28} />
            <h1 className="text-xl font-bold tracking-tight">Response Hub</h1>
          </div>
          <p className="text-sm text-gray-400">Intelligent Disaster Mitigation</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Active Alerts</div>
              <div className="text-3xl font-bold text-red-500">{activeIncidents}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Safe Shelters</div>
              <div className="text-3xl font-bold text-green-500">{shelters.length}</div>
            </div>
          </div>

          {/* Nearest Rescue Spots */}
          {userLocation && (
            <div>
              <h2 className="text-sm uppercase font-bold text-gray-400 mb-3 flex items-center gap-2">
                <MapPin size={16} /> Nearest Rescue Spots
              </h2>
              <div className="space-y-3">
                {shelters
                  .map(s => ({
                    ...s,
                    distance: getDistanceFromLatLonInKm(userLocation[0], userLocation[1], s.lat, s.lng)
                  }))
                  .sort((a, b) => a.distance - b.distance)
                  .map(shelter => (
                    <div 
                      key={shelter.id} 
                      onClick={() => handleShelterClick(shelter)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${
                        selectedShelter?.id === shelter.id ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-black/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm text-green-400">{shelter.name}</span>
                        <span className="text-xs font-mono text-gray-400">{shelter.distance.toFixed(1)} km away</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Capacity: {shelter.current_occupancy} / {shelter.capacity} people
                      </div>
                      {selectedShelter?.id === shelter.id && (
                        <div className="mt-2 text-xs text-green-400 flex items-center gap-1 font-bold">
                          <Navigation size={12} /> Directions highlighted on map
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Active Incident Feed */}
          <div>
            <h2 className="text-sm uppercase font-bold text-gray-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} /> Live Incident Feed
            </h2>
            <div className="space-y-3">
              {sosAlerts.slice().reverse().map(sos => (
                <div 
                  key={sos.id}
                  onClick={() => handleSOSClick(sos)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:bg-white/5 \${
                    selectedSOS?.id === sos.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-black/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{sos.type}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold \${
                      sos.status === 'Dispatched' ? 'bg-blue-500/20 text-blue-400' :
                      sos.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {sos.status === 'Dispatched' ? 'RESOLVED' : sos.priority}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Lat: {sos.lat.toFixed(4)}, Lng: {sos.lng.toFixed(4)}
                  </div>
                </div>
              ))}
              {sosAlerts.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No active incidents.</div>
              )}
            </div>
          </div>

        </div>

        {/* Dispatch Action Area */}
        <div className="p-6 border-t border-white/10 bg-black/40">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Action Center</h3>
          
          <div className="space-y-3">
            {selectedSOS ? (
              selectedSOS.status === 'Pending' ? (
                <button 
                  onClick={handleDispatch}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
                >
                  <Truck size={18} />
                  Dispatch Nearest Rescue
                </button>
              ) : (
                <button disabled className="w-full bg-green-900/50 text-green-500 font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 border border-green-500/30">
                  <CheckCircle2 size={18} />
                  Rescue Dispatched
                </button>
              )
            ) : (
              <div className="text-sm text-gray-500 flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
                <Navigation size={16} /> Select an incident to dispatch rescue teams.
              </div>
            )}

            {/* User Report Feature */}
            <button 
              onClick={() => {
                if (userLocation) {
                  reportSOS(userLocation[0], userLocation[1], "Citizen Distress Call");
                } else {
                  alert("Please allow location access to report an emergency.");
                }
              }}
              className="w-full bg-red-600/80 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all border border-red-500"
            >
              <PhoneCall size={18} />
              Report Emergency Here
            </button>
          </div>
        </div>
      </aside>

      {/* Map Area */}
      <main className="flex-1 relative">
        <MapComponent 
          shelters={shelters} 
          sosAlerts={sosAlerts} 
          selectedSOS={selectedSOS}
          selectedShelter={selectedShelter}
          onSOSClick={handleSOSClick}
          onShelterClick={handleShelterClick}
          userLocation={userLocation}
        />
        
        {/* Locating Toast */}
        {isLocating && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[400] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
            <Crosshair size={16} /> Locating your position...
          </div>
        )}
        
        {/* Floating Legend on Map */}
        <div className="absolute top-6 right-6 z-[400] bg-[#111] border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-md bg-opacity-80">
          <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">Map Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2ecc71] border border-white shadow-[0_0_8px_#2ecc71]"></div> Safe Shelter Base
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f1c40f] border border-white shadow-[0_0_8px_#f1c40f]"></div> Pending Incident
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#e74c3c] border border-white shadow-[0_0_8px_#e74c3c]"></div> Critical Incident
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3498db] border border-white shadow-[0_0_8px_#3498db]"></div> Dispatched Route
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
              <div className="w-3 h-3 rounded-full bg-[#9b59b6] border border-white shadow-[0_0_8px_#9b59b6]"></div> Your Live Location
            </div>
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  );
}

export default App;
