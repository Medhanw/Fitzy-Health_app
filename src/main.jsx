import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 👈 Import BrowserRouter
import './index.css'
import App from './App.jsx'

// The fix: Wrapping the entire application with BrowserRouter 
// so that useLocation() in Layout.jsx works correctly.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
