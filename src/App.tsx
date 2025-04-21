
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NewPage from './pages/NewPage';
import VideoDetails from './pages/VideoDetails';
import Search from './pages/Search';
import ChannelDetails from './pages/ChannelDetails';
import WritingVideos from './pages/WritingVideos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NewPage />} />
        <Route path="/video/:videoId" element={<VideoDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/channel/:channelId" element={<ChannelDetails />} />
        <Route path="/writing-videos" element={<WritingVideos />} />
      </Routes>
    </Router>
  );
}

export default App;
