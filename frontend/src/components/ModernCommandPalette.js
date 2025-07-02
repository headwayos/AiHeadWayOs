import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ModernCommandPalette = ({ isOpen, onClose, onCommand, theme = 'dark' }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    { id: 'assessment', label: 'Start Assessment', description: 'Begin skill evaluation', icon: '🎯', shortcut: 'A' },
    { id: 'roadmap', label: 'View Roadmap', description: 'See learning path', icon: '🗺️', shortcut: 'R' },
    { id: 'enhanced_roadmap', label: 'Enhanced Roadmap', description: 'Advanced roadmap view', icon: '🚀', shortcut: 'E' },
    { id: 'notebook', label: 'Open Notebook', description: 'Study materials', icon: '📖', shortcut: 'N' },
    { id: 'progress', label: 'View Progress', description: 'Track achievements', icon: '📊', shortcut: 'P' },
    { id: 'ai_assistant', label: 'AI Assistant', description: 'Toggle AI helper', icon: '🤖', shortcut: 'AI' },
    { id: 'dashboard', label: 'Dashboard', description: 'Main overview', icon: '🏠', shortcut: 'D' },
    { id: 'export', label: 'Export Plan', description: 'Download learning plan', icon: '📤', shortcut: 'X' },
    { id: 'toggle_enhanced', label: 'Toggle Enhanced Mode', description: 'Switch view mode', icon: '⚡', shortcut: 'T' },
    { id: 'reset', label: 'Reset Progress', description: 'Start over', icon: '🔄', shortcut: 'Reset' }
  ];

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleCommandSelect(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleCommandSelect = (command) => {
    onCommand(command.id);
    setQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="command-palette-backdrop" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="command-palette"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands..."
                className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-3 text-white placeholder-gray-400"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                ESC to close
              </div>
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-2xl mb-2">🤷‍♂️</div>
                <div>No commands found</div>
                <div className="text-sm mt-1">Try a different search term</div>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCommands.map((command, index) => (
                  <motion.button
                    key={command.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleCommandSelect(command)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      index === selectedIndex
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="text-xl">{command.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{command.label}</div>
                      <div className="text-sm text-gray-400 truncate">{command.description}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 text-xs bg-gray-700 rounded border border-gray-600 text-gray-300">
                        {command.shortcut}
                      </kbd>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">⏎</kbd>
                  <span>Select</span>
                </div>
              </div>
              <div>
                {filteredCommands.length} commands
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ModernCommandPalette;