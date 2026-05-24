import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

function decodeJwt(token: string): Record<string, string> {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
}

function tokenToUser(token: string): AuthUser | null {
  const claims = decodeJwt(token);
  if (!claims.sub) return null;
  return {
    id: String(claims.userId ?? claims.id ?? claims.sub),
    email: claims.sub,
    name: String(claims.name ?? claims.sub),
  };
}

function isTokenExpired(token: string): boolean {
  const claims = decodeJwt(token);
  if (!claims.exp) return false;
  return Number(claims.exp) * 1000 < Date.now();
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
    return tokenToUser(token);
  });

  async function login(email: string, password: string) {
    const { accessToken, refreshToken } = await authApi.login(email, password);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    const decoded = tokenToUser(accessToken);
    // JWT sub가 이메일인 경우 입력한 이메일로 보완
    setUser(decoded ?? { id: email, email, name: email });
  }

  async function logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
