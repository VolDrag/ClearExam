import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { TrackId } from "./tracks";

const KEY = "clearexam.track";
const CHANGE_EVENT = "clearexam:track-change";

export function saveTrackChoice(t: TrackId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, t);
  window.dispatchEvent(new CustomEvent<TrackId>(CHANGE_EVENT, { detail: t }));
}

type Ctx = {
  track: TrackId | null;
  setTrack: (t: TrackId) => void;
  clearTrack: () => void;
  ready: boolean;
};

const TrackContext = createContext<Ctx | null>(null);

export function TrackProvider({ children }: { children: ReactNode }) {
  const [track, setTrackState] = useState<TrackId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = window.localStorage.getItem(KEY) as TrackId | null;
    if (v) setTrackState(v);
    setReady(true);

    const onTrackChange = (event: Event) => {
      const next = (event as CustomEvent<TrackId>).detail;
      if (next) setTrackState(next);
    };
    window.addEventListener(CHANGE_EVENT, onTrackChange);
    return () => window.removeEventListener(CHANGE_EVENT, onTrackChange);
  }, []);

  const setTrack = useCallback((t: TrackId) => {
    setTrackState(t);
    saveTrackChoice(t);
  }, []);

  const clearTrack = useCallback(() => {
    setTrackState(null);
    window.localStorage.removeItem(KEY);
  }, []);

  return (
    <TrackContext.Provider value={{ track, setTrack, clearTrack, ready }}>
      {children}
    </TrackContext.Provider>
  );
}

export function useTrack() {
  const ctx = useContext(TrackContext);
  if (!ctx) throw new Error("useTrack must be used within TrackProvider");
  return ctx;
}
