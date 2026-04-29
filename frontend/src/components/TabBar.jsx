import React from 'react';
import { Map, AlertTriangle, Shield, Bot } from 'lucide-react';

const tabs = [
  { id: 'map', label: 'Map', icon: Map },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'shelters', label: 'Shelters', icon: Shield },
  { id: 'chat', label: 'AI Chat', icon: Bot },
];

export function TabBar({ activeTab, setActiveTab, incidentCount }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-1">
      <div className="bg-[#111]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)] flex justify-around items-center px-2 py-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(isActive && tab.id !== 'map' ? 'map' : tab.id)}
              className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 relative ${
                isActive 
                  ? 'text-blue-400' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Active indicator pill */}
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-blue-500 rounded-full" />
              )}
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                {/* Incident badge */}
                {tab.id === 'incidents' && incidentCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {incidentCount > 9 ? '9+' : incidentCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-blue-400' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
