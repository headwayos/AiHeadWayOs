import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

const EnhancedDashboard = ({ userProgress, onStartLearning, onViewProgress, addNotification }) => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    completedCourses: 0,
    streak: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load achievements
      const achievementsResponse = await axios.get(`${API}/achievements/anonymous`);
      setAchievements(achievementsResponse.data.achievements || []);

      // Load user progress
      const progressResponse = await axios.get(`${API}/user-progress/anonymous`);
      const progressData = progressResponse.data;
      
      setStats({
        totalXP: progressData.total_xp || 0,
        level: progressData.level || 1,
        completedCourses: progressData.completed_courses || 0,
        streak: progressData.learning_streak || 0
      });

      // Mock recent activity
      setRecentActivity([
        { type: 'completed', title: 'Network Fundamentals', time: '2 hours ago', icon: '✅' },
        { type: 'started', title: 'Web Security Basics', time: '1 day ago', icon: '🚀' },
        { type: 'achievement', title: 'First Steps Badge', time: '2 days ago', icon: '🏆' }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getXPProgress = () => {
    const currentLevelXP = stats.level * 1000;
    const nextLevelXP = (stats.level + 1) * 1000;
    const progress = ((stats.totalXP % 1000) / 1000) * 100;
    return { progress, nextLevelXP: nextLevelXP - stats.totalXP };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="cyber-loader"></div>
      </div>
    );
  }

  const xpProgress = getXPProgress();

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🛡️ CyberLearn Dashboard
            </h1>
            <p className="text-gray-400 font-mono">
              Welcome back, Defender! Ready to level up your cybersecurity skills?
            </p>
          </div>
          <div className="glass-card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-green">
                LEVEL {stats.level}
              </div>
              <div className="text-sm text-gray-400 font-mono">
                {stats.totalXP} XP
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-mono text-gray-400">LEVEL PROGRESS</span>
            <span className="text-sm font-mono text-neon-green">
              {xpProgress.nextLevelXP} XP to next level
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-neon-blue to-neon-green h-3 rounded-full transition-all duration-1000"
              style={{ width: `${xpProgress.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 text-center hover:bg-neon-blue/5 transition-all duration-300">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-neon-blue">{stats.totalXP}</div>
          <div className="text-sm text-gray-400 font-mono">TOTAL XP</div>
        </div>
        
        <div className="glass-card p-6 text-center hover:bg-neon-green/5 transition-all duration-300">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-neon-green">{stats.completedCourses}</div>
          <div className="text-sm text-gray-400 font-mono">COURSES COMPLETED</div>
        </div>
        
        <div className="glass-card p-6 text-center hover:bg-accent-green/5 transition-all duration-300">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-accent-green">{stats.streak}</div>
          <div className="text-sm text-gray-400 font-mono">DAY STREAK</div>
        </div>
        
        <div className="glass-card p-6 text-center hover:bg-cyber-purple/5 transition-all duration-300">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-cyber-purple">
            {achievements.filter(a => a.unlocked).length}
          </div>
          <div className="text-sm text-gray-400 font-mono">ACHIEVEMENTS</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            
            <div 
              className="glass-card p-6 cursor-pointer hover:bg-neon-green/10 transition-all duration-300 group"
              onClick={onStartLearning}
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl group-hover:scale-110 transition-transform">🚀</div>
                <div>
                  <h3 className="font-bold text-white">Start Learning</h3>
                  <p className="text-sm text-gray-400">Begin your cybersecurity journey</p>
                </div>
              </div>
            </div>

            <div 
              className="glass-card p-6 cursor-pointer hover:bg-neon-blue/10 transition-all duration-300 group"
              onClick={onViewProgress}
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl group-hover:scale-110 transition-transform">📊</div>
                <div>
                  <h3 className="font-bold text-white">View Progress</h3>
                  <p className="text-sm text-gray-400">Check your learning analytics</p>
                </div>
              </div>
            </div>

            <div 
              className="glass-card p-6 cursor-pointer hover:bg-accent-green/10 transition-all duration-300 group"
              onClick={() => addNotification('Coming soon! 🚧', 'info')}
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl group-hover:scale-110 transition-transform">👥</div>
                <div>
                  <h3 className="font-bold text-white">Join Community</h3>
                  <p className="text-sm text-gray-400">Connect with other learners</p>
                </div>
              </div>
            </div>

            <div 
              className="glass-card p-6 cursor-pointer hover:bg-cyber-purple/10 transition-all duration-300 group"
              onClick={() => addNotification('Practice labs coming soon! 🔬', 'info')}
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl group-hover:scale-110 transition-transform">🔬</div>
                <div>
                  <h3 className="font-bold text-white">Practice Labs</h3>
                  <p className="text-sm text-gray-400">Hands-on security exercises</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">📈 Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg">
                  <div className="text-xl">{activity.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{activity.title}</div>
                    <div className="text-sm text-gray-400">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Sidebar */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">🏆 Achievements</h2>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className={`glass-card p-4 ${
                  achievement.unlocked 
                    ? 'border-accent-green bg-accent-green/10' 
                    : 'border-gray-600 opacity-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon || '🏅'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {achievement.description}
                    </p>
                    {achievement.unlocked && (
                      <div className="text-xs text-accent-green font-mono mt-1">
                        +{achievement.xp_reward} XP
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Learning Streak */}
          <div className="glass-card p-6 mt-6 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-accent-green mb-1">
              {stats.streak} Days
            </div>
            <div className="text-sm text-gray-400 font-mono mb-4">
              LEARNING STREAK
            </div>
            <div className="text-xs text-gray-400">
              Keep it up! Consistency is key to mastering cybersecurity.
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="glass-card p-6 mt-6 text-center bg-gradient-to-br from-neon-blue/10 to-neon-green/10">
            <div className="text-lg mb-2">💡</div>
            <blockquote className="text-sm text-gray-300 italic mb-2">
              "In cybersecurity, knowledge is your strongest defense."
            </blockquote>
            <div className="text-xs text-gray-400">
              — CyberLearn Team
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cyber-loader {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(0, 255, 255, 0.1);
          border-top: 4px solid #00ffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .glass-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default EnhancedDashboard;