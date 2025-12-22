/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#f0b90b',
        night: '#05060a',
        obsidian: '#0c0d13',
        'accent-pink': '#ff77e9',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 40px rgba(255, 119, 233, 0.15)',
      },
    },
  },
  plugins: [],
};
