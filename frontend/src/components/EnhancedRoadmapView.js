import React, { useState, useEffect } from 'react';
import EnhancedVisualMap from './EnhancedVisualMap';

const EnhancedRoadmapView = ({ plan, onChapterSelect, currentChapter, userProgress, theme = 'light' }) => {
  const [viewMode, setViewMode] = useState('visual'); // 'visual', 'list', 'timeline'
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [roadmapData, setRoadmapData] = useState(null);

  // Enhanced roadmap data processing
  useEffect(() => {
    if (plan && plan.table_of_contents) {
      const enhanced = processRoadmapData(plan);
      setRoadmapData(enhanced);
    }
  }, [plan, userProgress]);

  const processRoadmapData = (plan) => {
    const { chapters, total_chapters, difficulty_level, total_estimated_time } = plan.table_of_contents;
    
    // Calculate comprehensive statistics
    const stats = {
      totalChapters: total_chapters,
      completedChapters: userProgress?.completed_chapters?.length || 0,
      totalTime: total_estimated_time,
      timeSpent: calculateTimeSpent(userProgress),
      skillsGained: extractSkillsGained(chapters, userProgress),
      difficultyDistribution: calculateDifficultyDistribution(chapters),
      prerequisites: extractPrerequisites(chapters),
      learningPaths: generateLearningPaths(chapters)
    };

    // Enhanced chapter data
    const enhancedChapters = chapters.map((chapter, index) => ({
      ...chapter,
      id: `chapter-${index}`,
      index,
      status: getChapterStatus(index, userProgress),
      progress: getChapterProgress(index, userProgress),
      estimatedTime: chapter.estimated_time || calculateEstimatedTime(chapter),
      difficulty: chapter.difficulty || difficulty_level,
      prerequisites: chapter.prerequisites || [],
      skills: extractChapterSkills(chapter),
      dependencies: calculateDependencies(index, chapters),
      nextSteps: generateNextSteps(index, chapter, chapters),
      resources: generateResources(chapter),
      assessments: generateAssessments(chapter)
    }));

    return {
      ...plan,
      stats,
      enhancedChapters,
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '2.0',
        granularity: 'exhaustive'
      }
    };
  };

  const getChapterStatus = (index, userProgress) => {
    if (!userProgress || !userProgress.completed_chapters) return 'pending';
    
    const completedChapters = userProgress.completed_chapters || [];
    if (completedChapters.includes(index)) return 'completed';
    if (index === currentChapter) return 'active';
    if (index < currentChapter || completedChapters.length >= index) return 'unlocked';
    return 'locked';
  };

  const getChapterProgress = (index, userProgress) => {
    if (!userProgress) return 0;
    const completedChapters = userProgress.completed_chapters || [];
    if (completedChapters.includes(index)) return 100;
    if (index === currentChapter) return userProgress.currentProgress || 0;
    return 0;
  };

  const calculateTimeSpent = (userProgress) => {
    return userProgress?.total_time_spent || 0;
  };

  const extractSkillsGained = (chapters, userProgress) => {
    const allSkills = [];
    chapters.forEach((chapter, index) => {
      if (userProgress?.completed_chapters?.includes(index)) {
        // Extract skills from completed chapters
        const chapterSkills = extractChapterSkills(chapter);
        allSkills.push(...chapterSkills);
      }
    });
    return [...new Set(allSkills)];
  };

  const extractChapterSkills = (chapter) => {
    // Mock skill extraction - in real app, this would analyze chapter content
    const skills = [
      'Network Analysis',
      'Threat Detection',
      'Incident Response',
      'Risk Assessment',
      'Security Architecture',
      'Compliance Management'
    ];
    return skills.slice(0, Math.floor(Math.random() * 3) + 2);
  };

  const calculateDifficultyDistribution = (chapters) => {
    const distribution = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    chapters.forEach(chapter => {
      const difficulty = chapter.difficulty || 'intermediate';
      distribution[difficulty]++;
    });
    return distribution;
  };

  const extractPrerequisites = (chapters) => {
    const allPrereqs = new Set();
    chapters.forEach(chapter => {
      if (chapter.prerequisites) {
        chapter.prerequisites.forEach(prereq => allPrereqs.add(prereq));
      }
    });
    return Array.from(allPrereqs);
  };

  const generateLearningPaths = (chapters) => {
    // Generate multiple learning paths based on goals
    return {
      linear: chapters.map((_, index) => index),
      skillBased: generateSkillBasedPath(chapters),
      timeOptimized: generateTimeOptimizedPath(chapters),
      difficultyGraded: generateDifficultyGradedPath(chapters)
    };
  };

  const generateSkillBasedPath = (chapters) => {
    // Sort chapters by skill dependencies
    return chapters.map((_, index) => index).sort((a, b) => {
      const aSkills = extractChapterSkills(chapters[a]).length;
      const bSkills = extractChapterSkills(chapters[b]).length;
      return aSkills - bSkills;
    });
  };

  const generateTimeOptimizedPath = (chapters) => {
    // Sort chapters by estimated time
    return chapters.map((_, index) => index).sort((a, b) => {
      const aTime = parseInt(chapters[a].estimated_time || '60');
      const bTime = parseInt(chapters[b].estimated_time || '60');
      return aTime - bTime;
    });
  };

  const generateDifficultyGradedPath = (chapters) => {
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    return chapters.map((_, index) => index).sort((a, b) => {
      const aDiff = difficultyOrder[chapters[a].difficulty || 'intermediate'];
      const bDiff = difficultyOrder[chapters[b].difficulty || 'intermediate'];
      return aDiff - bDiff;
    });
  };

  const calculateEstimatedTime = (chapter) => {
    // Calculate based on content length and complexity
    const baseTime = 45; // minutes
    const sections = chapter.sections?.length || 3;
    return `${baseTime + (sections * 15)} min`;
  };

  const calculateDependencies = (index, chapters) => {
    // Calculate which chapters depend on this one
    const dependencies = [];
    chapters.forEach((chapter, chapterIndex) => {
      if (chapter.prerequisites?.includes(`chapter-${index}`)) {
        dependencies.push(chapterIndex);
      }
    });
    return dependencies;
  };

  const generateNextSteps = (index, chapter, chapters) => {
    const nextSteps = [];
    if (index < chapters.length - 1) {
      nextSteps.push(`Continue to ${chapters[index + 1].title}`);
    }
    nextSteps.push('Complete chapter assessment');
    nextSteps.push('Practice hands-on exercises');
    return nextSteps;
  };

  const generateResources = (chapter) => {
    return [
      { type: 'video', title: 'Chapter Overview', url: '#', duration: '15 min' },
      { type: 'article', title: 'Deep Dive Reading', url: '#', readTime: '20 min' },
      { type: 'lab', title: 'Hands-on Practice', url: '#', difficulty: 'intermediate' },
      { type: 'quiz', title: 'Knowledge Check', url: '#', questions: 10 }
    ];
  };

  const generateAssessments = (chapter) => {
    return [
      { type: 'quiz', questions: 10, passingScore: 80 },
      { type: 'practical', tasks: 3, estimatedTime: '30 min' },
      { type: 'project', complexity: 'moderate', estimatedTime: '2 hours' }
    ];
  };

  const filteredChapters = roadmapData?.enhancedChapters.filter(chapter => {
    if (filterLevel !== 'all' && chapter.status !== filterLevel) return false;
    if (searchTerm && !chapter.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedSkills.length > 0 && !selectedSkills.some(skill => chapter.skills.includes(skill))) return false;
    return true;
  }) || [];

  if (!roadmapData) {
    return (
      <div className={`flex items-center justify-center h-96 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="text-4xl mb-4 loading-pulse">🗺️</div>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-700'} mb-2`}>
            Generating Enhanced Roadmap...
          </h3>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Processing comprehensive learning data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Enhanced Header */}
      <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-2`}>
                🗺️ Comprehensive Learning Roadmap
              </h1>
              <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {plan.topic} • {roadmapData.stats.totalChapters} chapters • {roadmapData.stats.totalTime}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <div className={`flex rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} p-1`}>
                {[
                  { id: 'visual', icon: '🗺️', label: 'Visual' },
                  { id: 'list', icon: '📋', label: 'List' },
                  { id: 'timeline', icon: '⏱️', label: 'Timeline' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === mode.id
                        ? 'bg-blue-600 text-white'
                        : `${theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-600' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'}`
                    }`}
                  >
                    <span className="mr-1">{mode.icon}</span>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {roadmapData.stats.completedChapters}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Completed</div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {roadmapData.stats.totalChapters}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total</div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                {roadmapData.stats.skillsGained.length}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Skills</div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                {roadmapData.stats.timeSpent}m
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Time Spent</div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>
                {Math.round((roadmapData.stats.completedChapters / roadmapData.stats.totalChapters) * 100)}%
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Progress</div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`}>
                {roadmapData.stats.prerequisites.length}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Prerequisites</div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search chapters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-800'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">All Chapters</option>
              <option value="completed">Completed</option>
              <option value="active">Active</option>
              <option value="unlocked">Available</option>
              <option value="locked">Locked</option>
            </select>

            {/* Results Count */}
            <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {filteredChapters.length} of {roadmapData.stats.totalChapters} chapters
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {viewMode === 'visual' ? (
          <EnhancedVisualMap
            plan={plan}
            onChapterSelect={onChapterSelect}
            currentChapter={currentChapter}
            userProgress={userProgress}
            theme={theme}
          />
        ) : viewMode === 'list' ? (
          <ListRoadmapView 
            chapters={filteredChapters}
            onChapterSelect={onChapterSelect}
            theme={theme}
          />
        ) : (
          <TimelineRoadmapView 
            chapters={filteredChapters}
            onChapterSelect={onChapterSelect}
            theme={theme}
          />
        )}
      </div>

      {/* Skills Gained Panel */}
      {roadmapData.stats.skillsGained.length > 0 && (
        <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-t p-6`}>
          <div className="max-w-7xl mx-auto">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-4`}>
              🎯 Skills Gained
            </h3>
            <div className="flex flex-wrap gap-2">
              {roadmapData.stats.skillsGained.map((skill, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    theme === 'dark' 
                      ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-600' 
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// List View Component
const ListRoadmapView = ({ chapters, onChapterSelect, theme }) => {
  return (
    <div className="space-y-4">
      {chapters.map((chapter, index) => (
        <div
          key={chapter.id}
          className={`roadmap-node ${chapter.status} cursor-pointer p-6`}
          onClick={() => onChapterSelect(chapter.index, chapter)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-2`}>
                {chapter.title}
              </h3>
              <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
                {chapter.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {chapter.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className={`px-2 py-1 text-xs rounded-full ${
                      theme === 'dark' ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  ⏱️ {chapter.estimatedTime}
                </span>
                <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  📊 {chapter.difficulty}
                </span>
                <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  ✅ {chapter.progress}%
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                chapter.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                chapter.status === 'active' ? 'bg-blue-100 text-blue-700' :
                chapter.status === 'unlocked' ? 'bg-slate-100 text-slate-600' :
                'bg-slate-50 text-slate-400'
              }`}>
                {chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}
              </div>
              
              <div className={`w-16 h-16 rounded-full border-4 ${
                chapter.status === 'completed' ? 'border-emerald-500' :
                chapter.status === 'active' ? 'border-blue-500' :
                'border-slate-300'
              } flex items-center justify-center text-2xl`}>
                {chapter.status === 'completed' ? '✓' : 
                 chapter.status === 'locked' ? '🔒' : 
                 chapter.index + 1}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Timeline View Component
const TimelineRoadmapView = ({ chapters, onChapterSelect, theme }) => {
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className={`absolute left-8 top-0 bottom-0 w-0.5 ${
        theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'
      }`}></div>

      <div className="space-y-8">
        {chapters.map((chapter, index) => (
          <div key={chapter.id} className="relative flex items-start">
            {/* Timeline Node */}
            <div className={`w-16 h-16 rounded-full border-4 ${
              chapter.status === 'completed' ? 'border-emerald-500 bg-emerald-100' :
              chapter.status === 'active' ? 'border-blue-500 bg-blue-100' :
              chapter.status === 'unlocked' ? 'border-slate-400 bg-slate-100' :
              'border-slate-300 bg-slate-50'
            } flex items-center justify-center text-xl font-bold z-10 relative`}>
              {chapter.status === 'completed' ? '✓' : 
               chapter.status === 'locked' ? '🔒' : 
               chapter.index + 1}
            </div>

            {/* Chapter Content */}
            <div 
              className={`ml-6 flex-1 roadmap-node ${chapter.status} cursor-pointer p-6`}
              onClick={() => onChapterSelect(chapter.index, chapter)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {chapter.title}
                </h3>
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {chapter.estimatedTime}
                </span>
              </div>

              <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
                {chapter.description}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    chapter.status === 'completed' ? 'bg-emerald-500' :
                    chapter.status === 'active' ? 'bg-blue-500' :
                    'bg-slate-400'
                  }`}
                  style={{ width: `${chapter.progress}%` }}
                ></div>
              </div>

              {/* Chapter Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {chapter.skills.slice(0, 2).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className={`px-2 py-1 text-xs rounded-full ${
                          theme === 'dark' ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Difficulty:</span>
                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {chapter.difficulty}
                  </div>
                </div>
                
                <div>
                  <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Resources:</span>
                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {chapter.resources.length}
                  </div>
                </div>
                
                <div>
                  <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Assessments:</span>
                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {chapter.assessments.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedRoadmapView;