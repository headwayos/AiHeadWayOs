import React, { useState, useEffect } from 'react';

const CommandPalette = ({ isOpen, onClose, onCommand }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    { id: 'assessment', label: 'Start Assessment', icon: '📝', shortcut: 'Ctrl+A' },
    { id: 'roadmap', label: 'View Roadmap', icon: '🗺️', shortcut: 'Ctrl+R' },
    { id: 'notebook', label: 'Open Notebook', icon: '📓', shortcut: 'Ctrl+N' },
    { id: 'progress', label: 'Check Progress', icon: '📊', shortcut: 'Ctrl+P' },
    { id: 'chat', label: 'AI Assistant', icon: '🤖', shortcut: 'Ctrl+/' },
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', shortcut: 'Ctrl+D' },
    { id: 'reset', label: 'Reset Session', icon: '🔄', shortcut: 'Ctrl+Shift+R' },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  const handleCommand = (command) => {
    onCommand(command.id);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm z-50 flex items-start justify-center pt-24">
      <div className="command-palette bg-white rounded-xl shadow-clean-xl border border-slate-200 w-full max-w-lg mx-4">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              No commands found for "{query}"
            </div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => handleCommand(command)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{command.icon}</span>
                    <span className="font-medium">{command.label}</span>
                  </div>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                    {command.shortcut}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <span>Ctrl+K to open</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;