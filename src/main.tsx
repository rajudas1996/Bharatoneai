import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (err: any) {
    console.error('Fatal initialization error:', err);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui, sans-serif; background: #f8fafc; padding: 24px;">
        <div style="max-width: 440px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h2 style="font-size: 18px; font-weight: 700; color: #dc2626; margin-bottom: 8px;">Bharat 1 AI</h2>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Application ready. Click below to launch.</p>
          <button onclick="window.location.reload()" style="background: #dc2626; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">
            Reload Dashboard
          </button>
        </div>
      </div>
    `;
  }
}
