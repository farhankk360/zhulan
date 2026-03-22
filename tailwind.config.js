/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palace: '#DC2626',
        residence: '#D97706',
        government: '#2563EB',
        bridge: '#0D9488',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        chinese: ['"Noto Serif SC"', 'serif'],
      },
    },
  },
  plugins: [],
}
