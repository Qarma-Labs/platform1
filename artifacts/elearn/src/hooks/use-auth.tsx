import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  LoginRequest,
  MeUserDto,
  RegisterRequest,
} from '@workspace/api-client-react';
import {
  fetchProfile,
  loginAccount,
  logoutAccount,
  registerAccount,
  restoreSession,
} from '@/lib/auth-session';

export type AuthStatus = 'loading' | 'authed' | 'anon';

interface AuthContextValue {
  status: AuthStatus;
  user: MeUserDto | null;
  login: (input: LoginRequest) => Promise<MeUserDto>;
  register: (input: RegisterRequest) => Promise<MeUserDto>;
  logout: () => Promise<void>;
  /** Re-fetch the profile; falls back to a cookie refresh on 401. */
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<MeUserDto | null>(null);

  // On first load, try to restore the session from the refresh cookie.
  useEffect(() => {
    let cancelled = false;
    restoreSession().then((profile) => {
      if (cancelled) return;
      setUser(profile);
      setStatus(profile ? 'authed' : 'anon');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginRequest) => {
    const profile = await loginAccount(input);
    setUser(profile);
    setStatus('authed');
    return profile;
  }, []);

  const register = useCallback(async (input: RegisterRequest) => {
    const profile = await registerAccount(input);
    setUser(profile);
    setStatus('authed');
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await logoutAccount();
    setUser(null);
    setStatus('anon');
  }, []);

  const reload = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      setUser(profile);
      setStatus('authed');
    } catch {
      const profile = await restoreSession();
      setUser(profile);
      setStatus(profile ? 'authed' : 'anon');
    }
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, logout, reload }),
    [status, user, login, register, logout, reload],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
