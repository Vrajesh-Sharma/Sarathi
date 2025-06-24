import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import ChatInterface from '../components/ChatInterface';
import Footer from '../components/Footer';

const ChatPage: React.FC = () => {
  const chatRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToChat = () => {
    chatRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleBackToVideo = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      {/* Back to Video Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleBackToVideo}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-purple-700 rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 border border-purple-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-inter text-sm font-medium">Back to Video</span>
      </motion.button>

      {/* Hero Section */}
      <HeroSection onBeginJourney={scrollToChat} />
      
      {/* Chat Interface */}
      <div ref={chatRef}>
        <ChatInterface />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ChatPage;