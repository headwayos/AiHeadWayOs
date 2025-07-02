import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

const VisualLearningMap = ({ planId, onChapterSelect, currentChapterId, plan }) => {
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (planId && plan) {
      loadChaptersAndProgress();
    }
  }, [planId, plan]);

  const loadChaptersAndProgress = async () => {
    try {
      if (plan?.table_of_contents?.chapters) {
        setChapters(plan.table_of_contents.chapters);
      }
      
      // Load user progress
      const progressResponse = await axios.get(`${API}/user-progress/anonymous`);
      setProgress(progressResponse.data.progress || {});
    } catch (error) {
      console.error('Error loading chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChapterStatus = (chapterId) => {
    const chapterProgress = progress[chapterId];
    if (!chapterProgress) return 'locked';
    if (chapterProgress.completed) return 'completed';
    if (chapterProgress.started) return 'active';
    return 'available';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'active': return '🔄';
      case 'available': return '🔓';
      case 'locked': return '🔒';
      default: return '⭕';
    }
  };

  const getStatusColor = (status, isSelected) => {
    if (isSelected) return 'border-neon-green bg-neon-green/20';
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-500/10';
      case 'active': return 'border-neon-blue bg-neon-blue/10';
      case 'available': return 'border-gray-400 bg-gray-400/10';
      case 'locked': return 'border-gray-600 bg-gray-600/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="cyber-loader"></div>
      </div>
    );
  }

  return (
    <div className="learning-map-container">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          🗺️ CYBERSECURITY LEARNING MAP
        </h2>
        <p className="text-gray-400 font-mono">
          Your visual journey through {plan?.topic?.replace('-', ' ')?.toUpperCase() || 'CYBERSECURITY'}
        </p>
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✅</span>
            <span className="text-gray-300">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-neon-blue">🔄</span>
            <span className="text-gray-300">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">🔓</span>
            <span className="text-gray-300">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">🔒</span>
            <span className="text-gray-300">Locked</span>
          </div>
        </div>
      </div>

      {/* Learning Path Visualization */}
      <div className="learning-path-container relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter, index) => {
            const status = getChapterStatus(chapter.id);
            const isSelected = currentChapterId === chapter.id;
            const isClickable = status !== 'locked';

            return (
              <div key={chapter.id} className="relative">
                {/* Connection Line */}
                {index < chapters.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-6 h-0.5 bg-gradient-to-r from-neon-blue to-transparent z-0"></div>
                )}

                {/* Chapter Node */}
                <div 
                  className={`
                    chapter-node relative cursor-pointer transform transition-all duration-300 hover:scale-105
                    ${isClickable ? 'hover:shadow-neon-blue' : 'cursor-not-allowed opacity-50'}
                  `}
                  onClick={() => isClickable && onChapterSelect(chapter.id)}
                >
                  <div className={`
                    glass-card p-6 border-2 rounded-xl relative overflow-hidden
                    ${getStatusColor(status, isSelected)}
                    ${isSelected ? 'ring-2 ring-neon-green' : ''}
                  `}>
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 text-xl">
                      {getStatusIcon(status)}
                    </div>

                    {/* Chapter Number */}
                    <div className="text-xs font-mono text-gray-400 mb-2">
                      CHAPTER {index + 1}
                    </div>

                    {/* Chapter Title */}
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {chapter.title}
                    </h3>

                    {/* Chapter Description */}
                    <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                      {chapter.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          status === 'completed' ? 'bg-green-500' : 
                          status === 'active' ? 'bg-neon-blue' : 'bg-gray-600'
                        }`}
                        style={{ 
                          width: status === 'completed' ? '100%' : 
                                status === 'active' ? '60%' : '0%' 
                        }}
                      ></div>
                    </div>

                    {/* Chapter Stats */}
                    <div className="flex justify-between text-xs text-gray-400 font-mono">
                      <span>⏱️ {chapter.estimated_time || '15 min'}</span>
                      <span>📖 {chapter.sections?.length || 3} sections</span>
                    </div>

                    {/* Interactive Elements */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-neon-green/5 rounded-xl pointer-events-none">
                        <div className="absolute top-2 left-2 w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Learning Path Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-green">
              {chapters.filter(c => getChapterStatus(c.id) === 'completed').length}
            </div>
            <div className="text-xs text-gray-400 font-mono">COMPLETED</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-blue">
              {chapters.filter(c => getChapterStatus(c.id) === 'active').length}
            </div>
            <div className="text-xs text-gray-400 font-mono">IN PROGRESS</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {chapters.filter(c => getChapterStatus(c.id) === 'available').length}
            </div>
            <div className="text-xs text-gray-400 font-mono">AVAILABLE</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-accent-green">
              {Math.round((chapters.filter(c => getChapterStatus(c.id) === 'completed').length / chapters.length) * 100)}%
            </div>
            <div className="text-xs text-gray-400 font-mono">OVERALL</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .learning-map-container {
          background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,20,40,0.1) 100%);
          border-radius: 16px;
          padding: 2rem;
        }
        
        .chapter-node:hover .glass-card {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .cyber-loader {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 255, 255, 0.1);
          border-top: 3px solid #00ffff;
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

export default VisualLearningMap;