import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PreplacedVisualMap from './PreplacedVisualMap';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

const MultiGateOnboarding = ({ onComplete, addNotification, theme, toggleTheme }) => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [selectedGate, setSelectedGate] = useState(null);
  const [formData, setFormData] = useState({
    topic: 'network-security',
    level: 'beginner',
    career_goal: 'student',
    duration_weeks: 4
  });
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvAnalysis, setCvAnalysis] = useState(null);

  const entryGates = [
    {
      id: 'normal_signup',
      title: 'Quick Start',
      description: 'Get started with basic information and begin learning immediately',
      icon: '🚀',
      features: ['Fast setup', 'Basic personalization', 'Immediate access'],
      color: 'blue',
      recommended: false
    },
    {
      id: 'knowledge_assessment',
      title: 'Knowledge Assessment',
      description: 'Take an intensive test to accurately assess your current skill level',
      icon: '🎯',
      features: ['Comprehensive evaluation', 'Precise skill mapping', 'Customized curriculum'],
      color: 'emerald',
      recommended: true
    },
    {
      id: 'cv_scanning',
      title: 'CV/Resume Analysis',
      description: 'Upload your CV for AI-powered skill analysis and personalized recommendations',
      icon: '📄',
      features: ['AI skill extraction', 'Experience mapping', 'Gap analysis'],
      color: 'purple',
      recommended: false
    },
    {
      id: 'visual_roadmap',
      title: 'Interactive Roadmap',
      description: 'Explore cybersecurity domains visually and choose your learning path',
      icon: '🗺️',
      features: ['Visual exploration', 'Domain mapping', 'Path selection'],
      color: 'orange',
      recommended: false
    }
  ];

  const getGateColor = (color, selected = false, theme = 'light') => {
    const colors = {
      blue: {
        light: {
          bg: selected ? 'bg-blue-50' : 'bg-white',
          border: selected ? 'border-blue-500' : 'border-slate-200',
          text: 'text-blue-600',
          hover: 'hover:border-blue-300'
        },
        dark: {
          bg: selected ? 'bg-blue-900/20' : 'bg-slate-800',
          border: selected ? 'border-blue-400' : 'border-slate-600',
          text: 'text-blue-400',
          hover: 'hover:border-blue-500'
        }
      },
      emerald: {
        light: {
          bg: selected ? 'bg-emerald-50' : 'bg-white',
          border: selected ? 'border-emerald-500' : 'border-slate-200',
          text: 'text-emerald-600',
          hover: 'hover:border-emerald-300'
        },
        dark: {
          bg: selected ? 'bg-emerald-900/20' : 'bg-slate-800',
          border: selected ? 'border-emerald-400' : 'border-slate-600',
          text: 'text-emerald-400',
          hover: 'hover:border-emerald-500'
        }
      },
      purple: {
        light: {
          bg: selected ? 'bg-purple-50' : 'bg-white',
          border: selected ? 'border-purple-500' : 'border-slate-200',
          text: 'text-purple-600',
          hover: 'hover:border-purple-300'
        },
        dark: {
          bg: selected ? 'bg-purple-900/20' : 'bg-slate-800',
          border: selected ? 'border-purple-400' : 'border-slate-600',
          text: 'text-purple-400',
          hover: 'hover:border-purple-500'
        }
      },
      orange: {
        light: {
          bg: selected ? 'bg-orange-50' : 'bg-white',
          border: selected ? 'border-orange-500' : 'border-slate-200',
          text: 'text-orange-600',
          hover: 'hover:border-orange-300'
        },
        dark: {
          bg: selected ? 'bg-orange-900/20' : 'bg-slate-800',
          border: selected ? 'border-orange-400' : 'border-slate-600',
          text: 'text-orange-400',
          hover: 'hover:border-orange-500'
        }
      }
    };
    return colors[color][theme];
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setCvFile(file);
    setLoading(true);

    try {
      // Simulate CV analysis - in real app, this would use AI service
      setTimeout(() => {
        const mockAnalysis = {
          skills: ['Network Security', 'Python', 'Linux', 'Incident Response'],
          experience_level: 'intermediate',
          suggested_topic: 'network-security',
          gaps: ['Advanced Threat Hunting', 'Cloud Security', 'Malware Analysis'],
          recommended_duration: 6
        };
        setCvAnalysis(mockAnalysis);
        setFormData({
          ...formData,
          topic: mockAnalysis.suggested_topic,
          level: mockAnalysis.experience_level,
          duration_weeks: mockAnalysis.recommended_duration
        });
        setLoading(false);
        addNotification('🎉 CV analysis complete! Recommendations ready.', 'success');
      }, 2000);
    } catch (error) {
      setLoading(false);
      addNotification('Failed to analyze CV. Please try again.', 'error');
    }
  };

  const handleGateSelection = (gateId) => {
    setSelectedGate(gateId);
    
    switch (gateId) {
      case 'normal_signup':
        setCurrentStep('basic_setup');
        break;
      case 'knowledge_assessment':
        setCurrentStep('assessment_intro');
        break;
      case 'cv_scanning':
        setCurrentStep('cv_upload');
        break;
      case 'visual_roadmap':
        setCurrentStep('visual_map');
        break;
    }
  };

  const handleQuickStart = () => {
    onComplete({
      type: 'skip_assessment',
      data: formData,
      plan: null // Will be generated
    });
  };

  const handleStartAssessment = () => {
    onComplete({
      type: 'assessment',
      data: formData
    });
  };

  const renderWelcomeScreen = () => (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-2`}>
              🛡️ CyberLearn Pro
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Choose your learning path to cybersecurity mastery
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`theme-toggle ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : ''}`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Entry Gates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {entryGates.map((gate) => {
            const colors = getGateColor(gate.color, selectedGate === gate.id, theme);
            return (
              <div
                key={gate.id}
                onClick={() => handleGateSelection(gate.id)}
                className={`entry-gate-card ${colors.bg} border-2 ${colors.border} ${colors.hover} relative cursor-pointer transition-all duration-300 hover:transform hover:scale-105`}
              >
                {gate.recommended && (
                  <div className={`absolute -top-3 -right-3 ${colors.text} ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} px-3 py-1 rounded-full text-sm font-semibold border-2 ${colors.border}`}>
                    Recommended
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">{gate.icon}</div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-2`}>
                    {gate.title}
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                    {gate.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className={`font-semibold ${colors.text} mb-2`}>Features:</h4>
                  {gate.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')}`}></div>
                      <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                      selectedGate === gate.id
                        ? `${colors.text.replace('text-', 'bg-')} text-white`
                        : `${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`
                    }`}
                  >
                    {selectedGate === gate.id ? 'Selected ✓' : 'Select Path'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        {selectedGate && (
          <div className="text-center">
            <button
              onClick={() => handleGateSelection(selectedGate)}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg ray-glow"
            >
              Continue with {entryGates.find(g => g.id === selectedGate)?.title}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCvUpload = () => (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} p-6`}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📄</div>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-4`}>
            Upload Your CV/Resume
          </h2>
          <p className={`text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            Our AI will analyze your experience and create a personalized learning path
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} border-2 border-dashed rounded-xl p-8 text-center mb-6`}>
          {!cvFile ? (
            <div>
              <div className="text-4xl mb-4">⬆️</div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-2`}>
                Drop your CV here or click to browse
              </h3>
              <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mb-4`}>
                Supports PDF, DOC, DOCX files up to 5MB
              </p>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-4">{loading ? '🔄' : '✅'}</div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-2`}>
                {loading ? 'Analyzing CV...' : 'Analysis Complete!'}
              </h3>
              <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {cvFile.name}
              </p>
            </div>
          )}
        </div>

        {cvAnalysis && (
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} border rounded-xl p-6 mb-6`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-4`}>
              🎯 Analysis Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} mb-2`}>
                  Identified Skills
                </h4>
                <div className="space-y-1">
                  {cvAnalysis.skills.map((skill, index) => (
                    <div key={index} className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      • {skill}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                  Skill Gaps to Address
                </h4>
                <div className="space-y-1">
                  {cvAnalysis.gaps.map((gap, index) => (
                    <div key={index} className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      • {gap}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Experience Level:</span>
                  <span className={`ml-2 font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {cvAnalysis.experience_level.charAt(0).toUpperCase() + cvAnalysis.experience_level.slice(1)}
                  </span>
                </div>
                <div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Recommended Duration:</span>
                  <span className={`ml-2 font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {cvAnalysis.recommended_duration} weeks
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('welcome')}
            className={`px-6 py-3 ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'} rounded-lg transition-colors`}
          >
            ← Back
          </button>
          
          {cvAnalysis && (
            <button
              onClick={() => {
                onComplete({
                  type: 'cv_based',
                  data: { ...formData, cv_analysis: cvAnalysis },
                  cv_file: cvFile
                });
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generate Personalized Plan →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderAssessmentIntro = () => (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} p-6`}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-6">🎯</div>
        <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-4`}>
          Intensive Knowledge Assessment
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-8`}>
          Our comprehensive assessment will evaluate your cybersecurity knowledge across multiple domains to create the perfect learning path.
        </p>

        <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} border rounded-xl p-6 mb-8`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-4`}>
            Assessment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-2">⏱️</div>
              <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>45 minutes</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Duration</div>
            </div>
            <div>
              <div className="text-2xl mb-2">📝</div>
              <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>50 questions</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Multiple formats</div>
            </div>
            <div>
              <div className="text-2xl mb-2">🎖️</div>
              <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Skill mapping</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Precise level</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('welcome')}
            className={`px-6 py-3 ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'} rounded-lg transition-colors`}
          >
            ← Back
          </button>
          
          <button
            onClick={handleStartAssessment}
            className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold ray-glow"
          >
            Start Assessment 🚀
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeScreen();
      case 'cv_upload':
        return renderCvUpload();
      case 'assessment_intro':
        return renderAssessmentIntro();
      case 'basic_setup':
        return renderWelcomeScreen(); // Will implement basic setup
      case 'visual_map':
        return renderWelcomeScreen(); // Will implement visual map
      default:
        return renderWelcomeScreen();
    }
  };

  return renderCurrentStep();
};

export default MultiGateOnboarding;