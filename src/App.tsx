
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VideoDetails from './pages/VideoDetails';
import Search from './pages/Search';
import ChannelDetails from './pages/ChannelDetails';
import WritingVideos from './pages/WritingVideos';
import ResetPassword from './pages/ResetPassword';
import Videos from './pages/Videos';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Videos />} />
      <Route path="/video/:videoId" element={<VideoDetails />} />
      <Route path="/search" element={<Search />} />
      <Route path="/channel/:channelId" element={<ChannelDetails />} />
      <Route path="/writing-videos" element={<WritingVideos />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;
