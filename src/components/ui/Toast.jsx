import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Fonction pour afficher un message avec type ('success', 'error', 'info', 'loading')
  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    if (!message) return;
    const id = Date.now() + Math.random();

    setToasts((prev) => {
      // Déduplication : supprimer tout toast identique déjà affiché
      const filtered = prev.filter((t) => t.message !== message);
      // Garder au maximum les 3 toasts les plus récents
      return [...filtered, { id, message, type }].slice(-3);
    });
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé dans un ToastProvider");
  }
  return context;
};

export default ToastProvider;
