import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Import Modern AI Era Components
import ModernOnboarding from './components/ModernOnboarding';
import ModernDashboard from './components/ModernDashboard';
import ModernCommandPalette from './components/ModernCommandPalette';
import TextSelectionExplainer from './components/TextSelectionExplainer';
import VoiceInterface from './components/VoiceInterface';
import Assessment from './components/Assessment';
import LearningSession from './components/LearningSession';
import CareerCanvas from './components/CareerCanvas';
import EnhancedRoadmapView from './components/EnhancedRoadmapView';
import NotebookInterface from './components/NotebookInterface';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import NotificationCenter from './components/NotificationCenter';

// Import Multi-Gate Onboarding and Visual Map Components
import MultiGateOnboarding from './components/MultiGateOnboarding';
import PreplacedVisualMap from './components/PreplacedVisualMap';
import EnhancedVisualMap from './components/EnhancedVisualMap';
import VisualLearningMap from './components/VisualLearningMap';

// Import Enhanced Dashboard
import EnhancedDashboard from './components/EnhancedDashboard';

// Import Roadmap Components
import RoadmapView from './components/RoadmapView';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Modern AI Era Flow management
const FLOW_STEPS = {
  ONBOARDING: 'onboarding',
  MULTI_GATE_ONBOARDING: 'multi_gate_onboarding',
  DASHBOARD: 'dashboard',
  ASSESSMENT: 'assessment',
  CAREER_CANVAS: 'career_canvas',
  PLAN_GENERATION: 'plan_generation',
  ROADMAP: 'roadmap',
  NOTEBOOK: 'notebook',
  LEARNING_SESSION: 'learning_session',
  PROGRESS: 'progress',
  VISUAL_MAP: 'visual_map'
};

// Main App Component with Modern AI Era Design
function App() {
  const [currentFlow, setCurrentFlow] = useState(FLOW_STEPS.MULTI_GATE_ONBOARDING);
  const [theme, setTheme] = useState('light'); // Default to light theme for better compatibility
  const [flowData, setFlowData] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [careerCanvasData, setCareerCanvasData] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [aiContext, setAiContext] = useState({});
  const [showFloatingAI, setShowFloatingAI] = useState(true);
  const [enhancedMode, setEnhancedMode] = useState(true);
  const [showVoiceInterface, setShowVoiceInterface] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedFlow = localStorage.getItem('emerald_learn_flow');
    const savedTheme = localStorage.getItem('emerald_theme') || 'light';
    
    if (savedFlow) {
      try {
        const flowState = JSON.parse(savedFlow);
        setCurrentFlow(flowState.step || FLOW_STEPS.MULTI_GATE_ONBOARDING);
        setFlowData(flowState.data || {});
        setGeneratedPlan(flowState.plan || null);
        setCurrentChapter(flowState.chapter || 0);
        setCvAnalysis(flowState.cvAnalysis || null);
      } catch (e) {
        console.error('Error loading saved flow:', e);
      }
    }
    
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    fetchUserProgress();
    setupKeyboardShortcuts();
  }, []);

  // Save flow state
  useEffect(() => {
    localStorage.setItem('emerald_learn_flow', JSON.stringify({
      step: currentFlow,
      data: flowData,
      plan: generatedPlan,
      chapter: currentChapter,
      cvAnalysis: cvAnalysis
    }));
  }, [currentFlow, flowData, generatedPlan, currentChapter, cvAnalysis]);

  // Save theme
  useEffect(() => {
    localStorage.setItem('emerald_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    addNotification(`Switched to ${newTheme} mode`, 'info');
  };

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
      case 'ai_assistant':
        setShowFloatingAI(!showFloatingAI);
        addNotification(showFloatingAI ? 'AI Assistant hidden' : 'AI Assistant activated', 'info');
        break;
      case 'toggle_enhanced':
        setEnhancedMode(!enhancedMode);
        addNotification(`${enhancedMode ? 'Standard' : 'Enhanced'} mode activated`, 'info');
        break;
      case 'export':
        handleExportPlan();
        break;
      case 'help':
        addNotification('Voice commands: "start assessment", "show roadmap", "view progress"', 'info');
        break;
      case 'reset':
        resetFlow();
        break;
    }
  };

  const handleVoiceCommand = (commandId) => {
    handleCommandPaletteAction(commandId);
  };

  const handleExportPlan = () => {
    if (!generatedPlan) {
      addNotification('No learning plan to export', 'warning');
      return;
    }
    
    const exportData = {
      plan: generatedPlan,
      progress: userProgress,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberlearn-plan-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addNotification('📤 Learning plan exported successfully!', 'success');
  };

  // Enhanced flow handlers for multiple entry gates
  const handleMultiGateOnboardingComplete = (result) => {
    setFlowData(result.data);
    setCvAnalysis(result.cv_analysis || null);
    
    switch (result.type) {
      case 'assessment':
        setCurrentFlow(FLOW_STEPS.ASSESSMENT);
        break;
      case 'skip_assessment':
        setGeneratedPlan(result.plan);
        setCurrentFlow(FLOW_STEPS.ROADMAP);
        setCurrentPlanId(result.plan?.plan_id);
        addNotification('🎉 Learning plan generated! Check out your roadmap.', 'success');
        break;
      case 'cv_based':
        // Generate plan based on CV analysis
        generateCvBasedPlan(result);
        break;
      case 'visual_map':
        setGeneratedPlan(result.plan);
        setCurrentFlow(FLOW_STEPS.ROADMAP);
        setCurrentPlanId(result.plan?.plan_id);
        addNotification('🗺️ Visual map selection complete! Your roadmap is ready.', 'success');
        break;
      case 'back':
        setCurrentFlow(FLOW_STEPS.MULTI_GATE_ONBOARDING);
        break;
      default:
        setCurrentFlow(FLOW_STEPS.DASHBOARD);
    }
  };

  const generateCvBasedPlan = async (result) => {
    try {
      const cvData = result.data.cv_analysis;
      const response = await axios.post(`${API}/generate-learning-plan`, {
        topic: cvData.suggested_topic,
        level: cvData.experience_level,
        duration_weeks: cvData.recommended_duration,
        focus_areas: cvData.gaps.slice(0, 3), // Focus on top 3 gaps
        user_background: `CV Analysis: ${cvData.skills.join(', ')}`,
        skip_assessment: true
      });

      setGeneratedPlan(response.data);
      setCurrentPlanId(response.data.plan_id);
      setCurrentFlow(FLOW_STEPS.ROADMAP);
      addNotification('🎯 CV-based learning plan generated!', 'success');
    } catch (error) {
      console.error('Error generating CV-based plan:', error);
      addNotification('Failed to generate CV-based plan', 'error');
      setCurrentFlow(FLOW_STEPS.DASHBOARD);
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
    
    // Update AI context with chapter information
    setAiContext({
      chapter: chapter.title,
      chapterIndex,
      progress: 0,
      section: null,
      timeSpent: 0
    });
    
    addNotification(`📖 Starting: ${chapter.title}`, 'info');
  };

  const handleStartLearning = () => {
    if (generatedPlan) {
      setCurrentFlow(FLOW_STEPS.ROADMAP);
    } else {
      setCurrentFlow(FLOW_STEPS.MULTI_GATE_ONBOARDING);
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
    localStorage.removeItem('emerald_theme');
    setCurrentFlow(FLOW_STEPS.MULTI_GATE_ONBOARDING);
    setFlowData({});
    setAssessmentResult(null);
    setCareerCanvasData(null);
    setGeneratedPlan(null);
    setCurrentPlanId(null);
    setCurrentChapter(0);
    setCvAnalysis(null);
    setTheme('light');
    document.documentElement.setAttribute('data-theme', 'light');
    addNotification('✨ Fresh start! Welcome back.', 'info');
  };

  // Render current flow step
  const renderCurrentFlow = () => {
    switch (currentFlow) {
      case FLOW_STEPS.MULTI_GATE_ONBOARDING:
        return (
          <MultiGateOnboarding
            onComplete={handleMultiGateOnboardingComplete}
            addNotification={addNotification}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        );

      case FLOW_STEPS.VISUAL_MAP:
        return (
          <PreplacedVisualMap
            onComplete={handleMultiGateOnboardingComplete}
            addNotification={addNotification}
            theme={theme}
          />
        );

      case FLOW_STEPS.DASHBOARD:
        return (
          <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Dashboard
              </h1>
              <button
                onClick={toggleTheme}
                className={`theme-toggle ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : ''}`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
            <EnhancedDashboard
              userProgress={userProgress}
              onStartLearning={handleStartLearning}
              onViewProgress={handleViewProgress}
              addNotification={addNotification}
              theme={theme}
            />
          </div>
        );

      case FLOW_STEPS.ASSESSMENT:
        return (
          <Assessment
            setupData={flowData}
            onComplete={handleAssessmentComplete}
            onBack={() => setCurrentFlow(FLOW_STEPS.MULTI_GATE_ONBOARDING)}
            addNotification={addNotification}
            theme={theme}
          />
        );

      case FLOW_STEPS.CAREER_CANVAS:
        return (
          <CareerCanvas
            assessmentResult={assessmentResult}
            onComplete={handleCareerCanvasComplete}
            onBack={() => setCurrentFlow(FLOW_STEPS.ASSESSMENT)}
            addNotification={addNotification}
            theme={theme}
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
            theme={theme}
          />
        );

      case FLOW_STEPS.ROADMAP:
        return (
          <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* EMERGENT-style Navigation */}
            <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b sticky top-0 z-40`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleBackToDashboard}
                      className={`flex items-center space-x-2 px-3 py-2 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'} rounded-lg transition-colors`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Dashboard</span>
                    </button>
                    <div className={`h-6 w-px ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                    <h1 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Learning Roadmap</h1>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEnhancedMode(!enhancedMode)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        enhancedMode
                          ? 'bg-blue-600 text-white'
                          : `${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`
                      }`}
                    >
                      {enhancedMode ? '🚀 Enhanced' : '📋 Standard'}
                    </button>
                    <button
                      onClick={toggleTheme}
                      className={`theme-toggle ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : ''}`}
                      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                      {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button
                      onClick={() => setCurrentFlow(FLOW_STEPS.NOTEBOOK)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium ray-glow"
                    >
                      📖 Start Learning
                    </button>
                    <button
                      onClick={() => setShowCommandPalette(true)}
                      className={`p-2 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'} rounded-lg transition-colors`}
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

            {enhancedMode ? (
              <EnhancedRoadmapView
                plan={generatedPlan}
                onChapterSelect={handleChapterSelect}
                currentChapter={currentChapter}
                userProgress={userProgress}
                theme={theme}
              />
            ) : (
              <RoadmapView
                plan={generatedPlan}
                onChapterSelect={handleChapterSelect}
                currentChapter={currentChapter}
                userProgress={userProgress}
                theme={theme}
              />
            )}
          </div>
        );

      case FLOW_STEPS.NOTEBOOK:
        return (
          <div className="h-screen flex flex-col">
            {/* Minimal Navigation */}
            <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b flex-shrink-0`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setCurrentFlow(FLOW_STEPS.ROADMAP)}
                      className={`flex items-center space-x-2 px-2 py-1 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'} rounded transition-colors text-sm`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Roadmap</span>
                    </button>
                    <div className={`h-4 w-px ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Notebook</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleTheme}
                      className={`p-1 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'} rounded transition-colors`}
                    >
                      {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button
                      onClick={() => setShowCommandPalette(true)}
                      className={`p-1 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'} rounded transition-colors`}
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
                theme={theme}
              />
            </div>
          </div>
        );

      case FLOW_STEPS.LEARNING_SESSION:
        return (
          <div className="learning-session-container">
            {/* Navigation Header */}
            <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBackToDashboard}
                    className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} rounded-lg transition-colors`}
                  >
                    ← Dashboard
                  </button>
                  <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    🛡️ CyberLearn Session
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleTheme}
                    className={`theme-toggle ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : ''}`}
                  >
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </button>
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
                  theme={theme}
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
            theme={theme}
          />
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
          <MultiGateOnboarding
            onComplete={handleMultiGateOnboardingComplete}
            addNotification={addNotification}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        );
    }
  };

  return (
    <div className={`App min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} relative`}>
      {/* Command Palette */}
      <ModernCommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommandPaletteAction}
        theme={theme}
      />
      
      {/* EMERGENT-style Notifications */}
      <NotificationCenter notifications={notifications} />
      
      {/* Floating AI Assistant */}
      {showFloatingAI && generatedPlan && (
        <FloatingAIAssistant
          context={aiContext}
          theme={theme}
          addNotification={addNotification}
        />
      )}
      
      {/* Main Content */}
      <div className="relative">
        {renderCurrentFlow()}
      </div>

      {/* Enhanced Keyboard shortcut hint with theme support */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className="flex flex-col space-y-2">
          {/* AI Assistant Toggle */}
          {generatedPlan && (
            <button
              onClick={() => setShowFloatingAI(!showFloatingAI)}
              className={`${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white p-3 rounded-full shadow-clean-lg transition-colors group ray-glow`}
              title="Toggle AI Assistant"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className={`absolute bottom-full right-0 mb-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-800'} text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                AI Assistant
              </div>
            </button>
          )}
          
          {/* Command Palette */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className={`${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-800 hover:bg-slate-700'} text-white p-3 rounded-full shadow-clean-lg transition-colors group`}
            title="Command Palette"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className={`absolute bottom-full right-0 mb-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-800'} text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
              Press Ctrl+K
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// EMERGENT-style Progress View Component
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              📊 Learning Progress
            </h1>
            <p className="text-slate-600">
              Track your cybersecurity learning journey
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-600 text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="emerald-card text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalXP}</div>
            <div className="text-sm text-slate-500">TOTAL XP</div>
          </div>
          <div className="emerald-card text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.completedCourses}</div>
            <div className="text-sm text-slate-500">COMPLETED</div>
          </div>
          <div className="emerald-card text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.streak}</div>
            <div className="text-sm text-slate-500">DAY STREAK</div>
          </div>
          <div className="emerald-card text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-purple-600">{stats.level}</div>
            <div className="text-sm text-slate-500">LEVEL</div>
          </div>
        </div>

        {/* Visual Learning Map */}
        {generatedPlan && (
          <div className="emerald-card">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Learning Roadmap</h2>
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

// EMERGENT-style Plan Generation Component
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
      addNotification('✨ Learning plan generated successfully!', 'success');
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="emerald-card p-12 text-center max-w-md">
        <div className="text-6xl mb-6">🗺️</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Generating Your Learning Plan
        </h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Please wait while we create your personalized cybersecurity curriculum based on your assessment...
        </p>
        <div className="flex justify-center">
          <div className="loading-pulse w-8 h-8 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};



export default App;