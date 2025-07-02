import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

const NotebookInterface = ({ planId, plan, currentChapter, onComplete, addNotification }) => {
  const [chapterContent, setChapterContent] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [aiMode, setAiMode] = useState('waiting'); // 'waiting', 'active', 'typing'
  const [showChat, setShowChat] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const contentRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (planId && currentChapter !== null) {
      fetchChapterContent();
    }
  }, [planId, currentChapter]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100);
        setReadingProgress(progress);
        
        // Auto-activate AI when user reaches bottom
        if (progress > 80 && aiMode === 'waiting') {
          setAiMode('active');
          addNotification('AI Assistant is now active. Ask me anything about this chapter!', 'info');
        }
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, [aiMode, addNotification]);

  const fetchChapterContent = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API}/learning-plans/${planId}/chapter/${currentChapter}`);
      setChapterContent(response.data);
      setCurrentSection(0);
      setReadingProgress(0);
      setAiMode('waiting');
      setShowChat(false);
    } catch (error) {
      console.error('Error fetching chapter content:', error);
      addNotification('Failed to load chapter content', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || aiMode === 'waiting') return;

    const userMessage = { id: Date.now(), sender: 'user', content: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setAiMode('typing');

    try {
      const response = await axios.post(`${API}/ai-chat`, {
        session_id: `notebook-${planId}-${currentChapter}`,
        message: chatInput,
        context: {
          chapter: chapterContent?.title,
          section: chapterContent?.sections?.[currentSection]?.title,
          progress: readingProgress
        }
      });

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: response.data.response,
        timestamp: new Date()
      };

      setTimeout(() => {
        setChatMessages(prev => [...prev, aiMessage]);
        setAiMode('active');
      }, 1000);

    } catch (error) {
      console.error('Error sending chat message:', error);
      setAiMode('active');
      addNotification('Failed to get AI response', 'error');
    }
  };

  const renderContent = (content) => {
    if (!content) return null;

    // Simple markdown-like rendering
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-slate-800 mb-4 mt-8">{line.slice(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold text-slate-700 mb-3 mt-6">{line.slice(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-slate-600 mb-2 mt-4">{line.slice(4)}</h3>;
      } else if (line.startsWith('```')) {
        return null; // Handle code blocks separately
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1 text-slate-600">{line.slice(2)}</li>;
      } else if (line.trim()) {
        return <p key={index} className="mb-4 text-slate-600 leading-relaxed">{line}</p>;
      }
      return <br key={index} />;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="loading-pulse text-4xl mb-4">📖</div>
          <p className="text-slate-500">Loading chapter content...</p>
        </div>
      </div>
    );
  }

  if (!chapterContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Content Available</h3>
          <p className="text-slate-500">Please select a chapter to begin learning</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Table of Contents Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-2">
            📖 {chapterContent.title}
          </h2>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {Math.round(readingProgress)}% complete
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Sections</h3>
          {chapterContent.sections?.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                currentSection === index
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="font-medium text-sm mb-1">{section.title}</div>
              {section.estimated_time && (
                <div className="text-xs text-slate-400">⏱️ {section.estimated_time}</div>
              )}
            </button>
          ))}
        </div>

        {/* AI Status Indicator */}
        <div className="p-4 border-t border-slate-200">
          <div className={`flex items-center space-x-2 p-2 rounded-lg ${
            aiMode === 'waiting' ? 'bg-slate-100 text-slate-500' :
            aiMode === 'active' ? 'bg-emerald-50 text-emerald-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              aiMode === 'waiting' ? 'bg-slate-400' :
              aiMode === 'active' ? 'bg-emerald-400 animate-pulse-ring' :
              'bg-blue-400 animate-pulse'
            }`}></div>
            <span className="text-xs font-medium">
              AI Assistant {aiMode === 'waiting' ? 'Waiting' : aiMode === 'active' ? 'Ready' : 'Thinking...'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                {chapterContent.sections?.[currentSection]?.title || 'Getting Started'}
              </h1>
              <p className="text-sm text-slate-500">
                Section {currentSection + 1} of {chapterContent.sections?.length || 1}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showChat
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                💬 AI Chat
              </button>
              {aiMode !== 'waiting' && (
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Notebook Content */}
          <div className="flex-1 relative">
            <div 
              ref={contentRef}
              className="notebook-content h-full overflow-y-auto p-8 bg-white"
            >
              {chapterContent.sections?.[currentSection] ? (
                <div className="max-w-4xl mx-auto">
                  <div className="prose prose-slate max-w-none">
                    {renderContent(chapterContent.sections[currentSection].content)}
                  </div>

                  {/* Interactive Elements */}
                  <div className="mt-8 space-y-4">
                    {/* Key Points */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">🔑 Key Points</h4>
                      <ul className="space-y-1 text-blue-700 text-sm">
                        <li>• Understanding the fundamentals is crucial</li>
                        <li>• Practice makes perfect in cybersecurity</li>
                        <li>• Stay updated with latest threats</li>
                      </ul>
                    </div>

                    {/* Practice Exercise */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-800 mb-2">💡 Practice Exercise</h4>
                      <p className="text-emerald-700 text-sm mb-3">
                        Try implementing the concepts you've learned in this section.
                      </p>
                      <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                        Start Exercise
                      </button>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200">
                    <button
                      onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                      disabled={currentSection === 0}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous Section</span>
                    </button>

                    <button
                      onClick={() => {
                        if (currentSection < (chapterContent.sections?.length || 1) - 1) {
                          setCurrentSection(currentSection + 1);
                        } else {
                          onComplete();
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>
                        {currentSection < (chapterContent.sections?.length || 1) - 1 ? 'Next Section' : 'Complete Chapter'}
                      </span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Section Content</h3>
                    <p className="text-slate-500">Select a section to view its content</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Chat Sidebar */}
          {showChat && (
            <div className="w-80 bg-white border-l border-slate-200 flex flex-col chat-border">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">🤖 AI Assistant</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {aiMode === 'waiting' ? 'Keep reading to activate' : 'Ask me anything about this chapter'}
                </p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm py-8">
                    {aiMode === 'waiting' ? (
                      <>
                        <div className="text-2xl mb-2">👀</div>
                        <p>AI is waiting for you to read more content...</p>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl mb-2">💬</div>
                        <p>Start a conversation about this chapter!</p>
                      </>
                    )}
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-700 rounded-bl-none'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                {aiMode === 'typing' && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 px-4 py-2 rounded-lg rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={aiMode === 'waiting' ? 'Keep reading to activate...' : 'Ask about this chapter...'}
                    disabled={aiMode === 'waiting'}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || aiMode === 'waiting'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotebookInterface;