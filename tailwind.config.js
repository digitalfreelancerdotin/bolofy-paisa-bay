/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {fontFamily: {
      sans: ['Libre Baskerville', 'sans-serif'],  
      serif: ['Montserrat', 'sans-serif'], 
    },
  },
  },
  plugins: [],
}