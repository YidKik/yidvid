
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ColorProvider } from "@/contexts/ColorContext";
import { PlaybackProvider } from "@/contexts/PlaybackContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { useEffect, useState } from "react";
import { getPageTitle } from "@/utils/pageTitle";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
  const { isAuthenticated, session } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Determine when to show auth dialog
  useEffect(() => {
    const protectedRoutes = ["/dashboard", "/settings"];
    const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
    
    // Don't automatically show auth dialog on page loads - let the components decide
    if (isProtectedRoute && !isAuthenticated && session === null) {
      // Instead of showing dialog, redirect to home
      // The individual components can decide if they want to show dialog
      // This prevents the dialog from automatically appearing on reload
    } else {
      // Always ensure dialog is hidden for non-auth routes or authenticated users
      setShowAuthDialog(false);
    }
  }, [location, isAuthenticated, session]);

  useEffect(() => {
    document.title = getPageTitle(location.pathname);
    
    // Force check viewport and console log it
    console.log(`Current viewport width: ${window.innerWidth}px`);
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    
    const handleResize = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      console.log(`Viewport resized to: ${window.innerWidth}px x ${window.innerHeight}px`);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location]);

  return (
    <>
      <Helmet>
        <title>{getPageTitle(location.pathname)}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth isOpen={showAuthDialog} onOpenChange={setShowAuthDialog} />} />
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
      <SessionProvider>
        <ColorProvider>
          <PlaybackProvider>
            <AppRoutes />
            <Toaster />
            <Sonner />
          </PlaybackProvider>
        </ColorProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default App;
