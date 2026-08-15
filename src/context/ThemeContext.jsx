import React, { createContext, useContext, useState, useEffect } from 'react';
import theme from '../config/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    // Le mode sombre est appliqué par défaut en production pour le portail captif
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('theme', mode);
    
    // Injection dynamique des tokens de couleur en variables CSS
    const colors = theme.colors[mode];
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
    
    // Injection de la typographie
    document.documentElement.style.setProperty('--font-family', theme.typography.fontFamily);
    
    // Gestion de la classe light-mode sur le body pour les surcharges éventuelles
    if (mode === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, colors: theme.colors[mode] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
