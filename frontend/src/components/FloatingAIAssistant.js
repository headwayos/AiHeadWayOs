import React, { useState, useEffect, useRef } from 'react';
import ModernAIChat from './ModernAIChat';

const FloatingAIAssistant = ({ context, theme = 'light', addNotification }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 120 });
  const [aiState, setAiState] = useState('idle'); // 'idle', 'thinking', 'speaking', 'listening'
  const [contextAwareness, setContextAwareness] = useState({});
  const [proactiveMode, setProactiveMode] = useState(true);
  
  const dragRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });

  // AI States and Animations
  const aiStates = {
    idle: { 
      emoji: '🤖', 
      color: 'blue', 
      description: 'Ready to help',
      animation: 'animate-pulse'
    },
    thinking: { 
      emoji: '🧠', 
      color: 'purple', 
      description: 'Processing...',
      animation: 'animate-spin'
    },
    speaking: { 
      emoji: '💬', 
      color: 'emerald', 
      description: 'Responding',
      animation: 'animate-bounce'
    },
    listening: { 
      emoji: '👂', 
      color: 'orange', 
      description: 'Listening',
      animation: 'animate-pulse'
    }
  };

  // Context-aware triggers
  useEffect(() => {
    if (context && proactiveMode) {
      analyzeContext(context);
    }
  }, [context, proactiveMode]);

  // Auto-position based on screen size
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 420),
        y: Math.min(prev.y, window.innerHeight - 120)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const analyzeContext = (newContext) => {
    setContextAwareness(prev => {
      const updated = { ...prev, ...newContext };
      
      // Proactive suggestions based on context
      if (newContext.chapter && !prev.chapter) {
        setAiState('thinking');
        setTimeout(() => {
          setAiState('speaking');
          if (addNotification) {
            addNotification('🤖 AI Assistant: Ready to help with this chapter!', 'info');
          }
          setTimeout(() => setAiState('idle'), 2000);
        }, 1000);
      }

      if (newContext.progress > 80 && prev.progress <= 80) {
        setAiState('speaking');
        if (addNotification) {
          addNotification('🎉 Great progress! Ask me anything about what you\'ve learned.', 'success');
        }
        setTimeout(() => setAiState('idle'), 2000);
      }

      return updated;
    });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, Math.min(e.clientX - dragStart.current.x, window.innerWidth - 420)),
        y: Math.max(0, Math.min(e.clientY - dragStart.current.y, window.innerHeight - 120))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const getStateColor = (state) => {
    const colors = {
      blue: theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500',
      purple: theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500',
      emerald: theme === 'dark' ? 'bg-emerald-600' : 'bg-emerald-500',
      orange: theme === 'dark' ? 'bg-orange-600' : 'bg-orange-500'
    };
    return colors[aiStates[state].color];
  };

  return (
    <>
      {/* Floating AI Avatar */}
      <div
        ref={dragRef}
        style={{ 
          left: position.x, 
          top: position.y,
          zIndex: isOpen ? 40 : 50
        }}
        className={`fixed transition-all duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
      >
        <div className="relative">
          {/* Main Avatar Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-16 h-16 rounded-full ${getStateColor(aiState)} text-white text-2xl shadow-2xl hover:scale-110 transition-all duration-300 ray-glow relative overflow-hidden`}
          >
            {/* Ray Border Animation */}
            <div className="absolute inset-0 rounded-full ray-border-animation opacity-75"></div>
            
            {/* AI State Emoji */}
            <div className={`relative z-10 ${aiStates[aiState].animation}`}>
              {aiStates[aiState].emoji}
            </div>

            {/* Context Indicator */}
            {Object.keys(contextAwareness).length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </button>

          {/* Status Tooltip */}
          {!isOpen && (
            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 ${
              theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'
            } text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}>
              {aiStates[aiState].description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
            </div>
          )}

          {/* Quick Actions Ring */}
          {!isOpen && aiState === 'idle' && (
            <div className="absolute inset-0 pointer-events-none">
              {['❓', '💡', '🎯', '📊'].map((emoji, index) => {
                const angle = (index / 4) * 2 * Math.PI;
                const radius = 40;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                return (
                  <button
                    key={index}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                      animationDelay: `${index * 0.1}s`
                    }}
                    className={`absolute top-1/2 left-1/2 w-8 h-8 rounded-full ${
                      theme === 'dark' ? 'bg-slate-700' : 'bg-white'
                    } text-sm shadow-lg pointer-events-auto hover:scale-110 transition-all duration-300 opacity-0 animate-fade-in`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(true);
                      // Quick action functionality
                      const actions = ['help', 'hint', 'focus', 'progress'];
                      if (addNotification) {
                        addNotification(`Quick action: ${actions[index]}`, 'info');
                      }
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Chat Interface */}
      {isOpen && (
        <div
          style={{ 
            left: Math.max(0, Math.min(position.x, window.innerWidth - 400)),
            top: Math.max(0, Math.min(position.y - 380, window.innerHeight - 400)),
            zIndex: 45
          }}
          className="fixed w-96 h-96"
        >
          <ModernAIChat
            sessionId={`floating-ai-${Date.now()}`}
            context={{
              ...contextAwareness,
              aiState,
              floatingMode: true
            }}
            theme={theme}
            isFloating={true}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Context Awareness Panel */}
      {isOpen && Object.keys(contextAwareness).length > 0 && (
        <div
          style={{ 
            left: Math.max(0, Math.min(position.x + 410, window.innerWidth - 250)),
            top: Math.max(0, Math.min(position.y - 380, window.innerHeight - 200)),
            zIndex: 44
          }}
          className={`fixed w-60 ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          } border rounded-xl shadow-2xl p-4`}
        >
          <h4 className={`text-sm font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          } mb-3 flex items-center`}>
            <span className="mr-2">🎯</span>
            Context Awareness
          </h4>
          
          <div className="space-y-2 text-xs">
            {contextAwareness.chapter && (
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Chapter:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>
                  {contextAwareness.chapter}
                </span>
              </div>
            )}
            {contextAwareness.progress !== undefined && (
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Progress:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>
                  {Math.round(contextAwareness.progress)}%
                </span>
              </div>
            )}
            {contextAwareness.timeSpent && (
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Time:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>
                  {contextAwareness.timeSpent}m
                </span>
              </div>
            )}
          </div>

          {/* Proactive Mode Toggle */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={proactiveMode}
                onChange={(e) => setProactiveMode(e.target.checked)}
                className="mr-2 rounded"
              />
              <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
                Proactive suggestions
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Fade-in Animation Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default FloatingAIAssistant;