import React, { useState, useEffect } from 'react';

const RoadmapView = ({ plan, onChapterSelect, currentChapter, userProgress }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const getNodeStatus = (chapterIndex, userProgress) => {
    if (!userProgress || !userProgress.completed_chapters) return 'pending';
    
    const completedChapters = userProgress.completed_chapters || [];
    if (completedChapters.includes(chapterIndex)) return 'completed';
    if (chapterIndex === currentChapter) return 'active';
    if (chapterIndex < currentChapter || completedChapters.length >= chapterIndex) return 'unlocked';
    return 'locked';
  };

  const getSkillProgress = (level) => {
    const levels = { beginner: 25, intermediate: 50, advanced: 75, expert: 100 };
    return levels[level] || 0;
  };

  if (!plan || !plan.table_of_contents) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Roadmap Available</h3>
          <p className="text-slate-500">Complete your assessment to generate a learning roadmap</p>
        </div>
      </div>
    );
  }

  const { chapters, total_chapters, difficulty_level } = plan.table_of_contents;

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              🗺️ Learning Roadmap
            </h1>
            <p className="text-slate-600">Your personalized cybersecurity learning journey</p>
          </div>
          <div className="text-right">
            <div className="bg-slate-100 px-4 py-2 rounded-lg">
              <div className="text-sm text-slate-500">Progress</div>
              <div className="text-2xl font-bold text-emerald-600">
                {Math.round(((currentChapter || 0) / total_chapters) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Skill Level Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📊</span>
              <span className="font-medium text-blue-800">Skill Level: {difficulty_level}</span>
            </div>
            <span className="text-sm text-blue-600">{getSkillProgress(difficulty_level)}% Proficiency</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getSkillProgress(difficulty_level)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Roadmap Visualization */}
      <div className="space-y-4">
        {chapters.map((chapter, index) => {
          const status = getNodeStatus(index, userProgress);
          const isHovered = hoveredNode === index;
          
          return (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => setHoveredNode(index)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Connection Line */}
              {index < chapters.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-8 bg-slate-200 z-0"></div>
              )}

              {/* Chapter Node */}
              <div
                className={`roadmap-node relative z-10 p-6 cursor-pointer transition-all duration-300 ${
                  status === 'completed' ? 'roadmap-node completed' :
                  status === 'active' ? 'roadmap-node active' :
                  status === 'unlocked' ? 'hover:shadow-clean-lg' :
                  'opacity-60 cursor-not-allowed'
                } ${isHovered && status !== 'locked' ? 'transform scale-105' : ''}`}
                onClick={() => {
                  if (status !== 'locked') {
                    onChapterSelect(index, chapter);
                  }
                }}
              >
                <div className="flex items-start space-x-4">
                  {/* Chapter Icon & Status */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      status === 'completed' ? 'bg-emerald-500' :
                      status === 'active' ? 'bg-blue-500' :
                      status === 'unlocked' ? 'bg-slate-400' :
                      'bg-slate-300'
                    }`}>
                      {status === 'completed' ? '✓' : 
                       status === 'locked' ? '🔒' : 
                       index + 1}
                    </div>
                  </div>

                  {/* Chapter Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-800 truncate">
                        {chapter.title}
                      </h3>
                      {chapter.estimated_time && (
                        <span className="text-sm text-slate-500 ml-4">
                          ⏱️ {chapter.estimated_time}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-600 mb-3 line-clamp-2">
                      {chapter.description}
                    </p>

                    {/* Chapter Stats */}
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      {chapter.sections && (
                        <span>📄 {chapter.sections.length} sections</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        status === 'active' ? 'bg-blue-100 text-blue-700' :
                        status === 'unlocked' ? 'bg-slate-100 text-slate-600' :
                        'bg-slate-50 text-slate-400'
                      }`}>
                        {status === 'completed' ? 'Completed' :
                         status === 'active' ? 'In Progress' :
                         status === 'unlocked' ? 'Available' :
                         'Locked'}
                      </span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  {status !== 'locked' && (
                    <div className="flex-shrink-0 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Hover Tooltip */}
                {isHovered && status !== 'locked' && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg z-20 whitespace-nowrap">
                    Click to {status === 'active' ? 'continue' : 'start'} chapter
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-800"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Card */}
      <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Learning Path Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{total_chapters}</div>
            <div className="text-sm text-slate-500">Total Chapters</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {userProgress?.completed_chapters?.length || 0}
            </div>
            <div className="text-sm text-slate-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {plan.table_of_contents.total_estimated_time || 'N/A'}
            </div>
            <div className="text-sm text-slate-500">Total Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600">
              {difficulty_level}
            </div>
            <div className="text-sm text-slate-500">Difficulty</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;