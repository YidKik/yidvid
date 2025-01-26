import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from "@/components/ui/tooltip"
import { BrowserRouter as Router } from "react-router-dom"
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      meta: {
        onError: (error: Error) => {
          console.error('Query error:', error)
        }
      }
    },
  },
})

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <TooltipProvider delayDuration={0}>
          <App />
        </TooltipProvider>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
)