// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/JSX files in src
  ],
  theme: {
    extend: {
      // Optional: Add custom colors, fonts, etc. here
      colors: {
        'brand-blue': '#3490dc',
        'brand-green': '#38c172',
        'brand-gray': '#606f7b',
      },
    },
  },
  plugins: [],
}