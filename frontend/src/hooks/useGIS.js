import { useState, useEffect, useCallback } from 'react';
import ReactUseWebSocket from 'react-use-websocket';

const useWebSocket = ReactUseWebSocket.default || ReactUseWebSocket;
const WS_URL = 'ws://localhost:8000/ws/gis';

export function useGIS() {
  const [shelters, setShelters] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState(0);

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastJsonMessage && lastJsonMessage.type === 'STATE_UPDATE') {
      setShelters(lastJsonMessage.shelters || []);
      setSosAlerts(lastJsonMessage.sos_alerts || []);
      setActiveIncidents(lastJsonMessage.active_incidents || 0);
    }
  }, [lastJsonMessage]);

  const resolveSOS = useCallback((sos_id) => {
    sendJsonMessage({ action: 'resolve_sos', sos_id });
  }, [sendJsonMessage]);

  const setLocation = useCallback((lat, lng) => {
    sendJsonMessage({ action: 'set_location', lat, lng });
  }, [sendJsonMessage]);

  const reportSOS = useCallback((lat, lng, emergency_type) => {
    sendJsonMessage({ action: 'report_sos', lat, lng, emergency_type });
  }, [sendJsonMessage]);

  return {
    shelters,
    sosAlerts,
    activeIncidents,
    resolveSOS,
    setLocation,
    reportSOS
  };
}
