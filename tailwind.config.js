module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        'half-screen': '50vh',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}