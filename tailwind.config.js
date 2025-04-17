/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'nature': {
          50: '#f7faf7',
          100: '#edf5ed',
          200: '#d1e6d1',
          300: '#b5d6b5',
          400: '#7db77d',
          500: '#457945',
          600: '#3e6d3e',
          700: '#345b34',
          800: '#2a492a',
          900: '#223c22'
        },
        'orsoie': '#D46E35'
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Cormorant', 'serif'],
        'logo': ['Montez', 'cursive'],
        'orsoie': ['Cookie', 'cursive']
      }
    },
  },
  plugins: [],
};