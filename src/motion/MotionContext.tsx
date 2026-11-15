import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface MotionState {
  motionOn: boolean;

  explicit: boolean;
  toggleMotion: () => void;
}

const MotionCtx = createContext<MotionState>({ motionOn: true, explicit: false, toggleMotion: () => {} });

const KEY = 'mogu:motion';
const read = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export function MotionProvider({ children }: { children: ReactNode }) {
  const [motionOn, setMotionOn] = useState(() => document.documentElement.dataset.motion !== 'off');
  const [explicit, setExplicit] = useState(() => read() !== null);

  useEffect(() => {
    document.documentElement.dataset.motion = motionOn ? 'on' : 'off';
  }, [motionOn]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      if (read() === null) setMotionOn(!mq.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleMotion = useCallback(() => {
    setMotionOn((on) => {
      const next = !on;
      try {
        localStorage.setItem(KEY, next ? 'on' : 'off');
      } catch {}
      return next;
    });
    setExplicit(true);
  }, []);

  return <MotionCtx.Provider value={{ motionOn, explicit, toggleMotion }}>{children}</MotionCtx.Provider>;
}

export const useMotion = () => useContext(MotionCtx);
