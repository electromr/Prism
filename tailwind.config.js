/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: "class", // or remove if you never use light mode
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Cyberpunk Palette
        cyan: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",   // MAIN CYAN
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        blue: {
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        neon: "#00ffea",
        matrix: "#00ff41",
        background: "#0a0a0a",
        foreground: "#e0fbfc",
        border: "#06b6d440",
        card: "#0f172a",
        muted: "#1e293b",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.25), transparent 70%)',
        'gradient-cyber': 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #0f172a 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.6)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.6)',
        'glow-intense': '0 0 40px rgba(6, 182, 212, 0.8), 0 0 80px rgba(6, 182, 212, 0.4)',
        'card-glow': '0 0 30px rgba(6, 182, 212, 0.3)',
      },
      borderWidth: {
        'glow': '2px',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 0.8 },
          '50%': { opacity: 1 },
        },
        glitch: {
          '0%': { textShadow: '2px 2px #ff00ff, -2px -2px #00ffff' },
          '25%': { textShadow: '-2px -2px #ff00ff, 2px 2px #00ffff' },
          '50%': { textShadow: '2px -2px #ff00ff, -2px 2px #00ffff' },
          '75%': { textShadow: '-2px 2px #ff00ff, 2px -2px #00ffff' },
          '100%': { textShadow: '2px 2px #ff00ff, -2px -2px #00ffff' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s infinite',
        'glitch': 'glitch 3s infinite',
        'scan': 'scan 8s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
