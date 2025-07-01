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
    
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      const response = await axios.post(`${API}/chat-with-ai?session_id=${session.session_id}&message=${encodeURIComponent(messageToSend)}`);
      
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
    <div className="max-w-full mx-auto h-screen flex flex-col bg-dark-bg">
      {/* Header */}
      <div className="glass-card rounded-t-2xl p-4 shadow-cyber-glow border-b border-neon-teal">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-neon-teal transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white font-mono">
                <span className="neon-text-teal">🤖 CYBER TUTOR</span> <span className="text-neon-green">ACTIVE</span>
              </h1>
              <p className="text-gray-300 font-mono text-sm">
                {plan && plan.topic.replace('-', ' ').toUpperCase()} • SESSION TIME: {timeSpent}m
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Progress Ring */}
            <div className="relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="40"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  className="text-dark-border"
                />
                <circle
                  cx="50" cy="50" r="40"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                  className="text-neon-green transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-neon-green font-mono">{Math.round(progress)}%</span>
              </div>
            </div>
            
            {/* System Status */}
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span className="text-sm text-neon-green font-mono">AI ONLINE</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-teal rounded-full animate-pulse"></div>
                <span className="text-sm text-neon-teal font-mono">TRACKING ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex bg-dark-bg overflow-hidden">
        {/* Learning Content Sidebar */}
        <div className="w-1/3 glass-card p-6 overflow-y-auto border-r border-neon-teal m-2 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4 font-mono">
            <span className="neon-text-teal">LEARNING MODULE</span>
          </h2>
          
          {plan && (
            <div className="space-y-6">
              {/* Current Topic */}
              <div className="glass-card p-4 border-neon-green">
                <h3 className="font-semibold text-neon-green mb-2 font-mono">CURRENT TOPIC</h3>
                <p className="text-white text-sm mb-2">
                  {currentTopic?.title || plan.topic.replace('-', ' ').toUpperCase()}
                </p>
                <p className="text-gray-300 text-xs mb-3">
                  {currentTopic?.description || "Building foundational knowledge"}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-dark-border rounded-full h-2">
                    <div 
                      className="h-2 bg-neon-green rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-neon-green text-xs font-mono">{progress}%</span>
                </div>
              </div>

              {/* Video Player Simulation */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-white mb-3 font-mono">📹 VIDEO LESSON</h3>
                <div className="video-player">
                  <div className="bg-black h-32 flex items-center justify-center text-neon-teal text-4xl">
                    {isVideoPlaying ? '⏸️' : '▶️'}
                  </div>
                  <div className="video-controls">
                    <button 
                      onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                      className="text-neon-teal hover:text-white"
                    >
                      {isVideoPlaying ? '⏸️' : '▶️'}
                    </button>
                    <div className="video-progress">
                      <div 
                        className="video-progress-fill"
                        style={{ width: `${videoProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm font-mono">
                      {Math.floor(videoProgress * 2.5 / 100)}:{Math.floor((videoProgress * 150 / 100) % 60).toString().padStart(2, '0')} / 2:30
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-white mb-3 font-mono">⚡ QUICK ACTIONS</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateProgress(Math.min(100, progress + 10))}
                    className="w-full text-left px-3 py-2 glass-card hover:bg-dark-card-hover rounded text-sm text-gray-300 transition-all font-mono"
                  >
                    ✓ MARK SECTION COMPLETE
                  </button>
                  <button
                    onClick={() => handleQuickAction('quiz')}
                    className="w-full text-left px-3 py-2 glass-card hover:bg-dark-card-hover rounded text-sm text-gray-300 transition-all font-mono"
                  >
                    🧠 REQUEST QUIZ
                  </button>
                  <button
                    onClick={() => handleQuickAction('demo')}
                    className="w-full text-left px-3 py-2 glass-card hover:bg-dark-card-hover rounded text-sm text-gray-300 transition-all font-mono"
                  >
                    💻 REQUEST DEMO
                  </button>
                  <button
                    onClick={() => handleQuickAction('next')}
                    className="w-full text-left px-3 py-2 glass-card hover:bg-dark-card-hover rounded text-sm text-gray-300 transition-all font-mono"
                  >
                    🎯 GET NEXT STEPS
                  </button>
                </div>
              </div>

              {/* Terminal Simulator */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-white mb-3 font-mono">💻 PRACTICE TERMINAL</h3>
                <div className="terminal h-32 overflow-y-auto">
                  {terminalHistory.slice(-5).map((entry, index) => (
                    <div key={index} className="mb-2">
                      <div className="terminal-prompt">
                        cybersec@lab:~$ <span className="terminal-command">{entry.command}</span>
                      </div>
                      <div className="text-neon-green text-xs">{entry.output}</div>
                    </div>
                  ))}
                  <div className="flex items-center">
                    <span className="terminal-prompt">cybersec@lab:~$ </span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTerminalCommand(terminalInput)}
                      className="bg-transparent border-none outline-none text-white font-mono text-sm flex-1"
                      placeholder="Type command..."
                    />
                  </div>
                </div>
              </div>

              {/* Study Plan Preview */}
              <div className="glass-card p-4 max-h-48 overflow-y-auto">
                <h3 className="font-semibold text-white mb-2 font-mono">📚 STUDY GUIDE</h3>
                <div className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                  {plan.curriculum.substring(0, 300)}...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'chat-bubble-user'
                      : 'chat-bubble-ai'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex items-center mb-2">
                      <span className="text-neon-green text-sm font-mono font-bold">🤖 CYBER TUTOR</span>
                      <div className="ml-2 w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap font-mono">{message.message}</div>
                  <div className="text-xs opacity-70 mt-2 font-mono">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="chat-bubble-ai">
                  <div className="flex items-center">
                    <span className="text-neon-green text-sm font-mono font-bold mr-2">🤖 CYBER TUTOR</span>
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm ml-2 font-mono">Analyzing and generating response...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Bar */}
          <div className="px-6 py-3 border-t border-dark-border">
            <div className="flex flex-wrap gap-2">
              {[
                { action: 'explain', label: 'Explain Concept', icon: '🔍' },
                { action: 'quiz', label: 'Quick Quiz', icon: '🧠' },
                { action: 'demo', label: 'Show Demo', icon: '💻' },
                { action: 'help', label: 'Get Help', icon: '❓' },
                { action: 'summary', label: 'Summarize', icon: '📝' },
              ].map((item) => (
                <button
                  key={item.action}
                  onClick={() => handleQuickAction(item.action)}
                  className="px-3 py-1 glass-card hover:bg-dark-card-hover text-neon-teal text-xs rounded-full transition-all font-mono"
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-dark-border">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask your AI tutor anything about cybersecurity..."
                className="flex-1 px-4 py-3 bg-dark-card border border-neon-teal rounded-lg text-white focus:ring-2 focus:ring-neon-teal focus:border-transparent font-mono"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="btn-neon px-6 py-3 font-bold"
              >
                {sendingMessage ? '⏳' : '🚀'} SEND
              </button>
            </div>
            
            {/* Keyboard Shortcuts */}
            <div className="mt-2 text-xs text-gray-400 font-mono text-center">
              <span className="text-neon-teal">TIP:</span> Use /quiz, /explain, /demo, or /help for quick commands
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningSession;