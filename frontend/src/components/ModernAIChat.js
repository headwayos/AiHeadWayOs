import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

const ModernAIChat = ({ sessionId, context, theme = 'light', isFloating = false, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiPersonality, setAiPersonality] = useState('helpful');
  const [chatMode, setChatMode] = useState('context'); // 'context', 'general', 'debug'
  const [isExpanded, setIsExpanded] = useState(!isFloating);
  const [suggestions, setSuggestions] = useState([]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // AI Personalities
  const personalities = {
    helpful: { 
      name: 'Cyber Mentor', 
      emoji: '🤖', 
      description: 'Helpful cybersecurity instructor',
      color: 'blue'
    },
    expert: { 
      name: 'Security Expert', 
      emoji: '🛡️', 
      description: 'Advanced security professional',
      color: 'purple'
    },
    friendly: { 
      name: 'Learning Buddy', 
      emoji: '😊', 
      description: 'Encouraging learning companion',
      color: 'emerald'
    }
  };

  // Context-aware suggestions
  const generateSuggestions = (context) => {
    const baseSuggestions = [
      "Explain this concept in simple terms",
      "What are the key takeaways?",
      "Can you give me a real-world example?",
      "How does this relate to cybersecurity?"
    ];

    if (context?.chapter) {
      return [
        `Tell me more about ${context.chapter}`,
        "What are the practical applications?",
        "What should I focus on most?",
        "How can I practice this?"
      ];
    }

    return baseSuggestions;
  };

  useEffect(() => {
    setSuggestions(generateSuggestions(context));
  }, [context]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with a welcome message
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        sender: 'ai',
        content: `Hi! I'm your ${personalities[aiPersonality].name} ${personalities[aiPersonality].emoji}. I'm here to help you learn cybersecurity. What would you like to know?`,
        timestamp: new Date(),
        type: 'welcome'
      };
      setMessages([welcomeMessage]);
    }
  }, [aiPersonality]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText = null) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${API}/ai-chat`, {
        session_id: sessionId || 'modern-chat',
        message: text,
        context: {
          ...context,
          personality: aiPersonality,
          chatMode
        }
      });

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: response.data.response,
        timestamp: new Date(),
        personality: aiPersonality
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000); // Realistic typing delay

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPersonalityColor = (personality) => {
    const colors = {
      blue: {
        bg: theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500',
        text: 'text-white',
        hover: theme === 'dark' ? 'hover:bg-blue-700' : 'hover:bg-blue-600'
      },
      purple: {
        bg: theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500',
        text: 'text-white',
        hover: theme === 'dark' ? 'hover:bg-purple-700' : 'hover:bg-purple-600'
      },
      emerald: {
        bg: theme === 'dark' ? 'bg-emerald-600' : 'bg-emerald-500',
        text: 'text-white',
        hover: theme === 'dark' ? 'hover:bg-emerald-700' : 'hover:bg-emerald-600'
      }
    };
    return colors[personalities[personality].color];
  };

  const ChatContainer = ({ children }) => {
    const baseClasses = `modern-ai-chat ray-border-animation ${
      theme === 'dark' 
        ? 'bg-slate-800 border-slate-700 text-white' 
        : 'bg-white border-slate-200 text-slate-800'
    } border rounded-xl shadow-2xl`;

    if (isFloating) {
      return (
        <div className={`fixed bottom-6 right-6 w-96 h-96 z-50 transition-all duration-300 ${
          isExpanded ? 'h-96' : 'h-16'
        } ${baseClasses}`}>
          {children}
        </div>
      );
    }

    return (
      <div className={`w-full h-full flex flex-col ${baseClasses}`}>
        {children}
      </div>
    );
  };

  return (
    <ChatContainer>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full ${getPersonalityColor(aiPersonality).bg} flex items-center justify-center text-lg relative`}>
            {personalities[aiPersonality].emoji}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              {personalities[aiPersonality].name}
            </h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Personality Selector */}
          <select
            value={aiPersonality}
            onChange={(e) => setAiPersonality(e.target.value)}
            className={`text-xs px-2 py-1 rounded ${
              theme === 'dark' 
                ? 'bg-slate-700 text-slate-300 border-slate-600' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            } border`}
          >
            {Object.entries(personalities).map(([key, personality]) => (
              <option key={key} value={key}>
                {personality.emoji} {personality.name}
              </option>
            ))}
          </select>

          {isFloating && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={isExpanded ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                </svg>
              </button>
              <button
                onClick={onClose}
                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {(!isFloating || isExpanded) && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? `${getPersonalityColor(aiPersonality).bg} ${getPersonalityColor(aiPersonality).text} rounded-br-none`
                      : `${theme === 'dark' ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'} rounded-bl-none`
                  } ${message.type === 'welcome' ? 'border-2 border-dashed border-emerald-400' : ''}`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className={`text-xs mt-2 opacity-70 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className={`px-4 py-3 rounded-2xl rounded-bl-none ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                }`}>
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      theme === 'dark' ? 'bg-slate-400' : 'bg-slate-500'
                    }`}></div>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      theme === 'dark' ? 'bg-slate-400' : 'bg-slate-500'
                    }`} style={{ animationDelay: '0.2s' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      theme === 'dark' ? 'bg-slate-400' : 'bg-slate-500'
                    }`} style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && messages.length <= 1 && (
            <div className={`px-4 py-2 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      theme === 'dark' 
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } transition-colors`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about cybersecurity..."
                className={`flex-1 px-4 py-3 rounded-full border ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  !inputValue.trim() || isTyping
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : `${getPersonalityColor(aiPersonality).bg} ${getPersonalityColor(aiPersonality).text} ${getPersonalityColor(aiPersonality).hover} ray-glow`
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </ChatContainer>
  );
};

export default ModernAIChat;