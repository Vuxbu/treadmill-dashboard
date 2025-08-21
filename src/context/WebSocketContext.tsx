import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

type Device = { name: string; id: string };

// Allow explicit null for “cleared” slots
type DeviceSelection = {
  runSpeed?: Device | null;
  cadence?: Device | null;
  heartRate?: Device | null;
};

type WebSocketContextType = {
  socket: WebSocket | null;
  connected: boolean;
  devices: DeviceSelection;
  connectMock: (selection: DeviceSelection) => void;
  disconnect: () => void;
  pairSingleDevice: (category: keyof DeviceSelection, device: Device) => void;
};

const Ctx = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<DeviceSelection>({});
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  const connectMock = (selection: DeviceSelection) => {
    setDevices(selection);
    // Fake/open socket
    if (!socketRef.current) {
      // @ts-ignore fake WS object for UI only
      socketRef.current = { readyState: 1 } as WebSocket;
    }
    setConnected(true); // in your flow, connectMock is only called when all three are set
  };

  const disconnect = () => {
    socketRef.current = null;
    setConnected(false);
    setDevices({
      runSpeed: null,
      cadence: null,
      heartRate: null,
    });
  };

  // ✅ Fix: compute next devices and connection status inside setter
  const pairSingleDevice = (category: keyof DeviceSelection, device: Device) => {
    setDevices((prev) => {
      const next: DeviceSelection = { ...prev, [category]: device };
      const allPaired = Boolean(next.runSpeed && next.cadence && next.heartRate);
      setConnected(allPaired);
      return next;
    });
  };

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      connected,
      devices,
      connectMock,
      disconnect,
      pairSingleDevice,
    }),
    [connected, devices]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useWS = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWS must be used within WebSocketProvider');
  return ctx;
};
