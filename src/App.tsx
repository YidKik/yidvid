import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import VideoDetails from "@/pages/VideoDetails";
import ChannelDetails from "@/pages/ChannelDetails";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import MusicDetails from "@/pages/MusicDetails";
import { ColorProvider } from "@/contexts/ColorContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/video/:id" element={<VideoDetails />} />
          <Route path="/channel/:id" element={<ChannelDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/music/:id" element={<MusicDetails />} />
        </Routes>
        <Toaster />
        <Sonner />
      </ColorProvider>
    </QueryClientProvider>
  );
}

export default App;