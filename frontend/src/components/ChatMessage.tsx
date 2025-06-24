import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Volume2, User, Sparkles } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.lang = message.language === 'hindi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`mb-6 flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex max-w-[80%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${message.isBot ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            message.isBot 
              ? 'bg-gradient-to-br from-saffron-400 to-purple-500' 
              : 'bg-gradient-to-br from-purple-400 to-blue-500'
          }`}>
            {message.isBot ? (
              <Sparkles className="w-5 h-5 text-white" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div
          className={`relative p-4 rounded-2xl shadow-lg backdrop-blur-sm ${
            message.isBot
              ? 'bg-gradient-to-br from-saffron-50 to-purple-50 border border-saffron-200 rounded-bl-none'
              : 'bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-br-none'
          }`}
        >
          {/* Message Text */}
          <div className={`prose prose-sm max-w-none ${
            message.isBot ? 'prose-purple' : 'prose-blue'
          }`}>
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className={`mb-3 leading-relaxed ${
                    message.isBot ? 'text-purple-800' : 'text-blue-800'
                  } font-inter`}>
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className={`font-semibold ${
                    message.isBot ? 'text-saffron-700' : 'text-blue-700'
                  } font-devanagari`}>
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className={`italic font-devanagari text-lg leading-relaxed ${
                    message.isBot ? 'text-purple-700' : 'text-blue-700'
                  }`}>
                    {children}
                  </em>
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>

          {/* Message Actions */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
            <span className={`text-xs ${
              message.isBot ? 'text-purple-500' : 'text-blue-500'
            } font-inter`}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            
            {message.isBot && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSpeak}
                className="p-2 rounded-full bg-saffron-100 hover:bg-saffron-200 text-saffron-600 transition-colors duration-200"
                title="Listen to this message"
              >
                <Volume2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;