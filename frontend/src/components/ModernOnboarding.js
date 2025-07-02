import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ModernOnboarding = ({ onComplete, addNotification, theme = 'dark' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPath, setSelectedPath] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    experience: '',
    goals: [],
    timeCommitment: '',
    interests: []
  });

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to CyberLearn AI',
      subtitle: 'Your intelligent cybersecurity learning companion',
      component: WelcomeStep
    },
    {
      id: 'path-selection',
      title: 'Choose Your Learning Path',
      subtitle: 'Select the approach that fits your learning style',
      component: PathSelectionStep
    },
    {
      id: 'preferences',
      title: 'Personalize Your Experience',
      subtitle: 'Help us tailor the perfect learning journey for you',
      component: PreferencesStep
    },
    {
      id: 'ready',
      title: 'Ready to Begin',
      subtitle: 'Your personalized learning environment is ready',
      component: ReadyStep
    }
  ];

  const learningPaths = [
    {
      id: 'assessment_first',
      title: 'Smart Assessment',
      subtitle: 'AI-powered skill evaluation',
      description: 'Start with an intelligent assessment that adapts to your responses and creates a perfectly tailored learning path.',
      icon: '🧠',
      features: ['Adaptive questioning', 'Skill gap analysis', 'Personalized curriculum'],
      recommended: true,
      duration: '15-20 min assessment'
    },
    {
      id: 'guided_tour',
      title: 'Guided Exploration',
      subtitle: 'Interactive cybersecurity tour',
      description: 'Explore cybersecurity domains through interactive scenarios and choose topics that interest you most.',
      icon: '🗺️',
      features: ['Interactive scenarios', 'Topic exploration', 'Interest-based learning'],
      recommended: false,
      duration: '10-15 min exploration'
    },
    {
      id: 'quick_start',
      title: 'Quick Start',
      subtitle: 'Jump right in',
      description: 'Begin learning immediately with our comprehensive beginner-friendly curriculum.',
      icon: '🚀',
      features: ['Immediate access', 'Beginner-friendly', 'Structured progression'],
      recommended: false,
      duration: 'Start immediately'
    },
    {
      id: 'ai_interview',
      title: 'AI Interview',
      subtitle: 'Conversational assessment',
      description: 'Have a natural conversation with our AI to understand your background and create a custom learning plan.',
      icon: '💬',
      features: ['Natural conversation', 'Background analysis', 'Custom recommendations'],
      recommended: false,
      duration: '10-12 min chat'
    }
  ];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const completionData = {
      type: selectedPath?.id || 'quick_start',
      preferences: userPreferences,
      path: selectedPath
    };
    
    addNotification('🎉 Onboarding completed! Launching your learning journey...', 'success');
    onComplete(completionData);
  };

  const CurrentStepComponent = onboardingSteps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            {onboardingSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-blue-400 shadow-lg shadow-blue-400/50' 
                    : 'bg-gray-600'
                }`} />
                {index < onboardingSteps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 transition-all duration-300 ${
                    index < currentStep ? 'bg-blue-400' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass p-8 rounded-2xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">
                {onboardingSteps[currentStep].title}
              </h1>
              <p className="text-gray-400">
                {onboardingSteps[currentStep].subtitle}
              </p>
            </div>

            <CurrentStepComponent
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
              userPreferences={userPreferences}
              setUserPreferences={setUserPreferences}
              learningPaths={learningPaths}
              onNext={nextStep}
              onPrev={prevStep}
              canGoNext={currentStep === 0 || selectedPath !== null}
              canGoPrev={currentStep > 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Step Components
const WelcomeStep = ({ onNext }) => (
  <div className="text-center">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="text-8xl mb-8 animate-float"
    >
      🛡️
    </motion.div>
    
    <div className="max-w-2xl mx-auto mb-8">
      <p className="text-lg text-gray-300 mb-6">
        Welcome to the future of cybersecurity education. Our AI-powered platform 
        adapts to your learning style and creates personalized paths to help you 
        master cybersecurity skills.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: '🧠', title: 'AI-Powered', desc: 'Intelligent learning paths' },
          { icon: '🎯', title: 'Personalized', desc: 'Tailored to your goals' },
          { icon: '🚀', title: 'Interactive', desc: 'Hands-on experiences' }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="glass-light p-4 rounded-xl text-center"
          >
            <div className="text-2xl mb-2">{feature.icon}</div>
            <div className="font-medium text-white">{feature.title}</div>
            <div className="text-sm text-gray-400">{feature.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>

    <button onClick={onNext} className="btn-primary text-lg px-8 py-4 neon-glow">
      Begin Your Journey 🚀
    </button>
  </div>
);

const PathSelectionStep = ({ selectedPath, setSelectedPath, learningPaths, onNext, canGoNext }) => (
  <div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {learningPaths.map((path, index) => (
        <motion.div
          key={path.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => setSelectedPath(path)}
          className={`card card-interactive relative ${
            selectedPath?.id === path.id ? 'neon-border' : ''
          }`}
        >
          {path.recommended && (
            <div className="absolute -top-2 -right-2 bg-gradient-primary text-white text-xs px-3 py-1 rounded-full">
              Recommended
            </div>
          )}
          
          <div className="text-3xl mb-4">{path.icon}</div>
          <h3 className="text-xl font-bold text-white mb-2">{path.title}</h3>
          <p className="text-blue-400 text-sm mb-3">{path.subtitle}</p>
          <p className="text-gray-400 text-sm mb-4">{path.description}</p>
          
          <div className="space-y-2 mb-4">
            {path.features.map((feature, idx) => (
              <div key={idx} className="flex items-center text-sm text-gray-300">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                {feature}
              </div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500">{path.duration}</div>
          
          {selectedPath?.id === path.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 text-blue-400"
            >
              ✓
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>

    <div className="flex justify-center">
      <button 
        onClick={onNext} 
        disabled={!canGoNext}
        className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue with {selectedPath?.title || 'Selection'} 👉
      </button>
    </div>
  </div>
);

const PreferencesStep = ({ userPreferences, setUserPreferences, onNext, onPrev }) => {
  const updatePreference = (key, value) => {
    setUserPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key, item) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: prev[key].includes(item) 
        ? prev[key].filter(i => i !== item)
        : [...prev[key], item]
    }));
  };

  return (
    <div className="space-y-8">
      {/* Experience Level */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">What's your cybersecurity experience?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Beginner', 'Some Experience', 'Intermediate', 'Advanced'].map(level => (
            <button
              key={level}
              onClick={() => updatePreference('experience', level)}
              className={`p-3 rounded-xl text-sm transition-all duration-300 ${
                userPreferences.experience === level
                  ? 'neon-border bg-blue-500/20'
                  : 'glass-light hover:bg-blue-500/10'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">What are your learning goals? (Select all that apply)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Career Change', 'Skill Enhancement', 'Certification Prep', 
            'Academic Study', 'Personal Interest', 'Job Requirements'
          ].map(goal => (
            <button
              key={goal}
              onClick={() => toggleArrayItem('goals', goal)}
              className={`p-3 rounded-xl text-sm text-left transition-all duration-300 ${
                userPreferences.goals.includes(goal)
                  ? 'neon-border bg-blue-500/20'
                  : 'glass-light hover:bg-blue-500/10'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Time Commitment */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">How much time can you dedicate weekly?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['1-2 hours', '3-5 hours', '6-10 hours', '10+ hours'].map(time => (
            <button
              key={time}
              onClick={() => updatePreference('timeCommitment', time)}
              className={`p-3 rounded-xl text-sm transition-all duration-300 ${
                userPreferences.timeCommitment === time
                  ? 'neon-border bg-blue-500/20'
                  : 'glass-light hover:bg-blue-500/10'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary px-6 py-3">
          ← Back
        </button>
        <button onClick={onNext} className="btn-primary px-8 py-3">
          Almost Done 👍
        </button>
      </div>
    </div>
  );
};

const ReadyStep = ({ selectedPath, userPreferences, onNext, onPrev }) => (
  <div className="text-center">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="text-6xl mb-6 animate-pulse-glow"
    >
      🎯
    </motion.div>

    <h2 className="text-2xl font-bold gradient-text mb-4">
      Your Learning Environment is Ready!
    </h2>
    
    <div className="max-w-md mx-auto mb-8 space-y-4">
      <div className="glass-light p-4 rounded-xl">
        <div className="font-medium text-white">Selected Path</div>
        <div className="text-blue-400">{selectedPath?.title}</div>
      </div>
      
      <div className="glass-light p-4 rounded-xl">
        <div className="font-medium text-white">Experience Level</div>
        <div className="text-blue-400">{userPreferences.experience || 'Not specified'}</div>
      </div>
      
      {userPreferences.goals.length > 0 && (
        <div className="glass-light p-4 rounded-xl">
          <div className="font-medium text-white">Goals</div>
          <div className="text-blue-400">{userPreferences.goals.join(', ')}</div>
        </div>
      )}
    </div>

    <p className="text-gray-400 mb-8">
      Based on your preferences, we've prepared a personalized learning journey 
      that will help you achieve your cybersecurity goals efficiently.
    </p>

    <div className="flex justify-between">
      <button onClick={onPrev} className="btn-secondary px-6 py-3">
        ← Back
      </button>
      <button onClick={onNext} className="btn-primary text-lg px-8 py-4 neon-glow">
        Launch Learning Experience 🚀
      </button>
    </div>
  </div>
);

export default ModernOnboarding;