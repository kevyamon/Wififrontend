import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, adminUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirection immédiate si déjà connecté
  useEffect(() => {
    if (adminUser) {
      navigate('/admin/dashboard');
    }
  }, [adminUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser || !password) return;

    setLoading(true);
    showToast("Connexion en cours...", "info");

    try {
      await login(cleanUser, password);
      showToast("Bienvenue, administrateur !", "success");
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

      <main style={{ maxWidth: 360 }}>
        <form onSubmit={handleSubmit} className="card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: 'var(--color-primary)',
              padding: 14,
              borderRadius: '50%'
            }}>
              <Shield size={32} />
            </div>
          </div>

          <h2 style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: 10 }}>Espace Admin</h2>
          
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nom d'utilisateur"
            required
            disabled={loading}
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
            disabled={loading}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default AdminLogin;
