/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Noto Sans Ethiopic',
          'Nyala',
          'sans-serif'
        ],
        serif: [
          'Merriweather',
          'Georgia',
          'Cambria',
          'serif'
        ]
      },
      colors: {
        gov: {
          50: '#F0F7F4',
          100: '#E1EFE9',
          200: '#C2DFD3',
          300: '#94C6B3',
          400: '#5FA68E',
          500: '#38886F',
          600: '#286E58',
          700: '#215747',
          800: '#1B4639',
          900: '#173B30',
          950: '#0B211B',
        },
        slate: {
          850: '#151E2E'
        }
      }
    },
  },
  plugins: [],
}
