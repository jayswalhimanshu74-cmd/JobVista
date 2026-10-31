import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import './styles/global.css';
import './styles/_buttons.css';
import './styles/_inputs.css';
import './styles/_cards.css';
import './styles/notifications.css';
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';

// Fire-and-forget ping to wake/warm up backend
const apiBase = import.meta.env.VITE_API_BASE_URL || "https://jobvista-psro.onrender.com/api/v1";
const apiRoot = apiBase.replace(/\/api\/v1\/?$/, "") || "https://jobvista-psro.onrender.com";
fetch(`${apiRoot}/ping`, { mode: "no-cors" }).catch(() => {});

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
)
