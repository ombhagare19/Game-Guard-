// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameGuardProvider } from './context/GameGuardContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameGuardProvider>
      <App />
    </GameGuardProvider>
  </React.StrictMode>
);
