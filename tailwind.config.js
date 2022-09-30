const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        'half-screen': '50vh',
      },
      colors: {
        'coffee': '#c0ffee',
        'pink': '#FFC0EE'
      },
      boxShadow: {
        'red': '0px 0px 0px 1px rgba(185, 28, 28,1)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}