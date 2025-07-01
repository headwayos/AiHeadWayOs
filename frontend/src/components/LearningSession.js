import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LearningSession = ({ planId, onBack, addNotification }) => {
  const [session, setSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [codeExample, setCodeExample] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [currentChapter, setCurrentChapter] = useState(null);
  const [chapterContent, setChapterContent] = useState(null);
  const [aiAssistantMode, setAiAssistantMode] = useState('waiting'); // 'waiting', 'active', 'minimized'
  const [readingProgress, setReadingProgress] = useState(0);
  const [showTableOfContents, setShowTableOfContents] = useState(true);
  const messagesEndRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const contentRef = useRef(null);

  useEffect(() => {
    startLearningSession();
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)); // minutes
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    // Track reading progress
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
        setReadingProgress(progress);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, [chapterContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startLearningSession = async () => {
    try {
      setLoading(true);
      
      // Get the learning plan
      const planResponse = await axios.get(`${API}/learning-plans/${planId}`);
      setPlan(planResponse.data);
      
      // Start learning session
      const sessionResponse = await axios.post(`${API}/start-learning-session?plan_id=${planId}&user_id=anonymous`);
      setSession(sessionResponse.data);
      
      // Load first chapter content
      if (planResponse.data.table_of_contents && planResponse.data.table_of_contents.chapters.length > 0) {
        const firstChapter = planResponse.data.table_of_contents.chapters[0];
        await loadChapterContent(firstChapter.id);
        setCurrentChapter(firstChapter);
      }
      
      // Load chat history
      await loadChatHistory(sessionResponse.data.session_id);
      
      // Send welcome message if this is a new session
      if (!chatMessages.length) {
        await sendWelcomeMessage(sessionResponse.data.session_id, planResponse.data);
      }
      
    } catch (error) {
      console.error('Error starting learning session:', error);
      addNotification?.('Error starting learning session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadChapterContent = async (chapterId) => {
    try {
      const response = await axios.get(`${API}/learning-plans/${planId}/chapter/${chapterId}`);
      setChapterContent(response.data);
      setReadingProgress(0);
      setAiAssistantMode('waiting'); // AI waits while user reads
    } catch (error) {
      console.error('Error loading chapter content:', error);
      addNotification?.('Error loading chapter content', 'error');
    }
  };

  const loadChatHistory = async (sessionId) => {
    try {
      const response = await axios.get(`${API}/chat-history/${sessionId}`);
      setChatMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendWelcomeMessage = async (sessionId, planData) => {
    const welcomeMessage = `🛡️ **CYBER TUTOR AI READY** 

Welcome to your personalized cybersecurity learning session! I'm your AI instructor for **${planData.topic.replace('-', ' ').toUpperCase()}**.

**I'M HERE TO HELP:**
🎯 I'll wait while you read each chapter
📚 Ask me questions about any concept
🔍 Request explanations or examples
💡 Get hints when you're stuck
🛠️ Practice with interactive demos

**READING MODE ACTIVATED:**
I can see you're starting with the first chapter. Take your time to read through the content. When you're ready to discuss, ask me anything!

**Available Commands:**
• \`/explain [concept]\` - Deep explanations
• \`/example [topic]\` - Code examples  
• \`/quiz\` - Test your knowledge
• \`/help\` - Show all commands

I'm watching your progress and ready to assist whenever you need! 📖✨`;

    try {
      const aiMessage = {
        id: Date.now().toString(),
        session_id: sessionId,
        sender: 'ai',
        message: welcomeMessage,
        timestamp: new Date().toISOString(),
        message_type: 'welcome'
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage || !session) return;

    const userMessage = {
      id: Date.now().toString(),
      session_id: session.session_id,
      sender: 'user',
      message: newMessage,
      timestamp: new Date().toISOString(),
      message_type: 'text'
    };

    setChatMessages(prev => [...prev, userMessage]);
    setSendingMessage(true);
    setIsTyping(true);
    setAiAssistantMode('active'); // AI becomes active when user asks something
    
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      // Add context about current chapter to the message
      let contextualMessage = messageToSend;
      if (chapterContent) {
        contextualMessage = `[Currently reading: ${chapterContent.title}] ${messageToSend}`;
      }

      const response = await axios.post(`${API}/chat-with-ai?session_id=${session.session_id}&message=${encodeURIComponent(contextualMessage)}`);
      
      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false);
        const aiMessage = {
          id: response.data.message_id || Date.now().toString(),
          session_id: session.session_id,
          sender: 'ai',
          message: response.data.ai_response,
          timestamp: new Date().toISOString(),
          message_type: 'text'
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        
        // Return to waiting mode after responding
        setTimeout(() => setAiAssistantMode('waiting'), 3000);
      }, 1500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      const errorMessage = {
        id: Date.now().toString(),
        session_id: session.session_id,
        sender: 'ai',
        message: '🚨 **SYSTEM ERROR** - Connection lost. Please try again.',
        timestamp: new Date().toISOString(),
        message_type: 'error'
      };
      setChatMessages(prev => [...prev, errorMessage]);
      addNotification?.('Error sending message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleChapterChange = async (chapter) => {
    setCurrentChapter(chapter);
    await loadChapterContent(chapter.id);
    
    // Notify AI about chapter change
    const contextMessage = {
      id: Date.now().toString(),
      session_id: session.session_id,
      sender: 'system',
      message: `📖 Now reading: **${chapter.title}** - I'm here when you need help!`,
      timestamp: new Date().toISOString(),
      message_type: 'system'
    };
    setChatMessages(prev => [...prev, contextMessage]);
  };

  const updateProgress = async (newProgress) => {
    if (!session) return;
    
    try {
      await axios.post(`${API}/update-progress?session_id=${session.session_id}&progress_percentage=${newProgress}&time_spent=${timeSpent}`);
      setProgress(newProgress);
      addNotification?.(`Progress updated: ${newProgress}%`, 'success');
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleQuickAction = (action) => {
    const actions = {
      quiz: "Generate a quick quiz on what we've covered so far",
      explain: "Can you explain the current topic in more detail?",
      demo: "Show me a practical demonstration or code example",
      next: "What should I focus on next in my learning path?",
      help: "What commands and features are available?",
      summary: "Summarize what we've learned in this session"
    };
    
    setNewMessage(actions[action] || action);
  };

  const handleTerminalCommand = (command) => {
    const output = simulateTerminalCommand(command);
    setTerminalHistory(prev => [...prev, { command, output, timestamp: new Date().toISOString() }]);
    setTerminalInput('');
  };

  const simulateTerminalCommand = (command) => {
    const commands = {
      'ls': 'config.py  network_scan.py  vulnerability_test.py  logs/',
      'pwd': '/home/cybersec/practice',
      'whoami': 'cybersec-student',
      'nmap -sV localhost': 'Starting Nmap scan on localhost...\nPORT     STATE SERVICE VERSION\n22/tcp   open  ssh     OpenSSH 8.2p1\n80/tcp   open  http    nginx 1.18.0\n443/tcp  open  https   nginx 1.18.0',
      'help': 'Available commands: ls, pwd, whoami, nmap, netstat, ps, grep, cat, echo',
      'netstat -an': 'Active Internet connections:\nProto Local Address Foreign Address State\ntcp   0.0.0.0:22    0.0.0.0:*       LISTEN\ntcp   0.0.0.0:80    0.0.0.0:*       LISTEN',
    };
    
    return commands[command] || `Command '${command}' not found. Type 'help' for available commands.`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-teal mb-4 mx-auto"></div>
          <p className="text-neon-teal font-mono text-lg">INITIALIZING LEARNING SESSION...</p>
          <div className="mt-4 space-y-2">
            <div className="w-64 bg-dark-border rounded h-2 mx-auto">
              <div className="bg-neon-teal h-2 rounded animate-pulse" style={{width: '60%'}}></div>
            </div>
            <p className="text-gray-400 text-sm font-mono">Loading AI tutor interface...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto h-screen flex bg-dark-bg">
      {/* Left Sidebar - Table of Contents */}
      <div className={`${showTableOfContents ? 'w-80' : 'w-12'} transition-all duration-300 glass-card border-r border-neon-teal`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowTableOfContents(!showTableOfContents)}
              className="text-neon-teal hover:text-white transition-colors"
            >
              {showTableOfContents ? '◀' : '▶'}
            </button>
            {showTableOfContents && (
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-neon-teal transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
          
          {showTableOfContents && plan && (
            <>
              <h2 className="text-lg font-bold text-white mb-4 font-mono neon-text-teal">
                📚 COURSE OUTLINE
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2">
                {plan.table_of_contents?.chapters?.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterChange(chapter)}
                    className={`w-full text-left p-3 rounded-lg transition-all font-mono text-sm ${
                      currentChapter?.id === chapter.id
                        ? 'bg-neon-teal bg-opacity-20 text-neon-teal border border-neon-teal'
                        : 'text-gray-300 hover:bg-dark-card-hover hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-neon-green">{index + 1}.</span>
                      <span className="flex-1">{chapter.title}</span>
                      {currentChapter?.id === chapter.id && (
                        <span className="text-xs text-neon-teal">●</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 ml-6">
                      ⏱ {chapter.estimated_time || '15 min'}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Progress Summary */}
              <div className="mt-4 p-3 glass-card border border-neon-green">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-neon-green">PROGRESS</span>
                  <span className="text-sm font-mono text-white">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-dark-border rounded-full h-2">
                  <div 
                    className="h-2 bg-neon-green rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-2 font-mono">
                  Session time: {timeSpent}m • Reading: {readingProgress}%
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area - MDN Style Documentation */}
      <div className="flex-1 flex flex-col bg-dark-bg">
        {/* Header */}
        <div className="glass-card p-4 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-white font-mono">
                  {chapterContent ? (
                    <>
                      <span className="neon-text-teal">📖</span> {chapterContent.title}
                    </>
                  ) : (
                    <>
                      <span className="neon-text-teal">🤖 CYBER TUTOR</span> <span className="text-neon-green">LOADING</span>
                    </>
                  )}
                </h1>
                {chapterContent && (
                  <p className="text-gray-400 text-sm font-mono">
                    {plan?.topic.replace('-', ' ').toUpperCase()} • {chapterContent.estimated_time || '15 min'} read
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* AI Assistant Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono ${
                aiAssistantMode === 'active' ? 'bg-neon-green bg-opacity-20 text-neon-green' :
                aiAssistantMode === 'waiting' ? 'bg-neon-teal bg-opacity-20 text-neon-teal' :
                'bg-gray-600 bg-opacity-20 text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  aiAssistantMode === 'active' ? 'bg-neon-green animate-pulse' :
                  aiAssistantMode === 'waiting' ? 'bg-neon-teal animate-pulse' :
                  'bg-gray-400'
                }`}></div>
                <span>
                  AI {aiAssistantMode === 'active' ? 'ACTIVE' : aiAssistantMode === 'waiting' ? 'READY' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content + AI Assistant Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chapter Content - MDN Style */}
          <div className="flex-1 overflow-y-auto" ref={contentRef}>
            {chapterContent ? (
              <div className="max-w-4xl mx-auto p-8">
                {/* Article Header */}
                <article className="prose prose-invert prose-lg max-w-none">
                  <header className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4 font-mono neon-text-teal">
                      {chapterContent.title}
                    </h1>
                    <div className="flex items-center space-x-6 text-sm text-gray-400 mb-6">
                      <span className="flex items-center space-x-2">
                        <span>⏱</span>
                        <span>{chapterContent.estimated_time || '15 min'} read</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <span>📊</span>
                        <span>Difficulty: {chapterContent.difficulty_level || 'Intermediate'}</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <span>🎯</span>
                        <span>Progress: {readingProgress}%</span>
                      </span>
                    </div>
                    <p className="text-xl text-gray-300 leading-relaxed">
                      {chapterContent.description}
                    </p>
                  </header>

                  {/* Chapter Sections */}
                  {chapterContent.sections?.map((section, index) => (
                    <section key={index} className="mb-12">
                      <h2 className="text-2xl font-bold text-white mb-4 font-mono text-neon-green border-l-4 border-neon-green pl-4">
                        {section.title}
                      </h2>
                      
                      <div className="space-y-6">
                        {/* Section Content */}
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {section.content}
                        </div>

                        {/* Code Examples */}
                        {section.code_example && (
                          <div className="my-6">
                            <h3 className="text-lg font-semibold text-neon-teal mb-2 font-mono">💻 Code Example:</h3>
                            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                              <pre className="text-sm text-gray-300 overflow-x-auto">
                                <code>{section.code_example}</code>
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Practice Exercise */}
                        {section.practice_exercise && (
                          <div className="my-6 p-4 glass-card border-l-4 border-neon-teal">
                            <h3 className="text-lg font-semibold text-neon-teal mb-2 font-mono">🎯 Practice Exercise:</h3>
                            <p className="text-gray-300">{section.practice_exercise}</p>
                          </div>
                        )}

                        {/* Key Points */}
                        {section.key_points && (
                          <div className="my-6 p-4 glass-card border-l-4 border-neon-green">
                            <h3 className="text-lg font-semibold text-neon-green mb-2 font-mono">🔑 Key Points:</h3>
                            <ul className="space-y-2">
                              {section.key_points.map((point, idx) => (
                                <li key={idx} className="text-gray-300 flex items-start space-x-2">
                                  <span className="text-neon-green mt-1">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </section>
                  ))}

                  {/* Chapter Navigation */}
                  <footer className="mt-12 pt-8 border-t border-dark-border">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => updateProgress(Math.min(100, progress + 25))}
                        className="btn-neon px-6 py-3 font-mono"
                      >
                        ✓ MARK COMPLETE
                      </button>
                      
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleQuickAction('quiz')}
                          className="px-4 py-2 glass-card hover:bg-dark-card-hover text-neon-teal rounded-lg transition-all font-mono text-sm"
                        >
                          🧠 Test Knowledge
                        </button>
                        <button
                          onClick={() => handleQuickAction('explain')}
                          className="px-4 py-2 glass-card hover:bg-dark-card-hover text-neon-green rounded-lg transition-all font-mono text-sm"
                        >
                          🔍 Ask AI
                        </button>
                      </div>
                    </div>
                  </footer>
                </article>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-teal mb-4 mx-auto"></div>
                  <p className="text-neon-teal font-mono text-lg">LOADING CHAPTER CONTENT...</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - AI Assistant */}
          <div className="w-96 glass-card border-l border-neon-teal flex flex-col">
            {/* AI Assistant Header */}
            <div className="p-4 border-b border-dark-border">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white font-mono">
                  <span className="neon-text-teal">🤖 AI ASSISTANT</span>
                </h3>
                <div className={`flex items-center space-x-2 text-xs font-mono ${
                  aiAssistantMode === 'waiting' ? 'text-neon-teal' : 'text-neon-green'
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    aiAssistantMode === 'waiting' ? 'bg-neon-teal' : 'bg-neon-green'
                  }`}></div>
                  <span>{aiAssistantMode === 'waiting' ? 'WAITING' : 'ACTIVE'}</span>
                </div>
              </div>
              {aiAssistantMode === 'waiting' && (
                <p className="text-xs text-gray-400 mt-2 font-mono">
                  I'm here when you need help with the content! 📚
                </p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className={`${
                  message.sender === 'user' ? 'ml-4' : message.sender === 'system' ? '' : 'mr-4'
                }`}>
                  <div className={`p-3 rounded-lg text-sm font-mono ${
                    message.sender === 'user' 
                      ? 'bg-neon-teal bg-opacity-20 text-white ml-auto max-w-xs'
                      : message.sender === 'system'
                      ? 'bg-neon-green bg-opacity-10 text-neon-green text-center text-xs'
                      : 'bg-dark-card text-gray-300'
                  }`}>
                    {message.sender === 'ai' && (
                      <div className="flex items-center mb-2">
                        <span className="text-neon-teal text-xs font-bold">🤖 TUTOR</span>
                        <div className="ml-2 w-1 h-1 bg-neon-teal rounded-full animate-pulse"></div>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.message}</div>
                    <div className="text-xs opacity-70 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="mr-4">
                  <div className="bg-dark-card p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-neon-teal text-xs font-bold font-mono">🤖 TUTOR</span>
                      <div className="ml-2 w-1 h-1 bg-neon-teal rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-neon-teal rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-neon-teal rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-neon-teal rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-xs ml-2 font-mono text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-t border-dark-border">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { action: 'explain', label: 'Explain', icon: '🔍' },
                  { action: 'quiz', label: 'Quiz Me', icon: '🧠' },
                  { action: 'demo', label: 'Demo', icon: '💻' },
                  { action: 'help', label: 'Help', icon: '❓' },
                ].map((item) => (
                  <button
                    key={item.action}
                    onClick={() => handleQuickAction(item.action)}
                    className="px-2 py-1 glass-card hover:bg-dark-card-hover text-neon-teal text-xs rounded transition-all font-mono"
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-dark-border">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything about this chapter..."
                  className="flex-1 px-3 py-2 bg-dark-card border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-neon-teal focus:border-transparent font-mono"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-3 py-2 bg-neon-teal bg-opacity-20 hover:bg-opacity-30 text-neon-teal rounded transition-all text-sm font-mono"
                >
                  {sendingMessage ? '⏳' : '🚀'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningSession;