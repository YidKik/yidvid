
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeCursor } from './utils/cursor.ts'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ResetPassword from './pages/ResetPassword.tsx'

// Initialize custom cursor
initializeCursor();

// Set favicon programmatically to ensure it's always the correct one
const setFavicon = () => {
  // Remove any existing favicons
  const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
  existingFavicons.forEach(favicon => favicon.remove());
  
  // Add the correct favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = '/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png';
  document.head.appendChild(link);
  
  // Also add apple touch icon
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = '/lovable-uploads/4a9898a9-f142-42b7-899a-ddd1a106410a.png';
  document.head.appendChild(appleLink);
};

// Run immediately and on page load
setFavicon();
window.addEventListener('load', setFavicon);

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
