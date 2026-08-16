import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/Toast.jsx'
import { seedCatalog } from './utils/api.js'
import App from './App.jsx'
import './index.css'

// Seed the master course catalog on first ever load (no-op if already exists)
seedCatalog()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
