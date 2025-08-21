// src/context/WorkoutContext.tsx
import React, { createContext, useCallback, useContext, useState } from 'react';

type Target = {
  type: 'pace' | 'hr' | 'cadence' | 'speed';
  min?: number;
  max?: number;
};

type Segment = {
  type: 'warmup' | 'run' | 'recovery' | 'cooldown';
  duration?: number; // seconds
  distance?: number; // meters
  targets?: Target[];
  repeat?: number;
  segments?: Segment[]; // nested segments for repeats
};

type Workout = {
  name: string;
  segments: Segment[];
};

type WorkoutState = 'idle' | 'running' | 'paused' | 'finished';

interface WorkoutContextType {
  workout: Workout | null;
  flatSegments: Segment[];
  currentIndex: number;
  progress: number; // seconds or meters completed in current segment
  state: WorkoutState;
  loadWorkout: (w: Workout) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skipNext: () => void;
  reset: () => void;
  tick: (delta: number) => void; // update progress externally (e.g. treadmill data or timer)
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// ---- Helpers ----
const flattenSegments = (segments: Segment[]): Segment[] => {
  const result: Segment[] = [];
  for (const seg of segments) {
    if (seg.repeat && seg.segments) {
      for (let i = 0; i < seg.repeat; i++) {
        result.push(...flattenSegments(seg.segments));
      }
    } else {
      result.push(seg);
    }
  }
  return result;
};

// ---- Provider ----
export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [flatSegments, setFlatSegments] = useState<Segment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<WorkoutState>('idle');

  const loadWorkout = (w: Workout) => {
    setWorkout(w);
    setFlatSegments(flattenSegments(w.segments));
    setCurrentIndex(0);
    setProgress(0);
    setState('idle');
  };

  const start = () => {
    if (!workout) return;
    setState('running');
  };

  const pause = () => setState('paused');
  const resume = () => setState('running');

  const skipNext = () => {
    setCurrentIndex((i) => Math.min(i + 1, flatSegments.length - 1));
    setProgress(0);
  };

  const reset = () => {
    setCurrentIndex(0);
    setProgress(0);
    setState('idle');
  };

  const tick = useCallback(
    (delta: number) => {
      if (state !== 'running') return;
      const current = flatSegments[currentIndex];
      if (!current) return;

      const limit = current.duration ?? current.distance ?? 0;
      const nextProgress = progress + delta;

      if (limit && nextProgress >= limit) {
        // move to next
        if (currentIndex < flatSegments.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setProgress(0);
        } else {
          setState('finished');
        }
      } else {
        setProgress(nextProgress);
      }
    },
    [state, progress, currentIndex, flatSegments]
  );

  return (
    <WorkoutContext.Provider
      value={{
        workout,
        flatSegments,
        currentIndex,
        progress,
        state,
        loadWorkout,
        start,
        pause,
        resume,
        skipNext,
        reset,
        tick,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

// ---- Hook ----
export const useWorkout = () => {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout must be used within a WorkoutProvider');
  return ctx;
};
