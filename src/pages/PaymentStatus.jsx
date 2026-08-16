import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, AlertCircle, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { API_BASE_URL } from '../config/constants';

const PaymentStatus = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [status, setStatus] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [code, setCode] = useState('');
  const [reason, setReason] = useState('');
  const [copied, setCopied] = useState(false);
  
  const pollingRef = React.useRef(null);
  const hasNotifiedRef = React.useRef(false);

  useEffect(() => {
    if (!state || !state.requestId) {
      navigate('/');
      return;
    }

    const { requestId } = state;

    // Fonction de polling pour interroger le backend
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/payment/status/${requestId}`);
        const data = await res.json();
        
        if (res.ok && data.success) {
          const { status: reqStatus, code: genCode, reason: rejReason } = data.data;
          
          if (reqStatus === 'approved') {
            setStatus('approved');
            setCode(genCode);
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (!hasNotifiedRef.current) {
              hasNotifiedRef.current = true;
              showToast("Votre paiement a été validé !", "success");
            }
          } else if (reqStatus === 'rejected') {
            setStatus('rejected');
            setReason(rejReason);
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (!hasNotifiedRef.current) {
              hasNotifiedRef.current = true;
              showToast("Paiement rejeté par l'administrateur.", "error");
            }
          }
        }
      } catch (err) {
        console.warn("Polling error:", err);
      }
    };

    // Lancer immédiatement la vérification
    checkStatus();

    // Déclencher le polling toutes les 4 secondes
    pollingRef.current = setInterval(checkStatus, 4000);

    // Arrêter l'intervalle lors du démontage du composant
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [state, navigate, showToast]);

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast("Code de connexion copié !", "success");
    
    // Redirection automatique vers le portail pour connexion après 1,5 seconde
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  if (!state) return null;

  return (
    <div className="app-container">
      <header className="site-header">
        <span className="site-title">Statut</span>
        <div style={{ width: 40 }}></div>
      </header>

      <main>
        {status === 'pending' && (
          <>
            <h1 className="title">Vérification</h1>
            <p className="subtitle">Nous validons votre reçu. Veuillez patienter sur cette page...</p>

            <div className="card" style={{ alignItems: 'center', padding: '50px 30px' }}>
              <div className="loading-spinner" style={{
                width: 60,
                height: 60,
                border: '5px solid var(--color-border)',
                borderTopColor: 'var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: 20
              }}></div>
              <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Validation en cours...</p>
              <p style={{ 
                fontSize: '0.8rem', 
                color: 'var(--color-textSecondary)', 
                textAlign: 'center',
                marginTop: 10
              }}>
                Si vous avez activé les notifications, vous pouvez réduire l'application. Vous recevrez une alerte dès que votre code sera prêt !
              </p>
            </div>
          </>
        )}

        {status === 'approved' && (
          <>
            <h1 className="title">Succès !</h1>
            <p className="subtitle">Votre paiement a été validé. Copiez votre code ci-dessous.</p>

            <div className="card" style={{ alignItems: 'center' }}>
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--color-success)',
                padding: 16,
                borderRadius: '50%',
                marginBottom: 10
              }}>
                <Check size={40} />
              </div>

              <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 5 }}>Code WiFi Disponible</p>
              
              <div style={{
                backgroundColor: 'var(--color-inputBg)',
                border: '2px solid var(--color-border)',
                borderRadius: 12,
                padding: '16px 24px',
                fontSize: '2rem',
                fontWeight: 'bold',
                letterSpacing: 2,
                color: 'var(--color-primary)',
                margin: '15px 0',
                width: '100%',
                textAlign: 'center'
              }}>
                {code}
              </div>

              <Button onClick={handleCopyCode}>
                {copied ? "Copié !" : "Copier & Se connecter"}
              </Button>
            </div>
          </>
        )}

        {status === 'rejected' && (
          <>
            <h1 className="title">Rejeté</h1>
            <p className="subtitle">Votre demande de paiement n'a pas pu être validée.</p>

            <div className="card" style={{ alignItems: 'center' }}>
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-error)',
                padding: 16,
                borderRadius: '50%',
                marginBottom: 10
              }}>
                <AlertCircle size={40} />
              </div>

              <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-error)' }}>
                Motif du rejet :
              </p>
              
              <div style={{
                backgroundColor: 'var(--color-inputBg)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: 16,
                fontSize: '0.95rem',
                margin: '15px 0',
                width: '100%',
                textAlign: 'center',
                lineHeight: 1.4
              }}>
                {reason}
              </div>

              <Button onClick={() => navigate('/acheter')}>
                Réessayer
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Animation d'attente (spinner) */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentStatus;
