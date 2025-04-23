
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VideoDetails from './pages/VideoDetails';
import Search from './pages/Search';
import ChannelDetails from './pages/ChannelDetails';
import WritingVideos from './pages/WritingVideos';
import ResetPassword from './pages/ResetPassword';
import Videos from './pages/Videos';
import HomePage from './pages/HomePage';
import { PlaybackProvider } from './contexts/PlaybackContext';
import { ColorProvider } from './contexts/ColorContext';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <PlaybackProvider>
      <ColorProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/video/:videoId" element={<VideoDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/channel/:channelId" element={<ChannelDetails />} />
          <Route path="/writing-videos" element={<WritingVideos />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </ColorProvider>
    </PlaybackProvider>
  );
}

export default App;
