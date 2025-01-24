import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import VideoDetails from "@/pages/VideoDetails";
import ChannelDetails from "@/pages/ChannelDetails";
import Settings from "@/pages/Settings";
import Dashboard from "@/pages/Dashboard";
import { Toaster } from "sonner";
import { ColorProvider } from "@/contexts/ColorContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

function App() {
  return (
    <ColorProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/video/:id" element={<VideoDetails />} />
          <Route path="/channel/:id" element={<ChannelDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Toaster position="top-center" />
      </LanguageProvider>
    </ColorProvider>
  );
}

export default App;