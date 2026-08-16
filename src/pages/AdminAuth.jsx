import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, UserCheck, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import NotFound from './NotFound';

const AdminAuth = () => {
  const [tab, setTab] = useState('login'); // 'login' ou 'register'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecretCode, setAdminSecretCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, adminUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isSecretUnlocked = typeof window !== 'undefined' && sessionStorage.getItem('admin_secret_unlocked');

  // Redirection si déjà connecté
  useEffect(() => {
    if (adminUser) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [adminUser, navigate]);

  // Si quelqu'un tape l'URL directement sans le geste secret, afficher la page 404
  if (!isSecretUnlocked && !adminUser) {
    return <NotFound />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || !password) return;

    setLoading(true);
    showToast(tab === 'login' ? "Connexion en cours..." : "Création du compte...", "info");

    try {
      if (tab === 'login') {
        await login(cleanPhone, password);
        showToast("Connexion réussie !", "success");
      } else {
        if (!adminSecretCode.trim()) {
          showToast("Le code secret d'administration est requis.", "error");
          setLoading(false);
          return;
        }
        await register(cleanPhone, password, adminSecretCode.trim());
        showToast("Compte administrateur créé et connecté !", "success");
      }
      navigate('/admin/dashboard');
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="site-header" style={{ justifyContent: 'center' }}>
        <span className="site-title">KevyFi Administrateur</span>
      </header>

      <main style={{ maxWidth: 380 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: 'var(--color-primary)',
              padding: 14,
              borderRadius: '50%'
            }}>
              {tab === 'login' ? <Shield size={32} /> : <KeyRound size={32} />}
            </div>
          </div>

          <h2 style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: 5 }}>
            {tab === 'login' ? "Connexion Admin" : "Inscription Admin"}
          </h2>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-textSecondary)', marginBottom: 15 }}>
            {tab === 'login'
              ? "Accédez à votre espace de gestion WiFi"
              : "Créez votre compte avec la clé secrète d'administration"}
          </p>

          {/* Onglets Connexion / Inscription */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 15 }}>
            <button
              type="button"
              onClick={() => setTab('login')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                backgroundColor: tab === 'login' ? 'var(--color-primary)' : 'var(--color-inputBg)',
                color: tab === 'login' ? 'var(--color-primaryText)' : 'var(--color-textSecondary)',
                transition: 'all 0.2s'
              }}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                backgroundColor: tab === 'register' ? 'var(--color-primary)' : 'var(--color-inputBg)',
                color: tab === 'register' ? 'var(--color-primaryText)' : 'var(--color-textSecondary)',
                transition: 'all 0.2s'
              }}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="N° DE TÉLÉPHONE"
              required
              disabled={loading}
            />

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="MOT DE PASSE (MIN. 6 CARACTÈRES)"
              required
              disabled={loading}
            />

            {tab === 'register' && (
              <Input
                type="password"
                value={adminSecretCode}
                onChange={(e) => setAdminSecretCode(e.target.value)}
                placeholder="CODE SECRET D'ADMINISTRATION"
                required
                disabled={loading}
              />
            )}

            <Button type="submit" disabled={loading} style={{ marginTop: 5 }}>
              {loading
                ? "Traitement..."
                : tab === 'login'
                ? "Se connecter"
                : "Créer mon compte admin"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminAuth;
