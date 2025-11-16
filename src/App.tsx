
import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import VideoDetails from './pages/VideoDetails';
import Search from './pages/Search';
import ChannelDetails from './pages/ChannelDetails';
import WritingVideos from './pages/WritingVideos';
import ResetPassword from './pages/ResetPassword';
import Videos from './pages/Videos';
import HorizontalHomePage from './pages/HorizontalHomePage';
import { PlaybackProvider } from './contexts/PlaybackContext';
import { ColorProvider } from './contexts/ColorContext';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import { recordNavigation, setupScrollRestoration } from './utils/scrollRestoration';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { GoogleChatStyleLoading } from './components/ui/loading/GoogleChatStyleLoading';
import { useWelcomeAnimation } from './hooks/useWelcomeAnimation';
import { SiteImprovementNotification } from './components/SiteImprovementNotification';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ChannelsPage from './pages/admin/ChannelsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import CommentsPage from './pages/admin/CommentsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import VideosPage from './pages/admin/VideosPage';
import UsersPage from './pages/admin/UsersPage';
import ReportedVideosPage from './pages/admin/ReportedVideosPage';
import RequestsPage from './pages/admin/RequestsPage';
import ContactRequestsPage from './pages/admin/ContactRequestsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import LayoutCustomizationPage from './pages/admin/LayoutCustomizationPage';
import TestimonialsPage from './pages/admin/TestimonialsPage';
import AdminSEO from './pages/AdminSEO';
import { EmailPreferences } from './pages/EmailPreferences';
import { Unsubscribe } from './pages/Unsubscribe';

// Add the PagePreloader import
import { PagePreloader } from './components/PagePreloader';

// Homepage redirects to videos
const HomePage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/videos', { replace: true });
  }, [navigate]);

  return null;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showWelcome, markWelcomeAsShown, loadingProgress } = useWelcomeAnimation();
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();
  
  // Set up navigation tracking
  useEffect(() => {
    // Initialize the scroll restoration system
    setupScrollRestoration();
    
    // Record the initial location
    recordNavigation(location.pathname + location.search);
  }, []);
  
  // Record navigation for each location change
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    recordNavigation(currentPath);
  }, [location]);

  const handleLoadingComplete = () => {
    markWelcomeAsShown();
  };

  // Show loading animation as the first thing on any page visit
  if (showWelcome === true) {
    return (
      <GoogleChatStyleLoading 
        isVisible={true}
        onComplete={handleLoadingComplete}
      />
    );
  }

  // Show loading while determining welcome state
  if (showWelcome === null) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <img 
            src="/lovable-uploads/e425cacb-4c3a-4d81-b4e0-77fcbf10f61c.png" 
            alt="YidVid Logo" 
            className="w-20 h-20 object-contain drop-shadow-lg animate-pulse"
          />
        </div>
      </div>
    );
  }

  return (
    <PlaybackProvider>
      <ColorProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HorizontalHomePage />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/video/:videoId" element={<VideoDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/channel/:channelId" element={<ChannelDetails />} />
          <Route path="/writing-videos" element={<WritingVideos />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/email-preferences" element={<EmailPreferences />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/channels" element={<ChannelsPage />} />
          <Route path="/admin/youtube-channels" element={<ChannelsPage />} />
          <Route path="/admin/categories" element={<CategoriesPage />} />
          <Route path="/admin/comments" element={<CommentsPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/videos" element={<VideosPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/reported-videos" element={<ReportedVideosPage />} />
          <Route path="/admin/requests" element={<RequestsPage />} />
          <Route path="/admin/contact-requests" element={<ContactRequestsPage />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route path="/admin/layout" element={<LayoutCustomizationPage />} />
          <Route path="/admin/testimonials" element={<TestimonialsPage />} />
          <Route path="/admin/seo" element={<AdminSEO />} />
        </Routes>
        
        {/* Add the PagePreloader to prefetch the Videos page */}
        <PagePreloader />
        
        {/* Site-wide improvement notification */}
        <SiteImprovementNotification />
      </ColorProvider>
    </PlaybackProvider>
  );
}

export default App;
