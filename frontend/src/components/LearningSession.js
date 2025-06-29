import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LearningSession = ({ planId, onBack }) => {
  const [session, setSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const messagesEndRef = useRef(null);
  const startTimeRef = useRef(Date.now());

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
      
      // Load chat history
      await loadChatHistory(sessionResponse.data.session_id);
      
      // Send welcome message if this is a new session
      if (!chatMessages.length) {
        await sendWelcomeMessage(sessionResponse.data.session_id, planResponse.data);
      }
      
    } catch (error) {
      console.error('Error starting learning session:', error);
    } finally {
      setLoading(false);
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
    const welcomeMessage = `Welcome to your personalized cybersecurity learning journey! 🎯

I'm your AI tutor, and I'll be guiding you through: **${planData.topic.replace('-', ' ').toUpperCase()}**

Here's what we'll cover together:
- Interactive learning sessions
- Real-time Q&A support  
- Practical exercises and guidance
- Progress tracking and feedback

Feel free to ask me anything about:
✓ Concepts you don't understand
✓ Practical implementation questions
✓ Career advice and next steps
✓ Study strategies and tips

Ready to begin? What would you like to start with today?`;

    try {
      const response = await axios.post(`${API}/chat-with-ai?session_id=${sessionId}&message=${encodeURIComponent("Welcome the learner and introduce the learning plan")}`);
      
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
    
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      const response = await axios.post(`${API}/chat-with-ai?session_id=${session.session_id}&message=${encodeURIComponent(messageToSend)}`);
      
      const aiMessage = {
        id: response.data.message_id,
        session_id: session.session_id,
        sender: 'ai',
        message: response.data.ai_response,
        timestamp: new Date().toISOString(),
        message_type: 'text'
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now().toString(),
        session_id: session.session_id,
        sender: 'ai',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        message_type: 'error'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
    }
  };

  const updateProgress = async (newProgress) => {
    if (!session) return;
    
    try {
      await axios.post(`${API}/update-progress?session_id=${session.session_id}&progress_percentage=${newProgress}&time_spent=${timeSpent}`);
      setProgress(newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const quickQuestions = [
    "Can you explain this concept in simpler terms?",
    "What are some real-world examples?",
    "How do I implement this in practice?",
    "What are the common mistakes to avoid?",
    "Can you give me a step-by-step guide?",
    "What should I study next?"
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Starting your learning session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 rounded-t-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                🤖 AI Learning Session
              </h1>
              <p className="text-gray-300">
                {plan && plan.topic.replace('-', ' ').toUpperCase()} • {timeSpent} min
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Progress</div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-white font-medium">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex bg-gray-900 rounded-b-2xl overflow-hidden">
        {/* Learning Plan Sidebar */}
        <div className="w-1/3 bg-gray-800 p-6 overflow-y-auto border-r border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">📚 Learning Plan</h2>
          
          {plan && (
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Current Topic</h3>
                <p className="text-gray-300 text-sm">
                  {plan.topic.replace('-', ' ').toUpperCase()}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Level: {plan.level} • Duration: {plan.duration_weeks} weeks
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateProgress(Math.min(100, progress + 10))}
                    className="w-full text-left px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm text-gray-300 transition-colors"
                  >
                    ✓ Mark Section Complete
                  </button>
                  <button
                    onClick={() => setNewMessage("Can you quiz me on what we've learned?")}
                    className="w-full text-left px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm text-gray-300 transition-colors"
                  >
                    🧠 Request a Quiz
                  </button>
                  <button
                    onClick={() => setNewMessage("What should I focus on next?")}
                    className="w-full text-left px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm text-gray-300 transition-colors"
                  >
                    🎯 Get Next Steps
                  </button>
                </div>
              </div>

              {/* Study Plan Preview */}
              <div className="bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-white mb-2">Study Guide</h3>
                <div className="text-xs text-gray-300 whitespace-pre-wrap">
                  {plan.curriculum.substring(0, 500)}...
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex items-center mb-2">
                      <span className="text-blue-400 text-sm font-medium">🤖 AI Tutor</span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">{message.message}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {sendingMessage && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-6 py-2 border-t border-gray-700">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => setNewMessage(question)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-full transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask your AI tutor anything..."
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningSession;