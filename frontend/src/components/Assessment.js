import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Assessment = ({ onAssessmentComplete, onBack }) => {
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

  const generateAssessment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/generate-assessment?topic=${setupData.topic}&level=${setupData.level}&career_goal=${setupData.career_goal}`
      );
      setAssessmentData(response.data);
      setStep('questions');
    } catch (error) {
      console.error('Error generating assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer, timeSpent = 30) => {
    setResponses(prev => {
      const existing = prev.find(r => r.question_id === questionId);
      if (existing) {
        return prev.map(r => 
          r.question_id === questionId 
            ? { ...r, answer, time_spent: timeSpent }
            : r
        );
      } else {
        return [...prev, { question_id: questionId, answer, time_spent: timeSpent }];
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
    } catch (error) {
      console.error('Error submitting assessment:', error);
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              🎯 Cybersecurity Assessment
            </h2>
            <p className="text-xl text-blue-200">
              Let's assess your current knowledge to create a personalized learning plan
            </p>
          </div>

          <div className="space-y-6">
            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Which cybersecurity domain interests you most?
              </label>
              <select
                value={setupData.topic}
                onChange={(e) => setSetupData(prev => ({ ...prev, topic: e.target.value }))}
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
                What's your current skill level?
              </label>
              <select
                value={setupData.level}
                onChange={(e) => setSetupData(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(levels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* Career Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What's your career goal?
              </label>
              <select
                value={setupData.career_goal}
                onChange={(e) => setSetupData(prev => ({ ...prev, career_goal: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(careerGoals).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Role (Optional)
              </label>
              <input
                type="text"
                value={setupData.current_role}
                onChange={(e) => setSetupData(prev => ({ ...prev, current_role: e.target.value }))}
                placeholder="e.g., Software Developer, IT Support, Student"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Years of IT/Security Experience
              </label>
              <input
                type="number"
                value={setupData.experience_years}
                onChange={(e) => setSetupData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                min="0"
                max="50"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={generateAssessment}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Assessment...
                  </div>
                ) : (
                  'Start Assessment'
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Question {currentQuestion + 1} of {totalQuestions}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">
                {question.question_type.toUpperCase()}
              </span>
              <span className="text-yellow-400 font-medium">
                {question.points} points
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-6">
              {question.question_text}
            </h3>

            {/* Question Content Based on Type */}
            <div className="space-y-4">
              {question.question_type === 'mcq' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={getCurrentResponse(question.id) === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-200">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === 'fill_blank' && (
                <div className="space-y-4">
                  <p className="text-gray-300 mb-4">Fill in the blanks with the correct terms:</p>
                  <input
                    type="text"
                    value={getCurrentResponse(question.id)}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Enter your answer (separate multiple answers with commas)"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {question.options && (
                    <div className="text-sm text-gray-400">
                      <span>Available terms: </span>
                      <span className="text-blue-400">{question.options.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {(question.question_type === 'practical' || question.question_type === 'coding') && (
                <div className="space-y-4">
                  <textarea
                    value={getCurrentResponse(question.id)}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder={question.question_type === 'coding' ? 'Write your code here...' : 'Describe your approach...'}
                    rows="8"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <button
              onClick={nextQuestion}
              disabled={!getCurrentResponse(question.id) || loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                currentQuestion === totalQuestions - 1 ? 'Submit Assessment' : 'Next Question'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results' && results) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {results.percentage >= 80 ? '🏆' : results.percentage >= 60 ? '👍' : '📚'}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Assessment Complete!
            </h2>
            <p className="text-xl text-blue-200">
              Here are your personalized results
            </p>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {results.score}/{results.total_points}
              </div>
              <div className="text-gray-300">Total Score</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {results.percentage}%
              </div>
              <div className="text-gray-300">Accuracy</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {results.correct_answers}/{results.total_questions}
              </div>
              <div className="text-gray-300">Correct Answers</div>
            </div>
          </div>

          {/* Skill Level */}
          <div className="bg-gray-700 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Determined Skill Level
            </h3>
            <div className="flex items-center">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium">
                {results.skill_level.charAt(0).toUpperCase() + results.skill_level.slice(1)}
              </span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Personalized Recommendations
            </h3>
            <ul className="space-y-3">
              {results.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">✓</span>
                  <span className="text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => onAssessmentComplete(results)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Generate Personalized Learning Plan
            </button>
            
            <button
              onClick={onBack}
              className="px-6 py-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Assessment;