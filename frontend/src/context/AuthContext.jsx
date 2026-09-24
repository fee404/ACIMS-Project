import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('acims_token') || null);
  const [activeRole, setActiveRole] = useState(localStorage.getItem('acims_active_role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('acims_token');
      const storedUser = localStorage.getItem('acims_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          const storedRole = localStorage.getItem('acims_active_role');
          if (storedRole && parsedUser.roles.includes(storedRole)) {
            setActiveRole(storedRole);
          } else {
            const defaultRole = parsedUser.roles[0] || 'lecturer';
            setActiveRole(defaultRole);
            localStorage.setItem('acims_active_role', defaultRole);
          }
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    localStorage.setItem('acims_token', receivedToken);
    localStorage.setItem('acims_user', JSON.stringify(receivedUser));

    // กำหนด active role เริ่มต้น
    const initialRole = receivedUser.roles[0] || 'lecturer';
    localStorage.setItem('acims_active_role', initialRole);

    setToken(receivedToken);
    setUser(receivedUser);
    setActiveRole(initialRole);

    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('acims_token');
    localStorage.removeItem('acims_user');
    localStorage.removeItem('acims_active_role');
    setToken(null);
    setUser(null);
    setActiveRole(null);
  };

  const switchActiveRole = (role) => {
    if (user && user.roles.includes(role)) {
      setActiveRole(role);
      localStorage.setItem('acims_active_role', role);
    }
  };

  const hasRole = (role) => {
    return user && user.roles && user.roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        loading,
        login,
        logout,
        switchActiveRole,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
