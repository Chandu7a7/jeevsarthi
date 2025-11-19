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
          yellow: '#FFC107',
        },
        tech: {
          blue: '#1976D2',
        },
        accent: {
          yellow: '#FFC107',
        },
        danger: {
          red: '#D32F2F',
        },
        alert: {
          safe: '#4CAF50',
          warning: '#FFC107',
          violation: '#D32F2F',
        },
        bg: {
          light: '#F9FAFB',
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

