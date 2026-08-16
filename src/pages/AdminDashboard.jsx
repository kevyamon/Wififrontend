import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Check, X, Bell, BellOff, ShieldAlert, ChevronLeft, ChevronRight, KeyRound } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { API_BASE_URL } from '../config/constants';

const VAPID_PUBLIC_KEY = 'BAad4XZeYfl4vQKji5-ftn0AbsrlMzSdhuMW__7tWUu_BRtlVrsi5CsKVTLl24MMV_OVIQYA42_p6NiC6uWd4UA';

// Convertisseur de clé publique VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

const AdminDashboard = () => {
  const { adminUser, loading: authLoading, logout, authFetch } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'history'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [pendingPagination, setPendingPagination] = useState({ page: 1, pages: 1 });
  const [historyPagination, setHistoryPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);

  // States pour les fenêtres modales
  const [activeScreenshot, setActiveScreenshot] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);

  // Modal de changement d'identifiants
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Sécurité d'accès
  useEffect(() => {
    if (!authLoading && !adminUser) {
      navigate('/admin/login');
    }
  }, [adminUser, authLoading, navigate]);

  // Charger les requêtes en attente
  const fetchPending = useCallback(async (page = 1) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/payment/pending?page=${page}&limit=5`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingRequests(data.items);
        setPendingPagination(data.pagination);
      }
    } catch (err) {
      console.error("Erreur chargement requêtes en attente :", err);
    }
  }, [authFetch]);

  // Charger l'historique
  const fetchHistory = useCallback(async (page = 1) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/payment/history?page=${page}&limit=5`);
      const data = await res.json();
      if (res.ok && data.success) {
        setHistoryRequests(data.items);
        setHistoryPagination(data.pagination);
      }
    } catch (err) {
      console.error("Erreur chargement historique :", err);
    }
  }, [authFetch]);

  // Recharger les données selon l'onglet actif
  useEffect(() => {
    if (adminUser) {
      if (activeTab === 'pending') {
        fetchPending(pendingPagination.page);
      } else {
        fetchHistory(historyPagination.page);
      }
    }
  }, [activeTab, adminUser, fetchPending, fetchHistory, pendingPagination.page, historyPagination.page]);

  // Polling automatique en temps réel des demandes en attente (toutes les 5 secondes)
  useEffect(() => {
    if (adminUser && activeTab === 'pending') {
      const interval = setInterval(() => {
        fetchPending(pendingPagination.page);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [adminUser, activeTab, fetchPending, pendingPagination.page]);

  // Vérifier si le navigateur est déjà abonné aux notifications
  useEffect(() => {
    if ('serviceWorker' in navigator && adminUser) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsPushSubscribed(!!subscription);
        });
      });
    }
  }, [adminUser]);

  // S'abonner aux notifications push de l'admin
  const togglePushSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      showToast("Votre navigateur ne supporte pas les notifications push.", "error");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if (isPushSubscribed) {
        // Se désabonner
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          setIsPushSubscribed(false);
          showToast("Désabonné des notifications push.", "success");
        }
      } else {
        // S'abonner
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showToast("Permission de notification refusée.", "error");
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        // Envoyer la souscription au backend
        const res = await authFetch(`${API_BASE_URL}/auth/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });

        if (res.ok) {
          setIsPushSubscribed(true);
          showToast("Abonnement aux notifications activé avec succès !", "success");
        } else {
          throw new Error("Erreur de sauvegarde de l'abonnement sur le serveur.");
        }
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Approuver une demande
  const handleApprove = async (id) => {
    setLoading(true);
    showToast("Approbation en cours...", "info");
    try {
      const res = await authFetch(`${API_BASE_URL}/payment/approve/${id}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      showToast(`Demande approuvée. Code : ${data.code}`, "success");
      fetchPending(pendingPagination.page);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Soumettre un rejet
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    setLoading(true);
    showToast("Rejet en cours...", "info");
    try {
      const res = await authFetch(`${API_BASE_URL}/payment/reject/${rejectingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast("Demande rejetée.", "success");
      setRejectingId(null);
      setRejectReason('');
      fetchPending(pendingPagination.page);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // Modifier les identifiants admin
  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newUsername.trim() || !newPassword) return;

    setLoading(true);
    showToast("Mise à jour des identifiants...", "info");

    try {
      const res = await authFetch(`${API_BASE_URL}/auth/update-credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername.trim(),
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast("Identifiants modifiés avec succès !", "success");
      setShowCredentialsModal(false);
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !adminUser) return null;

  return (
    <div className="app-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header className="site-header" style={{ maxWidth: '100%', marginBottom: 20 }}>
        <span className="site-title">KevyFi Admin</span>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={() => setShowCredentialsModal(true)} 
            className="theme-toggle" 
            title="Modifier mes identifiants de connexion"
          >
            <KeyRound size={20} />
          </button>

          <button 
            onClick={togglePushSubscription} 
            className="theme-toggle" 
            title={isPushSubscribed ? "Désactiver les notifications" : "Activer les notifications"}
            style={{ color: isPushSubscribed ? 'var(--color-success)' : 'var(--color-textSecondary)' }}
          >
            {isPushSubscribed ? <Bell size={20} /> : <BellOff size={20} />}
          </button>
          
          <button onClick={handleLogout} className="theme-toggle" title="Se déconnecter">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '100%', width: '100%' }}>
        {/* Alerte incitant à changer les identifiants par défaut */}
        {adminUser?.username === 'admin' && (
          <div 
            onClick={() => setShowCredentialsModal(true)}
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid var(--color-primary)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldAlert size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem' }}>
                <strong>Sécurité :</strong> Vous utilisez les identifiants par défaut (<code>admin</code>). Cliquez ici pour les personnaliser.
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>Modifier</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 15, marginBottom: 20, width: '100%' }}>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{
              flex: 1,
              padding: '12px 20px',
              fontWeight: 'bold',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'pending' ? 'var(--color-primary)' : 'var(--color-card)',
              color: activeTab === 'pending' ? 'var(--color-primaryText)' : 'var(--color-textPrimary)',
              transition: 'all 0.2s'
            }}
          >
            Demandes en attente
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '12px 20px',
              fontWeight: 'bold',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'history' ? 'var(--color-primary)' : 'var(--color-card)',
              color: activeTab === 'history' ? 'var(--color-primaryText)' : 'var(--color-textPrimary)',
              transition: 'all 0.2s'
            }}
          >
            Historique des ventes
          </button>
        </div>

        {activeTab === 'pending' ? (
          <div className="card" style={{ width: '100%' }}>
            <h3>Demandes à valider</h3>
            {pendingRequests.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-textSecondary)', padding: '20px 0' }}>
                Aucune demande en attente de validation.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {pendingRequests.map((req) => (
                  <div key={req._id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    padding: 15,
                    backgroundColor: 'var(--color-inputBg)',
                    flexWrap: 'wrap',
                    gap: 15
                  }}>
                    <div>
                      <p style={{ fontWeight: 'bold' }}>N° Téléphone : {req.phoneNumber}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-textSecondary)' }}>
                        Forfait : {req.plan.toUpperCase()} • Montant : {req.amount} F
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-textSecondary)' }}>
                        Date : {new Date(req.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                      <button 
                        onClick={() => setActiveScreenshot(req.screenshot)}
                        style={{
                          backgroundColor: 'var(--color-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 8,
                          width: 50,
                          height: 50,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}
                        title="Voir le reçu de paiement"
                      >
                        <img src={req.screenshot} alt="Reçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          disabled={loading} 
                          onClick={() => handleApprove(req._id)}
                          style={{
                            border: 'none',
                            backgroundColor: 'var(--color-success)',
                            color: '#ffffff',
                            padding: '10px 14px',
                            borderRadius: 8,
                            cursor: 'pointer'
                          }}
                          title="Valider la transaction"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          disabled={loading} 
                          onClick={() => setRejectingId(req._id)}
                          style={{
                            border: 'none',
                            backgroundColor: 'var(--color-error)',
                            color: '#ffffff',
                            padding: '10px 14px',
                            borderRadius: 8,
                            cursor: 'pointer'
                          }}
                          title="Rejeter la transaction"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination en attente */}
                {pendingPagination.pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 15, marginTop: 10 }}>
                    <button 
                      disabled={pendingPagination.page <= 1} 
                      onClick={() => fetchPending(pendingPagination.page - 1)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                    >
                      <ChevronLeft />
                    </button>
                    <span>Page {pendingPagination.page} sur {pendingPagination.pages}</span>
                    <button 
                      disabled={pendingPagination.page >= pendingPagination.pages} 
                      onClick={() => fetchPending(pendingPagination.page + 1)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                    >
                      <ChevronRight />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ width: '100%' }}>
            <h3>Historique des demandes</h3>
            {historyRequests.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-textSecondary)', padding: '20px 0' }}>
                Aucune transaction archivée.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {historyRequests.map((req) => (
                  <div key={req._id} style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    padding: 15,
                    backgroundColor: 'var(--color-inputBg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>N° : {req.phoneNumber}</span>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        backgroundColor: req.status === 'approved' ? 'var(--color-success)' : 'var(--color-error)'
                      }}>
                        {req.status === 'approved' ? 'APPROUVÉ' : 'REJETÉ'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--color-textSecondary)' }}>
                      Forfait : {req.plan.toUpperCase()} • Montant : {req.amount} F • Date : {new Date(req.createdAt).toLocaleString('fr-FR')}
                    </p>

                    {req.status === 'approved' && req.generatedCode && (
                      <p style={{ fontSize: '0.9rem' }}>
                        Code généré : <strong style={{ color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: '1.1rem' }}>{req.generatedCode.code}</strong>
                      </p>
                    )}

                    {req.status === 'rejected' && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-textSecondary)', borderLeft: '3px solid var(--color-error)', paddingLeft: 8 }}>
                        Raison du rejet : <em>{req.rejectionReason}</em>
                      </p>
                    )}
                  </div>
                ))}

                {/* Pagination historique */}
                {historyPagination.pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 15, marginTop: 10 }}>
                    <button 
                      disabled={historyPagination.page <= 1} 
                      onClick={() => fetchHistory(historyPagination.page - 1)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                    >
                      <ChevronLeft />
                    </button>
                    <span>Page {historyPagination.page} sur {historyPagination.pages}</span>
                    <button 
                      disabled={historyPagination.page >= historyPagination.pages} 
                      onClick={() => fetchHistory(historyPagination.page + 1)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                    >
                      <ChevronRight />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lightbox plein écran pour le reçu */}
      {activeScreenshot && (
        <div 
          onClick={() => setActiveScreenshot(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'zoom-out'
          }}
        >
          <img src={activeScreenshot} alt="Reçu Agrandi" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 10 }} />
        </div>
      )}

      {/* Modal pour saisir le motif du rejet */}
      {rejectingId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <form onSubmit={handleRejectSubmit} className="card" style={{ maxWidth: 360, gap: 15 }}>
            <h3 style={{ textAlign: 'center' }}>Rejeter la demande</h3>
            
            <Input 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Raison (ex: Reçu flou, montant incorrect...)"
              required
              disabled={loading}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <Button type="submit" variant="accent" disabled={loading || !rejectReason.trim()}>
                Confirmer le rejet
              </Button>
              <Button type="button" variant="secondary" onClick={() => { setRejectingId(null); setRejectReason(''); }} disabled={loading}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal pour modifier les identifiants admin */}
      {showCredentialsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <form onSubmit={handleUpdateCredentials} className="card" style={{ maxWidth: 380, gap: 15 }}>
            <h3 style={{ textAlign: 'center' }}>Modifier mes identifiants</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-textSecondary)', textAlign: 'center' }}>
              Personnalisez votre nom d'utilisateur et mot de passe administrateur.
            </p>

            <Input 
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mot de passe actuel"
              required
              disabled={loading}
            />

            <Input 
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Nouveau nom d'utilisateur"
              required
              disabled={loading}
            />

            <Input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              required
              disabled={loading}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 5 }}>
              <Button type="submit" disabled={loading || !currentPassword || !newUsername.trim() || !newPassword}>
                Enregistrer
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowCredentialsModal(false);
                  setCurrentPassword('');
                  setNewUsername('');
                  setNewPassword('');
                }} 
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
