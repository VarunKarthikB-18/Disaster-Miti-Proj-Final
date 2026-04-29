import { useState, useCallback, useEffect } from 'react';
import ReactUseWebSocket from 'react-use-websocket';
const useWebSocket = ReactUseWebSocket.default || ReactUseWebSocket;

const WS_URL = 'ws://localhost:8000/ws/simulation';

export function useSimulation() {
  const [grid, setGrid] = useState([]);
  const [predictionGrid, setPredictionGrid] = useState([]);
  const [wind, setWind] = useState('N');
  const [running, setRunning] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionSteps, setPredictionSteps] = useState(30);

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === 'STATE_UPDATE') {
        setGrid(lastJsonMessage.grid);
        setWind(lastJsonMessage.wind);
        setRunning(lastJsonMessage.running);
        
        // If predicting, request a new prediction on every state update
        if (isPredicting) {
            sendJsonMessage({ action: 'predict', steps: predictionSteps });
        }
      } else if (lastJsonMessage.type === 'PREDICTION_RESULT') {
        setPredictionGrid(lastJsonMessage.grid);
      }
    }
  }, [lastJsonMessage, isPredicting, predictionSteps, sendJsonMessage]);

  const togglePlay = useCallback(() => {
    sendJsonMessage({ action: 'toggle_play' });
  }, [sendJsonMessage]);

  const reset = useCallback(() => {
    sendJsonMessage({ action: 'reset' });
  }, [sendJsonMessage]);

  const togglePrediction = useCallback(() => {
    setIsPredicting(prev => {
        const next = !prev;
        if (next) {
            sendJsonMessage({ action: 'predict', steps: predictionSteps });
        } else {
            setPredictionGrid([]);
        }
        return next;
    });
  }, [sendJsonMessage, predictionSteps]);

  const updatePredictionSteps = useCallback((steps) => {
      setPredictionSteps(steps);
      if (isPredicting) {
          sendJsonMessage({ action: 'predict', steps });
      }
  }, [isPredicting, sendJsonMessage]);

  return {
    grid,
    predictionGrid,
    wind,
    running,
    isPredicting,
    predictionSteps,
    togglePlay,
    reset,
    togglePrediction,
    updatePredictionSteps
  };
}
