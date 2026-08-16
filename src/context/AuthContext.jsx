import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('kevyfi_token') || null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('kevyfi_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Authentification silencieuse au démarrage (Silent Refresh)
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          setToken(data.accessToken);
          sessionStorage.setItem('kevyfi_token', data.accessToken);
        }
        if (!adminUser) {
          const defaultUser = { username: 'admin' };
          setAdminUser(defaultUser);
          sessionStorage.setItem('kevyfi_user', JSON.stringify(defaultUser));
        }
      }
    } catch (err) {
      // Si pas de session valide et aucun token stocké, réinitialiser
      if (!sessionStorage.getItem('kevyfi_token')) {
        setAdminUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [adminUser]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Wrapper fetch authentifié avec Bearer token et credentials
  const authFetch = useCallback(async (url, options = {}) => {
    const currentToken = token || sessionStorage.getItem('kevyfi_token');
    const headers = {
      ...options.headers,
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {})
    };

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    // Si le token a expiré, tenter un rafraîchissement
    if (res.status === 401) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.accessToken) {
            setToken(refreshData.accessToken);
            sessionStorage.setItem('kevyfi_token', refreshData.accessToken);
            // Rejouer la requête avec le nouveau token
            return fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${refreshData.accessToken}`
              },
              credentials: 'include'
            });
          }
        }
      } catch (e) {
        console.error("Échec du rafraîchissement automatique :", e);
      }
    }

    return res;
  }, [token]);

  // Connexion de l'administrateur
  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Identifiants invalides.");
    }
    
    setAdminUser(data.user);
    sessionStorage.setItem('kevyfi_user', JSON.stringify(data.user));

    if (data.accessToken) {
      setToken(data.accessToken);
      sessionStorage.setItem('kevyfi_token', data.accessToken);
    }
    
    return data;
  };

  // Déconnexion de l'administrateur
  const logout = async () => {
    try {
      await authFetch(`${API_BASE_URL}/auth/logout`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error("Erreur de déconnexion :", err);
    } finally {
      setAdminUser(null);
      setToken(null);
      sessionStorage.removeItem('kevyfi_user');
      sessionStorage.removeItem('kevyfi_token');
    }
  };

  return (
    <AuthContext.Provider value={{ adminUser, token, loading, login, logout, authFetch, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
