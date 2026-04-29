import React from 'react';
import { AlertTriangle, Truck, CheckCircle2 } from 'lucide-react';

export function IncidentsPanel({ isActive, sosAlerts, selectedSOS, onSOSClick, onDispatch }) {
  if (!isActive) return null;

  return (
    <div className="absolute bottom-20 left-0 right-0 h-[55vh] bg-[#111]/95 backdrop-blur-xl border-t border-white/10 z-20 flex flex-col rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] slide-up">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
        <AlertTriangle size={18} className="text-red-400" />
        <h2 className="font-bold text-white">Live Incident Feed</h2>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold ml-auto">
          {sosAlerts.filter(s => s.status === 'Pending').length} active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 custom-scrollbar">
        {sosAlerts.slice().reverse().map(sos => (
          <div 
            key={sos.id}
            onClick={() => onSOSClick(sos)}
            className={`p-4 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${
              selectedSOS?.id === sos.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-black/20'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-sm text-white">{sos.type}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
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
          <div className="text-sm text-gray-500 text-center py-8">No active incidents.</div>
        )}
      </div>

      {/* Action Footer */}
      {selectedSOS && selectedSOS.status === 'Pending' && (
        <div className="px-5 py-3 border-t border-white/10 bg-black/40">
          <button 
            onClick={onDispatch}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 transition-all"
          >
            <Truck size={18} />
            Dispatch Nearest Rescue
          </button>
        </div>
      )}
    </div>
  );
}
