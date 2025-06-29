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

  const handleAssessmentComplete = (result) => {
    setAssessmentResult(result);
    setActiveTab('generate');
    fetchUserProgress(); // Refresh progress after assessment
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
    setAssessmentResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🛡️ CyberSec Learning Hub 2.0
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            AI-Powered Personalized Cybersecurity Learning with 1:1 Teaching
          </p>
          <p className="text-lg text-gray-300 mt-2">
            Assess → Learn → Master with AI guidance at every step
          </p>
        </div>

        {/* Navigation - only show if not in learning session */}
        {activeTab !== 'learning' && (
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 rounded-lg p-1 flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                🏠 Dashboard
              </button>
              <button
                onClick={() => setActiveTab('assessment')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'assessment'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                🎯 Assessment
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'generate'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                📋 Generate Plan
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'plans'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                📚 My Plans
              </button>
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
          />
        )}
        {activeTab === 'assessment' && (
          <Assessment 
            onAssessmentComplete={handleAssessmentComplete}
            onBack={handleBackToDashboard}
          />
        )}
        {activeTab === 'generate' && (
          <GeneratePlan 
            topics={topics} 
            levels={levels} 
            focusAreas={focusAreas}
            assessmentResult={assessmentResult}
            onBack={handleBackToDashboard}
          />
        )}
        {activeTab === 'plans' && (
          <MyPlans 
            onStartLearning={(planId) => {
              setActiveTab('learning');
              setActiveTab('learning-' + planId);
            }}
            onBack={handleBackToDashboard}
          />
        )}
        {activeTab.startsWith('learning-') && (
          <LearningSession 
            planId={activeTab.split('-')[1]}
            onBack={handleBackToDashboard}
          />
        )}
      </div>
    </div>
  );
}

// Dashboard Component
const Dashboard = ({ userProgress, onStartAssessment, onGeneratePlan, onViewPlans }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-6">
              Welcome to Your Learning Journey! 🚀
            </h2>
            <p className="text-gray-300 mb-8">
              Start with a personalized assessment to unlock AI-powered learning tailored just for you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={onStartAssessment}
                className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl text-white hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-2">Take Assessment</h3>
                <p className="text-sm opacity-90">Discover your skill level and get personalized recommendations</p>
              </button>
              
              <button
                onClick={onGeneratePlan}
                className="p-6 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl text-white hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105"
              >
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold mb-2">Create Plan</h3>
                <p className="text-sm opacity-90">Generate a customized learning plan for your goals</p>
              </button>
              
              <button
                onClick={onViewPlans}
                className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl text-white hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">My Plans</h3>
                <p className="text-sm opacity-90">Continue learning with your saved plans</p>
              </button>
              
              <div className="p-6 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl text-white">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-2">AI Tutor</h3>
                <p className="text-sm opacity-90">Get real-time help and guidance while learning</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">✨ New Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🎯</div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Smart Assessment</h4>
                  <p className="text-gray-300 text-sm">AI-generated questions adapted to your level and career goals</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🤖</div>
                <div>
                  <h4 className="text-lg font-semibold text-white">1:1 AI Tutoring</h4>
                  <p className="text-gray-300 text-sm">Real-time conversation with AI for instant help and guidance</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="text-2xl">📈</div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Progress Tracking</h4>
                  <p className="text-gray-300 text-sm">Detailed analytics and achievement system</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Plan Approval</h4>
                  <p className="text-gray-300 text-sm">Review and approve personalized learning plans</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Achievements */}
        <div className="space-y-8">
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">📊 Your Progress</h3>
            {userProgress ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {userProgress.total_points}
                  </div>
                  <div className="text-gray-300 text-sm">Total Points</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-400">
                      {userProgress.assessments_completed}
                    </div>
                    <div className="text-gray-400 text-xs">Assessments</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-400">
                      {userProgress.plans_completed}
                    </div>
                    <div className="text-gray-400 text-xs">Plans</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg text-orange-400 font-semibold">
                    🔥 {userProgress.learning_streak} day streak
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-4">📈</div>
                <p>Start your first assessment to see your progress!</p>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">🏆 Achievements</h3>
            {userProgress && userProgress.achievements.length > 0 ? (
              <div className="space-y-3">
                {userProgress.achievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <div className="text-white font-semibold text-sm">{achievement.name}</div>
                      <div className="text-gray-400 text-xs">{achievement.points} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-4">🏆</div>
                <p>Earn achievements as you learn!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Generate Plan Component
const GeneratePlan = ({ topics, levels, focusAreas, assessmentResult, onBack }) => {
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
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate learning plan');
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
        // Award achievement
        try {
          await axios.post(`${API}/award-achievement?user_id=anonymous&achievement_id=plan_approved`);
        } catch (e) {
          // Ignore if already awarded
        }
      }
    } catch (error) {
      console.error('Error approving plan:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Assessment Result Banner */}
      {assessmentResult && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                🎯 Assessment Complete!
              </h3>
              <p className="text-white opacity-90">
                Score: {assessmentResult.percentage}% • Recommended Level: {assessmentResult.skill_level}
              </p>
            </div>
            <div className="text-4xl">
              {assessmentResult.percentage >= 80 ? '🏆' : assessmentResult.percentage >= 60 ? '👍' : '📚'}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">
              Create Your Learning Plan
            </h2>
            {onBack && (
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-white transition-colors"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cybersecurity Domain
              </label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skill Level {assessmentResult && <span className="text-green-400">(From Assessment)</span>}
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                name="duration_weeks"
                value={formData.duration_weeks}
                onChange={handleInputChange}
                min="1"
                max="52"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Focus Areas (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {focusAreas.map(area => (
                  <label key={area} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.focus_areas.includes(area)}
                      onChange={() => handleFocusAreaChange(area)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Background */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Background {assessmentResult && <span className="text-green-400">(Enhanced with Assessment)</span>}
              </label>
              <textarea
                name="user_background"
                value={formData.user_background}
                onChange={handleInputChange}
                placeholder="Tell us about your current experience, goals, or specific interests..."
                rows="3"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePlan}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Generating Personalized Plan...
                </div>
              ) : (
                'Generate Learning Plan'
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">
            Generated Plan
          </h2>
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-6 py-4 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {generatedPlan ? (
            <div className="space-y-6">
              <div className="bg-green-900 border border-green-700 text-green-100 px-6 py-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Learning plan generated successfully!</span>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {topics[generatedPlan.topic]} • {levels[generatedPlan.level]}
                </h3>
                <p className="text-gray-300 mb-4">
                  Duration: {generatedPlan.duration_weeks} weeks
                </p>
                <div className="max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {generatedPlan.curriculum}
                  </pre>
                </div>
              </div>

              {/* Plan Approval Section */}
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  📋 Plan Approval
                </h4>
                <p className="text-blue-100 mb-4">
                  Review your personalized learning plan and approve it to start learning with AI guidance.
                </p>
                
                {!planApproved ? (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => approvePlan(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                    >
                      ✅ Approve & Start Learning
                    </button>
                    <button
                      onClick={() => approvePlan(false)}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                      ❌ Reject
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-green-400 text-xl font-bold mb-2">✅ Plan Approved!</div>
                    <p className="text-green-100 mb-4">You can now start learning with AI guidance.</p>
                    <button
                      onClick={() => window.location.reload()} // This will navigate to learning session
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                    >
                      🚀 Start Learning Session
                    </button>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-400">
                Plan ID: {generatedPlan.plan_id}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">Your generated learning plan will appear here</p>
              <p className="text-sm">
                {assessmentResult 
                  ? 'Generate a plan based on your assessment results'
                  : 'Fill out the form and click "Generate Learning Plan" to get started'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// My Plans Component
const MyPlans = ({ onStartLearning, onBack }) => {
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
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const startLearningSession = (planId) => {
    onStartLearning(planId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {onBack && (
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plans List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              📚 Saved Plans ({plans.length})
            </h2>
            
            {plans.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No learning plans yet</p>
                <p className="text-sm">Generate your first plan to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedPlan && selectedPlan.id === plan.id
                        ? 'bg-blue-600 shadow-lg'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-white text-sm">
                            {plan.topic.replace('-', ' ').toUpperCase()}
                          </h3>
                          {plan.approved && (
                            <span className="ml-2 text-green-400 text-xs">✅</span>
                          )}
                        </div>
                        <p className="text-gray-300 text-xs">
                          {plan.level} • {plan.duration_weeks} weeks
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
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
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Plan Details
            </h2>
            
            {selectedPlan ? (
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">
                      {selectedPlan.topic.replace('-', ' ').toUpperCase()}
                    </h3>
                    {selectedPlan.approved && (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ✅ Approved
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                    <span>Level: {selectedPlan.level}</span>
                    <span>Duration: {selectedPlan.duration_weeks} weeks</span>
                    <span>Created: {new Date(selectedPlan.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {selectedPlan.focus_areas && selectedPlan.focus_areas.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-400">Focus Areas: </span>
                      <span className="text-sm text-gray-300">
                        {selectedPlan.focus_areas.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    {selectedPlan.approved ? (
                      <button
                        onClick={() => startLearningSession(selectedPlan.id)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105"
                      >
                        🚀 Start Learning Session
                      </button>
                    ) : (
                      <div className="text-sm text-gray-400 bg-gray-600 px-4 py-2 rounded-lg">
                        ⏳ Plan needs approval before starting learning session
                      </div>
                    )}
                    
                    <button
                      onClick={() => deletePlan(selectedPlan.id)}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      🗑️ Delete Plan
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">📖 Learning Plan Content</h4>
                  <div className="max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {selectedPlan.curriculum}
                    </pre>
                  </div>
                </div>

                {/* Personalization Info */}
                {selectedPlan.assessment_result_id && (
                  <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">🎯 Personalized Plan</h4>
                    <p className="text-blue-100 text-sm">
                      This plan was generated based on your assessment results and personalized recommendations.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="text-lg">Select a plan to view details</p>
                <p className="text-sm">Click on any plan from the list to see its content and start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;