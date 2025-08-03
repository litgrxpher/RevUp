
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback((user: User) => {
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  }, [router]);


  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (!user && !isAuthPage) {
      router.push('/login');
    }
    if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const authContextValue = { user, loading, login, logout };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
      </div>
    );
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if (!user && !isAuthPage) {
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Redirecting to login...</p>
        </div>
    );
  }
  if (user && isAuthPage) {
     return (
        <div className="flex items-center justify-center h-screen">
            <p>Redirecting to app...</p>
        </div>
    );
  }


  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
