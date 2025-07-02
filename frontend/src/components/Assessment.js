import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Assessment = ({ onAssessmentComplete, onBack, addNotification }) => {
  const [step, setStep] = useState('setup'); // 'setup', 'questions', 'results'
  const [assessmentData, setAssessmentData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState({
    topic: 'network-security',
    level: 'beginner',
    career_goal: 'student',
    current_role: '',
    experience_years: 0
  });
  const [topics, setTopics] = useState({});
  const [levels, setLevels] = useState({});
  const [careerGoals, setCareerGoals] = useState({});
  const [results, setResults] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    fetchTopicsAndLevels();
  }, []);

  useEffect(() => {
    if (step === 'questions') {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, step]);

  useEffect(() => {
    if (step === 'questions') {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - questionStartTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [questionStartTime, step]);

  const fetchTopicsAndLevels = async () => {
    try {
      const response = await axios.get(`${API}/topics`);
      setTopics(response.data.topics);
      setLevels(response.data.levels);
      setCareerGoals(response.data.career_goals);
    } catch (error) {
      console.error('Error fetching topics:', error);
      addNotification?.('Error loading assessment data', 'error');
    }
  };

  const generateAssessment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/generate-assessment?topic=${setupData.topic}&level=${setupData.level}&career_goal=${setupData.career_goal}`
      );
      setAssessmentData(response.data);
      setStep('questions');
      addNotification?.('Assessment generated! Let\'s test your knowledge.', 'success');
    } catch (error) {
      console.error('Error generating assessment:', error);
      addNotification?.('Error generating assessment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const skipAssessment = async () => {
    setLoading(true);
    try {
      // Generate a learning plan without assessment results
      const response = await axios.post(`${API}/generate-learning-plan`, {
        topic: setupData.topic,
        level: setupData.level,
        career_goal: setupData.career_goal,
        skip_assessment: true,
        user_preferences: {
          current_role: setupData.current_role,
          experience_years: setupData.experience_years
        }
      });
      
      const planData = response.data;
      addNotification?.('Skipped assessment! Generated a general learning plan for you.', 'info');
      
      // Call the completion handler with the plan data
      onAssessmentComplete?.(planData);
      
    } catch (error) {
      console.error('Error generating learning plan:', error);
      addNotification?.('Error generating learning plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    const timeSpentOnQuestion = Math.floor((Date.now() - questionStartTime) / 1000);
    setResponses(prev => {
      const existing = prev.find(r => r.question_id === questionId);
      if (existing) {
        return prev.map(r => 
          r.question_id === questionId 
            ? { ...r, answer, time_spent: timeSpentOnQuestion }
            : r
        );
      } else {
        return [...prev, { question_id: questionId, answer, time_spent: timeSpentOnQuestion }];
      }
    });
  };

  const submitAssessment = async () => {
    setLoading(true);
    try {
      const submission = {
        assessment_id: assessmentData.assessment_id,
        responses: responses,
        career_goal: setupData.career_goal,
        current_role: setupData.current_role,
        experience_years: setupData.experience_years
      };

      const response = await axios.post(`${API}/submit-assessment`, submission);
      setResults(response.data);
      setStep('results');
      addNotification?.('Assessment completed! View your results below.', 'success');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      addNotification?.('Error submitting assessment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < assessmentData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getCurrentResponse = (questionId) => {
    const response = responses.find(r => r.question_id === questionId);
    return response ? response.answer : '';
  };

  if (step === 'setup') {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="glass-card p-8 shadow-cyber-glow">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-float">🎯</div>
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="neon-text-teal">KNOWLEDGE</span> <span className="neon-text-green">ASSESSMENT</span>
            </h2>
            <div className="text-xl text-blue-200 font-mono mb-2">
              [ CYBERSECURITY SKILL ANALYSIS PROTOCOL ]
            </div>
            <p className="text-lg text-gray-300">
              Initialize comprehensive knowledge scan to generate personalized learning matrix
            </p>
          </div>

          <div className="space-y-6">
            {/* Topic Selection */}
            <div className="glass-card p-6">
              <label className="block text-sm font-medium text-neon-teal mb-3 font-mono">
                🎯 PRIMARY CYBERSECURITY DOMAIN
              </label>
              <select
                value={setupData.topic}
                onChange={(e) => setSetupData(prev => ({ ...prev, topic: e.target.value }))}
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
            <div className="glass-card p-6">
              <label className="block text-sm font-medium text-neon-teal mb-3 font-mono">
                📊 CURRENT SKILL LEVEL
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(levels).map(([key, value]) => (
                  <label
                    key={key}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                      setupData.level === key
                        ? 'border-neon-green bg-dark-card-hover shadow-neon-green'
                        : 'border-dark-border hover:border-neon-teal'
                    }`}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={key}
                      checked={setupData.level === key}
                      onChange={(e) => setSetupData(prev => ({ ...prev, level: e.target.value }))}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {key === 'beginner' ? '🌱' : key === 'intermediate' ? '⚡' : '🚀'}
                      </div>
                      <div className={`font-bold font-mono ${
                        setupData.level === key ? 'text-neon-green' : 'text-white'
                      }`}>
                        {value?.toUpperCase() || key?.toUpperCase() || 'LEVEL'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Career Goal */}
            <div className="glass-card p-6">
              <label className="block text-sm font-medium text-neon-teal mb-3 font-mono">
                🎖️ CAREER OBJECTIVE
              </label>
              <select
                value={setupData.career_goal}
                onChange={(e) => setSetupData(prev => ({ ...prev, career_goal: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-card border border-neon-teal rounded-lg text-white focus:ring-2 focus:ring-neon-teal focus:border-transparent font-mono"
              >
                {Object.entries(careerGoals).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Role */}
              <div className="glass-card p-6">
                <label className="block text-sm font-medium text-neon-teal mb-3 font-mono">
                  💼 CURRENT ROLE [OPTIONAL]
                </label>
                <input
                  type="text"
                  value={setupData.current_role}
                  onChange={(e) => setSetupData(prev => ({ ...prev, current_role: e.target.value }))}
                  placeholder="e.g., Software Developer, IT Support, Student"
                  className="w-full px-4 py-3 bg-dark-card border border-neon-teal rounded-lg text-white focus:ring-2 focus:ring-neon-teal focus:border-transparent font-mono"
                />
              </div>

              {/* Experience Years */}
              <div className="glass-card p-6">
                <label className="block text-sm font-medium text-neon-teal mb-3 font-mono">
                  ⏰ YEARS OF IT/SECURITY EXPERIENCE
                </label>
                <input
                  type="number"
                  value={setupData.experience_years}
                  onChange={(e) => setSetupData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 bg-dark-card border border-neon-teal rounded-lg text-white focus:ring-2 focus:ring-neon-teal focus:border-transparent font-mono"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-mono font-medium hover:bg-gray-700 transition-colors"
              >
                ← BACK
              </button>
              
              <button
                onClick={skipAssessment}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-mono font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>GENERATING PLAN...</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">⏭️</span>
                    <span>SKIP ASSESSMENT</span>
                  </>
                )}
              </button>
              
              <button
                onClick={generateAssessment}
                disabled={loading}
                className="flex-1 btn-neon py-3 px-6 text-lg font-bold"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neon-teal mr-2"></div>
                    <span className="loading-dots">INITIALIZING ASSESSMENT</span>
                  </div>
                ) : (
                  'INITIATE KNOWLEDGE SCAN'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'questions' && assessmentData) {
    const question = assessmentData.questions[currentQuestion];
    const totalQuestions = assessmentData.questions.length;
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;

    return (
      <div className="max-w-5xl mx-auto">
        <div className="glass-card p-8 shadow-cyber-glow">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-sm text-gray-300 mb-4">
              <div className="flex items-center space-x-4">
                <span className="font-mono neon-text-teal">
                  QUESTION {currentQuestion + 1} OF {totalQuestions}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                  <span className="font-mono text-neon-green">{timeSpent}s</span>
                </div>
              </div>
              <span className="font-mono neon-text-green">{Math.round(progress)}% COMPLETE</span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="w-full bg-dark-border rounded-full h-3 overflow-hidden">
              <div 
                className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-neon-teal to-neon-green relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-mono font-bold mr-4 ${
                question.question_type === 'mcq' ? 'bg-neon-teal text-dark-bg' :
                question.question_type === 'practical' ? 'bg-neon-green text-dark-bg' :
                question.question_type === 'coding' ? 'bg-cyber-purple text-white' :
                'bg-cyber-pink text-white'
              }`}>
                {question.question_type.toUpperCase()}
              </span>
              <span className="text-yellow-400 font-mono font-bold flex items-center">
                <span className="mr-2">⭐</span>
                {question.points} XP
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-6 leading-relaxed">
              {question.question_text}
            </h3>

            {/* Question Content Based on Type */}
            <div className="space-y-4">
              {question.question_type === 'mcq' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <label 
                      key={index} 
                      className={`flex items-center space-x-4 p-4 glass-card cursor-pointer transition-all hover:bg-dark-card-hover interactive-hover ${
                        getCurrentResponse(question.id) === option ? 'border-neon-green shadow-neon-green' : ''
                      }`}
                    >
                      <div className="relative">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={getCurrentResponse(question.id) === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          getCurrentResponse(question.id) === option 
                            ? 'border-neon-green bg-neon-green' 
                            : 'border-neon-teal'
                        }`}>
                          {getCurrentResponse(question.id) === option && (
                            <div className="w-2 h-2 bg-dark-bg rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-200 font-mono flex-1">{option}</span>
                      <span className="text-neon-teal font-mono text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === 'fill_blank' && (
                <div className="space-y-4">
                  <div className="glass-card p-4">
                    <p className="text-neon-teal mb-4 font-mono">Fill in the blanks with the correct terms:</p>
                    <input
                      type="text"
                      value={getCurrentResponse(question.id)}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Enter your answer (separate multiple answers with commas)"
                      className="w-full px-4 py-3 bg-dark-card border border-neon-teal rounded-lg text-white focus:ring-2 focus:ring-neon-teal focus:border-transparent font-mono"
                    />
                    {question.options && (
                      <div className="text-sm text-gray-400 mt-4 font-mono">
                        <span className="text-neon-blue">AVAILABLE TERMS: </span>
                        <span className="text-neon-teal">{question.options.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(question.question_type === 'practical' || question.question_type === 'coding') && (
                <div className="space-y-4">
                  <div className="glass-card p-4">
                    <textarea
                      value={getCurrentResponse(question.id)}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder={question.question_type === 'coding' ? 'Write your code here...' : 'Describe your approach step by step...'}
                      rows="8"
                      className="w-full px-4 py-3 bg-black border border-neon-green rounded-lg text-neon-green focus:ring-2 focus:ring-neon-green focus:border-transparent font-mono text-sm"
                    />
                    <div className="mt-2 text-xs text-gray-400 font-mono">
                      TIP: Be specific and include technical details where relevant
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-dark-border">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-mono font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← PREVIOUS
            </button>
            
            <div className="flex items-center space-x-4">
              {/* Quick Navigation Dots */}
              <div className="flex space-x-2">
                {Array.from({ length: totalQuestions }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                      i === currentQuestion ? 'bg-neon-teal shadow-neon-teal' :
                      responses.find(r => r.question_id === assessmentData.questions[i].id) ? 'bg-neon-green' :
                      'bg-dark-border hover:bg-gray-500'
                    }`}
                    onClick={() => setCurrentQuestion(i)}
                  />
                ))}
              </div>
            </div>
            
            <button
              onClick={nextQuestion}
              disabled={!getCurrentResponse(question.id) || loading}
              className="btn-neon-green px-6 py-3 font-bold"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="loading-dots">PROCESSING</span>
                </div>
              ) : (
                currentQuestion === totalQuestions - 1 ? 'SUBMIT ASSESSMENT →' : 'NEXT →'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results' && results) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="glass-card p-8 shadow-cyber-glow">
          <div className="text-center mb-8">
            <div className="text-8xl mb-6 animate-float">
              {results.percentage >= 80 ? '🏆' : results.percentage >= 60 ? '🎯' : '📚'}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="neon-text-green">ASSESSMENT</span> <span className="neon-text-teal">COMPLETE</span>
            </h2>
            <div className="text-xl text-blue-200 font-mono mb-2">
              [ KNOWLEDGE SCAN RESULTS GENERATED ]
            </div>
            <p className="text-lg text-gray-300">
              Your personalized cybersecurity skill matrix has been analyzed
            </p>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6 text-center border-neon-teal">
              <div className="text-4xl font-bold text-neon-teal mb-2 font-mono">
                {results.score}
              </div>
              <div className="text-gray-300 font-mono text-sm">TOTAL SCORE</div>
              <div className="text-xs text-gray-400 mt-1">out of {results.total_points}</div>
            </div>
            
            <div className="glass-card p-6 text-center border-neon-green">
              <div className="text-4xl font-bold text-neon-green mb-2 font-mono">
                {results.percentage}%
              </div>
              <div className="text-gray-300 font-mono text-sm">ACCURACY</div>
              <div className="text-xs text-gray-400 mt-1">performance rating</div>
            </div>
            
            <div className="glass-card p-6 text-center border-cyber-purple">
              <div className="text-4xl font-bold text-cyber-purple mb-2 font-mono">
                {results.correct_answers}
              </div>
              <div className="text-gray-300 font-mono text-sm">CORRECT</div>
              <div className="text-xs text-gray-400 mt-1">out of {results.total_questions}</div>
            </div>

            <div className="glass-card p-6 text-center border-yellow-400">
              <div className="text-4xl font-bold text-yellow-400 mb-2 font-mono">
                {Math.floor(results.score / 10) + 1}
              </div>
              <div className="text-gray-300 font-mono text-sm">LEVEL</div>
              <div className="text-xs text-gray-400 mt-1">skill rating</div>
            </div>
          </div>

          {/* Skill Level */}
          <div className="glass-card p-6 mb-6 border-neon-blue">
            <h3 className="text-xl font-semibold text-white mb-4 font-mono">
              <span className="neon-text-blue">DETERMINED SKILL LEVEL</span>
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="bg-neon-blue text-dark-bg px-6 py-3 rounded-full font-mono font-bold text-lg">
                  {results.skill_level.toUpperCase()}
                </span>
                <div className="text-sm text-gray-300">
                  <div className="font-mono">Assessment-based recommendation</div>
                  <div className="text-xs text-gray-400">Ready for {results.skill_level} level content</div>
                </div>
              </div>
              <div className="text-4xl animate-pulse-green">
                {results.skill_level === 'beginner' ? '🌱' : 
                 results.skill_level === 'intermediate' ? '⚡' : '🚀'}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card p-6 mb-8 border-neon-green">
            <h3 className="text-xl font-semibold text-white mb-4 font-mono">
              <span className="neon-text-green">PERSONALIZED RECOMMENDATIONS</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 glass-card p-4">
                  <span className="text-neon-green text-xl mt-1">✓</span>
                  <span className="text-gray-300 font-mono text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => onAssessmentComplete(results)}
              className="flex-1 btn-neon-green py-4 px-6 text-lg font-bold"
            >
              🚀 GENERATE PERSONALIZED LEARNING PLAN
            </button>
            
            <button
              onClick={onBack}
              className="px-6 py-4 bg-gray-600 text-white rounded-lg font-mono font-medium hover:bg-gray-700 transition-colors"
            >
              ← BACK TO DASHBOARD
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Assessment;