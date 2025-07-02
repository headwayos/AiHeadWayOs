import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Import EMERGENT-style components
import Assessment from './components/Assessment';
import LearningSession from './components/LearningSession';
import CareerCanvas from './components/CareerCanvas';
import VisualLearningMap from './components/VisualLearningMap';
import SimplifiedOnboarding from './components/SimplifiedOnboarding';
import EnhancedDashboard from './components/EnhancedDashboard';
import CommandPalette from './components/CommandPalette';
import RoadmapView from './components/RoadmapView';
import NotebookInterface from './components/NotebookInterface';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// EMERGENT-style Flow management
const FLOW_STEPS = {
  ONBOARDING: 'onboarding',
  DASHBOARD: 'dashboard',
  ASSESSMENT: 'assessment',
  CAREER_CANVAS: 'career_canvas',
  PLAN_GENERATION: 'plan_generation',
  ROADMAP: 'roadmap',
  NOTEBOOK: 'notebook',
  LEARNING_SESSION: 'learning_session',
  PROGRESS: 'progress'
};

// Main App Component with EMERGENT Design
function App() {
  const [currentFlow, setCurrentFlow] = useState(FLOW_STEPS.ONBOARDING);
  const [flowData, setFlowData] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [careerCanvasData, setCareerCanvasData] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    // Check for existing session
    const savedFlow = localStorage.getItem('emerald_learn_flow');
    if (savedFlow) {
      try {
        const flowState = JSON.parse(savedFlow);
        setCurrentFlow(flowState.step || FLOW_STEPS.ONBOARDING);
        setFlowData(flowState.data || {});
        setGeneratedPlan(flowState.plan || null);
        setCurrentChapter(flowState.chapter || 0);
      } catch (e) {
        console.error('Error loading saved flow:', e);
      }
    }
    
    fetchUserProgress();
    setupKeyboardShortcuts();
  }, []);

  // Save flow state
  useEffect(() => {
    localStorage.setItem('emerald_learn_flow', JSON.stringify({
      step: currentFlow,
      data: flowData,
      plan: generatedPlan,
      chapter: currentChapter
    }));
  }, [currentFlow, flowData, generatedPlan, currentChapter]);

  const setupKeyboardShortcuts = () => {
    const handleKeyDown = (e) => {
      // Command palette shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      
      // Quick navigation shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'd':
            e.preventDefault();
            setCurrentFlow(FLOW_STEPS.DASHBOARD);
            break;
          case 'r':
            e.preventDefault();
            if (generatedPlan) setCurrentFlow(FLOW_STEPS.ROADMAP);
            break;
          case 'n':
            e.preventDefault();
            if (generatedPlan) setCurrentFlow(FLOW_STEPS.NOTEBOOK);
            break;
          case 'p':
            e.preventDefault();
            setCurrentFlow(FLOW_STEPS.PROGRESS);
            break;
          case '/':
            e.preventDefault();
            // Toggle AI chat in current context
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  };

  const fetchUserProgress = async () => {
    try {
      const response = await axios.get(`${API}/user-progress/anonymous`);
      setUserProgress(response.data);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleCommandPaletteAction = (commandId) => {
    switch (commandId) {
      case 'assessment':
        setCurrentFlow(FLOW_STEPS.ASSESSMENT);
        break;
      case 'roadmap':
        if (generatedPlan) setCurrentFlow(FLOW_STEPS.ROADMAP);
        else addNotification('Complete assessment first to generate roadmap', 'warning');
        break;
      case 'notebook':
        if (generatedPlan) setCurrentFlow(FLOW_STEPS.NOTEBOOK);
        else addNotification('Complete assessment first to access notebook', 'warning');
        break;
      case 'progress':
        setCurrentFlow(FLOW_STEPS.PROGRESS);
        break;
      case 'dashboard':
        setCurrentFlow(FLOW_STEPS.DASHBOARD);
        break;
      case 'reset':
        resetFlow();
        break;
    }
  };

  // Flow handlers
  const handleOnboardingComplete = (result) => {
    setFlowData(result.data);
    
    if (result.type === 'assessment') {
      setCurrentFlow(FLOW_STEPS.ASSESSMENT);
    } else if (result.type === 'skip_assessment') {
      setGeneratedPlan(result.plan);
      setCurrentFlow(FLOW_STEPS.ROADMAP);
      setCurrentPlanId(result.plan.plan_id);
      addNotification('🎉 Learning plan generated! Check out your roadmap.', 'success');
    }
  };

  const handleAssessmentComplete = (result) => {
    setAssessmentResult(result);
    setFlowData(prev => ({ ...prev, assessmentResult: result }));
    setCurrentFlow(FLOW_STEPS.CAREER_CANVAS);
  };

  const handleCareerCanvasComplete = (data) => {
    setCareerCanvasData(data);
    setFlowData(prev => ({ ...prev, careerCanvasData: data }));
    setCurrentFlow(FLOW_STEPS.PLAN_GENERATION);
  };

  const handlePlanGenerated = (plan) => {
    setGeneratedPlan(plan);
    setCurrentPlanId(plan.plan_id);
    setCurrentFlow(FLOW_STEPS.ROADMAP);
    addNotification('🗺️ Your personalized roadmap is ready!', 'success');
  };

  const handleChapterSelect = (chapterIndex, chapter) => {
    setCurrentChapter(chapterIndex);
    setCurrentFlow(FLOW_STEPS.NOTEBOOK);
    addNotification(`📖 Starting: ${chapter.title}`, 'info');
  };

  const handleStartLearning = () => {
    if (generatedPlan) {
      setCurrentFlow(FLOW_STEPS.ROADMAP);
    } else {
      setCurrentFlow(FLOW_STEPS.ONBOARDING);
    }
  };

  const handleViewProgress = () => {
    setCurrentFlow(FLOW_STEPS.PROGRESS);
  };

  const handleBackToDashboard = () => {
    setCurrentFlow(FLOW_STEPS.DASHBOARD);
  };

  const resetFlow = () => {
    localStorage.removeItem('emerald_learn_flow');
    setCurrentFlow(FLOW_STEPS.ONBOARDING);
    setFlowData({});
    setAssessmentResult(null);
    setCareerCanvasData(null);
    setGeneratedPlan(null);
    setCurrentPlanId(null);
    setCurrentChapter(0);
    addNotification('✨ Fresh start! Welcome back.', 'info');
  };

  // Render current flow step
  const renderCurrentFlow = () => {
    switch (currentFlow) {
      case FLOW_STEPS.ONBOARDING:
        return (
          <SimplifiedOnboarding
            onComplete={handleOnboardingComplete}
            addNotification={addNotification}
          />
        );

      case FLOW_STEPS.DASHBOARD:
        return (
          <EnhancedDashboard
            userProgress={userProgress}
            onStartLearning={handleStartLearning}
            onViewProgress={handleViewProgress}
            addNotification={addNotification}
          />
        );

      case FLOW_STEPS.ASSESSMENT:
        return (
          <Assessment
            setupData={flowData}
            onComplete={handleAssessmentComplete}
            onBack={() => setCurrentFlow(FLOW_STEPS.ONBOARDING)}
            addNotification={addNotification}
          />
        );

      case FLOW_STEPS.CAREER_CANVAS:
        return (
          <CareerCanvas
            assessmentResult={assessmentResult}
            onComplete={handleCareerCanvasComplete}
            onBack={() => setCurrentFlow(FLOW_STEPS.ASSESSMENT)}
            addNotification={addNotification}
          />
        );

      case FLOW_STEPS.PLAN_GENERATION:
        return (
          <PlanGeneration
            assessmentResult={assessmentResult}
            careerCanvasData={careerCanvasData}
            onPlanGenerated={handlePlanGenerated}
            onBack={() => setCurrentFlow(FLOW_STEPS.CAREER_CANVAS)}
            addNotification={addNotification}
          />
        );

      case FLOW_STEPS.ROADMAP:
        return (
          <div className="min-h-screen bg-slate-50">
            {/* EMERGENT-style Navigation */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleBackToDashboard}
                      className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Dashboard</span>
                    </button>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <h1 className="text-lg font-semibold text-slate-800">Learning Roadmap</h1>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentFlow(FLOW_STEPS.NOTEBOOK)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      📖 Start Learning
                    </button>
                    <button
                      onClick={() => setShowCommandPalette(true)}
                      className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Command Palette (Ctrl+K)"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <RoadmapView
              plan={generatedPlan}
              onChapterSelect={handleChapterSelect}
              currentChapter={currentChapter}
              userProgress={userProgress}
            />
          </div>
        );

      case FLOW_STEPS.NOTEBOOK:
        return (
          <div className="h-screen flex flex-col">
            {/* Minimal Navigation */}
            <div className="bg-white border-b border-slate-200 flex-shrink-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setCurrentFlow(FLOW_STEPS.ROADMAP)}
                      className="flex items-center space-x-2 px-2 py-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Roadmap</span>
                    </button>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <span className="text-sm font-medium text-slate-700">Notebook</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCommandPalette(true)}
                      className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                      title="Command Palette (Ctrl+K)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <NotebookInterface
                planId={currentPlanId}
                plan={generatedPlan}
                currentChapter={currentChapter}
                onComplete={() => {
                  addNotification('🎉 Chapter completed! Great progress.', 'success');
                  fetchUserProgress();
                  setCurrentFlow(FLOW_STEPS.ROADMAP);
                }}
                addNotification={addNotification}
              />
            </div>
          </div>
        );

      case FLOW_STEPS.LEARNING_SESSION:
        return (
          <div className="learning-session-container">
            {/* Navigation Header */}
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBackToDashboard}
                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    ← Dashboard
                  </button>
                  <h1 className="text-xl font-bold text-slate-800">
                    🛡️ CyberLearn Session
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentFlow(FLOW_STEPS.PROGRESS)}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    📊 Progress
                  </button>
                  <button
                    onClick={resetFlow}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Learning Map and Session */}
            <div className="flex-1">
              {generatedPlan && (
                <LearningSession
                  planId={currentPlanId}
                  plan={generatedPlan}
                  onComplete={() => {
                    addNotification('🎉 Learning session completed!', 'success');
                    setCurrentFlow(FLOW_STEPS.DASHBOARD);
                  }}
                  addNotification={addNotification}
                />
              )}
            </div>
          </div>
        );

      case FLOW_STEPS.PROGRESS:
        return (
          <ProgressView
            userProgress={userProgress}
            generatedPlan={generatedPlan}
            onBack={handleBackToDashboard}
            addNotification={addNotification}
          />
        );

      default:
        return (
          <SimplifiedOnboarding
            onComplete={handleOnboardingComplete}
            addNotification={addNotification}
          />
        );
    }
  };

  return (
    <div className="App min-h-screen bg-slate-50 relative">
      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommandPaletteAction}
      />
      
      {/* EMERGENT-style Notifications */}
      <NotificationCenter notifications={notifications} />
      
      {/* Main Content */}
      <div className="relative">
        {renderCurrentFlow()}
      </div>

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setShowCommandPalette(true)}
          className="bg-slate-800 text-white p-3 rounded-full shadow-clean-lg hover:bg-slate-700 transition-colors group"
          title="Command Palette"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="absolute bottom-full right-0 mb-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Press Ctrl+K
          </div>
        </button>
      </div>
    </div>
  );
}

// Progress View Component
const ProgressView = ({ userProgress, generatedPlan, onBack, addNotification }) => {
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    completedCourses: 0,
    streak: 0
  });

  useEffect(() => {
    if (userProgress) {
      setStats({
        totalXP: userProgress.total_xp || 0,
        level: userProgress.level || 1,
        completedCourses: userProgress.completed_courses || 0,
        streak: userProgress.learning_streak || 0
      });
    }
  }, [userProgress]);

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📊 Learning Progress
            </h1>
            <p className="text-gray-400 font-mono">
              Track your cybersecurity learning journey
            </p>
          </div>
          <button
            onClick={onBack}
            className="btn-cyber-secondary px-6 py-3"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-neon-blue">{stats.totalXP}</div>
            <div className="text-sm text-gray-400 font-mono">TOTAL XP</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-neon-green">{stats.completedCourses}</div>
            <div className="text-sm text-gray-400 font-mono">COMPLETED</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-accent-green">{stats.streak}</div>
            <div className="text-sm text-gray-400 font-mono">DAY STREAK</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-cyber-purple">{stats.level}</div>
            <div className="text-sm text-gray-400 font-mono">LEVEL</div>
          </div>
        </div>

        {/* Visual Learning Map */}
        {generatedPlan && (
          <div className="glass-card p-6">
            <VisualLearningMap
              planId={generatedPlan.plan_id}
              plan={generatedPlan}
              onChapterSelect={(chapterId) => {
                addNotification(`Opening chapter: ${chapterId}`, 'info');
              }}
              currentChapterId={null}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Plan Generation Component (Simplified)
const PlanGeneration = ({ assessmentResult, careerCanvasData, onPlanGenerated, onBack, addNotification }) => {
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/generate-learning-plan`, {
        topic: 'network-security',
        level: assessmentResult?.skill_level || 'beginner',
        duration_weeks: 4,
        focus_areas: ['Hands-on Labs', 'Real-world Applications'],
        user_background: `Assessment Score: ${assessmentResult?.percentage || 0}%, Skill Level: ${assessmentResult?.skill_level || 'beginner'}`,
        assessment_result_id: assessmentResult?.result_id
      });

      onPlanGenerated(response.data);
      addNotification('Learning plan generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating plan:', error);
      addNotification('Failed to generate learning plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePlan();
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="glass-card p-8 text-center max-w-md">
        <div className="text-4xl mb-4">🔄</div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Generating Your Learning Plan
        </h2>
        <p className="text-gray-300 mb-6">
          Please wait while we create your personalized cybersecurity curriculum...
        </p>
        <div className="cyber-loader mx-auto"></div>
      </div>
    </div>
  );
};

// Notification Center Component
const NotificationCenter = ({ notifications }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`glass-card p-4 max-w-sm transform transition-all duration-300 ${
            notification.type === 'success' ? 'border-green-500 bg-green-500/10' :
            notification.type === 'error' ? 'border-red-500 bg-red-500/10' :
            notification.type === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
            'border-neon-blue bg-neon-blue/10'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="text-xl">
              {notification.type === 'success' ? '✅' :
               notification.type === 'error' ? '❌' :
               notification.type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <p className="text-white text-sm font-mono">
              {notification.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;