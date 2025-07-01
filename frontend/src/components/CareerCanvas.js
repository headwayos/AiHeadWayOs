import React, { useState, useEffect } from 'react';

const CareerCanvas = ({ assessmentResult, onComplete, onBack, addNotification }) => {
  const [canvasData, setCanvasData] = useState({
    careerGoals: [],
    currentRole: '',
    experienceLevel: '',
    strengths: [],
    areasForGrowth: [],
    preferredIndustries: [],
    timeHorizon: '1-2 years',
    learningStyle: 'hands-on',
    motivations: [],
    challenges: []
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCanvas, setGeneratedCanvas] = useState(null);

  // Pre-populate with assessment data
  useEffect(() => {
    if (assessmentResult) {
      setCanvasData(prev => ({
        ...prev,
        experienceLevel: assessmentResult.skill_level,
        strengths: assessmentResult.percentage >= 80 ? 
          ['Strong technical foundation', 'Problem-solving skills'] :
          assessmentResult.percentage >= 60 ? 
          ['Good understanding of basics', 'Analytical thinking'] :
          ['Eager to learn', 'Growth mindset']
      }));
    }
  }, [assessmentResult]);

  const careerOptions = [
    'Cybersecurity Analyst',
    'Penetration Tester',
    'Security Architect',
    'Incident Response Specialist',
    'Security Consultant',
    'CISO/Security Manager',
    'Forensics Specialist',
    'Compliance Analyst',
    'DevSecOps Engineer',
    'Security Researcher'
  ];

  const industryOptions = [
    'Financial Services',
    'Healthcare',
    'Government',
    'Technology',
    'Consulting',
    'E-commerce',
    'Manufacturing',
    'Education',
    'Telecommunications',
    'Startups'
  ];

  const skillAreas = [
    'Network Security',
    'Application Security',
    'Cloud Security',
    'Risk Management',
    'Compliance',
    'Incident Response',
    'Forensics',
    'Penetration Testing',
    'Security Architecture',
    'Cryptography',
    'Social Engineering',
    'Security Awareness'
  ];

  const motivationOptions = [
    'Making a difference in cybersecurity',
    'High earning potential',
    'Job security and demand',
    'Continuous learning opportunities',
    'Working with cutting-edge technology',
    'Problem-solving challenges',
    'Protecting organizations',
    'Career advancement',
    'Work-life balance',
    'Remote work opportunities'
  ];

  const challengeOptions = [
    'Lack of practical experience',
    'Rapidly changing technology',
    'Getting first cybersecurity job',
    'Obtaining relevant certifications',
    'Building technical skills',
    'Understanding business context',
    'Networking in the industry',
    'Time management for learning',
    'Impostor syndrome',
    'Keeping up with threats'
  ];

  const steps = [
    { title: 'Career Goals', description: 'Define your cybersecurity career aspirations' },
    { title: 'Current State', description: 'Assess your current position and experience' },
    { title: 'Strengths & Growth', description: 'Identify your strengths and areas for improvement' },
    { title: 'Preferences', description: 'Set your industry and learning preferences' },
    { title: 'Motivations', description: 'What drives your cybersecurity journey?' },
    { title: 'Canvas Generation', description: 'Generate your personalized career canvas' }
  ];

  const handleMultiSelect = (field, value) => {
    setCanvasData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleInputChange = (field, value) => {
    setCanvasData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCareerCanvas = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API call for career canvas generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const canvas = {
        ...canvasData,
        generatedAt: new Date().toISOString(),
        recommendations: generateRecommendations(canvasData),
        skillMatrix: generateSkillMatrix(canvasData),
        careerPath: generateCareerPath(canvasData),
        nextSteps: generateNextSteps(canvasData)
      };
      
      setGeneratedCanvas(canvas);
      addNotification('Career canvas generated successfully!', 'success');
    } catch (error) {
      addNotification('Error generating career canvas', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRecommendations = (data) => {
    const recommendations = [];
    
    if (data.careerGoals.includes('Penetration Tester')) {
      recommendations.push('Focus on hands-on labs and capture-the-flag competitions');
      recommendations.push('Consider OSCP certification for practical penetration testing skills');
    }
    
    if (data.careerGoals.includes('Security Analyst')) {
      recommendations.push('Develop strong analytical and incident response skills');
      recommendations.push('Learn SIEM tools and security monitoring techniques');
    }
    
    if (data.experienceLevel === 'beginner') {
      recommendations.push('Start with Security+ certification as foundation');
      recommendations.push('Build a home lab for hands-on practice');
    }
    
    if (data.preferredIndustries.includes('Financial Services')) {
      recommendations.push('Focus on compliance frameworks like PCI-DSS');
      recommendations.push('Understand financial industry regulations');
    }
    
    return recommendations.slice(0, 5); // Return top 5 recommendations
  };

  const generateSkillMatrix = (data) => {
    const baseSkills = {
      'Network Security': data.experienceLevel === 'beginner' ? 30 : data.experienceLevel === 'intermediate' ? 60 : 80,
      'Risk Management': data.experienceLevel === 'beginner' ? 20 : data.experienceLevel === 'intermediate' ? 50 : 75,
      'Incident Response': data.experienceLevel === 'beginner' ? 25 : data.experienceLevel === 'intermediate' ? 55 : 70,
      'Compliance': data.experienceLevel === 'beginner' ? 35 : data.experienceLevel === 'intermediate' ? 65 : 85,
    };
    
    // Adjust based on career goals
    if (data.careerGoals.includes('Penetration Tester')) {
      baseSkills['Penetration Testing'] = data.experienceLevel === 'beginner' ? 40 : 70;
      baseSkills['Application Security'] = data.experienceLevel === 'beginner' ? 35 : 65;
    }
    
    if (data.careerGoals.includes('Security Architect')) {
      baseSkills['Security Architecture'] = data.experienceLevel === 'beginner' ? 30 : 70;
      baseSkills['Cloud Security'] = data.experienceLevel === 'beginner' ? 40 : 75;
    }
    
    return baseSkills;
  };

  const generateCareerPath = (data) => {
    const paths = {
      'short_term': [],
      'medium_term': [],
      'long_term': []
    };
    
    if (data.experienceLevel === 'beginner') {
      paths.short_term = ['Complete Security+ certification', 'Build home lab', 'Join cybersecurity communities'];
      paths.medium_term = ['Gain entry-level security role', 'Specialize in chosen area', 'Obtain advanced certification'];
      paths.long_term = ['Lead security projects', 'Mentor others', 'Pursue leadership roles'];
    } else if (data.experienceLevel === 'intermediate') {
      paths.short_term = ['Advanced certification in specialty', 'Contribute to security projects', 'Build professional network'];
      paths.medium_term = ['Senior security role', 'Thought leadership', 'Specialty expertise'];
      paths.long_term = ['Security leadership', 'Industry recognition', 'Strategic roles'];
    }
    
    return paths;
  };

  const generateNextSteps = (data) => {
    const steps = [];
    
    steps.push('Complete your personalized learning plan');
    steps.push('Set up practice environment for hands-on learning');
    
    if (data.careerGoals.length > 0) {
      steps.push(`Research ${data.careerGoals[0]} job requirements`);
    }
    
    if (data.preferredIndustries.length > 0) {
      steps.push(`Network with professionals in ${data.preferredIndustries[0]}`);
    }
    
    steps.push('Join relevant cybersecurity communities and forums');
    
    return steps;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">🎯 What are your career goals?</h3>
            <p className="text-gray-300 mb-6">Select one or more cybersecurity roles you're interested in pursuing:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {careerOptions.map(option => (
                <label
                  key={option}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all text-center ${
                    canvasData.careerGoals.includes(option)
                      ? 'border-accent-green bg-dark-card-hover'
                      : 'border-dark-border hover:border-accent-teal'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={canvasData.careerGoals.includes(option)}
                    onChange={() => handleMultiSelect('careerGoals', option)}
                    className="sr-only"
                  />
                  <div className="text-sm font-medium text-white">{option}</div>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">📊 Current State Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-accent-teal mb-2">
                  Current Role
                </label>
                <input
                  type="text"
                  value={canvasData.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                  placeholder="e.g., IT Support, Developer, Student"
                  className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white focus:ring-2 focus:ring-accent-teal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-accent-teal mb-2">
                  Experience Level {assessmentResult && <span className="text-accent-green">[FROM ASSESSMENT]</span>}
                </label>
                <select
                  value={canvasData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white focus:ring-2 focus:ring-accent-teal"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">💪 Strengths & Growth Areas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-accent-green mb-4">Your Strengths</h4>
                <div className="space-y-3">
                  {['Technical problem-solving', 'Attention to detail', 'Continuous learning', 'Communication skills', 'Team collaboration', 'Critical thinking'].map(strength => (
                    <label
                      key={strength}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        canvasData.strengths.includes(strength)
                          ? 'bg-dark-card-hover border border-accent-green'
                          : 'border border-dark-border hover:border-accent-teal'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={canvasData.strengths.includes(strength)}
                        onChange={() => handleMultiSelect('strengths', strength)}
                        className="sr-only"
                      />
                      <span className="text-white text-sm">{strength}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-accent-teal mb-4">Areas for Growth</h4>
                <div className="space-y-3">
                  {skillAreas.slice(0, 6).map(area => (
                    <label
                      key={area}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        canvasData.areasForGrowth.includes(area)
                          ? 'bg-dark-card-hover border border-accent-teal'
                          : 'border border-dark-border hover:border-accent-green'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={canvasData.areasForGrowth.includes(area)}
                        onChange={() => handleMultiSelect('areasForGrowth', area)}
                        className="sr-only"
                      />
                      <span className="text-white text-sm">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">🏢 Preferences & Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-accent-teal mb-4">Preferred Industries</h4>
                <div className="grid grid-cols-1 gap-3">
                  {industryOptions.map(industry => (
                    <label
                      key={industry}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        canvasData.preferredIndustries.includes(industry)
                          ? 'bg-dark-card-hover border border-accent-teal'
                          : 'border border-dark-border hover:border-accent-green'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={canvasData.preferredIndustries.includes(industry)}
                        onChange={() => handleMultiSelect('preferredIndustries', industry)}
                        className="sr-only"
                      />
                      <span className="text-white text-sm">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-accent-green mb-2">
                    Career Timeline
                  </label>
                  <select
                    value={canvasData.timeHorizon}
                    onChange={(e) => handleInputChange('timeHorizon', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white focus:ring-2 focus:ring-accent-green"
                  >
                    <option value="6 months">6 months</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-green mb-2">
                    Learning Style
                  </label>
                  <select
                    value={canvasData.learningStyle}
                    onChange={(e) => handleInputChange('learningStyle', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white focus:ring-2 focus:ring-accent-green"
                  >
                    <option value="hands-on">Hands-on / Practical</option>
                    <option value="theoretical">Theoretical / Academic</option>
                    <option value="mixed">Mixed Approach</option>
                    <option value="visual">Visual Learning</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">🚀 Motivations & Challenges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-accent-green mb-4">What motivates you?</h4>
                <div className="space-y-3">
                  {motivationOptions.map(motivation => (
                    <label
                      key={motivation}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        canvasData.motivations.includes(motivation)
                          ? 'bg-dark-card-hover border border-accent-green'
                          : 'border border-dark-border hover:border-accent-teal'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={canvasData.motivations.includes(motivation)}
                        onChange={() => handleMultiSelect('motivations', motivation)}
                        className="sr-only"
                      />
                      <span className="text-white text-sm">{motivation}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-accent-teal mb-4">Current Challenges</h4>
                <div className="space-y-3">
                  {challengeOptions.map(challenge => (
                    <label
                      key={challenge}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        canvasData.challenges.includes(challenge)
                          ? 'bg-dark-card-hover border border-accent-teal'
                          : 'border border-dark-border hover:border-accent-green'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={canvasData.challenges.includes(challenge)}
                        onChange={() => handleMultiSelect('challenges', challenge)}
                        className="sr-only"
                      />
                      <span className="text-white text-sm">{challenge}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            {!isGenerating && !generatedCanvas && (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">🎨 Ready to Generate Your Career Canvas</h3>
                <p className="text-gray-300 mb-8">
                  Based on your inputs, we'll create a comprehensive career roadmap tailored to your goals and preferences.
                </p>
                <button
                  onClick={generateCareerCanvas}
                  className="btn-cyber-green py-4 px-8 text-lg font-bold"
                >
                  🚀 GENERATE CAREER CANVAS
                </button>
              </div>
            )}
            
            {isGenerating && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-teal mb-4 mx-auto"></div>
                <h3 className="text-2xl font-bold text-white mb-4">Generating Your Career Canvas...</h3>
                <p className="text-gray-300">Analyzing your preferences and creating personalized recommendations</p>
              </div>
            )}
            
            {generatedCanvas && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4">🎨 Your Career Canvas</h3>
                  <p className="text-gray-300">Your personalized cybersecurity career roadmap</p>
                </div>
                
                <div className="career-canvas">
                  {/* Career Goals */}
                  <div className="career-section">
                    <h3>🎯 Career Goals</h3>
                    <ul className="space-y-2">
                      {generatedCanvas.careerGoals.map((goal, index) => (
                        <li key={index} className="text-gray-300">• {goal}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Skill Matrix */}
                  <div className="career-section">
                    <h3>📊 Skill Matrix</h3>
                    <div className="space-y-3">
                      {Object.entries(generatedCanvas.skillMatrix).map(([skill, level]) => (
                        <div key={skill} className="skill-meter">
                          <span className="skill-name">{skill}</span>
                          <div className="skill-bar">
                            <div 
                              className="skill-fill" 
                              style={{ width: `${level}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 ml-2">{level}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recommendations */}
                  <div className="career-section">
                    <h3>💡 Recommendations</h3>
                    <ul className="space-y-2">
                      {generatedCanvas.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-300">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Career Path */}
                  <div className="career-section">
                    <h3>🛤️ Career Path</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-accent-green font-semibold mb-2">Short-term (Next 6-12 months)</h4>
                        <ul className="space-y-1">
                          {generatedCanvas.careerPath.short_term.map((item, index) => (
                            <li key={index} className="text-gray-300 text-sm">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-accent-teal font-semibold mb-2">Medium-term (1-3 years)</h4>
                        <ul className="space-y-1">
                          {generatedCanvas.careerPath.medium_term.map((item, index) => (
                            <li key={index} className="text-gray-300 text-sm">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-accent-blue font-semibold mb-2">Long-term (3+ years)</h4>
                        <ul className="space-y-1">
                          {generatedCanvas.careerPath.long_term.map((item, index) => (
                            <li key={index} className="text-gray-300 text-sm">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Next Steps */}
                  <div className="career-section">
                    <h3>🚀 Immediate Next Steps</h3>
                    <ol className="space-y-2">
                      {generatedCanvas.nextSteps.map((step, index) => (
                        <li key={index} className="text-gray-300">{index + 1}. {step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  {/* Preferences Summary */}
                  <div className="career-section">
                    <h3>⚙️ Your Preferences</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-accent-teal">Timeline:</span> {generatedCanvas.timeHorizon}</p>
                      <p><span className="text-accent-teal">Learning Style:</span> {generatedCanvas.learningStyle}</p>
                      <p><span className="text-accent-teal">Industries:</span> {generatedCanvas.preferredIndustries.join(', ')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => onComplete(generatedCanvas)}
                    className="btn-cyber-green py-4 px-8 text-lg font-bold"
                  >
                    ✅ COMPLETE CAREER CANVAS
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="glass-card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🗺️ <span className="accent-text-teal">CAREER</span> <span className="accent-text-green">CANVAS</span>
          </h1>
          <p className="text-lg text-gray-300">
            Create your personalized cybersecurity career roadmap
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    index === currentStep
                      ? 'bg-accent-teal text-dark-bg'
                      : index < currentStep
                      ? 'bg-accent-green text-dark-bg'
                      : 'bg-dark-border text-gray-400'
                  }`}
                >
                  <span className="font-bold">{index + 1}</span>
                  <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="text-gray-400">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={currentStep === 0 ? onBack : () => setCurrentStep(currentStep - 1)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            ← {currentStep === 0 ? 'BACK' : 'PREVIOUS'}
          </button>
          
          {currentStep < steps.length - 1 && !generatedCanvas && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 0 && canvasData.careerGoals.length === 0) ||
                (currentStep === 2 && canvasData.strengths.length === 0)
              }
              className="btn-cyber py-3 px-6 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              NEXT →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerCanvas;