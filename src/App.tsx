
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import VideoDetails from './pages/VideoDetails';
import Search from './pages/Search';
import ChannelDetails from './pages/ChannelDetails';
import WritingVideos from './pages/WritingVideos';
import ResetPassword from './pages/ResetPassword';
import Videos from './pages/Videos';
import History from './pages/History';
import LandingPage from './pages/LandingPage';
import { PlaybackProvider } from './contexts/PlaybackContext';
import { ColorProvider } from './contexts/ColorContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { SidebarProvider } from './contexts/SidebarContext';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import { recordNavigation, setupScrollRestoration } from './utils/scrollRestoration';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import { EmailPreferences } from './pages/EmailPreferences';
import { Unsubscribe } from './pages/Unsubscribe';
import About from './pages/About';
import Favorites from './pages/Favorites';
import WatchLater from './pages/WatchLater';
import Playlists from './pages/Playlists';

import { PagePreloader } from './components/PagePreloader';
import { TopLoadingBar } from './components/ui/TopLoadingBar';
import { GlobalHeader } from './components/layout/GlobalHeader';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { useSessionManager } from './hooks/useSessionManager';
import { useIsMobile } from './hooks/use-mobile';

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, session } = useSessionManager();
  const { isDesktop } = useIsMobile();
  
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

  return (
    <>
      <TopLoadingBar />
      <GlobalHeader />
      {isDesktop ? (
        <Sidebar isAuthenticated={isAuthenticated} userId={session?.user?.id} />
      ) : (
        <MobileBottomNav isAuthenticated={isAuthenticated} />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
        <Route path="/history" element={<History />} />
        <Route path="/about" element={<About />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/watch-later" element={<WatchLater />} />
        <Route path="/playlists" element={<Playlists />} />
        
        {/* Admin route - single entry point, tabs handled internally */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      
      {/* Add the PagePreloader to prefetch the Videos page */}
      <PagePreloader />
    </>
  );
}

function App() {

  return (
    <LoadingProvider>
      <PlaybackProvider>
        <ColorProvider>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </ColorProvider>
      </PlaybackProvider>
    </LoadingProvider>
  );
}

export default App;
