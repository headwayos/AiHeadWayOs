/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-teal': '#00ffff',
        'neon-green': '#00ff00',
        'neon-blue': '#0080ff',
        'dark-bg': '#0a0a0a',
        'dark-card': '#111111',
        'dark-card-hover': '#1a1a1a',
        'dark-border': '#333333',
        'cyber-purple': '#9945ff',
        'cyber-pink': '#ff45b7',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
        'cyber': ['Orbitron', 'monospace'],
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #00ffff, #00ff00)',
        'cyber-gradient': 'linear-gradient(135deg, #0a0a0a, #001122)',
        'matrix-gradient': 'linear-gradient(45deg, #000000, #001122, #000000)',
      },
      animation: {
        'pulse-teal': 'pulse-teal 2s infinite',
        'pulse-green': 'pulse-green 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-text': 'glow-text 2s ease-in-out infinite',
        'matrix-rain': 'matrix-rain 10s linear infinite',
        'scan-line': 'scan-line 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-teal': {
          '0%, 100%': {
            boxShadow: '0 0 5px #00ffff, 0 0 10px #00ffff',
          },
          '50%': {
            boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
          },
        },
        'pulse-green': {
          '0%, 100%': {
            boxShadow: '0 0 5px #00ff00, 0 0 10px #00ff00',
          },
          '50%': {
            boxShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        'glow-text': {
          '0%, 100%': {
            textShadow: '0 0 5px #00ffff, 0 0 10px #00ffff',
          },
          '50%': {
            textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
          },
        },
        'matrix-rain': {
          '0%': {
            transform: 'translateY(-100%)',
          },
          '100%': {
            transform: 'translateY(100vh)',
          },
        },
        'scan-line': {
          '0%, 100%': {
            opacity: '0.1',
          },
          '50%': {
            opacity: '0.8',
          },
        },
      },
      boxShadow: {
        'neon-teal': '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff',
        'neon-green': '0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00',
        'neon-blue': '0 0 5px #0080ff, 0 0 10px #0080ff, 0 0 15px #0080ff',
        'cyber-glow': '0 0 20px rgba(0, 255, 255, 0.5)',
        'cyber-glow-green': '0 0 20px rgba(0, 255, 0, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}