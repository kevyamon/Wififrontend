import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ textAlign: 'center' }}>
      <main style={{ padding: '60px 20px', maxWidth: 420 }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <AlertTriangle size={40} />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0 0 10px', color: 'var(--color-textPrimary)' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 15, color: 'var(--color-textPrimary)' }}>
          Page introuvable
        </h2>
        <p style={{ color: 'var(--color-textSecondary)', fontSize: '0.95rem', marginBottom: 30, lineHeight: 1.5 }}>
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <Button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Home size={18} />
          <span>Retour à l'accueil</span>
        </Button>
      </main>
    </div>
  );
};

export default NotFound;
