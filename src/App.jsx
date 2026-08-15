import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import Portal from './pages/Portal';
import Acheter from './pages/Acheter';
import PaymentInstructions from './pages/PaymentInstructions';
import PaymentStatus from './pages/PaymentStatus';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

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
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
