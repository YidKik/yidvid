import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import VideoDetails from "@/pages/VideoDetails";
import ChannelDetails from "@/pages/ChannelDetails";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import MusicDetails from "@/pages/MusicDetails";
import Search from "@/pages/Search";
import { ColorProvider } from "@/contexts/ColorContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { getPageTitle } from "@/utils/pageTitle";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    // Update document title based on current route
    document.title = getPageTitle(location.pathname);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/video/:id" element={<VideoDetails />} />
      <Route path="/channel/:id" element={<ChannelDetails />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/music/:id" element={<MusicDetails />} />
      <Route path="/search" element={<Search />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorProvider>
        <AppRoutes />
        <Toaster />
        <Sonner />
      </ColorProvider>
    </QueryClientProvider>
  );
}

export default App;