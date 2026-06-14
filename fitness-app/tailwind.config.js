/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#f97316',
          dark: '#ea580c',
          light: '#fb923c',
        }
      }
    },
  },
  plugins: [],
}
