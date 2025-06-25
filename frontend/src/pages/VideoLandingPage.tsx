import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const VideoLandingPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = 0.5;
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("🔇 Autoplay failed, muting video.");
          video.muted = true;
          video.play();
          setIsMuted(true);
        });
      }
    }

    return () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, []);

  const handleChatWithKrishna = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  
    // Fire keep-alive ping in background
    fetch('https://sarathi-ai.onrender.com/keep-alive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Are you awake?' }),
    }).catch((err) => {
      console.warn('Keep-alive ping failed:', err);
    });
  
    // Redirect to chat page
    navigate('/ask-krishna');
  };
  

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={false}
        playsInline
        preload="auto"
      >
        <source src="/krishna-video.mp4" type="video/mp4" />
      </video>

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>

      {/* Sacred particles overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-divine-300 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-end px-6 pb-7">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="font-cinzel text-4xl md:text-6xl lg:text-7xl font-semibold text-white mb-6 leading-tight drop-shadow-2xl"
          >
            <span className="bg-gradient-to-r from-divine-200 via-saffron-200 to-purple-200 bg-clip-text text-transparent">
              Divine Presence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="font-inter text-xl md:text-2xl lg:text-3xl text-cream-100 mb-6 font-light italic drop-shadow-lg"
          >
            "Whenever dharma declines and adharma rises, I manifest myself."
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="font-devanagari text-lg md:text-xl text-divine-200 mb-12 opacity-90 drop-shadow-md"
          >
            यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ।<br />
            अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्‌ ॥<br />
            परित्राणाय साधूनां विनाशाय च दुष्कृताम्‌ ।<br />
            धर्मसंस्थापनार्थाय सम्भवामि युगे युगे ॥<br />
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 1.7 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleChatWithKrishna}
            className="group relative px-16 py-5 bg-gradient-to-r from-saffron-500 via-divine-500 to-purple-500 text-white font-inter font-semibold text-xl rounded-full shadow-2xl hover:shadow-saffron-500/40 transition-all duration-500 overflow-hidden border-2 border-white/20"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              Chat with Krishna
              <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-divine-400 via-saffron-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-110 transition-transform duration-700 ease-out"></div>
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="mt-8"
          >
            <p className="text-cream-200 text-base font-inter opacity-80 drop-shadow-sm">
              🙏 Seek divine guidance through the eternal wisdom of the Bhagavad Gita 🙏
            </p>
          </motion.div>
        </motion.div>

        {/* Audio Control Toggle */}
        {isMuted ? (
          <div className="absolute bottom-8 left-8 z-20">
            <button
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.muted = false;
                  video.volume = 0.5;
                  video.play();
                  setIsMuted(false);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm text-white text-sm rounded-full border border-white/20 hover:bg-black/60 transition"
            >
              🔊 Enable Sound
            </button>
          </div>
        ) : (
          <div className="absolute bottom-8 left-8 z-20">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-inter opacity-80">Audio Enabled</span>
            </div>
          </div>
        )}


        {/* Volume Hint */}
        <div className="absolute bottom-8 right-8">
          <p className="text-white/60 text-xs font-inter">
            🔊 Adjust your volume for the best experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoLandingPage;
