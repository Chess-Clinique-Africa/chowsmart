import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import './styles/reference-landing.css';
import './styles/reference-directory.css';
import './styles/reference-breads.css';
import './styles/reference-world.css';
import './styles/reference-kitchen.css';
import './styles/reference-discover.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
