/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00355f',
          light: '#0f4c81',
          dark: '#002040',
        },
        secondary: {
          DEFAULT: '#006c49',
          light: '#6cf8bb',
          dark: '#004d34',
        },
        surface: {
          DEFAULT: '#ffffff',
          low: '#eff4ff',
          container: '#e5eeff',
          high: '#dce9ff',
          highest: '#d3e4fe',
        },
        bg: '#f8f9ff',
        outline: {
          DEFAULT: '#727780',
          variant: '#c2c7d1',
        },
        amber: {
          card: '#fef3e2',
        },
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'ui-sans-serif', 'system-ui'],
        serif: ['Source Serif 4', 'ui-serif', 'Georgia'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease',
        'slide-up': 'slideUp 0.25s ease',
        'toast-in': 'toastIn 0.3s ease',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateX(-50%) translateY(-10px)' },
          to: { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
