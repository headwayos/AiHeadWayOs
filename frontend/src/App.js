import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [topics, setTopics] = useState({});
  const [levels, setLevels] = useState({});
  const [focusAreas, setFocusAreas] = useState([]);

  useEffect(() => {
    fetchTopicsAndLevels();
  }, []);

  const fetchTopicsAndLevels = async () => {
    try {
      const response = await axios.get(`${API}/topics`);
      setTopics(response.data.topics);
      setLevels(response.data.levels);
      setFocusAreas(response.data.focus_areas);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🛡️ CyberSec Learning Hub
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            AI-Powered Cybersecurity Learning Plans & Roadmaps
          </p>
          <p className="text-lg text-gray-300 mt-2">
            Personalized learning paths powered by advanced AI for all skill levels
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'generate'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Generate Plan
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'plans'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              My Plans
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'generate' && (
          <GeneratePlan 
            topics={topics} 
            levels={levels} 
            focusAreas={focusAreas} 
          />
        )}
        {activeTab === 'plans' && <MyPlans />}
      </div>
    </div>
  );
}

// Generate Plan Component
const GeneratePlan = ({ topics, levels, focusAreas }) => {
  const [formData, setFormData] = useState({
    topic: 'network-security',
    level: 'beginner',
    duration_weeks: 8,
    focus_areas: [],
    user_background: ''
  });
  
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    
    try {
      const response = await axios.post(`${API}/generate-learning-plan`, formData);
      setGeneratedPlan(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate learning plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">
            Create Your Learning Plan
          </h2>
          
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
                Skill Level
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
                Your Background (Optional)
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
                  Generating Plan...
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
              <p className="text-sm">Fill out the form and click "Generate Learning Plan" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// My Plans Component
const MyPlans = () => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plans List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Saved Plans ({plans.length})
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
                        <h3 className="font-semibold text-white text-sm">
                          {plan.topic.replace('-', ' ').toUpperCase()}
                        </h3>
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
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {selectedPlan.topic.replace('-', ' ').toUpperCase()}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    <span>Level: {selectedPlan.level}</span>
                    <span>Duration: {selectedPlan.duration_weeks} weeks</span>
                    <span>Created: {new Date(selectedPlan.created_at).toLocaleDateString()}</span>
                  </div>
                  {selectedPlan.focus_areas && selectedPlan.focus_areas.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-400">Focus Areas: </span>
                      <span className="text-sm text-gray-300">
                        {selectedPlan.focus_areas.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Learning Plan Content</h4>
                  <div className="max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {selectedPlan.curriculum}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="text-lg">Select a plan to view details</p>
                <p className="text-sm">Click on any plan from the list to see its content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;