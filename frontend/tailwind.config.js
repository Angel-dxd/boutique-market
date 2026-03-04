/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        boutique: '#059669', // Emerald 600
        market: '#0077b6',   // Custom Blue
      }
    },
  },
  plugins: [],
}
