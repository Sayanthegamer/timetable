import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSDK } from './useSDK';
import type { User } from 'timetable-sdk';
import { db } from '../services/db';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USE_MOCK = import.meta.env.DEV && !import.meta.env.VITE_API_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const sdk = useSDK();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (USE_MOCK) {
          const mockUser: User = {
            id: 'mock-user-1',
            email: 'student@jee.com',
            name: 'JEE Student'
          };
          setUser(mockUser);
          await db.saveUser(mockUser);
          setLoading(false);
          return;
        }

        const currentUser = await sdk.auth.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await db.saveUser(currentUser);
        } else {
          const cachedUser = await db.getUser();
          if (cachedUser) {
            setUser(cachedUser);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        const cachedUser = await db.getUser();
        if (cachedUser) {
          setUser(cachedUser);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [sdk]);

  const login = async (email: string, password: string) => {
    if (USE_MOCK) {
      const mockUser: User = {
        id: 'mock-user-1',
        email: email,
        name: email.split('@')[0]
      };
      setUser(mockUser);
      await db.saveUser(mockUser);
      return;
    }

    await sdk.login(email, password);
    const currentUser = await sdk.auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      await db.saveUser(currentUser);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    if (USE_MOCK) {
      const mockUser: User = {
        id: 'mock-user-1',
        email: email,
        name: name
      };
      setUser(mockUser);
      await db.saveUser(mockUser);
      return;
    }

    await sdk.register(email, password, name);
    const currentUser = await sdk.auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      await db.saveUser(currentUser);
    }
  };

  const logout = async () => {
    await sdk.logout();
    setUser(null);
    await db.clear();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
