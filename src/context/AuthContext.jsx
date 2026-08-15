import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authentification silencieuse au démarrage (Silent Refresh)
  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setAdminUser({ username: 'admin' });
      } else {
        setAdminUser(null);
      }
    } catch (err) {
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Connexion de l'administrateur
  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Identifiants invalides.");
    }
    
    setAdminUser(data.user);
    return data;
  };

  // Déconnexion de l'administrateur
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error("Erreur de déconnexion :", err);
    } finally {
      setAdminUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ adminUser, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
