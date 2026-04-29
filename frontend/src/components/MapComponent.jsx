import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function MapComponent({ shelters, sosAlerts, selectedSOS, selectedShelter, onSOSClick, onShelterClick, userLocation }) {
  const center = userLocation || [20.5937, 78.9629]; // Default India

  // Find nearest shelter for the selected SOS to draw a dispatch route
  const activeRoute = useMemo(() => {
    if (!selectedSOS) return null;
    
    // Simple distance calculation
    let nearest = shelters[0];
    let minDistance = Infinity;
    
    shelters.forEach(s => {
      const dist = Math.sqrt(Math.pow(s.lat - selectedSOS.lat, 2) + Math.pow(s.lng - selectedSOS.lng, 2));
      if (dist < minDistance) {
        minDistance = dist;
        nearest = s;
      }
    });

    if (nearest) {
      return [
        [nearest.lat, nearest.lng],
        [selectedSOS.lat, selectedSOS.lng]
      ];
    }
    return null;
  }, [selectedSOS, shelters]);

  const activeRouteToShelter = useMemo(() => {
    if (!selectedShelter || !userLocation) return null;
    return [
      userLocation,
      [selectedShelter.lat, selectedShelter.lng]
    ];
  }, [selectedShelter, userLocation]);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ width: '100%', height: '100%', background: '#0a0a0a' }}
        zoomControl={false}
      >
        <ChangeView center={center} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Shelters */}
        {shelters.map(shelter => (
          <CircleMarker 
            key={shelter.id} 
            center={[shelter.lat, shelter.lng]} 
            radius={8}
            pathOptions={{ color: '#ffffff', fillColor: '#2ecc71', fillOpacity: 0.9, weight: 2 }}
            eventHandlers={{
              click: () => onShelterClick(shelter),
            }}
          >
            <Popup className="custom-popup">
              <div className="font-sans text-sm p-1">
                <h3 className="font-bold text-lg mb-1">{shelter.name}</h3>
                <div className="text-gray-600 mb-2">Occupancy: {shelter.current_occupancy} / {shelter.capacity}</div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center gap-4">
                    <span>Food:</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width: `${shelter.resources.food}%`}}></div></div>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span>Water:</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: `${shelter.resources.water}%`}}></div></div>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span>Medical:</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{width: `${shelter.resources.medical}%`}}></div></div>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* User Location */}
        {userLocation && (
          <CircleMarker 
            center={userLocation} 
            radius={10}
            pathOptions={{ color: '#ffffff', fillColor: '#9b59b6', fillOpacity: 1, weight: 3 }}
            className="user-location-pulse"
          >
            <Popup className="custom-popup">
              <div className="font-bold text-sm">Your Location</div>
            </Popup>
          </CircleMarker>
        )}

        {/* SOS Alerts */}
        {sosAlerts.map(sos => {
          let fillColor = '#f1c40f'; // Med
          if (sos.status === 'Dispatched') fillColor = '#3498db';
          else if (sos.priority === 'High' || sos.priority === 'Critical') fillColor = '#e74c3c';

          return (
            <CircleMarker 
              key={sos.id} 
              center={[sos.lat, sos.lng]} 
              radius={7}
              pathOptions={{ color: '#ffffff', fillColor: fillColor, fillOpacity: 0.9, weight: 2 }}
              eventHandlers={{
                click: () => onSOSClick(sos),
              }}
              className="sos-marker-pulse"
            >
              <Popup className="custom-popup">
                <div className="font-sans p-1">
                  <div className="font-bold text-red-600 uppercase text-xs mb-1">SOS Alert</div>
                  <div className="font-semibold">{sos.type}</div>
                  <div className="text-xs text-gray-500 mt-1">Priority: {sos.priority}</div>
                  <div className="text-xs text-gray-500">Status: {sos.status}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Dispatch Route to SOS */}
        {activeRoute && (
          <Polyline 
            positions={activeRoute} 
            color="#3498db" 
            weight={4} 
            dashArray="10, 10" 
            className="animate-pulse"
          />
        )}

        {/* Escape Route to Shelter */}
        {activeRouteToShelter && (
          <Polyline 
            positions={activeRouteToShelter} 
            color="#2ecc71" 
            weight={4} 
            dashArray="10, 10" 
            className="animate-pulse"
          />
        )}
      </MapContainer>
    </div>
  );
}
