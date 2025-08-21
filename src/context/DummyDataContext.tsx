import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export type Metrics = {
  t: number; // seconds since start
  distanceKm: number;
  speedKph: number;
  paceSecPerKm: number;
  hrBpm: number;
  cadenceSpm: number;
  inclinePct: number;
  powerW: number;
  calories: number;
};

type DummyCtx = {
  metrics: Metrics;
  reset: () => void;
  sessionType: 'interval' | 'threshold' | 'road' | 'just';
  setSessionType: (t: DummyCtx['sessionType']) => void;
};

const Ctx = createContext<DummyCtx | null>(null);

const BASE: Metrics = {
  t: 0,
  distanceKm: 0,
  speedKph: 8.0,
  paceSecPerKm: 450,
  hrBpm: 110,
  cadenceSpm: 160,
  inclinePct: 0.5,
  powerW: 220,
  calories: 0,
};

export const DummyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<Metrics>(BASE);
  const [sessionType, setSessionType] = useState<DummyCtx['sessionType']>('just');

  // Use correct type for browser setInterval
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = performance.now();

    timer.current = window.setInterval(() => {
      const dt = (performance.now() - start) / 1000;

      const effort =
        sessionType === 'interval'
          ? (Math.sin((dt / 30) * Math.PI) + 1) / 2 // 0..1
          : sessionType === 'threshold'
          ? 0.7 + 0.1 * Math.sin(dt / 20)
          : 0.5 + 0.1 * Math.sin(dt / 40);

      const speed = 7 + 6 * effort; // 7..13 kph
      const hr = 105 + Math.round(70 * effort);
      const cadence = 155 + Math.round(30 * effort);
      const incline = 0.5 + 2.5 * Math.max(0, Math.sin(dt / 50));
      const power = 180 + Math.round(180 * effort);
      const pace = 3600 / ((speed * 1000) / 1000); // sec/km
      const distance = metrics.distanceKm + speed / 3600; // km per second
      const calories = metrics.calories + power / 4184; // rough kJ->kcal

      setMetrics({
        t: Math.floor(dt),
        distanceKm: distance,
        speedKph: speed,
        paceSecPerKm: pace,
        hrBpm: hr,
        cadenceSpm: cadence,
        inclinePct: incline,
        powerW: power,
        calories,
      });
    }, 1000);

    // Cleanup
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [sessionType]);

  const reset = () => setMetrics(BASE);

  return (
    <Ctx.Provider value={{ metrics, reset, sessionType, setSessionType }}>{children}</Ctx.Provider>
  );
};

export const useDummy = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDummy must be used within DummyDataProvider');
  return ctx;
};
