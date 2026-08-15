import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';

const Acheter = () => {
  const [plan, setPlan] = useState('jour');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toggleTheme, mode } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    
    // Validation du numéro de téléphone (8 à 15 chiffres)
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      showToast("Le numéro de téléphone est invalide (8 à 15 chiffres requis).", "error");
      return;
    }

    // Naviguer vers les instructions en passant les informations d'état
    navigate('/payment-instructions', { state: { plan, phoneNumber } });
  };

  return (
    <div className="app-container">
      <header className="site-header">
        <button onClick={() => navigate('/')} className="theme-toggle" aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <span className="site-title">Forfaits</span>
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Changer de thème">
          {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      <main>
        <h1 className="title">Acheter un forfait</h1>
        <p className="subtitle">Choisissez votre durée et saisissez votre numéro de téléphone.</p>

        <form onSubmit={handleNext} className="card">
          <div className="plan-list">
            <div 
              onClick={() => setPlan('jour')} 
              className={`plan-bubble ${plan === 'jour' ? 'selected' : ''}`}
            >
              <span className="radio-indicator"></span>
              <div className="plan-content">
                <strong>Forfait 1 Jour</strong><br />
                <small>Accès internet 24h</small>
              </div>
              <span className="plan-price">300F</span>
            </div>

            <div 
              onClick={() => setPlan('semaine')} 
              className={`plan-bubble ${plan === 'semaine' ? 'selected' : ''}`}
            >
              <span className="radio-indicator"></span>
              <div className="plan-content">
                <strong>Forfait 1 Semaine</strong><br />
                <small>Accès internet 7 jours</small>
              </div>
              <span className="plan-price">1000F</span>
            </div>

            <div 
              onClick={() => setPlan('mois')} 
              className={`plan-bubble ${plan === 'mois' ? 'selected' : ''}`}
            >
              <span className="radio-indicator"></span>
              <div className="plan-content">
                <strong>Forfait 1 Mois</strong><br />
                <small>Accès internet 30 jours</small>
              </div>
              <span className="plan-price">3000F</span>
            </div>
          </div>

          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="VOTRE NUMÉRO DE TÉLÉPHONE"
            required
          />

          <Button type="submit">
            Continuer
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Acheter;
