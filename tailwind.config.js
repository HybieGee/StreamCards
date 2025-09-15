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
        'pump-green': 'rgb(var(--pump-green) / <alpha-value>)',
        'deep-black': 'rgb(var(--deep-black) / <alpha-value>)',
        'card-black': 'rgb(var(--card-black) / <alpha-value>)',
        'neon-pink': 'rgb(var(--neon-pink) / <alpha-value>)',
        'electric-blue': 'rgb(var(--electric-blue) / <alpha-value>)',
        'charcoal-purple': 'rgb(var(--charcoal-purple) / <alpha-value>)',
        'cyber-purple': 'rgb(var(--cyber-purple) / <alpha-value>)',
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