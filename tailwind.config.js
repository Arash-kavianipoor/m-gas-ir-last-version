/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"EnglishDigits"', '"Vazirmatn"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        vazir: ['"Vazirmatn"', 'sans-serif'],
        mono: ['"Segoe UI"', 'Arial', 'Roboto', 'monospace'],
        digits: ['"Segoe UI"', 'Arial', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
