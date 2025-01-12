import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import VideoDetails from "@/pages/VideoDetails";
import ChannelDetails from "@/pages/ChannelDetails";
import Settings from "@/pages/Settings";
import Dashboard from "@/pages/Dashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/video/:id" element={<VideoDetails />} />
            <Route path="/channel/:id" element={<ChannelDetails />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <Toaster />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;