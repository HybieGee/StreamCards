/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pump-green': '#00FF87',
        'deep-black': '#0C0C0C',
        'neon-pink': '#FF2FB9',
        'electric-blue': '#00D1FF',
        'charcoal-purple': '#2A0E3B',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 135, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 135, 0.8)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0, 255, 135, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 135, 0.1) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}