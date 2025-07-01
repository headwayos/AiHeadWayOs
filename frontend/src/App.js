import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Assessment from './components/Assessment';
import LearningSession from './components/LearningSession';
import CareerCanvas from './components/CareerCanvas';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// User Flow Steps
const FLOW_STEPS = {
  WELCOME: 'welcome',
  ASSESSMENT: 'assessment',
  CAREER_CANVAS: 'career-canvas',
  PLAN_GENERATION: 'plan-generation',
  DASHBOARD: 'dashboard',
  LEARNING: 'learning'
};

// Main App Component
function App() {
  const [currentFlow, setCurrentFlow] = useState(FLOW_STEPS.WELCOME);
  const [flowData, setFlowData] = useState({});
  const [topics, setTopics] = useState({});
  const [levels, setLevels] = useState({});
  const [focusAreas, setFocusAreas] = useState([]);
  const [careerGoals, setCareerGoals] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [careerCanvasData, setCareerCanvasData] = useState(null);

  useEffect(() => {
    fetchTopicsAndLevels();
    fetchUserProgress();
    // Check if user has previous session data
    const savedFlow = localStorage.getItem('cyberlearn_flow');
    if (savedFlow) {
      try {
        const flowState = JSON.parse(savedFlow);
        setCurrentFlow(flowState.step || FLOW_STEPS.WELCOME);
        setFlowData(flowState.data || {});
      } catch (e) {
        console.error('Error loading saved flow:', e);
      }
    }
  }, []);

  // Save flow state to localStorage
  useEffect(() => {
    localStorage.setItem('cyberlearn_flow', JSON.stringify({
      step: currentFlow,
      data: flowData
    }));
  }, [currentFlow, flowData]);

  const fetchTopicsAndLevels = async () => {
    try {
      const response = await axios.get(`${API}/topics`);
      setTopics(response.data.topics);
      setLevels(response.data.levels);
      setFocusAreas(response.data.focus_areas);
      setCareerGoals(response.data.career_goals);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
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

  const moveToNextFlow = (step, data = {}) => {
    setFlowData(prev => ({ ...prev, ...data }));
    setCurrentFlow(step);
  };

  const handleAssessmentComplete = (result) => {
    setAssessmentResult(result);
    setFlowData(prev => ({ ...prev, assessmentResult: result }));
    moveToNextFlow(FLOW_STEPS.CAREER_CANVAS);
    fetchUserProgress();
    addNotification('Assessment completed! Now let\'s create your career canvas.', 'success');
  };

  const handleCareerCanvasComplete = (canvasData) => {
    setCareerCanvasData(canvasData);
    setFlowData(prev => ({ ...prev, careerCanvas: canvasData }));
    moveToNextFlow(FLOW_STEPS.PLAN_GENERATION);
    addNotification('Career canvas created! Ready to generate your personalized learning plan.', 'success');
  };

  const handlePlanGenerated = (planData) => {
    setFlowData(prev => ({ ...prev, generatedPlan: planData }));
    moveToNextFlow(FLOW_STEPS.DASHBOARD);
    addNotification('Learning plan generated! Welcome to your dashboard.', 'success');
  };

  const handleStartLearning = (planId) => {
    setCurrentPlanId(planId);
    moveToNextFlow(FLOW_STEPS.LEARNING);
    addNotification('Learning session started! Your AI tutor is ready.', 'success');
  };

  const resetFlow = () => {
    setCurrentFlow(FLOW_STEPS.WELCOME);
    setFlowData({});
    setAssessmentResult(null);
    setCareerCanvasData(null);
    setCurrentPlanId(null);
    localStorage.removeItem('cyberlearn_flow');
    addNotification('Flow reset! Starting from the beginning.', 'info');
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Subtle Matrix Background Effect */}
      <div className="matrix-bg absolute inset-0"></div>
      
      {/* Flow Navigation */}
      {currentFlow !== FLOW_STEPS.LEARNING && (
        <FlowNavigation currentFlow={currentFlow} onStepClick={setCurrentFlow} />
      )}
      
      {/* Notifications */}
      <NotificationContainer notifications={notifications} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Flow Content */}
        {currentFlow === FLOW_STEPS.WELCOME && (
          <WelcomeFlow onNext={() => moveToNextFlow(FLOW_STEPS.ASSESSMENT)} />
        )}
        
        {currentFlow === FLOW_STEPS.ASSESSMENT && (
          <Assessment 
            onAssessmentComplete={handleAssessmentComplete}
            onBack={() => moveToNextFlow(FLOW_STEPS.WELCOME)}
            addNotification={addNotification}
          />
        )}
        
        {currentFlow === FLOW_STEPS.CAREER_CANVAS && (
          <CareerCanvas
            assessmentResult={assessmentResult}
            onComplete={handleCareerCanvasComplete}
            onBack={() => moveToNextFlow(FLOW_STEPS.ASSESSMENT)}
            addNotification={addNotification}
          />
        )}
        
        {currentFlow === FLOW_STEPS.PLAN_GENERATION && (
          <PlanGeneration
            topics={topics}
            levels={levels}
            focusAreas={focusAreas}
            assessmentResult={assessmentResult}
            careerCanvasData={careerCanvasData}
            onPlanGenerated={handlePlanGenerated}
            onBack={() => moveToNextFlow(FLOW_STEPS.CAREER_CANVAS)}
            addNotification={addNotification}
          />
        )}
        
        {currentFlow === FLOW_STEPS.DASHBOARD && (
          <Dashboard 
            userProgress={userProgress}
            flowData={flowData}
            onStartLearning={handleStartLearning}
            onResetFlow={resetFlow}
            addNotification={addNotification}
          />
        )}
        
        {currentFlow === FLOW_STEPS.LEARNING && currentPlanId && (
          <LearningSession 
            planId={currentPlanId}
            onBack={() => moveToNextFlow(FLOW_STEPS.DASHBOARD)}
            addNotification={addNotification}
          />
        )}
      </div>
    </div>
  );
}

// Flow Navigation Component
const FlowNavigation = ({ currentFlow, onStepClick }) => {
  const steps = [
    { key: FLOW_STEPS.WELCOME, label: 'Welcome', icon: '🏠' },
    { key: FLOW_STEPS.ASSESSMENT, label: 'Assessment', icon: '🎯' },
    { key: FLOW_STEPS.CAREER_CANVAS, label: 'Career Canvas', icon: '🗺️' },
    { key: FLOW_STEPS.PLAN_GENERATION, label: 'Plan Generation', icon: '📋' },
    { key: FLOW_STEPS.DASHBOARD, label: 'Dashboard', icon: '📊' },
  ];

  return (
    <div className="flow-nav">
      {steps.map((step, index) => (
        <div
          key={step.key}
          className={`flow-nav-dot ${currentFlow === step.key ? 'active' : ''}`}
          onClick={() => onStepClick(step.key)}
          title={`${index + 1}. ${step.label}`}
        />
      ))}
    </div>
  );
};

// Welcome Flow Component
const WelcomeFlow = ({ onNext }) => {
  return (
    <div className="max-w-6xl mx-auto text-center">
      <div className="glass-card p-12 mb-8">
        <div className="text-8xl mb-6 animate-float">🛡️</div>
        <h1 className="text-6xl font-bold text-white mb-6">
          <span className="accent-text-teal">CYBER</span><span className="accent-text-green">SEC</span> ACADEMY
        </h1>
        <div className="text-2xl text-accent-teal font-mono mb-4">
          [ PERSONALIZED CYBERSECURITY LEARNING PLATFORM ]
        </div>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
          Master cybersecurity with AI-powered assessments, personalized career guidance, and hands-on learning experiences tailored to your goals.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="glass-card p-6 hover:bg-dark-card-hover transition-all">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-accent-teal mb-2">SKILL ASSESSMENT</h3>
            <p className="text-gray-300">AI-powered evaluation of your current cybersecurity knowledge and skills</p>
          </div>
          <div className="glass-card p-6 hover:bg-dark-card-hover transition-all">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-accent-green mb-2">CAREER CANVAS</h3>
            <p className="text-gray-300">Personalized career roadmap with skills matrix and learning paths</p>
          </div>
          <div className="glass-card p-6 hover:bg-dark-card-hover transition-all">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-accent-blue mb-2">AI TUTORING</h3>
            <p className="text-gray-300">1:1 mentoring with advanced AI for real-time guidance and support</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white mb-6">YOUR LEARNING JOURNEY</h2>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            <ProgressStep number="1" title="Skill Assessment" description="Evaluate current knowledge" active />
            <div className="text-accent-teal text-2xl hidden md:block">→</div>
            <ProgressStep number="2" title="Career Canvas" description="Map your career path" />
            <div className="text-accent-teal text-2xl hidden md:block">→</div>
            <ProgressStep number="3" title="Learning Plan" description="Personalized curriculum" />
            <div className="text-accent-teal text-2xl hidden md:block">→</div>
            <ProgressStep number="4" title="AI Learning" description="Guided practice sessions" />
          </div>
        </div>

        <button
          onClick={onNext}
          className="mt-8 btn-cyber py-4 px-8 text-lg font-bold"
        >
          🚀 BEGIN YOUR CYBERSECURITY JOURNEY
        </button>
      </div>
    </div>
  );
};

// Progress Step Component
const ProgressStep = ({ number, title, description, active = false }) => (
  <div className={`progress-step ${active ? 'active' : ''}`}>
    <div className="progress-step-number">{number}</div>
    <div>
      <h4 className="font-semibold text-white">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </div>
);

// Plan Generation Component
const PlanGeneration = ({ 
  topics, levels, focusAreas, assessmentResult, careerCanvasData, 
  onPlanGenerated, onBack, addNotification 
}) => {
  const [formData, setFormData] = useState({
    topic: 'network-security',
    level: 'beginner',
    duration_weeks: 8,
    focus_areas: [],
    user_background: '',
    assessment_result_id: null
  });
  
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [planApproved, setPlanApproved] = useState(false);

  // Update form data when assessment result is available
  useEffect(() => {
    if (assessmentResult) {
      let background = `Assessment Score: ${assessmentResult.percentage}%, Skill Level: ${assessmentResult.skill_level}`;
      
      if (careerCanvasData) {
        background += `\nCareer Goals: ${careerCanvasData.careerGoals.join(', ')}`;
        background += `\nStrengths: ${careerCanvasData.strengths.join(', ')}`;
        background += `\nAreas for Growth: ${careerCanvasData.areasForGrowth.join(', ')}`;
      }
      
      setFormData(prev => ({
        ...prev,
        level: assessmentResult.skill_level,
        assessment_result_id: assessmentResult.result_id,
        user_background: background
      }));
    }
  }, [assessmentResult, careerCanvasData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFocusAreaChange = (area) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area)
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area]
    }));
  };

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    setGeneratedPlan(null);
    setPlanApproved(false);
    
    try {
      const response = await axios.post(`${API}/generate-learning-plan`, formData);
      setGeneratedPlan(response.data);
      addNotification('Learning plan generated successfully!', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to generate learning plan';
      setError(errorMsg);
      addNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const approveTOC = async (approved) => {
    if (!generatedPlan) return;
    
    try {
      await axios.post(`${API}/approve-toc/${generatedPlan.plan_id}?approved=${approved}`);
      if (approved) {
        const updatedPlan = { ...generatedPlan, toc_approved: true };
        setGeneratedPlan(updatedPlan);
        addNotification('Table of contents approved! Continue to final plan review.', 'success');
      } else {
        setGeneratedPlan(null);
        addNotification('Table of contents rejected. Generating new plan...', 'info');
        generatePlan();
      }
    } catch (error) {
      console.error('Error approving table of contents:', error);
      addNotification('Error processing table of contents approval', 'error');
    }
  };

  const approvePlan = async (approved) => {
    if (!generatedPlan) return;
    
    try {
      await axios.post(`${API}/approve-learning-plan/${generatedPlan.plan_id}?approved=${approved}`);
      setPlanApproved(approved);
      if (approved) {
        addNotification('Learning plan approved! Moving to dashboard.', 'success');
        setTimeout(() => {
          onPlanGenerated(generatedPlan);
        }, 1500);
        try {
          await axios.post(`${API}/award-achievement?user_id=anonymous&achievement_id=plan_approved`);
        } catch (e) {
          // Ignore if already awarded
        }
      } else {
        addNotification('Plan rejected. You can generate a new one.', 'info');
      }
    } catch (error) {
      console.error('Error approving plan:', error);
      addNotification('Error processing plan approval', 'error');
    }
  };

  const approveTOC = async (approved) => {
    if (!generatedPlan) return;
    
    try {
      await axios.post(`${API}/approve-toc/${generatedPlan.plan_id}?approved=${approved}`);
      if (approved) {
        const updatedPlan = { ...generatedPlan, toc_approved: true };
        setGeneratedPlan(updatedPlan);
        addNotification('Table of contents approved! Continue to final plan review.', 'success');
      } else {
        setGeneratedPlan(null);
        addNotification('Table of contents rejected. Generating new plan...', 'info');
        generatePlan();
      }
    } catch (error) {
      console.error('Error approving table of contents:', error);
      addNotification('Error processing table of contents approval', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with flow context */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          <span className="accent-text-teal">LEARNING PLAN</span> GENERATION
        </h1>
        <p className="text-lg text-gray-300">
          Based on your assessment and career canvas, let's create your personalized learning plan
        </p>
      </div>

      {/* Assessment & Career Canvas Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {assessmentResult && (
          <div className="glass-card p-6 border border-accent-green">
            <h3 className="text-xl font-bold text-accent-green mb-4">📊 ASSESSMENT RESULTS</h3>
            <div className="space-y-2">
              <p className="text-white">Score: <span className="accent-text-green">{assessmentResult.percentage}%</span></p>
              <p className="text-white">Skill Level: <span className="accent-text-green">{assessmentResult.skill_level.toUpperCase()}</span></p>
            </div>
          </div>
        )}
        
        {careerCanvasData && (
          <div className="glass-card p-6 border border-accent-teal">
            <h3 className="text-xl font-bold text-accent-teal mb-4">🗺️ CAREER CANVAS</h3>
            <div className="space-y-2">
              <p className="text-white">Primary Goal: <span className="accent-text-teal">{careerCanvasData.careerGoals[0]}</span></p>
              <p className="text-white">Key Strength: <span className="accent-text-teal">{careerCanvasData.strengths[0]}</span></p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              CONFIGURE YOUR PLAN
            </h2>
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-accent-teal transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-medium text-accent-teal mb-2">
                CYBERSECURITY DOMAIN
              </label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white focus:ring-2 focus:ring-accent-teal focus:border-transparent"
              >
                {Object.entries(topics).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Selection */}
            <div>
              <label className="block text-sm font-medium text-accent-teal mb-2">
                SKILL LEVEL {assessmentResult && <span className="text-accent-green">[FROM ASSESSMENT]</span>}
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white focus:ring-2 focus:ring-accent-teal focus:border-transparent"
              >
                {Object.entries(levels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-accent-teal mb-2">
                DURATION (WEEKS)
              </label>
              <input
                type="number"
                name="duration_weeks"
                value={formData.duration_weeks}
                onChange={handleInputChange}
                min="1"
                max="52"
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white focus:ring-2 focus:ring-accent-teal focus:border-transparent"
              />
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-accent-teal mb-2">
                FOCUS AREAS [OPTIONAL]
              </label>
              <div className="grid grid-cols-2 gap-3">
                {focusAreas.map(area => (
                  <label key={area} className="flex items-center space-x-2 cursor-pointer glass-card p-2 hover:bg-dark-card-hover transition-all">
                    <input
                      type="checkbox"
                      checked={formData.focus_areas.includes(area)}
                      onChange={() => handleFocusAreaChange(area)}
                      className="w-4 h-4 text-accent-teal bg-dark-card border-accent-teal rounded focus:ring-accent-teal"
                    />
                    <span className="text-sm text-gray-300">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePlan}
              disabled={loading}
              className="w-full btn-cyber py-4 px-6 text-lg font-bold"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-teal mr-3"></div>
                  <span className="loading-dots">GENERATING PLAN</span>
                </div>
              ) : (
                'GENERATE LEARNING PLAN'
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            GENERATED PLAN
          </h2>
          
          {error && (
            <div className="glass-card border-red-500 text-red-100 px-6 py-4 mb-6">
              <div className="flex items-center">
                <span className="mr-2 text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {generatedPlan ? (
            <div className="space-y-6">
              <div className="glass-card border-accent-green text-accent-green px-6 py-4">
                <div className="flex items-center">
                  <span className="mr-2 text-xl">✅</span>
                  <span>LEARNING PLAN GENERATED SUCCESSFULLY</span>
                </div>
              </div>

              {/* Table of Contents Section */}
              {generatedPlan.table_of_contents && !generatedPlan.toc_approved && (
                <div className="glass-card border-accent-teal p-6">
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    📚 TABLE OF CONTENTS APPROVAL
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Review the structured learning path below and approve to start your journey:
                  </p>
                  
                  <div className="glass-card p-4 mb-6 bg-dark-card">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-accent-teal font-mono text-sm">
                        📖 {generatedPlan.table_of_contents.total_chapters} CHAPTERS
                      </div>
                      <div className="text-accent-green font-mono text-sm">
                        ⏱️ {Math.floor(generatedPlan.table_of_contents.total_estimated_time / 60)}h {generatedPlan.table_of_contents.total_estimated_time % 60}m
                      </div>
                      <div className="text-accent-blue font-mono text-sm">
                        📊 {generatedPlan.table_of_contents.difficulty_level.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {generatedPlan.table_of_contents.chapters.map((chapter, index) => (
                        <div key={chapter.id} className="glass-card p-4 border border-dark-border">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-bold">
                              {chapter.number}. {chapter.title}
                            </h4>
                            <div className="text-accent-teal text-sm font-mono">
                              {chapter.sections.reduce((total, section) => total + section.estimated_time, 0)} min
                            </div>
                          </div>
                          
                          <div className="ml-6 space-y-2">
                            {chapter.sections.map((section) => (
                              <div key={section.id} className="flex items-center justify-between text-gray-300">
                                <span className="text-sm">{section.id} {section.title}</span>
                                <span className="text-xs text-accent-green font-mono">{section.estimated_time}m</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => approveTOC(true)}
                      className="flex-1 btn-cyber-green py-3 px-6 font-bold"
                    >
                      ✅ APPROVE TABLE OF CONTENTS
                    </button>
                    <button
                      onClick={() => approveTOC(false)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      ❌ REGENERATE
                    </button>
                  </div>
                </div>
              )}
              
              {/* Traditional Plan Display (after TOC approval) */}
              {generatedPlan.toc_approved && (
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {topics[generatedPlan.topic]} • {levels[generatedPlan.level].toUpperCase()}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    DURATION: {generatedPlan.duration_weeks} WEEKS
                  </p>
                  <div className="max-h-96 overflow-y-auto code-block">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {generatedPlan.curriculum}
                    </pre>
                  </div>
                </div>
              )}

              {/* Final Plan Approval Section (only after TOC approval) */}
              {generatedPlan.toc_approved && (
                <div className="glass-card border-accent-blue p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    📋 FINAL PLAN APPROVAL
                  </h4>
                  <p className="text-blue-200 mb-4">
                    Your table of contents has been approved. Now finalize your learning plan to continue to your dashboard.
                  </p>
                  
                  {!planApproved ? (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => approvePlan(true)}
                        className="flex-1 btn-cyber-green py-3 px-6 font-bold"
                      >
                        ✅ APPROVE & CONTINUE
                      </button>
                      <button
                        onClick={() => approvePlan(false)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      >
                        ❌ REJECT
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-accent-green text-xl font-bold mb-2 animate-subtle-pulse">
                        ✅ PLAN APPROVED - REDIRECTING TO DASHBOARD
                      </div>
                      <p className="text-green-100 mb-4">Your learning environment is being prepared...</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-sm text-gray-400">
                PLAN ID: {generatedPlan.plan_id}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <div className="text-6xl mb-4 animate-float">📋</div>
              <p className="text-lg">AWAITING PLAN GENERATION</p>
              <p className="text-sm mt-2">
                Configure your learning preferences and generate your personalized curriculum
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ userProgress, flowData, onStartLearning, onResetFlow, addNotification }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/learning-plans`);
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      addNotification('Error loading plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startLearningSession = (planId) => {
    onStartLearning(planId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-teal mb-4"></div>
          <p className="text-accent-teal">LOADING DASHBOARD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          <span className="accent-text-teal">LEARNING</span> <span className="accent-text-green">DASHBOARD</span>
        </h1>
        <p className="text-xl text-gray-300">
          Your personalized cybersecurity learning environment
        </p>
        <button
          onClick={onResetFlow}
          className="mt-4 text-gray-400 hover:text-accent-teal transition-colors text-sm"
        >
          🔄 Reset Learning Flow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Flow Summary */}
          {flowData.assessmentResult && (
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-white mb-4">📈 YOUR JOURNEY SUMMARY</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-green">
                    {flowData.assessmentResult.percentage}%
                  </div>
                  <div className="text-gray-300 text-sm">Assessment Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-teal">
                    {flowData.assessmentResult.skill_level.toUpperCase()}
                  </div>
                  <div className="text-gray-300 text-sm">Skill Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-blue">
                    {plans.length}
                  </div>
                  <div className="text-gray-300 text-sm">Learning Plans</div>
                </div>
              </div>
            </div>
          )}

          {/* Learning Plans */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              🎯 YOUR LEARNING PLANS
            </h3>
            {plans.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-6xl mb-4 animate-float">📚</div>
                <p>No learning plans yet</p>
                <p className="text-sm">Complete the flow to generate your first plan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    className="glass-card p-6 hover:bg-dark-card-hover transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-white">
                        {plan.topic.replace('-', ' ').toUpperCase()}
                      </h4>
                      {plan.approved && (
                        <span className="bg-accent-green text-dark-bg px-2 py-1 rounded text-xs font-bold">
                          ✅ APPROVED
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-4">
                      {plan.level.toUpperCase()} • {plan.duration_weeks} weeks
                    </p>
                    {plan.approved && (
                      <button
                        onClick={() => startLearningSession(plan.id)}
                        className="w-full btn-cyber-green py-2 px-4"
                      >
                        🚀 START LEARNING
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Progress Stats */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              📊 PROGRESS
            </h3>
            {userProgress ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-teal">
                    {userProgress.total_points}
                  </div>
                  <div className="text-gray-300 text-sm">XP EARNED</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-green">
                    {userProgress.learning_streak}
                  </div>
                  <div className="text-gray-300 text-sm">DAY STREAK</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-4">
                <p>Complete activities to track progress</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              ⚡ QUICK ACTIONS
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => addNotification('Feature coming soon!', 'info')}
                className="w-full text-left px-3 py-2 glass-card hover:bg-dark-card-hover rounded text-sm text-gray-300 transition-all"
              >
                📝 Practice Quiz
              </button>
              <button
                onClick={() => addNotification('Feature coming soon!', 'info')}
                className="w-full text-left px-3 py-2 glass-card hover:bg-dark-card-hover rounded text-sm text-gray-300 transition-all"
              >
                📊 View Analytics
              </button>
              <button
                onClick={() => addNotification('Feature coming soon!', 'info')}
                className="w-full text-left px-3 py-2 glass-card hover:bg-dark-card-hover rounded text-sm text-gray-300 transition-all"
              >
                🎯 Set Goals
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Container Component
const NotificationContainer = ({ notifications }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {notifications.map(notification => (
      <div
        key={notification.id}
        className={`notification ${
          notification.type === 'success' ? 'border-accent-green' : 
          notification.type === 'error' ? 'border-red-500' : 'border-accent-teal'
        }`}
      >
        <div className="flex items-center">
          <span className="mr-2">
            {notification.type === 'success' ? '✅' : 
             notification.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="text-white">{notification.message}</span>
        </div>
      </div>
    ))}
  </div>
);

export default App;