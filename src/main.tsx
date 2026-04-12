
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeCursor } from './utils/cursor.ts'
import { initGA } from './utils/analytics.ts'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import { Toaster } from 'sonner'

// Initialize custom cursor
initializeCursor();

// Initialize Google Analytics
// Replace 'GA_MEASUREMENT_ID' with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'G-EB95XJNCCD'; // You'll need to replace this with your actual ID
initGA(GA_MEASUREMENT_ID);

// Set favicon programmatically to ensure it's always the correct one
const setFavicon = () => {
  // Remove any existing favicons
  const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
  existingFavicons.forEach(favicon => favicon.remove());
  
  // Add the correct favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = '/yidvid-logo-icon.png';
  link.sizes = '32x32';
  document.head.appendChild(link);
  
  // Also add apple touch icon
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.sizes = '180x180';
  appleLink.href = '/yidvid-logo-icon.png';
  document.head.appendChild(appleLink);
};

// Run immediately and on page load
setFavicon();
window.addEventListener('load', setFavicon);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster 
        position="bottom-right"
        closeButton={true}
        style={{ '--offset': '80px' } as React.CSSProperties}
        toastOptions={{
          classNames: {
            toast: 'group toast',
            closeButton: 'text-gray-400 hover:text-gray-700',
          },
          duration: 3000,
        }}
        richColors={false}
        expand={false}
        visibleToasts={2}
        gap={6}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
