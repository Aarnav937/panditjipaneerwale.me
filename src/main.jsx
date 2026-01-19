import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AdminProvider>
        <WishlistProvider>
          <NotificationProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </NotificationProvider>
        </WishlistProvider>
      </AdminProvider>
    </AuthProvider>
  </React.StrictMode>,
)


