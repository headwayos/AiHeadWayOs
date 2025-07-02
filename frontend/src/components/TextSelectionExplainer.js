import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TextSelectionExplainer = ({ addNotification }) => {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showExplainer, setShowExplainer] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 3 && text.length < 100) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(text);
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowExplainer(true);
        
        // Auto-hide after 5 seconds if no interaction
        setTimeout(() => {
          if (window.getSelection().toString() !== text) {
            setShowExplainer(false);
          }
        }, 5000);
      } else {
        setShowExplainer(false);
      }
    };

    const handleClickOutside = () => {
      if (!window.getSelection().toString()) {
        setShowExplainer(false);
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const explainText = async () => {
    if (!selectedText) return;
    
    setIsLoading(true);
    try {
      // Simulate AI explanation - in real app, this would call the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const explanations = {
        'firewall': 'A firewall is a network security device that monitors and controls incoming and outgoing network traffic based on predetermined security rules.',
        'encryption': 'Encryption is the process of converting information or data into a code to prevent unauthorized access.',
        'malware': 'Malware is malicious software designed to disrupt, damage, or gain unauthorized access to computer systems.',
        'phishing': 'Phishing is a type of social engineering attack used to steal user data, including login credentials and credit card numbers.',
        'vulnerability': 'A vulnerability is a weakness in a system that can be exploited by threats to gain unauthorized access or perform unauthorized actions.',
        'penetration testing': 'Penetration testing is an authorized simulated cyberattack on a computer system to evaluate its security.',
        'zero-day': 'A zero-day vulnerability is a computer software vulnerability that is unknown to those who should be interested in mitigating the vulnerability.',
        'ddos': 'A DDoS (Distributed Denial of Service) attack attempts to disrupt the normal traffic of a targeted server by overwhelming it with a flood of internet traffic.'
      };
      
      const lowerText = selectedText.toLowerCase();
      let foundExplanation = '';
      
      // Check if selected text matches any key terms
      for (const [term, explanation] of Object.entries(explanations)) {
        if (lowerText.includes(term)) {
          foundExplanation = explanation;
          break;
        }
      }
      
      if (!foundExplanation) {
        foundExplanation = `"${selectedText}" is a cybersecurity term. This concept is important for understanding security fundamentals and protecting digital assets.`;
      }
      
      setExplanation(foundExplanation);
      addNotification('💡 AI explanation generated!', 'info');
      
    } catch (error) {
      setExplanation('Sorry, I couldn\'t explain this term right now. Please try again later.');
      addNotification('Failed to generate explanation', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(selectedText);
    addNotification('📋 Text copied to clipboard!', 'success');
  };

  const searchTerm = () => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(selectedText + ' cybersecurity')}`;
    window.open(searchUrl, '_blank');
    addNotification('🔍 Opening search in new tab', 'info');
  };

  return (
    <AnimatePresence>
      {showExplainer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            transform: 'translateX(-50%)',
            zIndex: 9999
          }}
          className="text-explainer"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-w-64 max-w-80">
            {!explanation ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">💡</span>
                  <span className="font-medium text-white">Selected:</span>
                  <span className="text-blue-400 font-mono text-sm">"{selectedText}"</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={explainText}
                    disabled={isLoading}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center space-x-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Explaining...</span>
                      </>
                    ) : (
                      <>
                        <span>🧠</span>
                        <span>Explain</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={copyText}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center space-x-1"
                  >
                    <span>📋</span>
                    <span>Copy</span>
                  </button>
                  
                  <button
                    onClick={searchTerm}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center space-x-1"
                  >
                    <span>🔍</span>
                    <span>Search</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✨</span>
                  <span className="font-medium text-white">AI Explanation</span>
                </div>
                
                <p className="text-sm text-gray-300 leading-relaxed">
                  {explanation}
                </p>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setExplanation('')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    ← Back
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={copyText}
                      className="btn-ghost text-xs px-2 py-1"
                    >
                      📋
                    </button>
                    <button
                      onClick={searchTerm}
                      className="btn-ghost text-xs px-2 py-1"
                    >
                      🔍
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TextSelectionExplainer;