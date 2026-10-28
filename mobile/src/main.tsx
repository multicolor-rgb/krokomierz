import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/manrope';
import './index.css';
import App from './App';
import { Capacitor } from '@capacitor/core';

if (!Capacitor.isNativePlatform() && !import.meta.env.DEV && 'serviceWorker' in navigator) {
  // Zapytanie o unikalny build omija cache CDN dla pliku sw.js.
  window.addEventListener('load', () => {
    const build = typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : '1';
    void navigator.serviceWorker
      .register(`/app/sw.js?v=${build}`, { scope: '/app/' })
      .then((registration) => {
        window.setInterval(() => void registration.update().catch(() => undefined), 60 * 60 * 1000);
      })
      .catch(() => undefined);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
