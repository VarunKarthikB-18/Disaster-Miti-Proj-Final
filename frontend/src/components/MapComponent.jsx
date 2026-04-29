import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const shelterIcon = createCustomIcon('#2ecc71');
const sosIconHigh = createCustomIcon('#e74c3c');
const sosIconMed = createCustomIcon('#f1c40f');
const sosIconDispatched = createCustomIcon('#3498db');
const userIcon = createCustomIcon('#9b59b6');

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function MapComponent({ shelters, sosAlerts, selectedSOS, onSOSClick, userLocation }) {
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
          <Marker 
            key={shelter.id} 
            position={[shelter.lat, shelter.lng]} 
            icon={shelterIcon}
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
          </Marker>
        ))}

        {/* User Location */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup className="custom-popup">
              <div className="font-bold text-sm">Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* SOS Alerts */}
        {sosAlerts.map(sos => {
          let icon = sosIconMed;
          if (sos.status === 'Dispatched') icon = sosIconDispatched;
          else if (sos.priority === 'High' || sos.priority === 'Critical') icon = sosIconHigh;

          return (
            <Marker 
              key={sos.id} 
              position={[sos.lat, sos.lng]} 
              icon={icon}
              eventHandlers={{
                click: () => onSOSClick(sos),
              }}
            >
              <Popup className="custom-popup">
                <div className="font-sans p-1">
                  <div className="font-bold text-red-600 uppercase text-xs mb-1">SOS Alert</div>
                  <div className="font-semibold">{sos.type}</div>
                  <div className="text-xs text-gray-500 mt-1">Priority: {sos.priority}</div>
                  <div className="text-xs text-gray-500">Status: {sos.status}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Dispatch Route */}
        {activeRoute && (
          <Polyline 
            positions={activeRoute} 
            color="#3498db" 
            weight={4} 
            dashArray="10, 10" 
            className="animate-pulse"
          />
        )}
      </MapContainer>
    </div>
  );
}
