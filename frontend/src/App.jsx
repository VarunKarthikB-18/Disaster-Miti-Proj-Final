import React, { useState } from 'react';
import { useGIS } from './hooks/useGIS';
import { MapComponent } from './components/MapComponent';
import { TabBar } from './components/TabBar';
import { IncidentsPanel } from './components/IncidentsPanel';
import { SheltersPanel } from './components/SheltersPanel';
import { ChatPanel } from './components/ChatPanel';
import { Crosshair } from 'lucide-react';
import './index.css';

function App() {
  const { shelters, sosAlerts, activeIncidents, resolveSOS, setLocation, reportSOS } = useGIS();
  const [activeTab, setActiveTab] = useState('map');
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
        setUserLocation([12.8231, 80.0444]); // Fallback: Chennai area
        setLocation(12.8231, 80.0444);
        setIsLocating(false);
      });
    } else {
      setUserLocation([12.8231, 80.0444]);
      setLocation(12.8231, 80.0444);
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
    <div className="relative w-screen h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans select-none">
      
      {/* Full-Screen Map */}
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

      {/* Top Status Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-bold text-white tracking-wide">RESPONSE HUB</span>
          <div className="w-px h-4 bg-white/10"></div>
          <span className="text-xs text-gray-400">{activeIncidents} alerts</span>
        </div>
      </div>

      {/* Slide-Up Panels */}
      <IncidentsPanel 
        isActive={activeTab === 'incidents'}
        sosAlerts={sosAlerts}
        selectedSOS={selectedSOS}
        onSOSClick={handleSOSClick}
        onDispatch={handleDispatch}
      />
      <SheltersPanel 
        isActive={activeTab === 'shelters'}
        shelters={shelters}
        selectedShelter={selectedShelter}
        onShelterClick={handleShelterClick}
        userLocation={userLocation}
        reportSOS={reportSOS}
      />
      <ChatPanel isActive={activeTab === 'chat'} />

      {/* iOS Tab Bar */}
      <TabBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        incidentCount={activeIncidents}
      />
    </div>
  );
}

export default App;
