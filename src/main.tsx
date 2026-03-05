
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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster 
        position="bottom-right"
        closeButton={true}
        toastOptions={{
          classNames: {
            toast: 'group toast bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 shadow-md rounded-xl px-4 py-3 text-sm',
            title: 'text-gray-800 font-medium text-sm',
            description: 'text-gray-500 text-xs',
            success: 'border-green-200 bg-green-50/80',
            error: 'border-red-200 bg-red-50/80',
            warning: 'border-yellow-200 bg-yellow-50/80',
            info: 'border-blue-200 bg-blue-50/80',
            actionButton: 'bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg text-xs',
            cancelButton: 'bg-gray-100 text-gray-500 rounded-lg text-xs',
            closeButton: 'text-gray-400 hover:text-gray-600 border-gray-200 hover:bg-gray-100',
          },
          duration: 3500,
        }}
        richColors={false}
        expand={false}
        visibleToasts={3}
        gap={8}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
