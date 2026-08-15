import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Upload, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { API_BASE_URL } from '../config/constants';

const VAPID_PUBLIC_KEY = 'BAad4XZeYfl4vQKji5-ftn0AbsrlMzSdhuMW__7tWUu_BRtlVrsi5CsKVTLl24MMV_OVIQYA42_p6NiC6uWd4UA';
const WAVE_PHONE_DEFAULT = '0595673000';

// Convertisseur VAPID Base64 en Uint8Array requis par le PushManager
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PaymentInstructions = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [screenshotBase64, setScreenshotBase64] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sécurité : redirection si pas d'état transmis
  useEffect(() => {
    if (!state || !state.plan || !state.phoneNumber) {
      navigate('/acheter');
    }
  }, [state, navigate]);

  if (!state) return null;
  const { plan, phoneNumber } = state;

  // Calcul du prix
  const getPrice = () => {
    if (plan === 'jour') return '300';
    if (plan === 'semaine') return '1000';
    return '3000';
  };

  const getLabel = () => {
    if (plan === 'jour') return 'Forfait 1 Jour';
    if (plan === 'semaine') return 'Forfait 1 Semaine';
    return 'Forfait 1 Mois';
  };

  // Copier le numéro de téléphone Wave
  const handleCopyNumber = () => {
    navigator.clipboard.writeText(WAVE_PHONE_DEFAULT);
    setCopied(true);
    showToast("Numéro copié dans le presse-papiers !", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // Ouvrir l'application Wave selon l'OS mobile
  const handleOpenWave = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    showToast("Redirection vers Wave...", "info");
    
    if (/android/i.test(userAgent)) {
      // Android Intent: Ouvre l'application Wave, sinon redirige vers le Google Play Store
      window.location.href = `intent://#Intent;package=com.wave.personal;scheme=wave;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.wave.personal;end;`;
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      // iOS: Tente d'ouvrir wave://, sinon redirige vers l'App Store après un court délai
      window.location.href = "wave://";
      setTimeout(() => {
        window.location.href = "https://apps.apple.com/app/wave-mobile-money/id1454530007";
      }, 1500);
    } else {
      // Desktop ou autre : Lien informatif
      window.open("https://www.wave.com", "_blank");
    }
  };

  // Gérer la sélection du fichier de capture et sa conversion en Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Veuillez sélectionner un fichier image valide.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // Limite 5 Mo
      showToast("L'image est trop lourde. Limite à 5 Mo.", "error");
      return;
    }

    setScreenshotName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Demander l'abonnement push pour le client
  const getPushSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return null;
      }
      
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // S'abonner avec notre clé publique VAPID
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      return subscription;
    } catch (err) {
      console.warn("Push subscription failed:", err);
      return null;
    }
  };

  // Soumission finale de la capture d'écran
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshotBase64) {
      showToast("Veuillez uploader votre capture d'écran.", "error");
      return;
    }

    setLoading(true);
    showToast("Envoi de la demande...", "info");

    try {
      // 1. Tenter d'obtenir l'abonnement push
      const subscription = await getPushSubscription();

      // 2. Envoyer la demande au backend
      const response = await fetch(`${API_BASE_URL}/payment/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          plan,
          screenshot: screenshotBase64,
          clientSubscription: subscription || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la soumission.");
      }

      showToast("Demande de paiement envoyée avec succès !", "success");
      
      // Rediriger vers l'écran d'attente
      navigate('/payment-status', { state: { requestId: data.data.requestId } });

    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="site-header">
        <button onClick={() => navigate('/acheter')} className="theme-toggle" aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <span className="site-title">Paiement</span>
        <div style={{ width: 40 }}></div>
      </header>

      <main>
        <h1 className="title">Instructions</h1>
        <p className="subtitle">Suivez ces étapes pour finaliser l'achat du {getLabel()}.</p>

        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 15 }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-textSecondary)' }}>Montant à payer :</span>
            <h2 style={{ color: 'var(--color-primary)', fontSize: '2rem' }}>{getPrice()} FCFA</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.95rem' }}>
            <p>1. Effectuez un transfert Wave de <strong>{getPrice()} FCFA</strong> vers ce numéro :</p>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              backgroundColor: 'var(--color-inputBg)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '12px 16px'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{WAVE_PHONE_DEFAULT}</span>
              <button 
                type="button" 
                onClick={handleCopyNumber}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
              >
                <Copy size={20} />
              </button>
            </div>

            <p>2. Cliquez ci-dessous pour ouvrir l'application Wave :</p>
            <Button variant="secondary" onClick={handleOpenWave}>Ouvrir l'application Wave</Button>

            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              borderLeft: '4px solid var(--color-error)',
              padding: 12, 
              borderRadius: 6,
              display: 'flex',
              gap: 10,
              margin: '10px 0'
            }}>
              <AlertCircle size={24} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-textPrimary)' }}>
                <strong>ATTENTION :</strong> Une fois le paiement validé dans Wave, faites impérativement une <strong>capture d'écran</strong> du reçu avant de revenir.
              </span>
            </div>

            <p>3. Déposez la capture d'écran ci-dessous et validez :</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <label style={{
              border: '2px dashed var(--color-border)',
              borderRadius: 10,
              padding: '20px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'var(--color-inputBg)'
            }}>
              <Upload size={28} style={{ color: 'var(--color-textSecondary)' }} />
              <span style={{ fontSize: '0.9rem' }}>
                {screenshotName ? screenshotName : "Sélectionner la capture d'écran"}
              </span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                required
                style={{ display: 'none' }}
                disabled={loading}
              />
            </label>

            <Button type="submit" disabled={loading || !screenshotBase64}>
              {loading ? "Envoi..." : "Valider le paiement"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PaymentInstructions;
