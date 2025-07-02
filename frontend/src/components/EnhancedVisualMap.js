import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

const EnhancedVisualMap = ({ plan, onChapterSelect, currentChapter, userProgress, theme = 'light' }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [animationState, setAnimationState] = useState('idle');
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);

  // Enhanced node structure with comprehensive data
  const enhanceMapData = (plan) => {
    if (!plan || !plan.table_of_contents) return null;

    const { chapters, total_chapters, difficulty_level, total_estimated_time } = plan.table_of_contents;
    
    return {
      id: plan.plan_id || 'roadmap',
      title: `${plan.topic} Learning Journey`,
      level: difficulty_level,
      totalTime: total_estimated_time,
      totalChapters: total_chapters,
      nodes: chapters.map((chapter, index) => ({
        id: `chapter-${index}`,
        chapterIndex: index,
        title: chapter.title,
        description: chapter.description,
        estimatedTime: chapter.estimated_time || '45 min',
        sections: chapter.sections || [],
        prerequisites: chapter.prerequisites || [],
        learningObjectives: chapter.learning_objectives || [],
        difficulty: chapter.difficulty || difficulty_level,
        status: getNodeStatus(index, userProgress),
        progress: getNodeProgress(index, userProgress),
        position: calculateNodePosition(index, total_chapters),
        connections: getNodeConnections(index, total_chapters),
        contextData: {
          completionRate: getCompletionRate(index, userProgress),
          timeSpent: getTimeSpent(index, userProgress),
          skillsGained: getSkillsGained(chapter),
          nextActions: getNextActions(index, chapter)
        }
      }))
    };
  };

  const getNodeStatus = (chapterIndex, userProgress) => {
    if (!userProgress || !userProgress.completed_chapters) return 'pending';
    
    const completedChapters = userProgress.completed_chapters || [];
    if (completedChapters.includes(chapterIndex)) return 'completed';
    if (chapterIndex === currentChapter) return 'active';
    if (chapterIndex < currentChapter || completedChapters.length >= chapterIndex) return 'unlocked';
    return 'locked';
  };

  const getNodeProgress = (chapterIndex, userProgress) => {
    if (!userProgress) return 0;
    const completedChapters = userProgress.completed_chapters || [];
    if (completedChapters.includes(chapterIndex)) return 100;
    if (chapterIndex === currentChapter) return userProgress.currentProgress || 0;
    return 0;
  };

  const calculateNodePosition = (index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = Math.min(200 + index * 20, 400);
    const x = 400 + Math.cos(angle) * radius;
    const y = 300 + Math.sin(angle) * radius;
    return { x, y, angle, radius };
  };

  const getNodeConnections = (index, total) => {
    const connections = [];
    if (index < total - 1) connections.push(index + 1);
    if (index > 0) connections.push(index - 1);
    return connections;
  };

  const getCompletionRate = (index, userProgress) => {
    return Math.random() * 100; // Mock data - replace with real calculation
  };

  const getTimeSpent = (index, userProgress) => {
    return Math.floor(Math.random() * 120) + 30; // Mock data
  };

  const getSkillsGained = (chapter) => {
    return ['Network Analysis', 'Threat Detection', 'Incident Response'].slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const getNextActions = (index, chapter) => {
    return ['Complete assessment', 'Practice lab', 'Review materials'];
  };

  useEffect(() => {
    if (plan) {
      const enhanced = enhanceMapData(plan);
      setMapData(enhanced);
    }
  }, [plan, userProgress]);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setAnimationState(prev => {
        switch (prev) {
          case 'idle': return 'pulse';
          case 'pulse': return 'glow';
          case 'glow': return 'idle';
          default: return 'idle';
        }
      });
      animationFrame = setTimeout(animate, 2000);
    };
    animate();
    return () => clearTimeout(animationFrame);
  }, []);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    if (node.status !== 'locked' && onChapterSelect) {
      onChapterSelect(node.chapterIndex, node);
    }
  };

  const getNodeColor = (status, theme) => {
    const colors = {
      light: {
        completed: { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-white' },
        active: { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white' },
        unlocked: { bg: 'bg-slate-300', border: 'border-slate-400', text: 'text-slate-700' },
        locked: { bg: 'bg-slate-200', border: 'border-slate-300', text: 'text-slate-500' }
      },
      dark: {
        completed: { bg: 'bg-emerald-600', border: 'border-emerald-500', text: 'text-white' },
        active: { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-white' },
        unlocked: { bg: 'bg-slate-600', border: 'border-slate-500', text: 'text-slate-200' },
        locked: { bg: 'bg-slate-700', border: 'border-slate-600', text: 'text-slate-400' }
      }
    };
    return colors[theme][status];
  };

  if (!mapData) {
    return (
      <div className={`flex items-center justify-center h-96 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-700'} mb-2`}>
            No Visual Map Available
          </h3>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Complete your assessment to generate a visual learning map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Enhanced Header with Stats */}
      <div className={`absolute top-0 left-0 right-0 z-20 ${theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-1`}>
              🗺️ Interactive Learning Map
            </h1>
            <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              {mapData.title} • {mapData.level} Level
            </p>
          </div>
          
          {/* Map Statistics */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {mapData.nodes.filter(n => n.status === 'completed').length}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Completed</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {mapData.totalChapters}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Nodes</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                {mapData.totalTime}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Est. Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="absolute inset-0 pt-24">
        <svg
          ref={canvasRef}
          viewBox="0 0 800 600"
          className="w-full h-full"
        >
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                strokeWidth="1"
                opacity="0.3"
              />
            </pattern>
            
            {/* Ray Animation Gradient */}
            <radialGradient id="rayGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} stopOpacity="0.8" />
              <stop offset="50%" stopColor={theme === 'dark' ? '#06b6d4' : '#0891b2'} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="800" height="600" fill="url(#grid)" />

          {/* Connection Lines with Animation */}
          {mapData.nodes.map((node, index) => 
            node.connections.map(connectionIndex => {
              const targetNode = mapData.nodes[connectionIndex];
              if (!targetNode) return null;
              
              return (
                <line
                  key={`connection-${index}-${connectionIndex}`}
                  x1={node.position.x}
                  y1={node.position.y}
                  x2={targetNode.position.x}
                  y2={targetNode.position.y}
                  stroke={theme === 'dark' ? '#475569' : '#94a3b8'}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className={`transition-all duration-500 ${
                    hoveredNode === index || hoveredNode === connectionIndex ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;10"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </line>
              );
            })
          )}

          {/* Interactive Nodes */}
          {mapData.nodes.map((node, index) => {
            const colors = getNodeColor(node.status, theme);
            const isHovered = hoveredNode === index;
            const isSelected = selectedNode?.id === node.id;
            
            return (
              <g key={node.id} className="cursor-pointer">
                {/* Ray Animation Background for Active Nodes */}
                {(node.status === 'active' || isHovered) && (
                  <circle
                    cx={node.position.x}
                    cy={node.position.y}
                    r="50"
                    fill="url(#rayGradient)"
                    className={`${animationState === 'glow' ? 'animate-ping' : ''}`}
                    opacity={isHovered ? 1 : 0.6}
                  />
                )}

                {/* Node Background */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={isHovered ? "35" : "30"}
                  className={`${colors.bg} ${colors.border} transition-all duration-300 filter ${
                    isHovered ? 'drop-shadow-lg' : 'drop-shadow-sm'
                  }`}
                  strokeWidth="3"
                  onMouseEnter={() => setHoveredNode(index)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node)}
                />

                {/* Progress Ring */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r="38"
                  fill="none"
                  stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'}
                  strokeWidth="4"
                />
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r="38"
                  fill="none"
                  stroke={colors.bg.replace('bg-', '')}
                  strokeWidth="4"
                  strokeDasharray={`${(node.progress / 100) * 238.76} 238.76`}
                  strokeDashoffset="0"
                  transform={`rotate(-90 ${node.position.x} ${node.position.y})`}
                  className="transition-all duration-500"
                />

                {/* Node Icon/Number */}
                <text
                  x={node.position.x}
                  y={node.position.y + 5}
                  textAnchor="middle"
                  className={`${colors.text} font-bold text-lg`}
                  fill="currentColor"
                >
                  {node.status === 'completed' ? '✓' : 
                   node.status === 'locked' ? '🔒' : 
                   index + 1}
                </text>

                {/* Node Label */}
                <text
                  x={node.position.x}
                  y={node.position.y + 60}
                  textAnchor="middle"
                  className={`${theme === 'dark' ? 'fill-white' : 'fill-slate-700'} text-sm font-medium max-w-20`}
                  fontSize="12"
                >
                  {node.title.length > 15 ? node.title.substring(0, 15) + '...' : node.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Enhanced Node Detail Panel */}
      {hoveredNode !== null && (
        <div className={`absolute top-24 right-6 w-80 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} p-6 z-30 transform transition-all duration-300`}>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-1`}>
                  {mapData.nodes[hoveredNode].title}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  Chapter {hoveredNode + 1} • {mapData.nodes[hoveredNode].estimatedTime}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                mapData.nodes[hoveredNode].status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                mapData.nodes[hoveredNode].status === 'active' ? 'bg-blue-100 text-blue-700' :
                mapData.nodes[hoveredNode].status === 'unlocked' ? 'bg-slate-100 text-slate-600' :
                'bg-slate-50 text-slate-400'
              }`}>
                {mapData.nodes[hoveredNode].status.charAt(0).toUpperCase() + mapData.nodes[hoveredNode].status.slice(1)}
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Progress</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {mapData.nodes[hoveredNode].progress}%
                </span>
              </div>
              <div className={`w-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded-full h-2`}>
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${mapData.nodes[hoveredNode].progress}%` }}
                ></div>
              </div>
            </div>

            {/* Context Data */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mb-1`}>Completion Rate</div>
                <div className={`font-semibold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {Math.round(mapData.nodes[hoveredNode].contextData.completionRate)}%
                </div>
              </div>
              <div>
                <div className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mb-1`}>Time Spent</div>
                <div className={`font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {mapData.nodes[hoveredNode].contextData.timeSpent}m
                </div>
              </div>
            </div>

            {/* Skills Gained */}
            <div>
              <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mb-2`}>Skills Gained</div>
              <div className="flex flex-wrap gap-1">
                {mapData.nodes[hoveredNode].contextData.skillsGained.map((skill, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleNodeClick(mapData.nodes[hoveredNode])}
              disabled={mapData.nodes[hoveredNode].status === 'locked'}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                mapData.nodes[hoveredNode].status === 'locked'
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 ray-glow'
              }`}
            >
              {mapData.nodes[hoveredNode].status === 'completed' ? 'Review Chapter' :
               mapData.nodes[hoveredNode].status === 'active' ? 'Continue Learning' :
               mapData.nodes[hoveredNode].status === 'unlocked' ? 'Start Chapter' :
               'Locked'}
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className={`absolute bottom-6 left-6 ${theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-4 border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
        <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-3`}>Map Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
            <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
            <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVisualMap;