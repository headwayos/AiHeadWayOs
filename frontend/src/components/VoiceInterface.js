import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceInterface = ({ onVoiceCommand, addNotification, isVisible = true }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        addNotification('🎤 Voice recognition started - speak now!', 'info');
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript, result[0].confidence);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Voice recognition error';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your audio settings.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        addNotification(errorMessage, 'error');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
      console.warn('Speech Recognition not supported in this browser');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [addNotification]);

  const processVoiceCommand = (command, confidenceLevel) => {
    const lowerCommand = command.toLowerCase().trim();
    
    // Define voice commands
    const commands = {
      'start assessment': () => onVoiceCommand('assessment'),
      'begin assessment': () => onVoiceCommand('assessment'),
      'take assessment': () => onVoiceCommand('assessment'),
      'show roadmap': () => onVoiceCommand('roadmap'),
      'view roadmap': () => onVoiceCommand('roadmap'),
      'open roadmap': () => onVoiceCommand('roadmap'),
      'show progress': () => onVoiceCommand('progress'),
      'view progress': () => onVoiceCommand('progress'),
      'check progress': () => onVoiceCommand('progress'),
      'open dashboard': () => onVoiceCommand('dashboard'),
      'show dashboard': () => onVoiceCommand('dashboard'),
      'go to dashboard': () => onVoiceCommand('dashboard'),
      'help': () => onVoiceCommand('help'),
      'help me': () => onVoiceCommand('help'),
      'what can i do': () => onVoiceCommand('help'),
      'export plan': () => onVoiceCommand('export'),
      'download plan': () => onVoiceCommand('export'),
      'ai assistant': () => onVoiceCommand('ai_assistant'),
      'show ai': () => onVoiceCommand('ai_assistant'),
      'call ai': () => onVoiceCommand('ai_assistant')
    };
    
    // Check for exact matches first
    let commandExecuted = false;
    for (const [phrase, action] of Object.entries(commands)) {
      if (lowerCommand.includes(phrase)) {
        action();
        commandExecuted = true;
        addNotification(`✅ Voice command executed: "${phrase}"`, 'success');
        break;
      }
    }
    
    // If no exact match found, provide feedback
    if (!commandExecuted) {
      if (confidenceLevel < 0.7) {
        addNotification(`🤔 Not sure what you said: "${command}". Try speaking more clearly.`, 'warning');
      } else {
        addNotification(`❓ Command not recognized: "${command}". Try "start assessment" or "show roadmap".`, 'warning');
      }
    }
    
    // Clear transcript after processing
    setTimeout(() => setTranscript(''), 3000);
  };

  const startListening = () => {
    if (!isSupported) {
      addNotification('Voice recognition not supported in this browser', 'error');
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.abort();
      return;
    }
    
    setTranscript('');
    setConfidence(0);
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    recognitionRef.current?.abort();
    setIsListening(false);
  };

  if (!isVisible) return null;

  return (
    <div className="voice-interface">
      {/* Voice Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={startListening}
        disabled={!isSupported}
        className={`voice-btn ${isListening ? 'recording' : ''} ${
          !isSupported ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={
          !isSupported ? 'Voice recognition not supported' :
          isListening ? 'Click to stop recording' :
          'Click to start voice command'
        }
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isListening ? (
            <motion.path
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          )}
        </svg>
      </motion.button>

      {/* Voice Feedback */}
      <AnimatePresence>
        {(isListening || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full mb-4 right-0 glass p-4 rounded-xl min-w-64 max-w-80"
          >
            <div className="space-y-3">
              {/* Status */}
              <div className="flex items-center space-x-2">
                <div className={`status-${isListening ? 'thinking' : 'online'}`}></div>
                <span className="text-sm font-medium text-white">
                  {isListening ? 'Listening...' : 'Processing...'}
                </span>
              </div>
              
              {/* Transcript */}
              {transcript && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">You said:</div>
                  <div className="text-sm text-blue-400 font-mono bg-gray-800/50 p-2 rounded">
                    "{transcript}"
                  </div>
                  {confidence > 0 && (
                    <div className="text-xs text-gray-500">
                      Confidence: {Math.round(confidence * 100)}%
                    </div>
                  )}
                </div>
              )}
              
              {/* Voice Waveform Animation */}
              {isListening && (
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: ['4px', '12px', '8px', '16px', '4px'],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      className="bg-blue-400 w-1 rounded-full"
                    />
                  ))}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Try: "start assessment", "show roadmap"
                </div>
                {isListening && (
                  <button
                    onClick={stopListening}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInterface;