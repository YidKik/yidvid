import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import VideoDetails from "@/pages/VideoDetails";
import ChannelDetails from "@/pages/ChannelDetails";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Music from "@/pages/Music";
import MusicDetails from "@/pages/MusicDetails";
import { ColorProvider } from "@/contexts/ColorContext";

function App() {
  return (
    <ColorProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/video/:id" element={<VideoDetails />} />
        <Route path="/channel/:id" element={<ChannelDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/music" element={<Music />} />
        <Route path="/music/:id" element={<MusicDetails />} />
      </Routes>
      <Toaster />
      <Sonner />
    </ColorProvider>
  );
}

export default App;