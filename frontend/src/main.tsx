import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './brand-overrides.css'
import './login-final-overrides.css'
import './login-layout.css'
import './palette-final.css'
import './palette-absolute.css'
import './visual-final.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
