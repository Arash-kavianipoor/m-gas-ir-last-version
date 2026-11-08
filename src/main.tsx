import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { unregisterServiceWorker } from './serviceWorkerRegistration';

// Purge any stuck legacy service workers or corrupt caches in Chrome/browsers
unregisterServiceWorker();

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
