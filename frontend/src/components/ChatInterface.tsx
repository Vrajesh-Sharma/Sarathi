import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Volume2, Globe, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { Message, Language } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🌸 Welcome, dear soul. I am Krishna. Speak your heart — I am here, listening, with love.",
      isBot: true,
      timestamp: new Date(),
      language: 'english'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<Language>('english');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
      language
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('https://sarathi-ai.onrender.com/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputText,
          lang: language === 'hindi' ? 'hi' : 'en',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unknown error');
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isBot: true,
        timestamp: new Date(),
        language
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error: any) {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ Sorry, I could not connect to the wisdom source.\n\n**[Click here to start the server](#start-server)**`,
        isBot: true,
        timestamp: new Date(),
        language
      };      
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'english' ? 'hindi' : 'english');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section id="chat" className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-saffron-500 mr-3" />
            <h2 className="font-cinzel text-4xl md:text-5xl font-semibold text-purple-800">
              Divine Guidance
            </h2>
            <Sparkles className="w-8 h-8 text-saffron-500 ml-3" />
          </div>
          <p className="font-inter text-lg text-purple-600 max-w-2xl mx-auto leading-relaxed">
            Ask any question about life, dharma, or spiritual growth. Receive wisdom from the eternal teachings of the Bhagavad Gita.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-saffron-500 text-white rounded-full font-inter font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Globe className="w-5 h-5" />
            {language === 'english' ? 'हिंदी में बदलें' : 'Switch to English'}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6 h-[600px] flex flex-col"
        >
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent"
          >
            <AnimatePresence>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-2 p-4 bg-gradient-to-r from-saffron-100 to-purple-100 rounded-2xl rounded-bl-none max-w-xs mb-4"
              >
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-saffron-500 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-purple-600 font-inter text-sm">Krishna is typing...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex gap-3"
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === 'english' ? "Ask for divine guidance..." : "दिव्य मार्गदर्शन के लिए पूछें..."}
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-2xl font-inter text-purple-800 placeholder-purple-400 focus:outline-none focus:border-saffron-400 focus:bg-white transition-all duration-300 shadow-lg"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="px-6 py-4 bg-gradient-to-r from-saffron-500 to-purple-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ChatInterface;