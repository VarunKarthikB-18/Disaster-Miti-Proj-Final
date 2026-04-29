import React from 'react';
import { Shield, Navigation, PhoneCall } from 'lucide-react';

// Haversine distance
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function SheltersPanel({ isActive, shelters, selectedShelter, onShelterClick, userLocation, reportSOS }) {
  if (!isActive) return null;

  const enriched = shelters.map(s => ({
    ...s,
    distance: userLocation ? getDistanceKm(userLocation[0], userLocation[1], s.lat, s.lng) : null
  })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

  return (
    <div className="absolute bottom-20 left-0 right-0 h-[55vh] bg-[#111]/95 backdrop-blur-xl border-t border-white/10 z-20 flex flex-col rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] slide-up">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
        <Shield size={18} className="text-green-400" />
        <h2 className="font-bold text-white">Nearest Rescue Spots</h2>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold ml-auto">
          {shelters.length} available
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 custom-scrollbar">
        {enriched.map(shelter => (
          <div 
            key={shelter.id}
            onClick={() => onShelterClick(shelter)}
            className={`p-4 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${
              selectedShelter?.id === shelter.id ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-black/20'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm text-green-400">{shelter.name}</span>
              {shelter.distance !== null && (
                <span className="text-xs font-mono text-gray-400">{shelter.distance.toFixed(1)} km</span>
              )}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Capacity: {shelter.current_occupancy} / {shelter.capacity} people
            </div>
            {/* Resource Bars */}
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 mb-0.5">Food</div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{width: `${shelter.resources.food}%`}}></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 mb-0.5">Water</div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{width: `${shelter.resources.water}%`}}></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 mb-0.5">Medical</div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="bg-red-500 h-1.5 rounded-full transition-all" style={{width: `${shelter.resources.medical}%`}}></div>
                </div>
              </div>
            </div>

            {selectedShelter?.id === shelter.id && (
              <div className="mt-2 pt-2 border-t border-white/10 text-xs text-green-400 flex items-center gap-1 font-bold">
                <Navigation size={12} /> Route shown on map
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report Emergency Footer */}
      <div className="px-5 py-3 border-t border-white/10 bg-black/40">
        <button 
          onClick={() => {
            if (userLocation) {
              reportSOS(userLocation[0], userLocation[1], "Citizen Distress Call");
            } else {
              alert("Please allow location access.");
            }
          }}
          className="w-full bg-red-600/80 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 transition-all border border-red-500"
        >
          <PhoneCall size={18} />
          Report Emergency Here
        </button>
      </div>
    </div>
  );
}
