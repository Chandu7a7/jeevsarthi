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
        primary: {
          green: '#2E7D32',
          blue: '#1976D2',
          yellow: '#FFF59D',
        },
        alert: {
          safe: '#4CAF50',
          warning: '#FFC107',
          violation: '#F44336',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
      },
    },
  },
  plugins: [],
}

