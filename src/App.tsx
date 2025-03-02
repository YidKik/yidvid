
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ColorProvider } from "@/contexts/ColorContext";
import { PlaybackProvider } from "@/contexts/PlaybackContext";
import { useEffect } from "react";
import { getPageTitle } from "@/utils/pageTitle";
import { Helmet } from "react-helmet";

// Main pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import CategoryVideos from "@/pages/CategoryVideos";
import VideoDetails from "@/pages/VideoDetails";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Search from "@/pages/Search";
import MusicDetails from "@/pages/MusicDetails";
import ChannelDetails from "@/pages/ChannelDetails";

// Admin pages
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import VideosPage from "@/pages/admin/VideosPage";
import ChannelsPage from "@/pages/admin/ChannelsPage";
import UsersPage from "@/pages/admin/UsersPage";
import CommentsPage from "@/pages/admin/CommentsPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import RequestsPage from "@/pages/admin/RequestsPage";
import ContactRequestsPage from "@/pages/admin/ContactRequestsPage";
import ReportedVideosPage from "@/pages/admin/ReportedVideosPage";
import NotificationsPage from "@/pages/admin/NotificationsPage";
import LayoutCustomizationPage from "@/pages/admin/LayoutCustomizationPage";

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    document.title = getPageTitle(location.pathname);
  }, [location]);

  return (
    <>
      <Helmet>
        <title>{getPageTitle(location.pathname)}</title>
      </Helmet>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth isOpen={true} onOpenChange={() => {}} />} />
        <Route path="/category/:id" element={<CategoryVideos />} />
        <Route path="/video/:id" element={<VideoDetails />} />
        <Route path="/channel/:id" element={<ChannelDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/music/:id" element={<MusicDetails />} />
        
        {/* User routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Admin routes */}
        <Route path="/admin">
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="channels" element={<ChannelsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="comments" element={<CommentsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="contact-requests" element={<ContactRequestsPage />} />
          <Route path="reported-videos" element={<ReportedVideosPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="layout" element={<LayoutCustomizationPage />} />
        </Route>
      </Routes>
    </>
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
