import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

const PreplacedVisualMap = ({ onComplete, addNotification, theme }) => {
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedPath, setSelectedPath] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [userProfile, setUserProfile] = useState({
    interests: [],
    experience_level: 'beginner',
    career_goal: 'student'
  });
  const [loading, setLoading] = useState(false);

  // PREPLACED-style cybersecurity domains map
  const cybersecurityDomains = {
    'core_domains': {
      title: 'Core Security Domains',
      position: { x: 400, y: 100 },
      nodes: [
        {
          id: 'network-security',
          title: 'Network Security',
          icon: '🌐',
          color: 'blue',
          position: { x: 200, y: 200 },
          connections: ['ethical-hacking', 'incident-response'],
          description: 'Protect networks from threats and vulnerabilities',
          difficulty: 'intermediate',
          duration: '6-8 weeks',
          skills: ['Firewall Management', 'IDS/IPS', 'VPN Configuration', 'Network Monitoring']
        },
        {
          id: 'ethical-hacking',
          title: 'Ethical Hacking',
          icon: '🎯',
          color: 'red',
          position: { x: 600, y: 200 },
          connections: ['network-security', 'malware-analysis'],
          description: 'Learn penetration testing and vulnerability assessment',
          difficulty: 'advanced',
          duration: '8-10 weeks',
          skills: ['Penetration Testing', 'Vulnerability Assessment', 'Social Engineering', 'Tool Mastery']
        },
        {
          id: 'incident-response',
          title: 'Incident Response',
          icon: '🚨',
          color: 'orange',
          position: { x: 200, y: 350 },
          connections: ['network-security', 'threat-hunting'],
          description: 'Respond to and investigate security incidents',
          difficulty: 'intermediate',
          duration: '6-8 weeks',
          skills: ['Digital Forensics', 'Incident Handling', 'Evidence Collection', 'Recovery Procedures']
        },
        {
          id: 'malware-analysis',
          title: 'Malware Analysis',
          icon: '🦠',
          color: 'purple',
          position: { x: 600, y: 350 },
          connections: ['ethical-hacking', 'threat-hunting'],
          description: 'Analyze and reverse engineer malicious software',
          difficulty: 'expert',
          duration: '10-12 weeks',
          skills: ['Reverse Engineering', 'Static Analysis', 'Dynamic Analysis', 'Malware Research']
        }
      ]
    },
    'specialized_domains': {
      title: 'Specialized Domains',
      position: { x: 400, y: 500 },
      nodes: [
        {
          id: 'cloud-security',
          title: 'Cloud Security',
          icon: '☁️',
          color: 'cyan',
          position: { x: 100, y: 600 },
          connections: ['application-security'],
          description: 'Secure cloud infrastructure and services',
          difficulty: 'advanced',
          duration: '8-10 weeks',
          skills: ['AWS Security', 'Azure Security', 'Container Security', 'DevSecOps']
        },
        {
          id: 'application-security',
          title: 'Application Security',
          icon: '📱',
          color: 'green',
          position: { x: 300, y: 600 },
          connections: ['cloud-security', 'compliance-governance'],
          description: 'Secure software development and applications',
          difficulty: 'intermediate',
          duration: '6-8 weeks',
          skills: ['Secure Coding', 'Code Review', 'SAST/DAST', 'Web Security']
        },
        {
          id: 'compliance-governance',
          title: 'Compliance & Governance',
          icon: '📋',
          color: 'indigo',
          position: { x: 500, y: 600 },
          connections: ['application-security', 'threat-hunting'],
          description: 'Ensure regulatory compliance and governance',
          difficulty: 'intermediate',
          duration: '6-8 weeks',
          skills: ['Risk Management', 'Audit', 'Policy Development', 'Compliance Frameworks']
        },
        {
          id: 'threat-hunting',
          title: 'Threat Hunting',
          icon: '🔍',
          color: 'rose',
          position: { x: 700, y: 600 },
          connections: ['incident-response', 'malware-analysis', 'compliance-governance'],
          description: 'Proactively hunt for advanced persistent threats',
          difficulty: 'expert',
          duration: '10-12 weeks',
          skills: ['Threat Intelligence', 'Advanced Analytics', 'Behavioral Analysis', 'IOC Development']
        }
      ]
    }
  };

  useEffect(() => {
    generatePersonalizedMap();
  }, []);

  const generatePersonalizedMap = () => {
    // Generate personalized recommendations based on user profile
    setMapData(cybersecurityDomains);
  };

  const getNodeColor = (color, isSelected = false, isHovered = false, theme = 'light') => {
    const colors = {
      blue: {
        light: {
          bg: isSelected ? 'bg-blue-100' : isHovered ? 'bg-blue-50' : 'bg-white',
          border: isSelected ? 'border-blue-500' : isHovered ? 'border-blue-300' : 'border-slate-200',
          text: 'text-blue-600',
          shadow: isSelected ? 'shadow-blue-glow' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        },
        dark: {
          bg: isSelected ? 'bg-blue-900/30' : isHovered ? 'bg-blue-900/20' : 'bg-slate-800',
          border: isSelected ? 'border-blue-400' : isHovered ? 'border-blue-500' : 'border-slate-600',
          text: 'text-blue-400',
          shadow: isSelected ? 'shadow-blue-glow' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        }
      },
      red: {
        light: {
          bg: isSelected ? 'bg-red-100' : isHovered ? 'bg-red-50' : 'bg-white',
          border: isSelected ? 'border-red-500' : isHovered ? 'border-red-300' : 'border-slate-200',
          text: 'text-red-600',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        },
        dark: {
          bg: isSelected ? 'bg-red-900/30' : isHovered ? 'bg-red-900/20' : 'bg-slate-800',
          border: isSelected ? 'border-red-400' : isHovered ? 'border-red-500' : 'border-slate-600',
          text: 'text-red-400',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        }
      },
      orange: {
        light: {
          bg: isSelected ? 'bg-orange-100' : isHovered ? 'bg-orange-50' : 'bg-white',
          border: isSelected ? 'border-orange-500' : isHovered ? 'border-orange-300' : 'border-slate-200',
          text: 'text-orange-600',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        },
        dark: {
          bg: isSelected ? 'bg-orange-900/30' : isHovered ? 'bg-orange-900/20' : 'bg-slate-800',
          border: isSelected ? 'border-orange-400' : isHovered ? 'border-orange-500' : 'border-slate-600',
          text: 'text-orange-400',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        }
      },
      purple: {
        light: {
          bg: isSelected ? 'bg-purple-100' : isHovered ? 'bg-purple-50' : 'bg-white',
          border: isSelected ? 'border-purple-500' : isHovered ? 'border-purple-300' : 'border-slate-200',
          text: 'text-purple-600',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        },
        dark: {
          bg: isSelected ? 'bg-purple-900/30' : isHovered ? 'bg-purple-900/20' : 'bg-slate-800',
          border: isSelected ? 'border-purple-400' : isHovered ? 'border-purple-500' : 'border-slate-600',
          text: 'text-purple-400',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        }
      },
      green: {
        light: {
          bg: isSelected ? 'bg-emerald-100' : isHovered ? 'bg-emerald-50' : 'bg-white',
          border: isSelected ? 'border-emerald-500' : isHovered ? 'border-emerald-300' : 'border-slate-200',
          text: 'text-emerald-600',
          shadow: isSelected ? 'shadow-emerald-glow' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        },
        dark: {
          bg: isSelected ? 'bg-emerald-900/30' : isHovered ? 'bg-emerald-900/20' : 'bg-slate-800',
          border: isSelected ? 'border-emerald-400' : isHovered ? 'border-emerald-500' : 'border-slate-600',
          text: 'text-emerald-400',
          shadow: isSelected ? 'shadow-emerald-glow' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        }
      },
      cyan: {
        light: {
          bg: isSelected ? 'bg-cyan-100' : isHovered ? 'bg-cyan-50' : 'bg-white',
          border: isSelected ? 'border-cyan-500' : isHovered ? 'border-cyan-300' : 'border-slate-200',
          text: 'text-cyan-600',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        },
        dark: {
          bg: isSelected ? 'bg-cyan-900/30' : isHovered ? 'bg-cyan-900/20' : 'bg-slate-800',
          border: isSelected ? 'border-cyan-400' : isHovered ? 'border-cyan-500' : 'border-slate-600',
          text: 'text-cyan-400',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        }
      },
      indigo: {
        light: {
          bg: isSelected ? 'bg-indigo-100' : isHovered ? 'bg-indigo-50' : 'bg-white',
          border: isSelected ? 'border-indigo-500' : isHovered ? 'border-indigo-300' : 'border-slate-200',
          text: 'text-indigo-600',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        },
        dark: {
          bg: isSelected ? 'bg-indigo-900/30' : isHovered ? 'bg-indigo-900/20' : 'bg-slate-800',
          border: isSelected ? 'border-indigo-400' : isHovered ? 'border-indigo-500' : 'border-slate-600',
          text: 'text-indigo-400',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        }
      },
      rose: {
        light: {
          bg: isSelected ? 'bg-rose-100' : isHovered ? 'bg-rose-50' : 'bg-white',
          border: isSelected ? 'border-rose-500' : isHovered ? 'border-rose-300' : 'border-slate-200',
          text: 'text-rose-600',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        },
        dark: {
          bg: isSelected ? 'bg-rose-900/30' : isHovered ? 'bg-rose-900/20' : 'bg-slate-800',
          border: isSelected ? 'border-rose-400' : isHovered ? 'border-rose-500' : 'border-slate-600',
          text: 'text-rose-400',
          shadow: isSelected ? 'shadow-clean-lg' : isHovered ? 'shadow-clean-lg' : 'shadow-clean'
        }
      }
    };
    return colors[color][theme];
  };

  const handleNodeClick = (node) => {
    if (selectedDomain?.id === node.id) {
      // Deselect if clicking the same node
      setSelectedDomain(null);
      setSelectedPath([]);
    } else {
      setSelectedDomain(node);
      setSelectedPath([node.id]);
      addNotification(`Selected: ${node.title}`, 'info');
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedDomain) {
      addNotification('Please select a cybersecurity domain first', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/generate-learning-plan`, {
        topic: selectedDomain.id,
        level: userProfile.experience_level,
        duration_weeks: parseInt(selectedDomain.duration.split('-')[0]) || 6,
        focus_areas: selectedDomain.skills,
        user_background: `Visual Map Selection: ${selectedDomain.title}`,
        skip_assessment: true
      });

      onComplete({
        type: 'visual_map',
        data: {
          topic: selectedDomain.id,
          level: userProfile.experience_level,
          career_goal: userProfile.career_goal,
          selected_domain: selectedDomain
        },
        plan: response.data
      });

      addNotification(`🎉 Learning plan generated for ${selectedDomain.title}!`, 'success');
    } catch (error) {
      console.error('Error generating plan:', error);
      addNotification('Failed to generate learning plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderConnections = () => {
    if (!mapData) return null;

    const connections = [];
    Object.values(mapData).forEach(domain => {
      domain.nodes.forEach(node => {
        node.connections?.forEach(connId => {
          const targetNode = Object.values(mapData)
            .flatMap(d => d.nodes)
            .find(n => n.id === connId);
          
          if (targetNode) {
            const isHighlighted = selectedDomain && 
              (selectedDomain.id === node.id || selectedDomain.id === targetNode.id);
            
            connections.push(
              <line
                key={`${node.id}-${connId}`}
                x1={node.position.x + 75}
                y1={node.position.y + 75}
                x2={targetNode.position.x + 75}
                y2={targetNode.position.y + 75}
                stroke={isHighlighted ? 
                  (theme === 'dark' ? '#60a5fa' : '#3b82f6') : 
                  (theme === 'dark' ? '#475569' : '#cbd5e1')
                }
                strokeWidth={isHighlighted ? 3 : 1}
                strokeDasharray={isHighlighted ? '0' : '5,5'}
                className="transition-all duration-300"
              />
            );
          }
        });
      });
    });

    return connections;
  };

  const renderNodes = () => {
    if (!mapData) return null;

    return Object.values(mapData).flatMap(domain =>
      domain.nodes.map(node => {
        const isSelected = selectedDomain?.id === node.id;
        const isHovered = hoveredNode === node.id;
        const colors = getNodeColor(node.color, isSelected, isHovered, theme);

        return (
          <g key={node.id}>
            {/* Node Circle */}
            <circle
              cx={node.position.x + 75}
              cy={node.position.y + 75}
              r={isSelected ? 85 : isHovered ? 80 : 75}
              fill={theme === 'dark' ? '#1e293b' : 'white'}
              stroke={isSelected ? 
                (theme === 'dark' ? '#60a5fa' : '#3b82f6') : 
                (theme === 'dark' ? '#475569' : '#cbd5e1')
              }
              strokeWidth={isSelected ? 3 : 2}
              className={`cursor-pointer transition-all duration-300 ${colors.shadow}`}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            />
            
            {/* Node Icon */}
            <text
              x={node.position.x + 75}
              y={node.position.y + 85}
              textAnchor="middle"
              fontSize="32"
              className="cursor-pointer pointer-events-none"
            >
              {node.icon}
            </text>
            
            {/* Node Title */}
            <text
              x={node.position.x + 75}
              y={node.position.y + 190}
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fill={theme === 'dark' ? '#f1f5f9' : '#334155'}
              className="cursor-pointer pointer-events-none"
            >
              {node.title}
            </text>
            
            {/* Difficulty Badge */}
            <rect
              x={node.position.x + 35}
              y={node.position.y + 200}
              width={80}
              height={20}
              rx={10}
              fill={isSelected ? 
                (theme === 'dark' ? '#60a5fa' : '#3b82f6') : 
                (theme === 'dark' ? '#475569' : '#cbd5e1')
              }
              className="cursor-pointer"
            />
            <text
              x={node.position.x + 75}
              y={node.position.y + 214}
              textAnchor="middle"
              fontSize="10"
              fontWeight="500"
              fill="white"
              className="cursor-pointer pointer-events-none"
            >
              {node.difficulty}
            </text>
          </g>
        );
      })
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-4`}>
            🗺️ Cybersecurity Learning Map
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-6`}>
            Explore cybersecurity domains and choose your learning path
          </p>
          
          {selectedDomain && (
            <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} border rounded-xl p-6 max-w-2xl mx-auto`}>
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">{selectedDomain.icon}</span>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {selectedDomain.title}
                </h3>
              </div>
              <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
                {selectedDomain.description}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    Duration: 
                  </span>
                  <span className={`ml-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {selectedDomain.duration}
                  </span>
                </div>
                <div>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    Difficulty: 
                  </span>
                  <span className={`ml-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {selectedDomain.difficulty}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} block mb-2`}>
                  Key Skills:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedDomain.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'} rounded-full text-xs`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Map */}
        <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} border rounded-xl p-8 mb-8`}>
          <svg
            width="100%"
            height="800"
            viewBox="0 0 800 750"
            className="w-full"
          >
            {renderConnections()}
            {renderNodes()}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => onComplete({ type: 'back' })}
            className={`px-6 py-3 ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'} rounded-lg transition-colors`}
          >
            ← Back to Entry Gates
          </button>

          {selectedDomain && (
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                loading
                  ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 ray-glow'
              }`}
            >
              {loading ? 'Generating Plan...' : `Generate ${selectedDomain.title} Plan`}
            </button>
          )}
        </div>

        {/* Legend */}
        <div className={`mt-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} border rounded-xl p-6`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-4`}>
            Map Legend
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'}`}></div>
              <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Beginner Friendly</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${theme === 'dark' ? 'bg-orange-400' : 'bg-orange-500'}`}></div>
              <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Intermediate Level</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${theme === 'dark' ? 'bg-red-400' : 'bg-red-500'}`}></div>
              <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Advanced/Expert</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreplacedVisualMap;