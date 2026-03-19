/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8b85ff',
          DEFAULT: '#6C63FF',
          dark: '#5a52d5',
        },
        secondary: "#10b981",
        accent: "#f59e0b",
        dark: "#1f2937",
        background: "#f9fafb",
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'premium': '0 10px 25px -5px rgba(108, 99, 255, 0.1), 0 8px 10px -6px rgba(108, 99, 255, 0.1)',
        'premium-hover': '0 20px 25px -5px rgba(108, 99, 255, 0.2), 0 10px 10px -5px rgba(108, 99, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
