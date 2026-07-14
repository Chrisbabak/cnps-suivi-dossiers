/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette institutionnelle CNPS : vert foncé dominant.
        cnps: {
          50: '#EDF7F1',
          100: '#D6ECDF',
          200: '#A9D6BC',
          300: '#77BC96',
          400: '#4A9C70',
          500: '#2E7D51',
          600: '#1B5E3A',
          700: '#154B2E',
          800: '#103A24',
          900: '#0B2A1A',
        },
      },
    },
  },
  plugins: [],
}
