
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
import ChannelsPage from "@/pages/admin/ChannelsPage";
import CommentsPage from "@/pages/admin/CommentsPage";
import RequestsPage from "@/pages/admin/RequestsPage";
import UsersPage from "@/pages/admin/UsersPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import VideosPage from "@/pages/admin/VideosPage";
import CategoryVideos from "@/pages/CategoryVideos";
import ContactRequestsPage from "@/pages/admin/ContactRequestsPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";

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
      <Route path="/category/:id" element={<CategoryVideos />} />
      
      {/* Admin Routes */}
      <Route path="/admin/channels" element={<ChannelsPage />} />
      <Route path="/admin/comments" element={<CommentsPage />} />
      <Route path="/admin/requests" element={<RequestsPage />} />
      <Route path="/admin/users" element={<UsersPage />} />
      <Route path="/admin/analytics" element={<AnalyticsPage />} />
      <Route path="/admin/videos" element={<VideosPage />} />
      <Route path="/admin/categories" element={<CategoriesPage />} />
      <Route path="/admin/contact-requests" element={<ContactRequestsPage />} />
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
