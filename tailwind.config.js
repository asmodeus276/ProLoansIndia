/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './portal.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1565C0',
          navyDark: '#0F2942',
          navyDeep: '#0F3876',
          orange: '#F26522',
          orangeHover: '#D94E0E',
          orangeLight: '#FFEDD5',
          crimson: '#C5161D',
          emerald: '#16A34A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        display: ['Manrope', 'sans-serif']
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}
