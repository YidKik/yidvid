
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { Toaster } from '@/components/ui/sonner'
import { SessionProvider } from '@/contexts/SessionContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ColorProvider } from '@/contexts/ColorContext'
import { PlaybackProvider } from '@/contexts/PlaybackContext'
import App from './App'
import ResetPassword from './pages/ResetPassword'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <LanguageProvider>
            <ColorProvider>
              <PlaybackProvider>
                <Routes>
                  <Route path="/*" element={<App />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
                <Toaster position="top-right" richColors closeButton />
              </PlaybackProvider>
            </ColorProvider>
          </LanguageProvider>
        </SessionProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
