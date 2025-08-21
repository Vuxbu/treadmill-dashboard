import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DummyDataProvider } from './context/DummyDataContext';
import { WebSocketProvider } from './context/WebSocketContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebSocketProvider>
      <DummyDataProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DummyDataProvider>
    </WebSocketProvider>
  </React.StrictMode>
);
