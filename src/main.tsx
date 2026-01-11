
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
        toastOptions={{
          classNames: {
            toast: 'group toast bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-yellow-200 dark:border-yellow-800 shadow-xl shadow-yellow-100/50 dark:shadow-none rounded-2xl px-4 py-3',
            title: 'text-gray-900 dark:text-white font-semibold',
            description: 'text-gray-600 dark:text-gray-300',
            success: 'border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-gray-900',
            error: 'border-red-300 dark:border-red-700 bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-gray-900',
            warning: 'border-yellow-400 dark:border-yellow-600 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-900',
            info: 'border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900',
            actionButton: 'bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg',
            cancelButton: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg',
          },
          duration: 4000,
        }}
        richColors={false}
        expand={false}
        visibleToasts={4}
        gap={12}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
