
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import CategoryVideos from "@/pages/CategoryVideos";
import VideoDetails from "@/pages/VideoDetails";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Search from "@/pages/Search";
import MusicDetails from "@/pages/MusicDetails";
import ChannelDetails from "@/pages/ChannelDetails";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import VideosPage from "@/pages/admin/VideosPage";
import ChannelsPage from "@/pages/admin/ChannelsPage";
import UsersPage from "@/pages/admin/UsersPage";
import CommentsPage from "@/pages/admin/CommentsPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import RequestsPage from "@/pages/admin/RequestsPage";
import ContactRequestsPage from "@/pages/admin/ContactRequestsPage";
import ReportedVideosPage from "@/pages/admin/ReportedVideosPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ColorProvider } from "@/contexts/ColorContext";
import { PlaybackProvider } from "@/contexts/PlaybackContext";
import { useState, useEffect } from "react";
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
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    document.title = getPageTitle(location.pathname);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route 
        path="/auth" 
        element={<Auth isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />} 
      />
      <Route path="/category/:id" element={<CategoryVideos />} />
      <Route path="/video/:id" element={<VideoDetails />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/search" element={<Search />} />
      <Route path="/music/:id" element={<MusicDetails />} />
      <Route path="/channel/:id" element={<ChannelDetails />} />
      
      {/* Admin routes */}
      <Route path="/admin/analytics" element={<AnalyticsPage />} />
      <Route path="/admin/videos" element={<VideosPage />} />
      <Route path="/admin/channels" element={<ChannelsPage />} />
      <Route path="/admin/users" element={<UsersPage />} />
      <Route path="/admin/comments" element={<CommentsPage />} />
      <Route path="/admin/categories" element={<CategoriesPage />} />
      <Route path="/admin/requests" element={<RequestsPage />} />
      <Route path="/admin/contact-requests" element={<ContactRequestsPage />} />
      <Route path="/admin/reported-videos" element={<ReportedVideosPage />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorProvider>
        <PlaybackProvider>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </PlaybackProvider>
      </ColorProvider>
    </QueryClientProvider>
  );
}

export default App;
