
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import VideoDetails from './pages/VideoDetails';
import Search from './pages/Search';
import ChannelDetails from './pages/ChannelDetails';
import WritingVideos from './pages/WritingVideos';
import ResetPassword from './pages/ResetPassword';
import Videos from './pages/Videos';
import NewHomePage from './pages/NewHomePage';
import { PlaybackProvider } from './contexts/PlaybackContext';
import { ColorProvider } from './contexts/ColorContext';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import { recordNavigation, setupScrollRestoration } from './utils/scrollRestoration';

// Admin Pages
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

function App() {
  const location = useLocation();
  
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

  return (
    <PlaybackProvider>
      <ColorProvider>
        <Routes>
          <Route path="/" element={<NewHomePage />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/video/:videoId" element={<VideoDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/channel/:channelId" element={<ChannelDetails />} />
          <Route path="/writing-videos" element={<WritingVideos />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin routes */}
          <Route path="/admin/channels" element={<ChannelsPage />} />
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
        </Routes>
      </ColorProvider>
    </PlaybackProvider>
  );
}

export default App;
