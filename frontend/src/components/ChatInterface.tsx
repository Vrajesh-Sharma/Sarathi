import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Volume2, Globe, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { Message, Language } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🙏 Namaste! I am your spiritual guide, here to share the eternal wisdom of the Bhagavad Gita. What troubles your mind today, dear seeker?",
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
    // Only scroll the chat messages container, not the entire page
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
      const response = await fetch('http://localhost:5000/ask', {
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
        text: `❌ Sorry, I could not connect to the wisdom source. (${error.message})`,
        isBot: true,
        timestamp: new Date(),
        language
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateSpritualResponse = (query: string, lang: Language): string => {
    const responses = {
      english: [
        `**श्रीमद्भगवद्गीता अध्याय 2, श्लोक 47**\n\n*कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥*\n\n**Translation:** You have the right to perform your actions, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.\n\n**Guidance:** Focus on your dharma without attachment to outcomes. This brings inner peace and spiritual growth.`,
        
        `**श्रीमद्भगवद्गीता अध्याय 6, श्लोक 5**\n\n*उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥*\n\n**Translation:** One must deliver himself with the help of his mind, and not degrade himself. The mind is the friend of the conditioned soul, and his enemy as well.\n\n**Guidance:** You are your own best friend and worst enemy. Cultivate self-discipline and positive thoughts to elevate your consciousness.`,
        
        `**श्रीमद्भगवद्गीता अध्याय 18, श्लोक 66**\n\n*सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥*\n\n**Translation:** Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.\n\n**Guidance:** Trust in the divine plan. Surrender your ego and attachments, and you will find peace beyond understanding.`
      ],
      hindi: [
        `**श्रीमद्भगवद्गीता अध्याय 2, श्लोक 47**\n\n*कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥*\n\n**अनुवाद:** तुम्हारा अधिकार केवल कर्म पर है, फल पर कभी नहीं। कर्म के फल का कारण मत बनो और कर्म न करने में भी आसक्त मत होओ।\n\n**मार्गदर्शन:** फल की चिंता किए बिना अपने धर्म पर ध्यान दें। इससे आंतरिक शांति और आध्यात्मिक विकास होता है।`,
        
        `**श्रीमद्भगवद्गीता अध्याय 6, श्लोक 5**\n\n*उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥*\n\n**अनुवाद:** मनुष्य को चाहिए कि वह अपने मन की सहायता से अपना उद्धार करे, अपनी अवनति न करे। मन ही जीवात्मा का मित्र है और मन ही उसका शत्रु भी है।\n\n**मार्गदर्शन:** आप अपने सबसे अच्छे मित्र और सबसे बुरे शत्रु दोनों हैं। चेतना को ऊंचा उठाने के लिए आत्म-अनुशासन और सकारात्मक विचारों का विकास करें।`
      ]
    };

    const responseList = responses[lang];
    return responseList[Math.floor(Math.random() * responseList.length)];
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
        {/* Header */}
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

        {/* Language Toggle */}
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

        {/* Chat Messages - Fixed height container with scroll */}
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

        {/* Input Area */}
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