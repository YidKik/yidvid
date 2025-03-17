
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeCursor } from './utils/cursor.ts'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ResetPassword from './pages/ResetPassword.tsx'

// Initialize custom cursor
initializeCursor();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
