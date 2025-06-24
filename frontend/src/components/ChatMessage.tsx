import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Volume2, User, Sparkles } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    // Some browsers load voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, []);

  const handleSpeak = () => {
    const synth = window.speechSynthesis;

    // Stop speaking if already speaking
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.lang = message.language === 'hindi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.85;
    utterance.pitch = 1;

    // Choose Indian voice if available
    const preferredVoice = availableVoices.find(
      (voice) =>
        voice.lang === utterance.lang &&
        (voice.name.toLowerCase().includes('google') || voice.name.toLowerCase().includes('india'))
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
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
        <div className={`relative p-4 rounded-2xl shadow-lg backdrop-blur-sm ${
          message.isBot
            ? 'bg-gradient-to-br from-saffron-50 to-purple-50 border border-saffron-200 rounded-bl-none'
            : 'bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-br-none'
        }`}>
          <div className={`prose prose-sm max-w-none ${
            message.isBot ? 'prose-purple' : 'prose-blue'
          }`}>
            <ReactMarkdown
              components={{
                a: ({ href, children }) => {
                  if (href === '#start-server') {
                    return (
                      <span
                        onClick={async () => {
                          try {
                            await fetch('https://sarathi-ai.onrender.com/keep-alive');
                            alert('⚙️ Server pinged. Please try again in a minute.');
                          } catch (err) {
                            alert('Failed to ping the server.');
                          }
                        }}
                        className="cursor-pointer underline text-orange-600 font-semibold"
                      >
                        {children}
                      </span>
                    );
                  }
                  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                },
                h1: ({ children }) => (
                  <h1 className="text-3xl font-extrabold text-black mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-black mb-3">{children}</h2>
                ),
                p: ({ children }) => (
                  <p className="mb-3 leading-relaxed text-gray-800 font-inter">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="text-orange-600 font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                  <strong className="text-orange-600 font-semibold">{children}</strong> // remove italic effect
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-saffron-500 pl-4 italic text-gray-700 my-3">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>

          </div>

          {/* Actions: Timestamp + Speak */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
            <span className={`text-xs ${
              message.isBot ? 'text-purple-500' : 'text-blue-500'
            } font-inter`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>

            {message.isBot && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSpeak}
                className={`p-2 rounded-full ${
                  isSpeaking
                    ? 'bg-red-100 hover:bg-red-200 text-red-600'
                    : 'bg-saffron-100 hover:bg-saffron-200 text-saffron-600'
                } transition-colors duration-200`}
                title={isSpeaking ? 'Stop' : 'Listen to this message'}
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
