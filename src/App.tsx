import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NewPage from './pages/NewPage';
import VideoPage from './pages/VideoPage';
import SearchPage from './pages/SearchPage';
import ChannelPage from './pages/ChannelPage';
import WritingVideos from './pages/WritingVideos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NewPage />} />
        <Route path="/video/:videoId" element={<VideoPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/channel/:channelId" element={<ChannelPage />} />
        <Route path="/writing-videos" element={<WritingVideos />} />
      </Routes>
    </Router>
  );
}

export default App;
