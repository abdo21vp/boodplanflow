/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        domain: {
          academic: '#4f46e5',
          fitness: '#10b981',
          secular: '#f59e0b',
          work: '#8b5cf6',
          personal: '#06b6d4',
          sleep: '#64748b'
        }
      }
    },
  },
  plugins: [],
}
