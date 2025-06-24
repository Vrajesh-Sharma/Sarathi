import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VideoLandingPage from './pages/VideoLandingPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VideoLandingPage />} />
        <Route path="/ask-krishna" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;