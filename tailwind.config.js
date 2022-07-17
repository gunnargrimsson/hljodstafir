const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        'half-screen': '50vh',
      },
      colors: {
        'coffee': '#c0ffee',
        'pink': '#ffc0ee'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}