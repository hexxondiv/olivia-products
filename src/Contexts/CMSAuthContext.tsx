import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'staff';
  token: string;
}

interface CMSAuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const CMSAuthContext = createContext<CMSAuthContextType | undefined>(undefined);

export const useCMSAuth = () => {
  const context = useContext(CMSAuthContext);
  if (!context) {
    throw new Error('useCMSAuth must be used within CMSAuthProvider');
  }
  return context;
};

interface CMSAuthProviderProps {
  children: ReactNode;
}

// Helper function to get API base URL
// Always use relative path to work with proxy
const getApiUrl = () => {
  // Always use /api which will be proxied by setupProxy.js
  // The proxy will rewrite /api to /olivia-products/api on the PHP server
  return '/api';
};

export const CMSAuthProvider: React.FC<CMSAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('cms_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth.php?action=me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser({ ...data.user, token });
          localStorage.setItem('cms_token', token);
        } else {
          localStorage.removeItem('cms_token');
        }
      } else {
        localStorage.removeItem('cms_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('cms_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.error('Login response not OK:', response.status, response.statusText);
        const text = await response.text();
        console.error('Response body:', text);
        return false;
      }

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('cms_token', data.user.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cms_token');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Update token if provided
      if (userData.token) {
        localStorage.setItem('cms_token', userData.token);
      }
    }
  };

  return (
    <CMSAuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        updateUser,
      }}
    >
      {children}
    </CMSAuthContext.Provider>
  );
};

