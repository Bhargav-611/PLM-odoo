/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0f1c', // Dark background
        card: '#161e31',
        primary: '#3b82f6', // blue
        secondary: '#64748b',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUp: 'slideUp 0.6s ease-out forwards',
        slideUpDelay: 'slideUp 0.6s ease-out forwards 0.2s',
        slideUpDelaySlow: 'slideUp 0.8s ease-out forwards 0.4s',
      }
    },
  },
  plugins: [],
}
