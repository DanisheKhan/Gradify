import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import App from './App.jsx';
import './index.css';
import './styles/print.css'; // Add print styles
import './lib/i18n'; // Init i18n settings

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#343a40',
              fontSize: '13px',
              fontWeight: '600',
              border: '1px solid #dee2e6',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              borderRadius: '10px',
            },
          }}
        />
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>
);
