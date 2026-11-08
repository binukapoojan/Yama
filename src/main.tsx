// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AudioMixerDebugPanel } from './components/debug/AudioMixerDebugPanel';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <AudioMixerDebugPanel />
  </React.StrictMode>
);
