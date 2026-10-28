import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/manrope';
import './index.css';
import App from './App';
import { Capacitor } from '@capacitor/core';
import { registerSW } from 'virtual:pwa-register';

if (!Capacitor.isNativePlatform()) {
  registerSW({ immediate: true });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
