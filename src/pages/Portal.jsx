import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Wifi } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config/constants';

const Portal = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toggleTheme, mode } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleConnect = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setLoading(true);
    showToast("Vérification du code en cours...", "info");

    try {
      const res = await fetch(`${API_BASE_URL}/code/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la validation du code.");
      }

      showToast(data.message, "success");
      setCode('');
      
      // Simulation de redirection réseau autorisée
      setTimeout(() => {
        window.location.href = "https://www.google.com";
      }, 2000);
      
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="site-header">
        <span className="site-title">KevyFi</span>
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Changer de thème">
          {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      <main>
        <svg className="wifi-logo" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
          <circle className="dot" cx="50" cy="70" r="8"></circle>
          <path className="arc" d="M 25,60 A 40,40 0 0 1 75,60"></path>
          <path className="arc" d="M 10,45 A 60,60 0 0 1 90,45"></path>
          <path className="arc" d="M -5,30 A 80,80 0 0 1 105,30"></path>
        </svg>

        <h1 className="title">KevyFi Portal</h1>
        <p className="subtitle">Entrez votre code pour activer votre accès internet.</p>

        <form onSubmit={handleConnect} className="card">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ENTREZ VOTRE CODE"
            required
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/acheter')} disabled={loading}>
            Acheter un forfait
          </Button>
        </form>
      </main>

      <footer className="site-footer">
        <div className="footer-links">
          <a href="https://wa.me/2250595673000" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="tel:+2250595673000">Téléphone</a>
        </div>
        <p>&copy; 2026 KevyFi. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Portal;
