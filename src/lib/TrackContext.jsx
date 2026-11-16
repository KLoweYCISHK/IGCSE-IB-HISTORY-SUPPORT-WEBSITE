import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TrackGate from '@/components/TrackGate';

const TrackContext = createContext({ track: null, setTrack: () => {}, clearTrack: () => {} });
const KEY = 'history-track';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function TrackProvider({ children }) {
  const [track, setTrackState] = useState(() => {
    try {
      // Always start fresh — show the welcome gate on every new site visit.
      sessionStorage.removeItem(KEY);
      return null;
    } catch { return null; }
  });
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const setTrack = useCallback((t) => {
    setTrackState(t);
    try { sessionStorage.setItem(KEY, t); } catch {}
  }, []);

  const clearTrack = useCallback(() => {
    setTrackState(null);
    try { sessionStorage.removeItem(KEY); } catch {}
  }, []);

  // Choosing a course on the welcome screen always opens that course's home page,
  // whichever page was open before the refresh.
  const choose = useCallback((t) => {
    setTrack(t);
    navigate('/', { replace: true });
  }, [setTrack, navigate]);

  const showGate = !track && !AUTH_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <TrackContext.Provider value={{ track, setTrack, clearTrack }}>
      {children}
      {showGate && <TrackGate onChoose={choose} />}
    </TrackContext.Provider>
  );
}

export const useTrack = () => useContext(TrackContext);