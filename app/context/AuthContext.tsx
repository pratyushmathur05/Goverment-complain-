'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CivilianSession {
  role: 'civilian';
  name: string;
  email: string;
  phone?: string;
}

export interface AdminSession {
  role: 'admin';
  name: string;
  email: string;
  employeeId: string;
  department: string;
}

export type Session = CivilianSession | AdminSession | null;

interface AuthContextValue {
  session: Session;
  setSession: (s: Session) => void;
  clearSession: () => void;
  isLoggedIn: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SESSION_KEY = 'ccp-session';

/**
 * Read session synchronously from localStorage.
 * Called as the useState initializer so session is available
 * on the very first render — no useEffect delay, no null flash.
 * Returns null on server (localStorage unavailable) or parse error.
 */
function readSession(): Session {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  session: null,
  setSession: () => {},
  clearSession: () => {},
  isLoggedIn: false,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  // Read localStorage synchronously as the initial value.
  // This means the very first render already has the correct session —
  // no useEffect needed, no null flash, no 404 symptom.
  const [session, setSessionState] = useState<Session>(readSession);

  const setSession = useCallback((s: Session) => {
    setSessionState(s);
    try {
      if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else   localStorage.removeItem(SESSION_KEY);
    } catch { /* ignore — private browsing */ }
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, setSession, clearSession, isLoggedIn: session !== null }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}

// ─── String helpers ───────────────────────────────────────────────────────────

/** "Priya Sharma" → "PS" */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/**
 * Derives a display name from an email address.
 * "priya.sharma@gmail.com" → "Priya Sharma"
 * Used only for the email-login path where the user didn't type their name.
 */
export function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  return (
    local
      .replace(/[._\-+]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || 'User'
  );
}