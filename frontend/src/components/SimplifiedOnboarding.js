import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

const SimplifiedOnboarding = ({ onComplete, addNotification }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    topic: 'network-security',
    level: 'beginner',
    career_goal: 'student',
    duration_weeks: 4
  });
  const [topics, setTopics] = useState({});
  const [levels, setLevels] = useState({});
  const [careerGoals, setCareerGoals] = useState({});
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to CyberLearn',
      subtitle: 'Your personalized cybersecurity learning journey',
      icon: '🛡️'
    },
    {
      id: 'topic',
      title: 'Choose Your Focus',
      subtitle: 'What area of cybersecurity interests you most?',
      icon: '🎯'
    },
    {
      id: 'level',
      title: 'Your Experience Level',
      subtitle: 'Help us customize your learning path',
      icon: '📊'
    },
    {
      id: 'goal',
      title: 'Your Career Goal',
      subtitle: 'What do you want to achieve?',
      icon: '🚀'
    },
    {
      id: 'assessment',
      title: 'Assessment Options',
      subtitle: 'Choose how you\'d like to start',
      icon: '⚡'
    }
  ];

  useEffect(() => {
    fetchTopicsAndLevels();
  }, []);

  const fetchTopicsAndLevels = async () => {
    try {
      const response = await axios.get(`${API}/topics`);
      setTopics(response.data.topics);
      setLevels(response.data.levels);
      setCareerGoals(response.data.career_goals);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOptionSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTakeAssessment = () => {
    onComplete({
      type: 'assessment',
      data: formData
    });
  };

  const handleSkipAssessment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/generate-learning-plan`, {
        ...formData,
        skip_assessment: true,
        user_background: `Skipped assessment - ${levels[formData.level] || 'beginner'} level learner interested in ${topics[formData.topic] || formData.topic}`,
        focus_areas: ['Hands-on Labs', 'Real-world Applications'],
        user_preferences: {
          current_role: careerGoals[formData.career_goal] || 'student',
          experience_years: formData.level === 'beginner' ? 0 : formData.level === 'intermediate' ? 2 : 5
        }
      });

      addNotification('Learning plan generated successfully! 🎉', 'success');
      onComplete({
        type: 'skip_assessment',
        data: formData,
        plan: response.data
      });
    } catch (error) {
      console.error('Error generating learning plan:', error);
      addNotification('Failed to generate learning plan. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="mb-8">
              <img 
                src="https://images.pexels.com/photos/7663144/pexels-photo-7663144.jpeg"
                alt="Cybersecurity Network"
                className="w-full h-64 object-cover rounded-lg opacity-70"
              />
            </div>
            <div className="text-6xl mb-4">{step.icon}</div>
            <h1 className="text-4xl font-bold text-white mb-4">{step.title}</h1>
            <p className="text-xl text-gray-300 mb-8">{step.subtitle}</p>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="glass-card p-4">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm text-gray-300">Personalized Learning</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl mb-2">🤖</div>
                <div className="text-sm text-gray-300">AI-Powered Tutoring</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-sm text-gray-300">Achievement System</div>
              </div>
            </div>
          </div>
        );

      case 'topic':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
              <p className="text-gray-300">{step.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(topics).map(([key, value]) => (
                <div
                  key={key}
                  className={`glass-card p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                    formData.topic === key ? 'border-neon-green bg-neon-green/10' : 'border-gray-600'
                  }`}
                  onClick={() => handleOptionSelect('topic', key)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {key === 'network-security' ? '🔐' : 
                       key === 'web-security' ? '🌐' : 
                       key === 'mobile-security' ? '📱' : 
                       key === 'cloud-security' ? '☁️' : '🛡️'}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{value}</h3>
                      <p className="text-sm text-gray-400">
                        {key === 'network-security' ? 'Secure networks & infrastructure' : 
                         key === 'web-security' ? 'Web application protection' : 
                         key === 'mobile-security' ? 'Mobile app & device security' : 
                         key === 'cloud-security' ? 'Cloud platform security' : 'General security practices'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'level':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
              <p className="text-gray-300">{step.subtitle}</p>
            </div>
            <div className="space-y-4">
              {Object.entries(levels).map(([key, value]) => (
                <div
                  key={key}
                  className={`glass-card p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                    formData.level === key ? 'border-neon-blue bg-neon-blue/10' : 'border-gray-600'
                  }`}
                  onClick={() => handleOptionSelect('level', key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {key === 'beginner' ? '🌱' : key === 'intermediate' ? '🔧' : '🎯'}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{value}</h3>
                        <p className="text-sm text-gray-400">
                          {key === 'beginner' ? 'New to cybersecurity' : 
                           key === 'intermediate' ? 'Some experience with security concepts' : 
                           'Experienced with security practices'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 font-mono">
                        {key === 'beginner' ? '0-1 years' : key === 'intermediate' ? '1-3 years' : '3+ years'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'goal':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
              <p className="text-gray-300">{step.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(careerGoals).map(([key, value]) => (
                <div
                  key={key}
                  className={`glass-card p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                    formData.career_goal === key ? 'border-accent-green bg-accent-green/10' : 'border-gray-600'
                  }`}
                  onClick={() => handleOptionSelect('career_goal', key)}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">
                      {key === 'student' ? '🎓' : 
                       key === 'professional' ? '💼' : 
                       key === 'career-change' ? '🔄' : '🚀'}
                    </div>
                    <h3 className="font-bold text-white mb-2">{value}</h3>
                    <p className="text-sm text-gray-400">
                      {key === 'student' ? 'Learning for academic purposes' : 
                       key === 'professional' ? 'Advancing current career' : 
                       key === 'career-change' ? 'Transitioning to cybersecurity' : 'Exploring new opportunities'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'assessment':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
              <p className="text-gray-300">{step.subtitle}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Take Assessment Option */}
              <div className="glass-card p-8 text-center space-y-4 hover:bg-neon-blue/5 transition-all duration-300">
                <div className="text-4xl">📋</div>
                <h3 className="text-xl font-bold text-white">Take Assessment</h3>
                <p className="text-gray-300 text-sm mb-6">
                  Get a personalized learning plan based on your current knowledge level
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center justify-center space-x-2">
                    <span>⏱️</span>
                    <span>10-15 minutes</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>📊</span>
                    <span>Detailed skill analysis</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>🎯</span>
                    <span>Highly personalized</span>
                  </div>
                </div>
                <button
                  onClick={handleTakeAssessment}
                  className="btn-cyber-blue w-full py-3 mt-6"
                  disabled={loading}
                >
                  📋 Take Assessment
                </button>
              </div>

              {/* Skip Assessment Option */}
              <div className="glass-card p-8 text-center space-y-4 hover:bg-neon-green/5 transition-all duration-300">
                <div className="text-4xl">⚡</div>
                <h3 className="text-xl font-bold text-white">Skip & Start Learning</h3>
                <p className="text-gray-300 text-sm mb-6">
                  Jump right into learning with a general plan based on your selections
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center justify-center space-x-2">
                    <span>🚀</span>
                    <span>Start immediately</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>📚</span>
                    <span>General curriculum</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>⚡</span>
                    <span>Quick setup</span>
                  </div>
                </div>
                <button
                  onClick={handleSkipAssessment}
                  className="btn-cyber-green w-full py-3 mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="cyber-loader-small"></div>
                      <span>Generating Plan...</span>
                    </div>
                  ) : (
                    '⚡ Skip & Start Learning'
                  )}
                </button>
              </div>
            </div>

            {/* Selected Preferences Summary */}
            <div className="glass-card p-6 bg-gray-800/30">
              <h4 className="text-lg font-bold text-white mb-4">📋 Your Selections</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-neon-blue">🎯</span>
                  <span className="text-gray-300">Topic:</span>
                  <span className="text-white font-mono">{topics[formData.topic] || formData.topic}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-neon-green">📊</span>
                  <span className="text-gray-300">Level:</span>
                  <span className="text-white font-mono">{levels[formData.level] || formData.level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent-green">🚀</span>
                  <span className="text-gray-300">Goal:</span>
                  <span className="text-white font-mono">{careerGoals[formData.career_goal] || formData.career_goal}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-mono text-gray-400">
              STEP {currentStep + 1} OF {steps.length}
            </span>
            <span className="text-sm font-mono text-gray-400">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% COMPLETE
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-neon-blue to-neon-green h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {currentStep < steps.length - 1 && (
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              className={`btn-cyber-secondary px-6 py-3 ${
                currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={currentStep === 0}
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              className="btn-cyber-primary px-6 py-3"
              disabled={currentStep === 0 || (currentStep === steps.length - 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .cyber-loader-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 255, 255, 0.1);
          border-top: 2px solid #00ffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SimplifiedOnboarding;