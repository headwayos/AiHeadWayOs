import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Import components
import Assessment from './components/Assessment';
import LearningSession from './components/LearningSession';
import CareerCanvas from './components/CareerCanvas';
import VisualLearningMap from './components/VisualLearningMap';
import SimplifiedOnboarding from './components/SimplifiedOnboarding';
import EnhancedDashboard from './components/EnhancedDashboard';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Flow management
const FLOW_STEPS = {
  ONBOARDING: 'onboarding',
  DASHBOARD: 'dashboard',
  ASSESSMENT: 'assessment',
  CAREER_CANVAS: 'career_canvas',
  PLAN_GENERATION: 'plan_generation',
  LEARNING_SESSION: 'learning_session',
  PROGRESS: 'progress'
};

// Main App Component
function App() {
  const [currentFlow, setCurrentFlow] = useState(FLOW_STEPS.ONBOARDING);
  const [flowData, setFlowData] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [careerCanvasData, setCareerCanvasData] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  useEffect(() => {
    // Check for existing session
    const savedFlow = localStorage.getItem('cyberlearn_flow');
    if (savedFlow) {
      try {
        const flowState = JSON.parse(savedFlow);
        setCurrentFlow(flowState.step || FLOW_STEPS.ONBOARDING);
        setFlowData(flowState.data || {});
        setGeneratedPlan(flowState.plan || null);
      } catch (e) {
        console.error('Error loading saved flow:', e);
      }
    }
    
    fetchUserProgress();
  }, []);

  // Save flow state
  useEffect(() => {
    localStorage.setItem('cyberlearn_flow', JSON.stringify({
      step: currentFlow,
      data: flowData,
      plan: generatedPlan
    }));
  }, [currentFlow, flowData, generatedPlan]);

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

  // Flow handlers
  const handleOnboardingComplete = (result) => {
    setFlowData(result.data);
    
    if (result.type === 'assessment') {
      setCurrentFlow(FLOW_STEPS.ASSESSMENT);
    } else if (result.type === 'skip_assessment') {
      setGeneratedPlan(result.plan);
      setCurrentFlow(FLOW_STEPS.LEARNING_SESSION);
      setCurrentPlanId(result.plan.plan_id);
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
    setCurrentFlow(FLOW_STEPS.LEARNING_SESSION);
  };

  const handleStartLearning = () => {
    if (generatedPlan) {
      setCurrentFlow(FLOW_STEPS.LEARNING_SESSION);
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
    localStorage.removeItem('cyberlearn_flow');
    setCurrentFlow(FLOW_STEPS.ONBOARDING);
    setFlowData({});
    setAssessmentResult(null);
    setCareerCanvasData(null);
    setGeneratedPlan(null);
    setCurrentPlanId(null);
    addNotification('Session reset! Starting fresh.', 'info');
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

      case FLOW_STEPS.LEARNING_SESSION:
        return (
          <div className="learning-session-container">
            {/* Navigation Header */}
            <div className="bg-dark-bg border-b border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBackToDashboard}
                    className="btn-cyber-secondary px-4 py-2"
                  >
                    ← Dashboard
                  </button>
                  <h1 className="text-xl font-bold text-white">
                    🛡️ CyberLearn Session
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentFlow(FLOW_STEPS.PROGRESS)}
                    className="btn-cyber-blue px-4 py-2"
                  >
                    📊 Progress
                  </button>
                  <button
                    onClick={resetFlow}
                    className="btn-cyber-red px-4 py-2"
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
    <div className="App min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Matrix Background Effect */}
      <div className="matrix-bg"></div>
      
      {/* Notifications */}
      <NotificationCenter notifications={notifications} />
      
      {/* Main Content */}
      <div className="relative z-10">
        {renderCurrentFlow()}
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