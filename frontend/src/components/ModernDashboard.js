import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ModernDashboard = ({ 
  userProgress, 
  onStartLearning, 
  onViewProgress, 
  addNotification, 
  theme = 'dark',
  onNavigate 
}) => {
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    completedCourses: 0,
    streak: 0,
    skillsGained: [],
    nextMilestone: 'Complete first assessment'
  });

  const [quickActions, setQuickActions] = useState([
    { id: 'assessment', icon: '🎯', label: 'Start Assessment', action: () => onNavigate('assessment') },
    { id: 'roadmap', icon: '🗺️', label: 'View Roadmap', action: () => onNavigate('roadmap') },
    { id: 'progress', icon: '📊', label: 'Track Progress', action: onViewProgress },
    { id: 'export', icon: '📤', label: 'Export Plan', action: () => handleExport() }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'achievement', title: 'First Steps', description: 'Completed your first assessment', time: '2 hours ago', icon: '🏆' },
    { id: 2, type: 'progress', title: 'Network Security', description: 'Progress: 45%', time: '1 day ago', icon: '📚' },
    { id: 3, type: 'skill', title: 'New Skill Unlocked', description: 'Threat Detection', time: '2 days ago', icon: '⚡' }
  ]);

  useEffect(() => {
    if (userProgress) {
      setStats({
        totalXP: userProgress.total_points || 0,
        level: Math.floor((userProgress.total_points || 0) / 1000) + 1,
        completedCourses: userProgress.assessments_completed || 0,
        streak: userProgress.learning_streak || 0,
        skillsGained: userProgress.skills_gained || [],
        nextMilestone: generateNextMilestone(userProgress)
      });
    }
  }, [userProgress]);

  const generateNextMilestone = (progress) => {
    const milestones = [
      'Complete first assessment',
      'Finish 3 chapters',
      'Reach 1000 XP',
      'Unlock advanced topics',
      'Complete specialization'
    ];
    
    const currentLevel = Math.floor((progress.total_points || 0) / 1000);
    return milestones[Math.min(currentLevel, milestones.length - 1)];
  };

  const handleExport = () => {
    addNotification('📤 Learning plan exported successfully!', 'success');
    // Export functionality would be implemented here
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card card-interactive relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <div className={`w-2 h-2 rounded-full ${
          color === 'primary' ? 'bg-blue-400' :
          color === 'success' ? 'bg-green-400' :
          color === 'warning' ? 'bg-yellow-400' :
          'bg-purple-400'
        } animate-pulse-glow`}></div>
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold gradient-text">{value}</div>
        <div className="text-sm text-gray-400">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
      </div>
      
      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 text-6xl opacity-10">
        {icon}
      </div>
    </motion.div>
  );

  const QuickActionCard = ({ action, index }) => (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={action.action}
      className="card card-interactive w-full text-left group"
    >
      <div className="flex items-center space-x-4">
        <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
          {action.icon}
        </div>
        <div>
          <div className="font-medium text-white">{action.label}</div>
          <div className="text-sm text-gray-400">Click to {action.label.toLowerCase()}</div>
        </div>
      </div>
    </motion.button>
  );

  const ActivityItem = ({ activity, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-start space-x-3 p-3 glass-light rounded-lg hover:bg-opacity-20 transition-all duration-300"
    >
      <div className="text-xl">{activity.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white">{activity.title}</div>
        <div className="text-sm text-gray-400">{activity.description}</div>
        <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Welcome back, Cyber Learner! 🛡️
          </h1>
          <p className="text-gray-400">
            Continue your cybersecurity journey with personalized learning
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total XP"
            value={stats.totalXP.toLocaleString()}
            subtitle={`Level ${stats.level}`}
            icon="⚡"
            color="primary"
          />
          <StatCard
            title="Completed"
            value={stats.completedCourses}
            subtitle="Assessments"
            icon="🎯"
            color="success"
          />
          <StatCard
            title="Learning Streak"
            value={`${stats.streak} days`}
            subtitle="Keep it up!"
            icon="🔥"
            color="warning"
          />
          <StatCard
            title="Skills Gained"
            value={stats.skillsGained.length}
            subtitle="Cybersecurity skills"
            icon="🧠"
            color="accent"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6 rounded-2xl"
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <span className="mr-2">⚡</span>
                Quick Actions
              </h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <QuickActionCard key={action.id} action={action} index={index} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Progress Overview */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6 rounded-2xl h-full"
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <span className="mr-2">📊</span>
                Learning Progress
              </h3>
              
              {/* Next Milestone */}
              <div className="mb-6 p-4 glass-light rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Next Milestone</span>
                  <span className="text-xs text-blue-400">In Progress</span>
                </div>
                <div className="font-medium text-white">{stats.nextMilestone}</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div 
                    className="gradient-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: '65%' }}
                  ></div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <ActivityItem key={activity.id} activity={activity} index={index} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="glass p-8 rounded-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold gradient-text mb-4">
                Ready to level up your cybersecurity skills?
              </h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Start your personalized learning journey with AI-powered assessments 
                and adaptive learning paths designed for your career goals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={onStartLearning}
                  className="btn-primary text-lg px-8 py-4 neon-glow"
                >
                  🚀 Start Learning Journey
                </button>
                <button 
                  onClick={onViewProgress}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  📈 View Detailed Progress
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernDashboard;