import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import Portal from './pages/Portal';
import Acheter from './pages/Acheter';
import PaymentInstructions from './pages/PaymentInstructions';
import PaymentStatus from './pages/PaymentStatus';
import AdminAuth from './pages/AdminAuth';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Portal />} />
              <Route path="/acheter" element={<Acheter />} />
              <Route path="/payment-instructions" element={<PaymentInstructions />} />
              <Route path="/payment-status" element={<PaymentStatus />} />
              <Route path="/admin/auth" element={<AdminAuth />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              
              {/* Toute tentative d'accès direct à /admin/login ou autre URL inconnue renvoie la page 404 */}
              <Route path="/admin/login" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
