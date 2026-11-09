import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { unregisterServiceWorker } from './serviceWorkerRegistration';
import { ErrorBoundary } from './components/ErrorBoundary';

// Purge any stuck legacy service workers or corrupt caches in Chrome/browsers
unregisterServiceWorker();

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
