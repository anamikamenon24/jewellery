/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        blush: {
          100: '#FDE8EE',
          200: '#F9CFDB',
          300: '#F4B4C6',
          400: '#EE93AD',
          500: '#E06F92',
          600: '#C45478',
        },
        gold: {
          100: '#FBF1D9',
          200: '#F4DFA8',
          300: '#EBCB7E',
          400: '#DDB25A',
          500: '#C8973C',
          600: '#A47A2B',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(238, 147, 173, 0.45)',
        gold: '0 0 40px -10px rgba(221, 178, 90, 0.55)',
        soft: '0 10px 40px -12px rgba(0, 0, 0, 0.35)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-120%) skewX(-20deg)' },
          '100%': { transform: 'translateX(220%) skewX(-20deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: 0, transform: 'scale(0.4) rotate(0deg)' },
          '50%': { opacity: 1, transform: 'scale(1) rotate(45deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.1s ease-in-out',
        twinkle: 'twinkle 2.4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        gradient: 'gradient 6s ease infinite',
        'spin-slow': 'spinSlow 30s linear infinite',
      },
    },
  },
  plugins: [],
}
