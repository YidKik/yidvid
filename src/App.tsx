
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

function App() {
  return (
    <PlaybackProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/video/:videoId" element={<VideoDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/channel/:channelId" element={<ChannelDetails />} />
        <Route path="/writing-videos" element={<WritingVideos />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </PlaybackProvider>
  );
}

export default App;
