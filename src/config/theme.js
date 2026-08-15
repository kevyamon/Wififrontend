const theme = {
  colors: {
    // Mode sombre (défaut, Slate & Amber & Violet)
    dark: {
      background: '#0f172a',     // Slate 900
      card: '#1e293b',           // Slate 800
      textPrimary: '#f8fafc',    // Slate 50
      textSecondary: '#94a3b8',  // Slate 400
      border: '#334155',         // Slate 700
      inputBg: '#1e293b',
      primary: '#f59e0b',        // Amber 500 (Le jaune de la marque)
      primaryHover: '#d97706',   // Amber 600
      primaryText: '#0f172a',
      accent: '#8b5cf6',         // Violet 500 (Pour les forfaits)
      accentHover: '#7c3aed',     // Violet 600
      success: '#10b981',        // Emerald 500
      error: '#ef4444',          // Red 500
      loading: '#3b82f6'         // Blue 500
    },
    // Mode clair
    light: {
      background: '#f8fafc',     // Slate 50
      card: '#ffffff',
      textPrimary: '#0f172a',    // Slate 900
      textSecondary: '#475569',  // Slate 600
      border: '#e2e8f0',         // Slate 200
      inputBg: '#ffffff',
      primary: '#f59e0b',
      primaryHover: '#d97706',
      primaryText: '#0f172a',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      success: '#10b981',
      error: '#ef4444',
      loading: '#3b82f6'
    }
  },
  typography: {
    fontFamily: "'Outfit', 'Inter', system-ui, sans-serif"
  }
};

export default theme;
