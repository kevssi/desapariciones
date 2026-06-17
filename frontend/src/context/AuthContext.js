import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(sessionStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Si hay token pero el nombre no está disponible, carga el perfil desde la API
  useEffect(() => {
    if (token) {
      authService.getProfile()
        .then(res => {
          const profile = res.data;
          const updatedUser = { ...user, id: profile.id, nombre: profile.nombre, apellido: profile.apellido, rol: profile.rol };
          setUser(updatedUser);
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
        })
        .catch(() => {
          // Token inválido — limpiar sesión
          setToken(null);
          setUser(null);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    sessionStorage.setItem('token', authToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
