import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
const AuthContext = createContext<AuthState>({ user: null, loading: true, error: null });
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });
  useEffect(
    () =>
      onAuthStateChanged(
        auth,
        (user) => setState({ user, loading: false, error: null }),
        (error) => setState({ user: null, loading: false, error: error.message }),
      ),
    [],
  );
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
