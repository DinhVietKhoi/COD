/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f4f6fb',
          100: '#e6eaf3',
          200: '#c8d2e5',
          300: '#9aafd0',
          400: '#6884b3',
          500: '#456498',
          600: '#34507f',
          700: '#2c4067',
          800: '#283757',
          900: '#1d2840',
          950: '#121829',
        },
      },
    },
  },
  plugins: [],
};
