import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'baseline_admin_view_mode';
const EVENT_NAME = 'admin-view-mode-change';

export function getStoredAdminViewMode() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'learner' ? 'learner' : 'admin';
  } catch {
    return 'admin';
  }
}

export function setStoredAdminViewMode(mode) {
  const next = mode === 'learner' ? 'learner' : 'admin';
  try {
    sessionStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage errors in restricted contexts
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { mode: next } }));
}

export default function useAdminViewMode(user) {
  const [viewMode, setViewModeState] = useState(getStoredAdminViewMode);

  useEffect(() => {
    const handleSync = (e) => {
      setViewModeState(e.detail?.mode || getStoredAdminViewMode());
    };
    window.addEventListener(EVENT_NAME, handleSync);
    return () => window.removeEventListener(EVENT_NAME, handleSync);
  }, []);

  const setViewMode = useCallback((mode) => {
    setStoredAdminViewMode(mode);
  }, []);

  const isRealAdmin = user?.role === 'admin';
  const effectiveIsAdmin = Boolean(isRealAdmin && viewMode === 'admin');
  const isLearnerView = Boolean(isRealAdmin && viewMode === 'learner');

  return { viewMode, setViewMode, isRealAdmin, effectiveIsAdmin, isLearnerView };
}