import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Assessment from './components/Assessment';
import LearningSession from './components/LearningSession';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [topics, setTopics] = useState({});
  const [levels, setLevels] = useState({});
  const [focusAreas, setFocusAreas] = useState([]);
  const [careerGoals, setCareerGoals] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchTopicsAndLevels();
    fetchUserProgress();
  }, []);

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

  const handleAssessmentComplete = (result) => {
    setAssessmentResult(result);
    setActiveTab('generate');
    fetchUserProgress();
    addNotification('Assessment completed! Ready to generate your personalized plan.', 'success');
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
    setAssessmentResult(null);
    setCurrentPlanId(null);
  };

  const handleStartLearning = (planId) => {
    setCurrentPlanId(planId);
    setActiveTab('learning');
    addNotification('Learning session started! Your AI tutor is ready.', 'success');
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Matrix Background Effect */}
      <div className="matrix-bg absolute inset-0 bg-matrix-gradient"></div>
      
      {/* Notifications */}
      <NotificationContainer notifications={notifications} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 animate-glow-text">
            🛡️ <span className="neon-text-teal">CYBER</span><span className="neon-text-green">SEC</span> Hub
          </h1>
          <div className="text-2xl text-neon-teal font-mono mb-2">
            [ AI-POWERED SECURITY TRAINING PLATFORM ]
          </div>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto">
            Master cybersecurity with personalized AI tutoring, real-time assessments, and hands-on practice
          </p>
          <div className="flex justify-center items-center mt-4 space-x-4">
            <div className="w-2 h-2 bg-neon-teal rounded-full animate-pulse"></div>
            <div className="text-sm text-neon-green font-mono">SYSTEM ONLINE</div>
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Navigation - only show if not in learning session */}
        {activeTab !== 'learning' && (
          <div className="flex justify-center mb-8">
            <div className="glass-card p-2 flex space-x-2">
              <NavButton
                active={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
                icon="🏠"
                label="DASHBOARD"
              />
              <NavButton
                active={activeTab === 'assessment'}
                onClick={() => setActiveTab('assessment')}
                icon="🎯"
                label="ASSESSMENT"
              />
              <NavButton
                active={activeTab === 'generate'}
                onClick={() => setActiveTab('generate')}
                icon="📋"
                label="GENERATE PLAN"
              />
              <NavButton
                active={activeTab === 'plans'}
                onClick={() => setActiveTab('plans')}
                icon="📚"
                label="MY PLANS"
              />
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            userProgress={userProgress}
            onStartAssessment={() => setActiveTab('assessment')}
            onGeneratePlan={() => setActiveTab('generate')}
            onViewPlans={() => setActiveTab('plans')}
            addNotification={addNotification}
          />
        )}
        {activeTab === 'assessment' && (
          <Assessment 
            onAssessmentComplete={handleAssessmentComplete}
            onBack={handleBackToDashboard}
            addNotification={addNotification}
          />
        )}
        {activeTab === 'generate' && (
          <GeneratePlan 
            topics={topics} 
            levels={levels} 
            focusAreas={focusAreas}
            assessmentResult={assessmentResult}
            onBack={handleBackToDashboard}
            addNotification={addNotification}
          />
        )}
        {activeTab === 'plans' && (
          <MyPlans 
            onStartLearning={handleStartLearning}
            onBack={handleBackToDashboard}
            addNotification={addNotification}
          />
        )}
        {activeTab === 'learning' && currentPlanId && (
          <LearningSession 
            planId={currentPlanId}
            onBack={handleBackToDashboard}
            addNotification={addNotification}
          />
        )}
      </div>
    </div>
  );
}

// Navigation Button Component
const NavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-lg font-mono font-medium transition-all transform hover:scale-105 ${
      active
        ? 'bg-neon-teal text-dark-bg shadow-neon-teal'
        : 'text-neon-teal hover:text-white hover:bg-dark-card-hover border border-neon-teal hover:shadow-neon-teal'
    }`}
  >
    <span className="mr-2">{icon}</span>
    {label}
  </button>
);

// Notification Container Component
const NotificationContainer = ({ notifications }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {notifications.map(notification => (
      <div
        key={notification.id}
        className={`notification ${
          notification.type === 'success' ? 'border-neon-green' : 
          notification.type === 'error' ? 'border-red-500' : 'border-neon-teal'
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

// Dashboard Component
const Dashboard = ({ userProgress, onStartAssessment, onGeneratePlan, onViewPlans, addNotification }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Welcome Section */}
          <div className="glass-card glass-card-hover p-8 shadow-cyber-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                <span className="neon-text-teal">WELCOME</span> TO YOUR LEARNING HUB
              </h2>
              <div className="text-4xl animate-float">🚀</div>
            </div>
            <p className="text-gray-300 mb-8 text-lg">
              Initialize your cybersecurity journey with AI-powered assessments and personalized learning paths.
            </p>
            
            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ActionCard
                icon="🎯"
                title="SCAN KNOWLEDGE"
                description="Advanced assessment system to analyze your current skill matrix"
                onClick={onStartAssessment}
                color="teal"
                delay="0"
              />
              <ActionCard
                icon="📋"
                title="GENERATE PLAN"
                description="AI-crafted learning sequences tailored to your objectives"
                onClick={onGeneratePlan}
                color="green"
                delay="100"
              />
              <ActionCard
                icon="📚"
                title="ACCESS VAULT"
                description="Your personal collection of learning plans and achievements"
                onClick={onViewPlans}
                color="blue"
                delay="200"
              />
            </div>
          </div>

          {/* Learning Modules */}
          <div className="glass-card glass-card-hover p-8 shadow-cyber-glow">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="neon-text-green">ACTIVE MODULES</span>
              <div className="ml-4 w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ModuleCard
                title="Network Security"
                progress={65}
                lessons={12}
                completed={8}
                icon="🔒"
                isActive={true}
              />
              <ModuleCard
                title="Ethical Hacking"
                progress={35}
                lessons={15}
                completed={5}
                icon="👨‍💻"
                isActive={false}
              />
              <ModuleCard
                title="Incident Response"
                progress={80}
                lessons={10}
                completed={8}
                icon="🚨"
                isActive={false}
              />
              <ModuleCard
                title="Cryptography"
                progress={20}
                lessons={18}
                completed={4}
                icon="🔐"
                isActive={false}
              />
              <ModuleCard
                title="Digital Forensics"
                progress={0}
                lessons={14}
                completed={0}
                icon="🔍"
                isActive={false}
                isLocked={true}
              />
              <ModuleCard
                title="Cloud Security"
                progress={0}
                lessons={16}
                completed={0}
                icon="☁️"
                isActive={false}
                isLocked={true}
              />
            </div>
          </div>

          {/* AI Tutor Status */}
          <div className="glass-card glass-card-hover p-6 shadow-cyber-glow-green">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-neon-green rounded-full flex items-center justify-center animate-pulse-green">
                  <span className="text-dark-bg text-xl font-bold">AI</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-neon-green">CYBER TUTOR ONLINE</h4>
                  <p className="text-gray-300">Ready for 1:1 learning sessions and real-time assistance</p>
                </div>
              </div>
              <button 
                onClick={() => addNotification('AI Tutor ready! Start a learning session to chat.', 'info')}
                className="btn-neon-green"
              >
                ACTIVATE
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Progress Stats */}
          <div className="glass-card p-6 shadow-cyber-glow">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="neon-text-teal">PROGRESS MATRIX</span>
            </h3>
            {userProgress ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <ProgressRing progress={Math.min(100, (userProgress.total_points / 1000) * 100)} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-neon-teal">
                        {Math.round((userProgress.total_points / 1000) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">Overall Progress</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="glass-card p-3">
                    <div className="text-lg font-bold text-neon-green">
                      {userProgress.total_points}
                    </div>
                    <div className="text-xs text-gray-400">XP EARNED</div>
                  </div>
                  <div className="glass-card p-3">
                    <div className="text-lg font-bold text-neon-teal">
                      {userProgress.learning_streak}
                    </div>
                    <div className="text-xs text-gray-400">DAY STREAK</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg text-orange-400 font-mono">
                    🔥 LEVEL {Math.floor(userProgress.total_points / 100) + 1}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-4 animate-float">📊</div>
                <p>Initialize your first scan to unlock progress tracking</p>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="glass-card p-6 shadow-cyber-glow">
            <h3 className="text-xl font-bold text-white mb-4">
              <span className="neon-text-green">ACHIEVEMENTS</span>
            </h3>
            {userProgress && userProgress.achievements.length > 0 ? (
              <div className="space-y-3">
                {userProgress.achievements.slice(0, 4).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 glass-card hover:bg-dark-card-hover transition-all">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm">{achievement.name}</div>
                      <div className="text-neon-teal text-xs">{achievement.points} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-4 animate-float">🏆</div>
                <p>Complete challenges to earn achievements</p>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="glass-card p-6 shadow-cyber-glow">
            <h3 className="text-xl font-bold text-white mb-4">
              <span className="neon-text-teal">SYSTEM STATUS</span>
            </h3>
            <div className="space-y-3">
              <StatusItem label="AI TUTOR" status="ONLINE" color="green" />
              <StatusItem label="ASSESSMENT ENGINE" status="READY" color="teal" />
              <StatusItem label="LEARNING VAULT" status="SYNCHRONIZED" color="green" />
              <StatusItem label="PROGRESS TRACKER" status="ACTIVE" color="teal" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Action Card Component
const ActionCard = ({ icon, title, description, onClick, color, delay }) => (
  <div
    className={`glass-card glass-card-hover p-6 cursor-pointer interactive-hover animate-float`}
    onClick={onClick}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="text-4xl mb-4 text-center">{icon}</div>
    <h3 className={`text-lg font-bold mb-2 text-center ${
      color === 'teal' ? 'neon-text-teal' : 
      color === 'green' ? 'neon-text-green' : 
      'text-neon-blue'
    }`}>
      {title}
    </h3>
    <p className="text-gray-300 text-sm text-center">{description}</p>
  </div>
);

// Module Card Component
const ModuleCard = ({ title, progress, lessons, completed, icon, isActive, isLocked = false }) => (
  <div className={`glass-card p-6 ${
    isLocked ? 'opacity-50' : 'glass-card-hover interactive-hover'
  } ${isActive ? 'border-neon-green shadow-neon-green' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-2xl">{icon}</span>
      {isLocked && <span className="text-yellow-400">🔒</span>}
      {isActive && <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>}
    </div>
    <h4 className="text-white font-bold mb-2">{title}</h4>
    <div className="text-sm text-gray-300 mb-3">
      {completed}/{lessons} lessons • {progress}% complete
    </div>
    <div className="w-full bg-dark-border rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-500 ${
          isActive ? 'bg-neon-green' : 'bg-neon-teal'
        }`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

// Progress Ring Component
const ProgressRing = ({ progress }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="currentColor"
        strokeWidth="8"
        fill="transparent"
        className="text-dark-border"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="currentColor"
        strokeWidth="8"
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="text-neon-teal transition-all duration-500"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Status Item Component
const StatusItem = ({ label, status, color }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-300">{label}</span>
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full animate-pulse ${
        color === 'green' ? 'bg-neon-green' : 'bg-neon-teal'
      }`}></div>
      <span className={color === 'green' ? 'text-neon-green' : 'text-neon-teal'}>
        {status}
      </span>
    </div>
  </div>
);

// Generate Plan Component (keeping it similar but with new styling)
const GeneratePlan = ({ topics, levels, focusAreas, assessmentResult, onBack, addNotification }) => {
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
      setFormData(prev => ({
        ...prev,
        level: assessmentResult.skill_level,
        assessment_result_id: assessmentResult.result_id,
        user_background: `Based on assessment: ${assessmentResult.percentage}% score, ${assessmentResult.recommendations.join(', ')}`
      }));
    }
  }, [assessmentResult]);

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

  const approvePlan = async (approved) => {
    if (!generatedPlan) return;
    
    try {
      await axios.post(`${API}/approve-learning-plan/${generatedPlan.plan_id}?approved=${approved}`);
      setPlanApproved(approved);
      if (approved) {
        addNotification('Learning plan approved! Ready to start learning.', 'success');
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Assessment Result Banner */}
      {assessmentResult && (
        <div className="glass-card p-6 mb-8 shadow-cyber-glow-green border-neon-green">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                <span className="neon-text-green">ASSESSMENT COMPLETE</span>
                <span className="ml-2">🎯</span>
              </h3>
              <p className="text-white opacity-90 font-mono">
                SCORE: {assessmentResult.percentage}% • LEVEL: {assessmentResult.skill_level.toUpperCase()}
              </p>
            </div>
            <div className="text-4xl animate-float">
              {assessmentResult.percentage >= 80 ? '🏆' : assessmentResult.percentage >= 60 ? '👍' : '📚'}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="glass-card p-8 shadow-cyber-glow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">
              <span className="neon-text-teal">PLAN GENERATION</span>
            </h2>
            {onBack && (
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-neon-teal transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-medium text-neon-teal mb-2 font-mono">
                CYBERSECURITY DOMAIN
              </label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-dark-card border border-neon-teal rounded-lg text-white focus:ring-2 focus:ring-neon-teal focus:border-transparent font-mono"
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
              <label className="block text-sm font-medium text-neon-teal mb-2 font-mono">
                SKILL LEVEL {assessmentResult && <span className="text-neon-green">[FROM SCAN]</span>}
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-dark-card border border-neon-teal rounded-lg text-white focus:ring-2 focus:ring-neon-teal focus:border-transparent font-mono"
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
              <label className="block text-sm font-medium text-neon-teal mb-2 font-mono">
                DURATION (WEEKS)
              </label>
              <input
                type="number"
                name="duration_weeks"
                value={formData.duration_weeks}
                onChange={handleInputChange}
                min="1"
                max="52"
                className="w-full px-4 py-3 bg-dark-card border border-neon-teal rounded-lg text-white focus:ring-2 focus:ring-neon-teal focus:border-transparent font-mono"
              />
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-neon-teal mb-2 font-mono">
                FOCUS AREAS [OPTIONAL]
              </label>
              <div className="grid grid-cols-2 gap-3">
                {focusAreas.map(area => (
                  <label key={area} className="flex items-center space-x-2 cursor-pointer glass-card p-2 hover:bg-dark-card-hover transition-all">
                    <input
                      type="checkbox"
                      checked={formData.focus_areas.includes(area)}
                      onChange={() => handleFocusAreaChange(area)}
                      className="w-4 h-4 text-neon-teal bg-dark-card border-neon-teal rounded focus:ring-neon-teal"
                    />
                    <span className="text-sm text-gray-300 font-mono">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Background */}
            <div>
              <label className="block text-sm font-medium text-neon-teal mb-2 font-mono">
                BACKGROUND INFO {assessmentResult && <span className="text-neon-green">[ENHANCED]</span>}
              </label>
              <textarea
                name="user_background"
                value={formData.user_background}
                onChange={handleInputChange}
                placeholder="Describe your experience, goals, and specific interests..."
                rows="3"
                className="w-full px-4 py-3 bg-dark-card border border-neon-teal rounded-lg text-white focus:ring-2 focus:ring-neon-teal focus:border-transparent font-mono"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePlan}
              disabled={loading}
              className="w-full btn-neon py-4 px-6 text-lg font-bold"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neon-teal mr-3"></div>
                  <span className="loading-dots">GENERATING PLAN</span>
                </div>
              ) : (
                'GENERATE LEARNING PLAN'
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="glass-card p-8 shadow-cyber-glow">
          <h2 className="text-3xl font-bold text-white mb-6">
            <span className="neon-text-green">GENERATED PLAN</span>
          </h2>
          
          {error && (
            <div className="glass-card border-red-500 text-red-100 px-6 py-4 mb-6">
              <div className="flex items-center">
                <span className="mr-2 text-xl">⚠️</span>
                <span className="font-mono">{error}</span>
              </div>
            </div>
          )}

          {generatedPlan ? (
            <div className="space-y-6">
              <div className="glass-card border-neon-green text-neon-green px-6 py-4">
                <div className="flex items-center font-mono">
                  <span className="mr-2 text-xl">✅</span>
                  <span>LEARNING PLAN GENERATED SUCCESSFULLY</span>
                </div>
              </div>
              
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4 font-mono">
                  {topics[generatedPlan.topic]} • {levels[generatedPlan.level].toUpperCase()}
                </h3>
                <p className="text-gray-300 mb-4 font-mono">
                  DURATION: {generatedPlan.duration_weeks} WEEKS
                </p>
                <div className="max-h-96 overflow-y-auto code-block">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {generatedPlan.curriculum}
                  </pre>
                </div>
              </div>

              {/* Plan Approval Section */}
              <div className="glass-card border-neon-blue p-6">
                <h4 className="text-lg font-semibold text-white mb-4 font-mono">
                  📋 PLAN APPROVAL REQUIRED
                </h4>
                <p className="text-blue-200 mb-4">
                  Review your personalized learning plan and approve to activate AI tutoring mode.
                </p>
                
                {!planApproved ? (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => approvePlan(true)}
                      className="flex-1 btn-neon-green py-3 px-6 font-bold"
                    >
                      ✅ APPROVE & ACTIVATE
                    </button>
                    <button
                      onClick={() => approvePlan(false)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-mono font-medium transition-colors"
                    >
                      ❌ REJECT
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-neon-green text-xl font-bold mb-2 font-mono animate-pulse-green">
                      ✅ PLAN APPROVED - SYSTEM READY
                    </div>
                    <p className="text-green-100 mb-4">AI tutoring mode is now active and ready for deployment.</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="btn-neon-green py-3 px-6 font-bold"
                    >
                      🚀 INITIATE LEARNING SESSION
                    </button>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-400 font-mono">
                PLAN ID: {generatedPlan.plan_id}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <div className="text-6xl mb-4 animate-float">📋</div>
              <p className="text-lg font-mono">AWAITING PLAN GENERATION</p>
              <p className="text-sm mt-2">
                {assessmentResult 
                  ? 'Generate a personalized plan based on your assessment results'
                  : 'Configure parameters and execute plan generation protocol'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// My Plans Component (keeping it similar but with new styling)
const MyPlans = ({ onStartLearning, onBack, addNotification }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

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

  const deletePlan = async (planId) => {
    try {
      await axios.delete(`${API}/learning-plans/${planId}`);
      setPlans(plans.filter(plan => plan.id !== planId));
      if (selectedPlan && selectedPlan.id === planId) {
        setSelectedPlan(null);
      }
      addNotification('Plan deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting plan:', error);
      addNotification('Error deleting plan', 'error');
    }
  };

  const startLearningSession = (planId) => {
    onStartLearning(planId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-teal mb-4"></div>
          <p className="text-neon-teal font-mono">LOADING VAULT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {onBack && (
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-neon-teal transition-colors font-mono"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            BACK TO DASHBOARD
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plans List */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 shadow-cyber-glow">
            <h2 className="text-2xl font-bold text-white mb-6 font-mono">
              <span className="neon-text-teal">LEARNING VAULT</span> ({plans.length})
            </h2>
            
            {plans.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-6xl mb-4 animate-float">📚</div>
                <p className="font-mono">VAULT EMPTY</p>
                <p className="text-sm">Generate your first learning plan to begin</p>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-lg cursor-pointer transition-all glass-card ${
                      selectedPlan && selectedPlan.id === plan.id
                        ? 'border-neon-teal shadow-neon-teal'
                        : 'hover:bg-dark-card-hover'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-white text-sm font-mono">
                            {plan.topic.replace('-', ' ').toUpperCase()}
                          </h3>
                          {plan.approved && (
                            <span className="ml-2 text-neon-green text-xs">✅</span>
                          )}
                        </div>
                        <p className="text-gray-300 text-xs font-mono">
                          {plan.level.toUpperCase()} • {plan.duration_weeks}W
                        </p>
                        <p className="text-gray-400 text-xs mt-1 font-mono">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlan(plan.id);
                        }}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Plan Details */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 shadow-cyber-glow">
            <h2 className="text-2xl font-bold text-white mb-6 font-mono">
              <span className="neon-text-green">PLAN DETAILS</span>
            </h2>
            
            {selectedPlan ? (
              <div className="space-y-6">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white font-mono">
                      {selectedPlan.topic.replace('-', ' ').toUpperCase()}
                    </h3>
                    {selectedPlan.approved && (
                      <span className="bg-neon-green text-dark-bg px-3 py-1 rounded-full text-sm font-medium font-mono">
                        ✅ APPROVED
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4 font-mono">
                    <span>LEVEL: {selectedPlan.level.toUpperCase()}</span>
                    <span>DURATION: {selectedPlan.duration_weeks}W</span>
                    <span>CREATED: {new Date(selectedPlan.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {selectedPlan.focus_areas && selectedPlan.focus_areas.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm text-neon-teal font-mono">FOCUS AREAS: </span>
                      <span className="text-sm text-gray-300 font-mono">
                        {selectedPlan.focus_areas.join(', ').toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    {selectedPlan.approved ? (
                      <button
                        onClick={() => startLearningSession(selectedPlan.id)}
                        className="btn-neon-green py-3 px-6 font-bold"
                      >
                        🚀 INITIATE LEARNING SESSION
                      </button>
                    ) : (
                      <div className="text-sm text-gray-400 glass-card px-4 py-2 font-mono">
                        ⏳ PLAN REQUIRES APPROVAL
                      </div>
                    )}
                    
                    <button
                      onClick={() => deletePlan(selectedPlan.id)}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-mono font-medium transition-colors"
                    >
                      🗑️ DELETE
                    </button>
                  </div>
                </div>
                
                <div className="glass-card p-4">
                  <h4 className="font-semibold text-white mb-3 font-mono neon-text-teal">📖 LEARNING PLAN CONTENT</h4>
                  <div className="max-h-96 overflow-y-auto code-block">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {selectedPlan.curriculum}
                    </pre>
                  </div>
                </div>

                {/* Personalization Info */}
                {selectedPlan.assessment_result_id && (
                  <div className="glass-card border-neon-blue p-4">
                    <h4 className="font-semibold text-white mb-2 font-mono neon-text-blue">🎯 PERSONALIZED PLAN</h4>
                    <p className="text-blue-200 text-sm font-mono">
                      This plan was generated based on your assessment results and personalized recommendations.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <div className="text-6xl mb-4 animate-float">👁️</div>
                <p className="text-lg font-mono">SELECT A PLAN TO VIEW DETAILS</p>
                <p className="text-sm mt-2">Click on any plan from the vault to access its content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;