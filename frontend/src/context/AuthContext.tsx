import { type ReactNode, createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  email: string;
  role?: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, accessToken: string, role?: string, avatarUrl?: string | null) => void;
  updateUserAvatar: (avatarUrl: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { return JSON.parse(storedUser); } catch { return null; }
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('access_token');
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return userData.role === 'ADMIN';
      } catch { return false; }
    }
    return false;
  });

  const login = (username: string, accessToken: string, role: string = 'USER', avatarUrl?: string | null) => {
    const userData: User = { username, email: '', role, avatarUrl };
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(role === 'ADMIN');
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateUserAvatar = (avatarUrl: string | null) => {
    setUser(prev => {
      if (!prev) return prev;
      return { ...prev, avatarUrl };
    });
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, updateUserAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
